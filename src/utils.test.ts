import { describe, it, expect } from 'vitest';
import { getClosestWay } from './utils';
import waysJson from './data/ways.json';
import { LatLng } from 'leaflet';
import { Way } from './types';

const ways = waysJson as Way[];

const testData = [{
  center: [ 55.60360925153541,12.981132566928865 ],
  expectedWayId: 174377654,
}, {
  center: [ 55.603891081475425,12.981765568256378 ],
  expectedWayId: 174377654,
}, {
  center: [ 55.60388956626609,12.981821894645693 ],
  expectedWayId: 126784706,
}]

describe('getClosestWay', () => {
  testData.forEach(({ center, expectedWayId }, i) => {
    it(`returns expected way for test case #${i + 1}`, () => {
      const centerLatLng = new LatLng(center[0], center[1]);
      const result = getClosestWay(centerLatLng, ways as Way[]);
      expect(result?.wayId).toBe(expectedWayId);
    });
  });
});
