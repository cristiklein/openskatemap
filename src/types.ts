import { LatLngExpression } from 'leaflet';

export type Quality = 'green' | 'yellow' | 'red' | 'grey';

export interface Way {
  id: number;
  path: LatLngExpression[];
  quality: Quality;
}
