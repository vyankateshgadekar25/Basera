#!/usr/bin/env node
/**
 * Minimal migration runner: applies every .sql file in /migrations in order.
 * Idempotent — tracks applied filenames in `schema_migrations`.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, query } = require('../src/db');

(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const dir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

    for (const f of files) {
      const done = await query('SELECT 1 FROM schema_migrations WHERE filename = $1', [f]);
      if (done.rows.length) {
        console.log(`  ✔ ${f} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      console.log(`  → applying ${f} ...`);
      await pool.query(sql);
      await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
      console.log(`  ✔ ${f}`);
    }
    console.log('Migrations complete.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
})();
