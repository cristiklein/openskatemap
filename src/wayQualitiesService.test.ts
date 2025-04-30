import { describe, it, expect } from 'vitest';
import { fetchWayQualities, storeWayQualities } from './wayQualitiesService';

describe('wayQualitiesService', () => {
  it('should store', async () => {
    const wayQualities = [
      {
        id: 0,
        quality: 1,
      },
      {
        id: 1,
        quality: 0,
      },
      {
        id: 2,
        quality: -1,
      },
    ];

    await storeWayQualities(wayQualities);

    const fetchedWayQualities = fetchWayQualities(wayQualities.map((w) => w.id));
    expect(fetchedWayQualities).toStrictEqual(wayQualities);

    const f2 = fetchWayQualities([2]);
    expect(f2).toStrictEqual([
      {
        id: 2,
        quality: -1,
      }
    ]);
  });
});
