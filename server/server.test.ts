// server.test.ts
import { describe, it, beforeAll, expect } from 'vitest';
import request from 'supertest';
import { app, initDb } from './server';

beforeAll(async () => {
  await initDb(true); // true means "in memory"
});

describe('Way Qualities API store', () => {
  it('should accept a POST and return 204', async () => {
    const res = await request(app)
      .post('/openskatemap/api/way-qualities')
      .send([
        { wayId: 12345, quality: 'good' },
        { wayId: 12346, quality: 'medium' },
        { wayId: 12347, quality: 'bad' },
      ])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(204);
  });

  it('should return stored data with GET', async () => {
    const res = await request(app)
      .get('/openskatemap/api/way-qualities?ids=12345,12346')
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining(
        { wayId: 12345, quality: 'good' }
      ),
      expect.objectContaining(
        { wayId: 12346, quality: 'medium' }
      )
    ]);
  });
});
