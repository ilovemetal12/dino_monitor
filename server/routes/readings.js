/**
 * Blood pressure readings CRUD routes.
 * Handles creating, listing, fetching, and deleting BP readings.
 */

import { Router } from 'express';

/** Valid ranges for blood pressure values */
const BP_LIMITS = { systolic: { min: 60, max: 250 }, diastolic: { min: 30, max: 150 } };

/** Minimum daily readings required */
const DAILY_MINIMUM = 2;

export default function readingsRouter(db) {
  const router = Router();

  /**
   * GET / - List readings with optional date filters.
   * Query params: date, from, to, limit (default 50), offset (default 0)
   */
  router.get('/', (req, res) => {
    const { date, from, to, limit = 50, offset = 0 } = req.query;

    const conditions = [];
    const params = [];

    if (date) { conditions.push('date = ?'); params.push(date); }
    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }

    const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const readings = db.prepare(`SELECT * FROM readings${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, Number(limit), Number(offset));

    const { count } = db.prepare(`SELECT COUNT(*) as count FROM readings${where}`).get(...params);

    res.json({ readings, total: count });
  });

  /**
   * GET /today/count - Returns today's reading count vs minimum required.
   * Must be defined before /:id to avoid route conflict.
   */
  router.get('/today/count', (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { count } = db.prepare('SELECT COUNT(*) as count FROM readings WHERE date = ?').get(today);
    res.json({ count, minimum: DAILY_MINIMUM });
  });

  /** GET /:id - Fetch a single reading by ID. */
  router.get('/:id', (req, res) => {
    const reading = db.prepare('SELECT * FROM readings WHERE id = ?').get(req.params.id);
    if (!reading) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(reading);
  });

  /** POST / - Create a new blood pressure reading. */
  router.post('/', (req, res) => {
    const { systolic, diastolic, pulse, position, arm, notes } = req.body;

    if (!systolic || !diastolic) {
      return res.status(400).json({ error: 'Sistolica y diastolica son requeridas' });
    }
    if (systolic < BP_LIMITS.systolic.min || systolic > BP_LIMITS.systolic.max ||
        diastolic < BP_LIMITS.diastolic.min || diastolic > BP_LIMITS.diastolic.max) {
      return res.status(400).json({ error: 'Valores fuera de rango valido' });
    }

    const result = db.prepare(
      'INSERT INTO readings (systolic, diastolic, pulse, position, arm, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(systolic, diastolic, pulse || null, position || 'sentada', arm || 'izquierdo', notes || null);

    const newReading = db.prepare('SELECT * FROM readings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newReading);
  });

  /** DELETE /:id - Delete a reading by ID. */
  router.delete('/:id', (req, res) => {
    const { changes } = db.prepare('DELETE FROM readings WHERE id = ?').run(req.params.id);
    if (changes === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ success: true });
  });

  return router;
}
