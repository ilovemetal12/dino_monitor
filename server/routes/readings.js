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
  router.get('/', async (req, res) => {
    const { date, from, to, limit = 50, offset = 0 } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (date) { conditions.push(`date = $${paramIndex++}`); params.push(date); }
    if (from) { conditions.push(`date >= $${paramIndex++}`); params.push(from); }
    if (to) { conditions.push(`date <= $${paramIndex++}`); params.push(to); }

    const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    const { rows: readings } = await db.query(
      `SELECT * FROM readings${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), Number(offset)]
    );

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*)::int as count FROM readings${where}`,
      params
    );

    res.json({ readings, total: count });
  });

  /**
   * GET /today/count - Returns today's reading count vs minimum required.
   * Must be defined before /:id to avoid route conflict.
   */
  router.get('/today/count', async (_req, res) => {
    const { rows: [{ count }] } = await db.query(
      "SELECT COUNT(*)::int as count FROM readings WHERE date = CURRENT_DATE"
    );
    res.json({ count, minimum: DAILY_MINIMUM });
  });

  /** GET /:id - Fetch a single reading by ID. */
  router.get('/:id', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM readings WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(rows[0]);
  });

  /** POST / - Create a new blood pressure reading. */
  router.post('/', async (req, res) => {
    const { systolic, diastolic, pulse, position, arm, notes } = req.body;

    if (!systolic || !diastolic) {
      return res.status(400).json({ error: 'Sistolica y diastolica son requeridas' });
    }
    if (systolic < BP_LIMITS.systolic.min || systolic > BP_LIMITS.systolic.max ||
        diastolic < BP_LIMITS.diastolic.min || diastolic > BP_LIMITS.diastolic.max) {
      return res.status(400).json({ error: 'Valores fuera de rango valido' });
    }

    const { rows } = await db.query(
      `INSERT INTO readings (systolic, diastolic, pulse, position, arm, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [systolic, diastolic, pulse || null, position || 'sentada', arm || 'izquierdo', notes || null]
    );

    res.status(201).json(rows[0]);
  });

  /** DELETE /:id - Delete a reading by ID. */
  router.delete('/:id', async (req, res) => {
    const { rowCount } = await db.query('DELETE FROM readings WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ success: true });
  });

  return router;
}
