const { Pool } = require('pg');

// Prefer DATABASE_URL (Neon / Supabase / any managed Postgres).
// Falls back to discrete vars for local dev. SSL is required by most cloud
// Postgres hosts; toggle via PGSSLMODE=disable if you self-host.
const useUrl = !!process.env.DATABASE_URL;
const useSSL = process.env.PGSSLMODE !== 'disable' && (useUrl || process.env.NODE_ENV === 'production');

const pool = useUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 5432,
      database: process.env.DB_NAME     || 'basera',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    });

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.LOG_SQL === '1') {
    console.log('SQL', { text: text.substring(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

module.exports = { pool, query };
