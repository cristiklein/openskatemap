import { afterEach, describe, it, expect, vi } from 'vitest';
import L from 'leaflet';
import fetchWays from './fetchWays';
import axios, { AxiosError } from 'axios';

describe('fetchWays', () => {
  it('should retrieve expected cycleways', async () => {
    const south = 55.66879962984757;
    const west = 13.073666095733644;
    const north = 55.676870569996126;
    const east = 13.081712722778322;

    const bounds = L.latLngBounds(
      L.latLng(south, west),
      L.latLng(north, east)
    );

    const ways = await fetchWays(bounds);

    expect(ways.length).toBe(38);
    expect(ways[0].wayId).toBe(60468726);
    expect(ways[0].path[0]).toStrictEqual(L.latLng(55.6691438, 13.0744193));
    expect(ways[0].path).toStrictEqual([
      {
        "lat": 55.6691438,
        "lng": 13.0744193,
      },
      {
        "lat": 55.6694982,
        "lng": 13.0744039,
      },
      {
        "lat": 55.6698994,
        "lng": 13.0744139,
      },
      {
        "lat": 55.6703336,
        "lng": 13.0744334,
      },
      {
        "lat": 55.6706882,
        "lng": 13.0744673,
      },
      {
        "lat": 55.6707472,
        "lng": 13.0745094,
      },
      {
        "lat": 55.6709184,
        "lng": 13.0746073,
      },
      {
        "lat": 55.6710711,
        "lng": 13.0747784,
      },
      {
        "lat": 55.6711242,
        "lng": 13.0748146,
      },
      {
        "lat": 55.6715987,
        "lng": 13.074904,
      },
      {
        "lat": 55.6724452,
        "lng": 13.0750892,
      },
      {
        "lat": 55.6724795,
        "lng": 13.075107,
      },
    ]);
  });

  it('should retrieve expected cycleways with bicycle=yes tags', async () => {
    const south = 52.386015;
    const west = 4.868831;
    const north = 52.388883;
    const east = 4.874298;

    const bounds = L.latLngBounds(
      L.latLng(south, west),
      L.latLng(north, east)
    );

    const ways = await fetchWays(bounds);

    expect(ways.length).toBe(22);
    expect(ways[0].wayId).toBe(11535112);
    expect(ways[0].path[0]).toStrictEqual(L.latLng(52.3863161, 4.8657807));
  });
});

describe('failures', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw a friendly network error', async () => {
    const south = 55.66879962984757;
    const west = 13.073666095733644;
    const north = 55.676870569996126;
    const east = 13.081712722778322;

    const bounds = L.latLngBounds(
      L.latLng(south, west),
      L.latLng(north, east)
    );

    vi.spyOn(axios, 'post').mockRejectedValue(new AxiosError('Network Error'));

    await expect(fetchWays(bounds)).rejects.toThrow('No internet connection. Please check your network and try again.');

    expect(axios.post).toHaveBeenCalledWith(
      'https://overpass-api.de/api/interpreter',
      expect.anything(),
      expect.anything(),
    );
  });
});
