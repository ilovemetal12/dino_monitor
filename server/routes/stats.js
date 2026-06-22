/**
 * Statistics routes.
 * Provides summary data for the home dashboard:
 * today's readings, weekly averages, last reading, and BP classification.
 */

import { Router } from 'express';

/**
 * Classifies blood pressure based on pregnancy guidelines.
 * @param {number} systolic
 * @param {number} diastolic
 * @returns {'normal'|'elevada'|'alta'|'baja'}
 */
function classifyBP(systolic, diastolic) {
  if (systolic >= 140 || diastolic >= 90) return 'alta';
  if (systolic >= 130 || diastolic >= 80) return 'elevada';
  if (systolic < 90 || diastolic < 60) return 'baja';
  return 'normal';
}

export default function statsRouter(db) {
  const router = Router();

  /** GET /summary - Full dashboard summary (today, week averages, trend data). */
  router.get('/summary', (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const todayReadings = db.prepare(
      'SELECT * FROM readings WHERE date = ? ORDER BY created_at DESC'
    ).all(today);

    const weekAvg = db.prepare(`
      SELECT ROUND(AVG(systolic),1) as avg_systolic, ROUND(AVG(diastolic),1) as avg_diastolic,
             ROUND(AVG(pulse),1) as avg_pulse, COUNT(*) as total_readings
      FROM readings WHERE date >= ?
    `).get(weekAgoStr);

    const lastReading = db.prepare(
      'SELECT * FROM readings ORDER BY created_at DESC LIMIT 1'
    ).get();

    const dailyReadings = db.prepare(`
      SELECT date, ROUND(AVG(systolic),1) as avg_systolic,
             ROUND(AVG(diastolic),1) as avg_diastolic, COUNT(*) as count
      FROM readings WHERE date >= ? GROUP BY date ORDER BY date ASC
    `).all(weekAgoStr);

    const classification = lastReading
      ? classifyBP(lastReading.systolic, lastReading.diastolic)
      : 'normal';

    res.json({
      today: { readings: todayReadings, count: todayReadings.length, minimum_required: 2 },
      week: weekAvg,
      last_reading: lastReading || null,
      daily_readings: dailyReadings,
      classification
    });
  });

  return router;
}
