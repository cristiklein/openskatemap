import { Quality } from './types';
import axios from 'axios';

export interface WayQuality {
  wayId: number;
  quality: Quality;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
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
    if (axios.isAxiosError(error)) {
      console.error('Request failed with status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      console.error('Request failed with status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
