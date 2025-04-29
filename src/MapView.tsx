import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import { latLng, LatLng } from 'leaflet';
import { Quality, Way } from './types';
import debounce from 'lodash.debounce';
import fetchWays from './fetchWays';
import UserLocationTracker from './UserLocationTracker';
import { getDistanceToLineSegment } from './utils';

const center: LatLng = latLng([55.60249267294951, 12.967599313254912]);

const initialWays: Way[] = [
  {
    id: 1,
    path: [
      latLng([55.6025, 12.9675]),
      latLng([55.6030, 12.9678]),
    ],
    quality: 'red',
  },
  {
    id: 2,
    path: [
      latLng([55.6020, 12.9670]),
      latLng([55.6023, 12.9674]),
    ],
    quality: 'yellow',
  },
  {
    id: 3,
    path: [
      latLng([55.6015, 12.9665]),
      latLng([55.6018, 12.9670]),
    ],
    quality: 'green',
  },
];

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

  const debouncedFetchWays = useMemo(() => {
    return debounce(async () => {
      const bounds = map.getBounds();
      const newWays = await fetchWays(bounds);
      setWays(newWays);
    }, 500);
  }, [map, setWays]);

  useEffect(() => {
    debouncedFetchWays(); // initial fetch
    map.on('moveend', debouncedFetchWays)
    return () => {
      map.off('moveend', debouncedFetchWays)
    }
  }, [map, debouncedFetchWays]);

  const updateClosestWayQuality = (quality: Quality) => {
    let closestWayId: number | null = null;
    let closestDistance = Infinity;

    const centerLatLng = map.getCenter();

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
          closestWayId = way.id;
        }
      }
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
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '0%',
        zIndex: 1000,
        background: 'white',
        fontSize: 10,
        padding: 2,
      }}>
        OpenStakeMap { __APP_VERSION__ }
      </div>
    </div>
  );
};

export default MapView;
