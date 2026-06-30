const { query } = require('../db');

async function searchProperties(req, res) {
  try {
    const { city, gender_pref, vacancy_only, min_rating } = req.query;

    let sql = `
      SELECT
        p.id, p.name, p.address, p.city, p.gender_pref, p.rules,
        p.latitude, p.longitude, p.landmark,
        v.total_beds, v.vacant_beds,
        COALESCE(avg_r.avg_overall, 0) as avg_rating,
        COALESCE(avg_r.total_ratings, 0) as rating_count
      FROM properties p
      LEFT JOIN property_vacancy_summary v ON v.property_id = p.id
      LEFT JOIN (
        SELECT property_id,
          AVG((cleanliness + responsiveness + safety) / 3.0) as avg_overall,
          COUNT(*) as total_ratings
        FROM ratings GROUP BY property_id
      ) avg_r ON avg_r.property_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      params.push(`%${city}%`);
      sql += ` AND (p.city ILIKE $${params.length} OR p.address ILIKE $${params.length} OR p.name ILIKE $${params.length})`;
    }
    if (gender_pref) {
      params.push(gender_pref);
      sql += ` AND (p.gender_pref = $${params.length} OR p.gender_pref = 'any')`;
    }
    if (vacancy_only === 'true') {
      sql += ` AND COALESCE(v.vacant_beds, 0) > 0`;
    }
    if (min_rating) {
      params.push(parseFloat(min_rating));
      sql += ` AND COALESCE(avg_r.avg_overall, 0) >= $${params.length}`;
    }

    sql += ` ORDER BY COALESCE(v.vacant_beds, 0) DESC, COALESCE(avg_r.avg_overall, 0) DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed.' });
  }
}

async function getPropertyPublic(req, res) {
  try {
    const { id } = req.params;
    const prop = await query('SELECT * FROM properties WHERE id = $1', [id]);
    if (prop.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const vacancy = await query('SELECT * FROM property_vacancy_summary WHERE property_id = $1', [id]);
    const ratings = await query(
      `SELECT r.*, u.name as renter_name FROM ratings r
       JOIN users u ON u.id = r.renter_id WHERE r.property_id = $1 ORDER BY r.created_at DESC`,
      [id]
    );
    const avg = await query(
      `SELECT COALESCE(AVG((cleanliness + responsiveness + safety) / 3.0), 0) as avg_overall,
        COALESCE(AVG(cleanliness), 0) as avg_cleanliness,
        COALESCE(AVG(responsiveness), 0) as avg_responsiveness,
        COALESCE(AVG(safety), 0) as avg_safety,
        COUNT(*) as total_ratings
       FROM ratings WHERE property_id = $1`, [id]
    );

    const data = prop.rows[0];
    delete data.owner_id;
    data.vacancy = vacancy.rows[0] || { total_beds: 0, vacant_beds: 0 };
    data.ratings = ratings.rows;
    data.rating_summary = avg.rows[0];

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
}

module.exports = { searchProperties, getPropertyPublic };
