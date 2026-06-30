const { query } = require('../db');

function toNumOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function createProperty(req, res) {
  try {
    const { name, address, city, latitude, longitude, landmark, gender_pref, rules, contact_visible } = req.body;
    if (!name || !address || !city) {
      return res.status(400).json({ error: 'Name, address, and city are required.' });
    }
    if (gender_pref && !['male', 'female', 'any'].includes(gender_pref)) {
      return res.status(400).json({ error: 'gender_pref must be male, female, or any.' });
    }

    const result = await query(
      `INSERT INTO properties (owner_id, name, address, city, latitude, longitude, landmark, gender_pref, rules, contact_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        req.user.user_id, name, address, city,
        toNumOrNull(latitude), toNumOrNull(longitude),
        landmark || null,
        gender_pref || 'any', rules, contact_visible !== false,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create property.' });
  }
}

async function getMyProperties(req, res) {
  try {
    const result = await query(
      `SELECT p.*, v.total_beds, v.occupied_beds, v.vacant_beds
       FROM properties p
       LEFT JOIN property_vacancy_summary v ON v.property_id = p.id
       WHERE p.owner_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
}

async function getProperty(req, res) {
  try {
    const { id } = req.params;
    const propResult = await query(
      'SELECT * FROM properties WHERE id = $1 AND owner_id = $2',
      [id, req.user.user_id]
    );
    if (propResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const roomsResult = await query(
      `SELECT r.*,
        json_agg(
          json_build_object(
            'id', b.id,
            'label', b.label,
            'occupied', t.status IS NOT NULL,
            'tenant_name', u.name,
            'move_in_date', t.move_in_date
          ) ORDER BY b.label
        ) FILTER (WHERE b.id IS NOT NULL) as beds
       FROM rooms r
       LEFT JOIN beds b ON b.room_id = r.id
       LEFT JOIN tenancies t ON t.bed_id = b.id AND t.status = 'active'
       LEFT JOIN users u ON u.id = t.renter_id
       WHERE r.property_id = $1
       GROUP BY r.id
       ORDER BY r.label`,
      [id]
    );

    const property = propResult.rows[0];
    property.rooms = roomsResult.rows.map(r => ({ ...r, beds: r.beds || [] }));
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
}

async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const { name, address, city, latitude, longitude, landmark, gender_pref, rules, contact_visible } = req.body;

    const check = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [id, req.user.user_id]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const result = await query(
      `UPDATE properties SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        city = COALESCE($3, city),
        latitude = COALESCE($4, latitude),
        longitude = COALESCE($5, longitude),
        landmark = COALESCE($6, landmark),
        gender_pref = COALESCE($7, gender_pref),
        rules = COALESCE($8, rules),
        contact_visible = COALESCE($9, contact_visible),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [
        name, address, city,
        toNumOrNull(latitude), toNumOrNull(longitude),
        landmark,
        gender_pref, rules, contact_visible, id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property.' });
  }
}

async function deleteProperty(req, res) {
  try {
    const { id } = req.params;
    const check = await query('SELECT * FROM properties WHERE id = $1 AND owner_id = $2', [id, req.user.user_id]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const active = await query(
      'SELECT * FROM tenancies WHERE property_id = $1 AND status = $2 LIMIT 1',
      [id, 'active']
    );
    if (active.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete a property with active tenants. Check out all tenants first.' });
    }

    await query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property.' });
  }
}

module.exports = { createProperty, getMyProperties, getProperty, updateProperty, deleteProperty };
