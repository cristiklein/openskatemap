import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import { latLng, LatLng } from 'leaflet';
import { Quality, Way } from './types';
import debounce from 'lodash.debounce';
import fetchWays from './fetchWays';
import UserLocationTracker from './UserLocationTracker';
import { getDistanceToLineSegment } from './utils';

const MAX_WAYS = 1000; // imposed server-side

const center: LatLng = latLng([55.60249267294951, 12.967599313254912]);

const initialWays: Way[] = [
  {
    id: 1,
    path: [
      latLng([55.6025, 12.9675]),
      latLng([55.6030, 12.9678]),
    ],
    quality: -1,
  },
  {
    id: 2,
    path: [
      latLng([55.6020, 12.9670]),
      latLng([55.6023, 12.9674]),
    ],
    quality: 0,
  },
  {
    id: 3,
    path: [
      latLng([55.6015, 12.9665]),
      latLng([55.6018, 12.9670]),
    ],
    quality: 1,
  },
];

const minZoomForWays = 15;

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
      if (map.getZoom() < minZoomForWays) {
        setWays([]);
        return;
      }
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

  const buttons = [
    {
      quality: 1 as Quality,
      label: 'Good',
      color: 'green',
    },
    {
      quality: 0 as Quality,
      label: 'Medium',
      color: 'gold',
    },
    {
      quality: -1 as Quality,
      label: 'Bad',
      color: 'red',
    },
  ]

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
      { map.getZoom() < minZoomForWays || ways.length > MAX_WAYS ? (
        <div>Zoom in to see and mark asphalt quality.</div>
      ) : (
        <>
        <div>Mark asphalt quality over "x" marker:</div>
        <div>
          { buttons.map(btn => (
            <button
              key={btn.label}
              onClick={() => updateClosestWayQuality(btn.quality)}
              style={{
                background: btn.color,
                color: 'white',
                marginRight: '5px',
                minWidth: '64px',
              }}
            >
            { btn.label  }
            </button>
          ))}
        </div>
        <div>⚠️ This is just a Proof-of-Concept.<br/>Your marks WILL NOT be saved.</div>
      </>
    )}
      <div><label><input
        type="checkbox"
        name="follow-user"
        checked={followUser}
        onChange={(e) => setFollowUser(e.target.checked)}
      />
        Center map on my location
      </label></div>
    </div>
  );
};

function qualityToColor(quality: Quality): string {
  switch (quality) {
    case 1:
      return 'green';
    case 0:
      return 'gold';
    case -1:
      return 'red';
    default:
      return 'grey'
  }
}

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
              color: qualityToColor(userWayIdToQuality.get(way.id)),
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
