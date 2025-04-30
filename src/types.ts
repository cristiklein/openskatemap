import { LatLng } from 'leaflet';

export type Quality = 1 | 0 | -1 | undefined;

export interface Way {
  id: number;
  path: LatLng[];
  quality: Quality;
}
