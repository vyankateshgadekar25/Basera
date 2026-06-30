const { query } = require('../db');
const crypto = require('crypto');

function hashImage(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function submitPayment(req, res) {
  try {
    const { bill_id, amount_paid, utr, proof_hash } = req.body;
    if (!bill_id || !amount_paid || !utr) {
      return res.status(400).json({ error: 'bill_id, amount_paid, and utr are required.' });
    }

    const bill = await query(
      `SELECT b.*, t.renter_id FROM bills b
       JOIN tenancies t ON t.id = b.tenancy_id
       WHERE b.id = $1`,
      [bill_id]
    );
    if (bill.rows.length === 0) return res.status(404).json({ error: 'Bill not found.' });
    if (bill.rows[0].renter_id !== req.user.user_id) return res.status(403).json({ error: 'Access denied' });
    if (!['pending', 'rejected'].includes(bill.rows[0].status)) {
      return res.status(400).json({ error: 'This bill cannot be paid at this time.' });
    }

    const flags = [];
    const amountDue = parseFloat(bill.rows[0].amount_due);
    const amountPaid = parseFloat(amount_paid);
    if (Math.abs(amountPaid - amountDue) > 0.01) {
      flags.push('Amount mismatch');
    }

    const dupUTR = await query('SELECT * FROM bills WHERE utr = $1 AND id != $2 LIMIT 1', [utr, bill_id]);
    if (dupUTR.rows.length > 0) {
      flags.push('Duplicate transaction ID');
    }

    if (proof_hash) {
      const dupHash = await query('SELECT * FROM bills WHERE proof_hash = $1 AND id != $2 LIMIT 1', [proof_hash, bill_id]);
      if (dupHash.rows.length > 0) {
        flags.push('Duplicate screenshot');
      }
    }

    await query(
      `UPDATE bills SET 
        amount_paid = $1, utr = $2, proof_hash = $3, flags = $4,
        status = 'submitted', submitted_at = NOW(), updated_at = NOW()
       WHERE id = $5`,
      [amount_paid, utr, proof_hash || null, flags, bill_id]
    );

    res.json({ message: 'Payment proof submitted. Your owner will review and confirm.', flags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit payment.' });
  }
}

async function getMyBills(req, res) {
  try {
    const result = await query(
      `SELECT b.*, p.name as property_name, r.label as room_label, bd.label as bed_label
       FROM bills b
       JOIN tenancies t ON t.id = b.tenancy_id
       JOIN properties p ON p.id = t.property_id
       JOIN beds bd ON bd.id = t.bed_id
       JOIN rooms r ON r.id = bd.room_id
       WHERE t.renter_id = $1
       ORDER BY b.month DESC, b.created_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bills.' });
  }
}

module.exports = { submitPayment, getMyBills };
