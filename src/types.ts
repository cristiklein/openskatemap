import { LatLng } from 'leaflet';

export type Quality = 1 | 0 | -1 | undefined;

export interface Way {
  wayId: number;
  path: LatLng[];
  quality: Quality;
}

export class FriendlyError extends Error {
  static readonly NETWORK_ERROR = 'NETWORK_ERROR';
  static readonly SERVER_ERROR = 'SERVER_ERROR';
  static readonly UNKNOWN_ERROR = 'UNKNOWN_ERROR';

  public code: string;
  public originalError: Error;

  constructor(
    message: string,
    code = FriendlyError.UNKNOWN_ERROR,
    originalError: Error,
  ) {
    super(message);
    this.name = 'FriendlyError';
    this.code = code;
    this.originalError = originalError;
  }
}
