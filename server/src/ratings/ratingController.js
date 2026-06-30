const { query } = require('../db');

async function createRating(req, res) {
  try {
    const { property_id, tenancy_id, cleanliness, responsiveness, safety, comment } = req.body;
    if (!property_id || !tenancy_id || !cleanliness || !responsiveness || !safety) {
      return res.status(400).json({ error: 'property_id, tenancy_id, and all three scores are required.' });
    }
    if ([cleanliness, responsiveness, safety].some(s => s < 1 || s > 5)) {
      return res.status(400).json({ error: 'All scores must be between 1 and 5.' });
    }

    const tenancy = await query(
      `SELECT * FROM tenancies WHERE id = $1 AND renter_id = $2 AND status = 'archived' AND property_id = $3`,
      [tenancy_id, req.user.user_id, property_id]
    );
    if (tenancy.rows.length === 0) {
      return res.status(400).json({ error: 'You can only rate after completing a verified stay.' });
    }

    const paidBill = await query(
      `SELECT * FROM bills WHERE tenancy_id = $1 AND status = 'paid' LIMIT 1`,
      [tenancy_id]
    );
    if (paidBill.rows.length === 0) {
      return res.status(400).json({ error: 'You must have at least one paid bill to rate this property.' });
    }

    const result = await query(
      `INSERT INTO ratings (property_id, tenancy_id, renter_id, cleanliness, responsiveness, safety, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [property_id, tenancy_id, req.user.user_id, cleanliness, responsiveness, safety, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'You have already rated this property.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
}

async function replyToRating(req, res) {
  try {
    const { ratingId } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'Reply is required.' });

    const rating = await query(
      `SELECT r.*, p.owner_id FROM ratings r
       JOIN properties p ON p.id = r.property_id
       WHERE r.id = $1`,
      [ratingId]
    );
    if (rating.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (rating.rows[0].owner_id !== req.user.user_id) return res.status(403).json({ error: 'Access denied' });
    if (rating.rows[0].owner_reply) {
      return res.status(400).json({ error: 'You have already replied to this rating.' });
    }

    await query(
      `UPDATE ratings SET owner_reply = $1, updated_at = NOW() WHERE id = $2`,
      [reply, ratingId]
    );
    res.json({ message: 'Reply posted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post reply.' });
  }
}

async function getPropertyRatings(req, res) {
  try {
    const { propertyId } = req.params;
    const result = await query(
      `SELECT r.*, u.name as renter_name
       FROM ratings r
       JOIN users u ON u.id = r.renter_id
       WHERE r.property_id = $1
       ORDER BY r.created_at DESC`,
      [propertyId]
    );

    const avg = await query(
      `SELECT 
        COALESCE(AVG(cleanliness), 0) as avg_cleanliness,
        COALESCE(AVG(responsiveness), 0) as avg_responsiveness,
        COALESCE(AVG(safety), 0) as avg_safety,
        COALESCE(AVG((cleanliness + responsiveness + safety) / 3.0), 0) as avg_overall,
        COUNT(*) as total_ratings
       FROM ratings WHERE property_id = $1`,
      [propertyId]
    );

    res.json({ ratings: result.rows, summary: avg.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ratings.' });
  }
}

module.exports = { createRating, replyToRating, getPropertyRatings };
