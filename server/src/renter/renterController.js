const { query } = require('../db');

async function getMyStay(req, res) {
  try {
    const result = await query(
      `SELECT t.*, p.name as property_name, p.address, p.city, p.rules,
        r.label as room_label, b.label as bed_label, p.owner_id
       FROM tenancies t
       JOIN properties p ON p.id = t.property_id
       JOIN beds b ON b.id = t.bed_id
       JOIN rooms r ON r.id = b.room_id
       WHERE t.renter_id = $1 AND t.status = 'active'
       LIMIT 1`,
      [req.user.user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active stay found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stay details.' });
  }
}

async function getMyArchivedStays(req, res) {
  try {
    const result = await query(
      `SELECT t.*, p.name as property_name, p.address, p.city,
        r.label as room_label, b.label as bed_label
       FROM tenancies t
       JOIN properties p ON p.id = t.property_id
       JOIN beds b ON b.id = t.bed_id
       JOIN rooms r ON r.id = b.room_id
       WHERE t.renter_id = $1 AND t.status = 'archived'
       ORDER BY t.move_out_date DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch archived stays.' });
  }
}

module.exports = { getMyStay, getMyArchivedStays };
