import { LatLngBounds, latLng } from 'leaflet';
import { Way } from './types';
import axios, { AxiosError } from 'axios';

async function unfriendlyFetchWays(
  bounds: LatLngBounds,
): Promise<Way[]> {
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  const bbox = `${south},${west},${north},${east}`;

  const query = `
    [out:json][timeout:25];
    (
      way["highway"="cycleway"]({{bbox}});
      way["bicycle"="designated"]({{bbox}});
    );
    out geom;
  `.replaceAll('{{bbox}}', bbox);

  const url = 'https://overpass-api.de/api/interpreter';

  const response = await axios.post(url, query, {
    headers: { 'Content-Type': 'text/plain' },
  });

  const elements = response.data.elements;

  const newWays: Way[] = elements
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    .filter((el: any) => el.type === 'way' && el.geometry)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    .map((way: any) => ({
      wayId: way.id,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      path: way.geometry.map((g: any) => latLng(g.lat, g.lon)),
    }));

  return newWays;
};

enum FriendlyErrorCode {
  GENERIC_ERROR = 'GENERIC_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

class FriendlyError extends Error {
  public code: FriendlyErrorCode;
  public originalError: Error;

  constructor(
    message: string,
    code: FriendlyErrorCode = FriendlyErrorCode.GENERIC_ERROR,
    originalError: Error,
  ) {
    super(message);
    this.name = 'FriendlyError';
    this.code = code;
    this.originalError = originalError;
  }
}

async function fetchWays(
  bounds: LatLngBounds,
): Promise<Way[]> {
  try {
    return await unfriendlyFetchWays(bounds);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (!error.response) {
        // No response, probably a network error
        throw new FriendlyError(
          'No internet connection. Please check your network and try again.',
          FriendlyErrorCode.NETWORK_ERROR,
          error);
      } else if (error.response.status === 500) {
        // Server error
        throw new FriendlyError(
          'Sorry, we are experiencing technical difficulties. Please try again later.',
          FriendlyErrorCode.SERVER_ERROR,
          error);
      } else if (error.response.status === 404) {
        // Not found
        throw new FriendlyError(
          'The requested data was not found. Please try again later.',
          FriendlyErrorCode.NOT_FOUND,
          error);
      } else {
        // Other errors
        throw new FriendlyError(
          'Something went wrong. Please try again later.',
          FriendlyErrorCode.GENERIC_ERROR,
          error);
      }
    } else {
      throw error;
    }
  }
}

export default fetchWays;
