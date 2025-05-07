import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { fetchWayQualities, storeWayQualities, WayQuality } from './wayQualitiesService';

import { app, initDb } from '../server/server';
import { Server } from 'http';

let server: Server;

beforeAll(async () => {
  await initDb();
  server = app.listen(3001); // use a test port
});

afterAll(() => {
  server.close();
});

describe('wayQualitiesService', () => {
  it('should store', async () => {
    const wayQualities = [
      {
        wayId: 0,
        quality: 1,
      },
      {
        wayId: 1,
        quality: 0,
      },
      {
        wayId: 2,
        quality: -1,
      },
    ] as WayQuality[];

    await storeWayQualities(wayQualities);

    const wayIds = wayQualities.map((w) => w.wayId);
    const fetchedWayQualities = await fetchWayQualities(wayIds);

    const relevantWayQualities = fetchedWayQualities.map(
      (wq: WayQuality) => ({ wayId: wq.wayId, quality: wq.quality })
    );

    expect(relevantWayQualities).toStrictEqual(wayQualities);

    const f2 = await fetchWayQualities([2]);
    expect(f2).toEqual([
      expect.objectContaining({
        wayId: 2,
        quality: -1,
      })
    ]);
  });
});
