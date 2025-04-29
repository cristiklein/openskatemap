import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { LatLngExpression, latLng } from 'leaflet';
import UserLocationTracker from './UserLocationTracker';
import axios from 'axios';

const center: LatLngExpression = [55.60249267294951, 12.967599313254912];

type Quality = 'green' | 'yellow' | 'red' | 'grey';

interface Way {
  id: number;
  path: LatLngExpression[];
  quality: Quality;
}

const initialWays: Way[] = [
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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function debounce(this: any, func: any, timeout = 1000) {
  let timer: ReturnType<typeof setTimeout>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const WayUpdater = ({
  ways,
  setWays,
  userWayIdToQuality,
  setUserWayIdToQuality,
  followUser,
  setFollowUser,
}: {
  ways: Way[];
  setWays: React.Dispatch<React.SetStateAction<Way[]>>;
  userWayIdToQuality: Map<number, Quality>;
  setUserWayIdToQuality: React.Dispatch<React.SetStateAction<Map<number, Quality>>>;
  followUser: boolean;
  setFollowUser: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const map = useMap();

  const fetchWays = async () => {
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

      const newWays: Way[] = elements
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        .filter((el: any) => el.type === 'way' && el.geometry)
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        .map((way: any) => ({
          id: way.id,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          path: way.geometry.map((g: any) => [g.lat, g.lon]) as LatLngExpression[],
          quality: 'grey', // default quality
        }));

      setWays(newWays);
    } catch (error) {
      console.error('Failed to fetch ways', error);
    }
  };

  const debouncedFetchWays = debounce(() => fetchWays());

  useEffect(() => {
    debouncedFetchWays(); // initial fetch
    map.on('move', debouncedFetchWays)
    return () => {
      map.off('move', debouncedFetchWays)
    }
  }, [map, debouncedFetchWays]);

  const updateClosestWayQuality = (quality: Quality) => {
    const centerLatLng = map.getCenter();

    let closestWayId: number | null = null;
    let closestDistance = Infinity;

    ways.forEach((way) => {
      way.path.forEach((point) => {
        const pointLatLng = latLng(point);
        const distance = centerLatLng.distanceTo(pointLatLng);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestWayId = way.id;
        }
      });
    });

    if (closestWayId !== null) {
      console.log(`Setting way ${closestWayId} to ${quality}`);
      setUserWayIdToQuality(new Map(userWayIdToQuality).set(closestWayId, quality));
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
      <div>Edit asphalt quality over "x" marker:</div>
      <div>
        <button onClick={() => updateClosestWayQuality('green')} style={{ background: 'green', color: 'white', marginRight: '5px' }}>Green</button>
        <button onClick={() => updateClosestWayQuality('yellow')} style={{ background: 'gold', color: 'black', marginRight: '5px' }}>Yellow</button>
        <button onClick={() => updateClosestWayQuality('red')} style={{ background: 'red', color: 'white' }}>Red</button>
      </div>
      <div>⚠️ This is just a Proof-of-Concept.<br/>Your edits WILL NOT be saved.</div>
      <div><label><input
        type="checkbox"
        checked={followUser}
        onChange={(e) => setFollowUser(e.target.checked)}
      />
        Center map on my location
      </label></div>
    </div>
  );
};

const MapView = () => {
  const [ways, setWays] = useState<Way[]>(initialWays);
  const [userWayIdToQuality, setUserWayIdToQuality] = useState(new Map<number, Quality>());
  const [followUser, setFollowUser] = useState(true);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 1000,
        width: 0,
        height: 0,
        textAlign: 'center',
        verticalAlign: 'middle',
      }}>
        x
      </div>
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

        <WayUpdater
          ways={ways}
          setWays={setWays}
          userWayIdToQuality={userWayIdToQuality}
          setUserWayIdToQuality={setUserWayIdToQuality}
          followUser={followUser}
          setFollowUser={setFollowUser}
        />

        {/* Draw all ways */}
        {ways.map((way) => (
          <Polyline
            key={way.id}
            positions={way.path}
            pathOptions={{
              color: userWayIdToQuality.get(way.id) || way.quality || 'grey',
              weight: 5
            }}
          />
        ))}
        {followUser && <UserLocationTracker />}
      </MapContainer>
    </div>
  );
};

export default MapView;
