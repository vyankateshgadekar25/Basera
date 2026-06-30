const { query } = require('../db');

async function checkIn(req, res) {
  try {
    const { bed_id, renter_name, renter_phone, monthly_rent, deposit, move_in_date } = req.body;
    if (!bed_id || !renter_name || !renter_phone || !monthly_rent || !move_in_date) {
      return res.status(400).json({ error: 'bed_id, renter_name, renter_phone, monthly_rent, move_in_date are required.' });
    }

    const bedCheck = await query(
      `SELECT b.*, r.property_id FROM beds b JOIN rooms r ON r.id = b.room_id WHERE b.id = $1`,
      [bed_id]
    );
    if (bedCheck.rows.length === 0) return res.status(404).json({ error: 'Bed not found.' });
    const propertyId = bedCheck.rows[0].property_id;

    const ownerCheck = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [propertyId, req.user.user_id]);
    if (ownerCheck.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const existing = await query("SELECT * FROM tenancies WHERE bed_id = $1 AND status = 'active'", [bed_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Bed is already occupied.' });

    let renter = await query('SELECT * FROM users WHERE phone = $1', [renter_phone]);
    if (renter.rows.length === 0) {
      await query(
        'INSERT INTO users (name, phone, role, is_verified) VALUES ($1, $2, $3, false)',
        [renter_name, renter_phone, 'renter']
      );
      renter = await query('SELECT * FROM users WHERE phone = $1', [renter_phone]);
    }
    const renterId = renter.rows[0].id;

    const result = await query(
      `INSERT INTO tenancies (bed_id, property_id, renter_id, move_in_date, monthly_rent, deposit, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
      [bed_id, propertyId, renterId, move_in_date, monthly_rent, deposit || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check in tenant.' });
  }
}

async function checkOut(req, res) {
  try {
    const { tenancy_id } = req.params;
    const tenancy = await query('SELECT * FROM tenancies WHERE id = $1', [tenancy_id]);
    if (tenancy.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const ownerCheck = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [tenancy.rows[0].property_id, req.user.user_id]);
    if (ownerCheck.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    await query(
      `UPDATE tenancies SET status = 'archived', move_out_date = CURRENT_DATE, updated_at = NOW() WHERE id = $1`,
      [tenancy_id]
    );
    res.json({ message: 'Tenant checked out successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check out tenant.' });
  }
}

async function getPropertyTenants(req, res) {
  try {
    const { propertyId } = req.params;
    const ownerCheck = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [propertyId, req.user.user_id]);
    if (ownerCheck.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const result = await query(
      `SELECT t.*, u.name as renter_name, u.phone as renter_phone, b.label as bed_label, r.label as room_label
       FROM tenancies t
       JOIN users u ON u.id = t.renter_id
       JOIN beds b ON b.id = t.bed_id
       JOIN rooms r ON r.id = b.room_id
       WHERE t.property_id = $1 AND t.status = 'active'
       ORDER BY t.move_in_date DESC`,
      [propertyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tenants.' });
  }
}

module.exports = { checkIn, checkOut, getPropertyTenants };
