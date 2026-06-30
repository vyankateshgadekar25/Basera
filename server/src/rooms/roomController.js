const { query } = require('../db');

async function verifyOwnership(propertyId, ownerId) {
  const result = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [propertyId, ownerId]);
  return result.rows.length > 0;
}

async function createRoom(req, res) {
  try {
    const { propertyId } = req.params;
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'Label is required.' });
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      'INSERT INTO rooms (property_id, label) VALUES ($1, $2) RETURNING *',
      [propertyId, label]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room.' });
  }
}

async function getRooms(req, res) {
  try {
    const { propertyId } = req.params;
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      `SELECT r.*, 
        json_agg(json_build_object('id', b.id, 'label', b.label, 'occupied', t.status IS NOT NULL)) FILTER (WHERE b.id IS NOT NULL) as beds
       FROM rooms r
       LEFT JOIN beds b ON b.room_id = r.id
       LEFT JOIN tenancies t ON t.bed_id = b.id AND t.status = 'active'
       WHERE r.property_id = $1
       GROUP BY r.id ORDER BY r.label`,
      [propertyId]
    );
    res.json(result.rows.map(r => ({ ...r, beds: r.beds || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
}

async function updateRoom(req, res) {
  try {
    const { propertyId, roomId } = req.params;
    const { label } = req.body;
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      'UPDATE rooms SET label = $1, updated_at = NOW() WHERE id = $2 AND property_id = $3 RETURNING *',
      [label, roomId, propertyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update room.' });
  }
}

async function deleteRoom(req, res) {
  try {
    const { propertyId, roomId } = req.params;
    if (!(await verifyOwnership(propertyId, req.user.user_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const active = await query(
      `SELECT t.* FROM tenancies t
       JOIN beds b ON b.id = t.bed_id
       WHERE b.room_id = $1 AND t.status = 'active' LIMIT 1`,
      [roomId]
    );
    if (active.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete a room with active tenants.' });
    }
    await query('DELETE FROM rooms WHERE id = $1 AND property_id = $2', [roomId, propertyId]);
    res.json({ message: 'Room deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete room.' });
  }
}

module.exports = { createRoom, getRooms, updateRoom, deleteRoom };
