import { LatLngBounds, latLng } from 'leaflet';
import { FriendlyError, Way } from './types';
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
      way["highway"="raceway"]({{bbox}});
      way["bicycle"]({{bbox}});
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

export function handleAxiosError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (!error.response) {
      // No response, probably a network error
      throw new FriendlyError(
        'No internet connection. Please check your network and try again.',
        FriendlyError.NETWORK_ERROR,
        error);
    } else if (error.response.status === 500) {
      // Server error
      throw new FriendlyError(
        'Sorry, Overpass is experiencing technical difficulties. Please try again later.',
        FriendlyError.SERVER_ERROR,
        error);
    } else {
      // Other errors
      throw new FriendlyError(
        'Something went wrong while fetching data from Overpass. Please try again later.',
        FriendlyError.UNKNOWN_ERROR,
        error);
    }
  } else {
    throw error;
  }
}

async function fetchWays(
  bounds: LatLngBounds,
): Promise<Way[]> {
  try {
    return await unfriendlyFetchWays(bounds);
  } catch (error) {
    handleAxiosError(error);
  }
}

export default fetchWays;
