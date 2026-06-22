/**
 * DinoMom Server
 * 
 * Express server that serves the React frontend and provides
 * the REST API for blood pressure tracking during pregnancy.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import readingsRouter from './routes/readings.js';
import statsRouter from './routes/stats.js';
import weekRouter from './routes/week.js';
import reportsRouter from './routes/reports.js';
import settingsRouter from './routes/settings.js';
import authRouter from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3333;

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = initDb();

// --- API Routes ---
app.use('/api/auth', authRouter(db));
app.use('/api/readings', readingsRouter(db));
app.use('/api/stats', statsRouter(db));
app.use('/api/week', weekRouter(db));
app.use('/api/reports', reportsRouter(db));
app.use('/api/settings', settingsRouter(db));

// --- Static Files ---
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Serve React frontend (production build)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`DinoMom server running on port ${PORT}`);
});
