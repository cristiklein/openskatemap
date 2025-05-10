import { FriendlyError, Quality } from './types';
import axios from 'axios';

export interface WayQuality {
  wayId: number;
  quality: Quality;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
}

export function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (process.env.NODE_ENV !== 'test')
      console.error('wayQualityService failed:', error);
    if (!error.response) {
      // No response, probably a network error
      throw new FriendlyError(
        'No internet connection. Please check your network and try again.',
        FriendlyError.NETWORK_ERROR,
        error);
    } else if (error.response.status === 500) {
      // Server error
      throw new FriendlyError(
        'Sorry, OpenSkateMap is experiencing technical difficulties. Please try again later.',
        FriendlyError.SERVER_ERROR,
        error);
    } else {
      // Other errors
      throw new FriendlyError(
        'Something went wrong while fetching data from OpenSkateMap. Please try again later.',
        FriendlyError.UNKNOWN_ERROR,
        error);
    }
  } else {
    throw error;
  }
}

export async function fetchWayQualities(wayIds: number[]): Promise<WayQuality[]> {
  if (wayIds.length === 0) {
    // It doesn't make sense to ask the server for no data
    return [];
  }

  const url = `${import.meta.env.VITE_API_BASE_URL}/openskatemap/api/way-qualities`;

  try {
    const response = await axios.post(url, wayIds, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function storeWayQualities(wq: WayQuality[]) {
  const url = `${import.meta.env.VITE_API_BASE_URL}/openskatemap/api/way-qualities`;

  try {
    const response = await axios.put(url, wq, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
