import { Quality } from './types';

export interface WayQuality {
  id: number;
  quality: Quality;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fetchWayQualities(wayIds: number[]) {
  /* TODO */
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function storeWayQualities(wq: WayQuality[]) {
  /* TODO */
}
