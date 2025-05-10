import { afterAll, afterEach, beforeAll, describe, it, expect } from 'vitest';
import { fetchWayQualities, handleAxiosError, storeWayQualities, WayQuality } from './wayQualitiesService';
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { app, initDb } from '../server/server';
import { Server } from 'http';

describe('wayQualitiesService', () => {
  let server: Server;

  beforeAll(async () => {
    await initDb();
    server = app.listen(3001); // use a test port
  });

  afterAll(() => {
    server.close();
  });

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

  it('should not error with an empty request', async () => {
    const wqs = await fetchWayQualities([]);
    expect(wqs).toEqual([]);
  });
});

describe('network failures', () => {
  const server = setupServer(...[
    http.post('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return HttpResponse.error();
    }),
    http.put('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return HttpResponse.error();
    }),
  ]);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should throw a friendly network error on fetch', async () => {
    await expect(fetchWayQualities([123])).rejects.toThrow('No internet connection. Please check your network and try again.');
  });

  it('should throw a friendly network error on store', async () => {
    await expect(storeWayQualities([])).rejects.toThrow('No internet connection. Please check your network and try again.');
  });
});

describe('server failures', () => {
  const server = setupServer(...[
    http.post('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return new HttpResponse(null, { status: 500 });
    }),
    http.put('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return new HttpResponse(null, { status: 500 });
    }),
  ]);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should throw a friendly server error on fetch', async () => {
    await expect(fetchWayQualities([123])).rejects.toThrow('Sorry, OpenSkateMap is experiencing technical difficulties. Please try again later.');
  });

  it('should throw a friendly server error on store', async () => {
    await expect(storeWayQualities([])).rejects.toThrow('Sorry, OpenSkateMap is experiencing technical difficulties. Please try again later.');
  });
});

describe('other failures', () => {
  const server = setupServer(...[
    http.post('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return new HttpResponse(null, { status: 501 });
    }),
    http.put('http://localhost:3001/openskatemap/api/way-qualities', () => {
      return new HttpResponse(null, { status: 501 });
    }),
  ]);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should throw a friendly server error on fetch', async () => {
    await expect(fetchWayQualities([123])).rejects.toThrow('Something went wrong while fetching data from OpenSkateMap. Please try again later.');
  });

  it('should throw a friendly server error on store', async () => {
    await expect(storeWayQualities([])).rejects.toThrow('Something went wrong while fetching data from OpenSkateMap. Please try again later.');
  });
});

describe('handleAxiosError', () => {
  it('passes through non-Axios errors untouched', () => {
    const edgeErrors = [undefined, 'string error', new Error('42')];

    for (const error of edgeErrors) {
      expect(() => handleAxiosError(error)).toThrow(error);
    }
  });
});
