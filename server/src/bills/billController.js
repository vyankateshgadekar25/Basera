const { query } = require('../db');

async function generateBills(req, res) {
  try {
    const { month } = req.body;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format.' });
    }

    const activeTenancies = await query(
      `SELECT t.*, p.owner_id FROM tenancies t
       JOIN properties p ON p.id = t.property_id
       WHERE t.status = 'active'`
    );

    let created = 0;
    let skipped = 0;

    for (const tenancy of activeTenancies.rows) {
      if (tenancy.owner_id !== req.user.user_id) continue;
      try {
        await query(
          `INSERT INTO bills (tenancy_id, month, amount_due) VALUES ($1, $2, $3)`,
          [tenancy.id, month, tenancy.monthly_rent]
        );
        created++;
      } catch (e) {
        if (e.code === '23505') skipped++;
        else throw e;
      }
    }

    res.json({ message: `Bills generated: ${created} created, ${skipped} already existed.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate bills.' });
  }
}

async function getOwnerBills(req, res) {
  try {
    const { status, month } = req.query;
    let sql = `
      SELECT b.*, t.renter_id, u.name as renter_name, p.name as property_name, r.label as room_label, bd.label as bed_label
      FROM bills b
      JOIN tenancies t ON t.id = b.tenancy_id
      JOIN users u ON u.id = t.renter_id
      JOIN properties p ON p.id = t.property_id
      JOIN beds bd ON bd.id = t.bed_id
      JOIN rooms r ON r.id = bd.room_id
      WHERE p.owner_id = $1
    `;
    const params = [req.user.user_id];
    if (status) {
      sql += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }
    if (month) {
      sql += ` AND b.month = $${params.length + 1}`;
      params.push(month);
    }
    sql += ` ORDER BY b.month DESC, b.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bills.' });
  }
}

async function reviewPayment(req, res) {
  try {
    const { billId } = req.params;
    const { action } = req.body;
    if (!['confirm', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be confirm or reject.' });
    }

    const bill = await query(
      `SELECT b.*, p.owner_id FROM bills b
       JOIN tenancies t ON t.id = b.tenancy_id
       JOIN properties p ON p.id = t.property_id
       WHERE b.id = $1`,
      [billId]
    );
    if (bill.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (bill.rows[0].owner_id !== req.user.user_id) return res.status(403).json({ error: 'Access denied' });

    const newStatus = action === 'confirm' ? 'paid' : 'rejected';
    await query(
      `UPDATE bills SET status = $1, confirmed_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [newStatus, billId]
    );

    res.json({ message: `Payment ${action}ed successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to review payment.' });
  }
}

module.exports = { generateBills, getOwnerBills, reviewPayment };
