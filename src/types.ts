import { LatLng } from 'leaflet';

export type Quality = 'good' | 'medium' | 'bad' | 'unknown';

export interface Way {
  id: number;
  path: LatLng[];
  quality: Quality;
}
