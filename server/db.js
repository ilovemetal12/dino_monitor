/**
 * Database initialization and connection pool.
 * Uses PostgreSQL via node-postgres (pg).
 * Reads DATABASE_URL from environment (provided by Railway).
 */

import pg from 'pg';

const { Pool, types } = pg;

// Force pg to return DATE and TIMESTAMP as strings instead of JS Date objects.
// This ensures consistent JSON serialization for the client.
types.setTypeParser(1082, (val) => val);           // DATE → 'YYYY-MM-DD'
types.setTypeParser(1114, (val) => val);           // TIMESTAMP → 'YYYY-MM-DD HH:MM:SS'
types.setTypeParser(1184, (val) => {               // TIMESTAMPTZ → proper ISO 8601
  // Postgres returns '2026-06-22 10:44:00-04', convert to ISO format with T separator
  return val ? val.replace(' ', 'T') : val;
});

/** Singleton pool instance */
let pool;

/**
 * Returns the shared connection pool, creating it on first call.
 * Also runs migrations to ensure tables exist.
 */
export async function getDb() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Set timezone to Mexico City (UTC-6) so all timestamps are in local time
  pool.on('connect', (client) => {
    client.query("SET timezone = 'America/Mexico_City'");
  });

  await migrate(pool);
  return pool;
}

/**
 * Creates tables and seeds default settings if they don't exist.
 */
async function migrate(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS readings (
      id SERIAL PRIMARY KEY,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      pulse INTEGER,
      position TEXT DEFAULT 'sentada',
      arm TEXT DEFAULT 'izquierdo',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      date DATE NOT NULL DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_readings_date ON readings(date);
    CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at);
  `);

  // Seed default settings (only inserts if key doesn't exist)
  const defaults = [
    ['due_date', '2027-01-29'],
    ['baby_name', 'Bebito Dino'],
    ['reminder_times', JSON.stringify(['08:00', '20:00'])],
    ['mama_name', 'Dinomamá'],
    ['pin', '2604']
  ];

  for (const [key, value] of defaults) {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, value]
    );
  }
}
