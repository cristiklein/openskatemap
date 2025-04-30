import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import { z } from 'zod';

const WayQualitySchema = z.object({
  wayId: z.number().int().nonnegative(),
  quality: z.enum(['good', 'medium', 'bad']),
});

const WayQualityArraySchema = z.array(WayQualitySchema);

const app = express();
app.use(express.json());

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

let db: sqlite3.Database;

async function initDb(memory = false) {
  const database = await open({
    filename: memory ? ':memory:' : './way_qualities.db',
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS way_qualities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      way_id INTEGER NOT NULL,
      quality TEXT NOT NULL CHECK (quality IN ('good', 'medium', 'bad')),
      timestamp TEXT NOT NULL,
      ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_way_timestamp ON way_qualities (way_id, timestamp);
  `);

  db = database;
}

app.post('/openskatemap/api/way-qualities', async (req, res) => {
  const result = WayQualityArraySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request', details: result.error.issues });
  }

  const entries = result.data;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  const now = new Date().toISOString();

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
    res.status(500).json({ error: e.message });
  } finally {
    await stmt.finalize();
  }
});

const WayIdArraySchema = z.string()
        .transform(value => value.split( ',' ).map( Number ))
        .pipe(z.array(z.number().int().nonnegative()));

app.get('/openskatemap/api/way-qualities', async (req, res) => {
  const result = WayIdArraySchema.safeParse(req.query.ids);

  if (!result.success) {
    console.error(result.error.issues);
    return res.status(400).json({ error: 'Invalid request', details: result.error.issues });
  }

  const ids = result.data;
  if (ids.length === 0) {
    return res.status(400).json({ error: 'No valid IDs provided' });
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
