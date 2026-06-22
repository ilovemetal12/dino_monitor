/**
 * Settings routes.
 * Key-value store for app configuration (due date, reminders, names).
 * Values are JSON-serialized for complex types (arrays, objects).
 */

import { Router } from 'express';

export default function settingsRouter(db) {
  const router = Router();

  /** GET / - Returns all settings as a key-value object. */
  router.get('/', async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM settings');
    const settings = {};
    for (const { key, value } of rows) {
      try { settings[key] = JSON.parse(value); }
      catch { settings[key] = value; }
    }
    res.json(settings);
  });

  /** PUT /:key - Update a single setting by key. */
  router.put('/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await db.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [key, serialized]
    );
    res.json({ key, value });
  });

  return router;
}
