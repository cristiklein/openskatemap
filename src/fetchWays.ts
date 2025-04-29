import { LatLngBounds, latLng } from 'leaflet';
import { Way } from './types';
import axios from 'axios';

export default async function fetchWays(
  bounds: LatLngBounds,
  defaultQuality = 'grey',
): Promise<Way[]> {
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();

  const query = `
    [out:json][timeout:25];
    (
      way["highway"="cycleway"](${south},${west},${north},${east});
      way["cycleway"~"."](${south},${west},${north},${east});
      way["highway"="footway"](${south},${west},${north},${east});
      way["footway"~"."](${south},${west},${north},${east});
      way["highway"="secondary"]["cycleway"="lane"](${south},${west},${north},${east});
    );
    out geom;
  `;

  console.log(`Fetching ${query}`);

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
      id: way.id,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      path: way.geometry.map((g: any) => latLng(g.lat, g.lon)),
      quality: defaultQuality,
    }));

  console.log(`Got ${newWays.length} ways`);

  return newWays;
};
