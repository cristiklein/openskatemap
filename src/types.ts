import { LatLng } from 'leaflet';

export type Quality = 'green' | 'yellow' | 'red' | 'grey';

export interface Way {
  id: number;
  path: LatLng[];
  quality: Quality;
}
