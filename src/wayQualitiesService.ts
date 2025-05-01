import { Quality } from './types';
import axios from 'axios';

export interface WayQuality {
  wayId: number;
  quality: Quality;
  timestamp?: string;
}

export async function fetchWayQualities(wayIds: number[]) {
  const url = `${import.meta.env.VITE_API_BASE_URL}/openskatemap/api/way-qualities`;

  const response = await axios.post(url, wayIds, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
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
