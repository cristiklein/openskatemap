import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { LatLngExpression, latLng } from 'leaflet';
import axios from 'axios';

const center: LatLngExpression = [55.60249267294951, 12.967599313254912];

type Quality = 'green' | 'yellow' | 'red';

interface Road {
  id: number;
  path: LatLngExpression[];
  quality: Quality;
}

const initialRoads: Road[] = [
  {
    id: 1,
    path: [
      [55.6025, 12.9675],
      [55.6030, 12.9678],
    ],
    quality: 'red',
  },
  {
    id: 2,
    path: [
      [55.6020, 12.9670],
      [55.6023, 12.9674],
    ],
    quality: 'yellow',
  },
  {
    id: 3,
    path: [
      [55.6015, 12.9665],
      [55.6018, 12.9670],
    ],
    quality: 'green',
  },
];

const RoadUpdater = ({
  roads,
  setRoads,
}: {
  roads: Road[];
  setRoads: React.Dispatch<React.SetStateAction<Road[]>>;
}) => {
  const map = useMap();

  useEffect(() => {
    const fetchCycleways = async () => {
      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();

      const query = `
        [out:json][timeout:25];
        (
          way["highway"="cycleway"](${south},${west},${north},${east});
          way["cycleway"~"."](${south},${west},${north},${east});
        );
        out geom;
      `;

      const url = 'https://overpass-api.de/api/interpreter';

      try {
        const response = await axios.post(url, query, {
          headers: { 'Content-Type': 'text/plain' },
        });

        const elements = response.data.elements;

        const newRoads: Road[] = elements
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          .filter((el: any) => el.type === 'way' && el.geometry)
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          .map((way: any) => ({
            id: way.id,
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            path: way.geometry.map((g: any) => [g.lat, g.lon]) as LatLngExpression[],
            quality: 'yellow', // default quality
          }));

        setRoads(newRoads);
      } catch (error) {
        console.error('Failed to fetch cycleways', error);
      }
    };

    fetchCycleways();
  }, [map]);

  const updateClosestRoadQuality = (quality: Quality) => {
    const centerLatLng = map.getCenter();

    let closestRoadId: number | null = null;
    let closestDistance = Infinity;

    roads.forEach((road) => {
      road.path.forEach((point) => {
        const pointLatLng = latLng(point);
        const distance = centerLatLng.distanceTo(pointLatLng);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestRoadId = road.id;
        }
      });
    });

    if (closestRoadId !== null) {
      setRoads((prevRoads) =>
        prevRoads.map((road) =>
          road.id === closestRoadId ? { ...road, quality } : road
        )
      );
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
      background: 'white',
      padding: '8px',
      borderRadius: '8px',
      display: 'grid',
      gridAutoFlow: 'row',
      gridAutoColumns: '1fr',
      gap: 5,
    }}>
      <div>Edit asphalt quality:</div>
      <div>
        <button onClick={() => updateClosestRoadQuality('green')} style={{ background: 'green', color: 'white', marginRight: '5px' }}>Green</button>
        <button onClick={() => updateClosestRoadQuality('yellow')} style={{ background: 'gold', color: 'black', marginRight: '5px' }}>Yellow</button>
        <button onClick={() => updateClosestRoadQuality('red')} style={{ background: 'red', color: 'white' }}>Red</button>
      </div>
      <div>⚠️ This is just a Proof-of-Concept.<br/>Your edits WILL NOT be saved.</div>
    </div>
  );
};

const MapView = () => {
  const [roads, setRoads] = useState<Road[]>(initialRoads);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={19}
        />

        <RoadUpdater roads={roads} setRoads={setRoads} />

        {/* Draw all cycleways */}
        {roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.path}
            pathOptions={{ color: road.quality, weight: 5 }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
