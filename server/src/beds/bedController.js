const { query } = require('../db');

async function verifyOwnership(propertyId, ownerId) {
  const result = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [propertyId, ownerId]);
  return result.rows.length > 0;
}

async function createBed(req, res) {
  try {
    const { propertyId, roomId } = req.params;
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'Label is required.' });
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const roomCheck = await query('SELECT * FROM rooms WHERE id = $1 AND property_id = $2', [roomId, propertyId]);
    if (roomCheck.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const result = await query(
      'INSERT INTO beds (room_id, label) VALUES ($1, $2) RETURNING *',
      [roomId, label]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create bed.' });
  }
}

async function updateBed(req, res) {
  try {
    const { propertyId, roomId, bedId } = req.params;
    const { label } = req.body;
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      `UPDATE beds SET label = $1, updated_at = NOW()
       WHERE id = $2 AND room_id = $3 RETURNING *`,
      [label, bedId, roomId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update bed.' });
  }
}

async function deleteBed(req, res) {
  try {
    const { propertyId, roomId, bedId } = req.params;
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const active = await query(
      'SELECT * FROM tenancies WHERE bed_id = $1 AND status = $2 LIMIT 1',
      [bedId, 'active']
    );
    if (active.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot remove a bed with an active tenant.' });
    }
    await query('DELETE FROM beds WHERE id = $1 AND room_id = $2', [bedId, roomId]);
    res.json({ message: 'Bed deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bed.' });
  }
}

module.exports = { createBed, updateBed, deleteBed };
