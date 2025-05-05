// server.test.ts
import { describe, it, beforeAll, expect } from 'vitest';
import request from 'supertest';
import { app, initDb } from './server';

beforeAll(async () => {
  await initDb();
});

describe('Way Qualities API store', () => {
  it('should accept PUT and return 204', async () => {
    const res = await request(app)
      .put('/openskatemap/api/way-qualities')
      .send([
        { wayId: 12345, quality: +1 },
        { wayId: 12346, quality: 0 },
        { wayId: 12347, quality: -1 },
      ])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(204);
  });

  it('should accept POST and return stored data', async () => {
    const res = await request(app)
      .post('/openskatemap/api/way-qualities')
      .send([12345,12346])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining(
        { wayId: 12345, quality: +1 }
      ),
      expect.objectContaining(
        { wayId: 12346, quality: 0 }
      )
    ]);
  });

  it('should accept PUT with coordinates and return 204', async () => {
    const res = await request(app)
      .put('/openskatemap/api/way-qualities')
      .send([
        {
          wayId: 112345,
          quality: +1,
          latitude: 55.67424385812128,
          longitude: 13.073523260499705
        },
        {
          wayId: 112346,
          quality: 0,
          latitude: 55.60276481037733,
          longitude: 12.96742708750688,
        },
        {
          wayId: 112347,
          quality: -1,
          latitude: 55.60276481037733,
          longitude: 12.96742708750688,
        },
      ])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(204);
  });

  it('should accept POST and return stored data with coordinates', async () => {
    const res = await request(app)
      .post('/openskatemap/api/way-qualities')
      .send([112345,112346])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining(
        {
          wayId: 112345,
          quality: +1,
          latitude: 55.67424385812128,
          longitude: 13.073523260499705
        }
      ),
      expect.objectContaining(
        {
          wayId: 112346,
          quality: 0,
          latitude: 55.60276481037733,
          longitude: 12.96742708750688,
        }
      )
    ]);
  });

  it('should accept PUT to reset quality', async () => {
    const res = await request(app)
      .put('/openskatemap/api/way-qualities')
      .send([
        { wayId: 212345, quality: undefined },
      ])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(204);
  });

  it('should accept POST and return reset quality', async () => {
    const res = await request(app)
      .post('/openskatemap/api/way-qualities')
      .send([212345])
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining(
        {
          wayId: 212345,
          quality: null,
        }
      ),
    ]);
  });
});
