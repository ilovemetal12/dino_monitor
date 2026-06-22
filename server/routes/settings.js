/**
 * Settings routes.
 * Key-value store for app configuration (due date, reminders, names).
 * Values are JSON-serialized for complex types (arrays, objects).
 */

import { Router } from 'express';

export default function settingsRouter(db) {
  const router = Router();

  /** GET / - Returns all settings as a key-value object. */
  router.get('/', (_req, res) => {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const { key, value } of rows) {
      try { settings[key] = JSON.parse(value); }
      catch { settings[key] = value; }
    }
    res.json(settings);
  });

  /** PUT /:key - Update a single setting by key. */
  router.put('/:key', (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, serialized);
    res.json({ key, value });
  });

  return router;
}
