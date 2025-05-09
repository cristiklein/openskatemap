import { LatLng } from 'leaflet';
import { Way } from './types';

// Function to calculate the distance from a point to a line segment using L.LatLng
export function getDistanceToLineSegment(
  pointLatLng: LatLng,
  lineLatLng1: LatLng,
  lineLatLng2: LatLng,
) {
  // Extract lat/lng values from L.LatLng objects
  const lat1 = lineLatLng1.lat;
  const lng1 = lineLatLng1.lng;
  const lat2 = lineLatLng2.lat;
  const lng2 = lineLatLng2.lng;
  const latP = pointLatLng.lat;
  const lngP = pointLatLng.lng;

  // Vector from lineStart to lineEnd
  const lineVectorX = lng2 - lng1;
  const lineVectorY = lat2 - lat1;

  // Vector from lineStart to point
  const pointVectorX = lngP - lng1;
  const pointVectorY = latP - lat1;

  // Length squared of the line segment
  const lineLengthSquared = lineVectorX * lineVectorX + lineVectorY * lineVectorY;

  // Project the point onto the line (scalar projection)
  const projectionFactor = (pointVectorX * lineVectorX + pointVectorY * lineVectorY) / lineLengthSquared;

  let closestPoint;

  // If the projection falls before the start of the segment
  if (projectionFactor < 0) {
    closestPoint = lineLatLng1;  // closest to the first endpoint
  }
  // If the projection falls after the end of the segment
  else if (projectionFactor > 1) {
    closestPoint = lineLatLng2;  // closest to the second endpoint
  }
  // If the projection falls within the segment
  else {
    closestPoint = new LatLng(lat1 + projectionFactor * lineVectorY, lng1 + projectionFactor * lineVectorX);  // closest point on the line
  }

  // Return the distance from the point to the closest point on the line
  return pointLatLng.distanceTo(closestPoint);
}

export function getClosestWay(centerLatLng: LatLng, ways: Way[]): Way | undefined {
  let closestWay: Way | undefined;
  let closestDistance = Infinity;

  ways.forEach((way) => {
    for (let i = 0; i < way.path.length - 1; i++) {
      const start = way.path[i];
      const end = way.path[i + 1];

      const distance = getDistanceToLineSegment(
        centerLatLng,
        start,
        end);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestWay = way;
      }
    }
  });

  return closestWay;
}
