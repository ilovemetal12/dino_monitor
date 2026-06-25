/**
 * Statistics routes.
 * Provides summary data for the home dashboard:
 * today's readings, weekly averages, last reading, and BP classification.
 */

import { Router } from 'express';

/**
 * Classifies blood pressure based on pregnancy guidelines.
 * Uses the highest category reached by either value.
 * @param {number} systolic
 * @param {number} diastolic
 * @returns {'muy_alta'|'alta'|'elevada'|'normal'|'baja'}
 */
function classifyBP(systolic, diastolic) {
  if (systolic >= 160 || diastolic >= 110) return 'muy_alta';
  if (systolic >= 140 || diastolic >= 90) return 'alta';
  if (systolic >= 130 || diastolic >= 80) return 'elevada';
  if (systolic < 90 || diastolic < 60) return 'baja';
  return 'normal';
}

export default function statsRouter(db) {
  const router = Router();

  /** GET /summary - Full dashboard summary (today, week averages, trend data). */
  router.get('/summary', async (_req, res) => {
    const { rows: todayReadings } = await db.query(
      'SELECT * FROM readings WHERE date = CURRENT_DATE ORDER BY created_at DESC'
    );

    const { rows: [weekAvg] } = await db.query(`
      SELECT ROUND(AVG(systolic)::numeric, 1) as avg_systolic,
             ROUND(AVG(diastolic)::numeric, 1) as avg_diastolic,
             ROUND(AVG(pulse)::numeric, 1) as avg_pulse,
             COUNT(*)::int as total_readings
      FROM readings WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const { rows: lastRows } = await db.query(
      'SELECT * FROM readings ORDER BY created_at DESC LIMIT 1'
    );
    const lastReading = lastRows[0] || null;

    const { rows: dailyReadings } = await db.query(`
      SELECT date, ROUND(AVG(systolic)::numeric, 1) as avg_systolic,
             ROUND(AVG(diastolic)::numeric, 1) as avg_diastolic, COUNT(*)::int as count
      FROM readings WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date ORDER BY date ASC
    `);

    const classification = lastReading
      ? classifyBP(lastReading.systolic, lastReading.diastolic)
      : 'normal';

    res.json({
      today: { readings: todayReadings, count: todayReadings.length, minimum_required: 3 },
      week: weekAvg,
      last_reading: lastReading,
      daily_readings: dailyReadings,
      classification
    });
  });

  return router;
}
