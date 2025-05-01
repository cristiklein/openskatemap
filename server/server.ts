import express from 'express';
import { initDb, getDb } from './db';
import cors from 'cors';
import { z } from 'zod';
import pinoHttp from 'pino-http';
import logger from './logger';

const app: express.Application = express();
app.use(express.json());
app.use(pinoHttp({ logger }));
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

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

  const db = getDb();
   try {
    await db.transaction(async (trx) => {
      for (const { wayId, quality } of req.body) {
        await trx('way_qualities').insert({
          way_id: wayId,
          quality,
          timestamp: now,
          ip,
        });
      }
    });
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
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

  const db = getDb();
  const results = await db('way_qualities as wq1')
    .select('wq1.way_id', 'wq1.quality', 'wq1.timestamp')
    .join(
      db('way_qualities')
        .select('way_id')
        .max('timestamp as max_ts')
        .whereIn('way_id', ids)
        .groupBy('way_id')
        .as('wq2'),
      function () {
        this.on('wq1.way_id', '=', 'wq2.way_id')
            .andOn('wq1.timestamp', '=', 'wq2.max_ts');
      }
    );

  res.json(results.map(({ way_id, quality, timestamp }) => ({
    wayId: way_id,
    quality,
    timestamp,
  })));
});

app.get('/health', async (_, res) => {
  const db = getDb();
  try {
    await db.raw('SELECT 1+1 AS result');
    res.send('OK');
  } catch (err) {
    logger.error(err, 'Health check failed');
    res.status(500).json({ error: (err as Error).message });
  }
});

export { app, initDb };
