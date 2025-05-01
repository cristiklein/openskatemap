import express from 'express';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import cors from 'cors';
import { z } from 'zod';
import pinoHttp from 'pino-http';
import logger from './logger';

const app: express.Application = express();
app.use(express.json());
app.use(pinoHttp({ logger }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://cristiklein.github.io',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

let db: Database<sqlite3.Database, sqlite3.Statement>;

async function initDb(memory = false) {
  const database = await open({
    filename: memory ? ':memory:' : '/tmp/way_qualities.db',
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS way_qualities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      way_id INTEGER NOT NULL,
      quality INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_way_timestamp ON way_qualities (way_id, timestamp);
  `);

  db = database;
}

const WayQualitiesPutSchema = z.array(
  z.object({
    wayId: z.number().int().nonnegative(),
    quality: z.number().int(),
  }),
);

app.put('/openskatemap/api/way-qualities', async (req, res) => {
  const result = WayQualitiesPutSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: result.error.issues
    });
    return;
  }

  const entries = result.data;
  const ip = req.ip;
  const now = new Date().toISOString();

  if (entries.length > MAX_IDS) {
    res.status(400).json({ error: `Too many entities (max ${MAX_IDS})` });
    return;
  }

  const stmt = await db.prepare(
    `INSERT INTO way_qualities (way_id, quality, timestamp, ip)
     VALUES (?, ?, ?, ?)`
  );

  try {
    await db.run('BEGIN');
    for (const { wayId, quality } of entries) {
      await stmt.run(wayId, quality, now, ip);
    }
    await db.run('COMMIT');
    res.sendStatus(204);
  } catch (e) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    await stmt.finalize();
  }
});

const WayQualitiesPostSchema = z.array(
  z.number().int().nonnegative(),
);
const MAX_IDS = 1000;

app.post('/openskatemap/api/way-qualities', async (req, res) => {
  const result = WayQualitiesPostSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: result.error.issues
    });
    return;
  }

  const ids = result.data;
  if (ids.length === 0) {
    res.status(400).json({ error: 'No valid IDs provided' });
    return;
  }
  if (ids.length > MAX_IDS) {
    res.status(400).json({ error: `Too many IDs requested (max ${MAX_IDS})` });
    return;
  }

  const placeholders = ids.map(() => '?').join(',');

  const latestRows = await db.all(
    `SELECT wq1.way_id, wq1.quality, wq1.timestamp
     FROM way_qualities wq1
     INNER JOIN (
       SELECT way_id, MAX(timestamp) AS max_ts
       FROM way_qualities
       WHERE way_id IN (${placeholders})
       GROUP BY way_id
     ) wq2 ON wq1.way_id = wq2.way_id AND wq1.timestamp = wq2.max_ts`,
    ids
  );

  res.json(latestRows.map(row => ({
    wayId: row.way_id,
    quality: row.quality,
    timestamp: row.timestamp
  })));
});

export { app, initDb };
