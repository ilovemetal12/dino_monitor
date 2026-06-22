/**
 * Database initialization and schema management.
 * Uses SQLite via better-sqlite3 for zero-config persistence.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initializes the SQLite database with required tables and default settings.
 * Creates the data directory if it doesn't exist.
 * @returns {Database} better-sqlite3 database instance
 */
export function initDb() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'dino_monitor.db');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      pulse INTEGER,
      position TEXT DEFAULT 'sentada',
      arm TEXT DEFAULT 'izquierdo',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      date TEXT NOT NULL DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_readings_date ON readings(date);
    CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at);
  `);

  // Seed default settings (only inserts if key doesn't exist)
  const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insert.run('due_date', '2027-01-29');
  insert.run('baby_name', 'Bebito Dino');
  insert.run('reminder_times', JSON.stringify(['08:00', '20:00']));
  insert.run('mama_name', 'Mama');
  insert.run('pin', '2604');

  return db;
}
