// server.ts
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://cristiklein.github.io',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

let db: sqlite3.Database;

async function initDb() {
  const database = await open({
    filename: './way_qualities.db',
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS way_qualities (
      way_id INTEGER PRIMARY KEY,
      quality TEXT NOT NULL CHECK (quality IN ('green', 'yellow', 'red')),
      timestamp TEXT NOT NULL,
      ip TEXT NOT NULL
    );
  `);

  db = database;
}

app.post('/api/way-qualities', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const entries = req.body;
  const stmt = await db.prepare(
    `INSERT INTO way_qualities (way_id, quality, timestamp, ip)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(way_id) DO UPDATE SET
       quality=excluded.quality,
       timestamp=excluded.timestamp,
       ip=excluded.ip`
  );

  const now = new Date().toISOString();

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

app.post('/api/way-qualities/get', async (req, res) => {
  const ids = req.body;
  const placeholders = ids.map(() => '?').join(',');
  const rows = await db.all(
    `SELECT way_id as wayId, quality, timestamp FROM way_qualities WHERE way_id IN (${placeholders})`,
    ids
  );
  res.json(rows);
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
