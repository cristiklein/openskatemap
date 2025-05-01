import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import { latLng, LatLng } from 'leaflet';
import { Quality, Way } from './types';
import debounce from 'lodash.debounce';
import fetchWays from './fetchWays';
import { fetchWayQualities, storeWayQualities } from './wayQualitiesService';
import UserLocationTracker from './UserLocationTracker';
import { getDistanceToLineSegment } from './utils';

const MAX_WAYS = 1000; // imposed server-side

const center: LatLng = latLng([55.60249267294951, 12.967599313254912]);

const initialWays: Way[] = [
  {
    wayId: 1,
    path: [
      latLng([55.6025, 12.9675]),
      latLng([55.6030, 12.9678]),
    ],
    quality: -1,
  },
  {
    wayId: 2,
    path: [
      latLng([55.6020, 12.9670]),
      latLng([55.6023, 12.9674]),
    ],
    quality: 0,
  },
  {
    wayId: 3,
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
  wayQualities,
  setWayQualities,
}: {
  ways: Way[];
  setWays: React.Dispatch<React.SetStateAction<Way[]>>;
  wayQualities: Map<number, Quality>;
  setWayQualities: React.Dispatch<React.SetStateAction<Map<number, Quality>>>;
}) => {
  const map = useMap();
  const [followUser, setFollowUser] = useState(true);
  const [status, setStatus] = useState('Changes will be stored on a server.');

  const debouncedFetchWays = useMemo(() => {
    return debounce(async () => {
      if (map.getZoom() < minZoomForWays) {
        setWays([]);
        return;
      }

      let newWays;
      try {
        const bounds = map.getBounds();
        newWays = await fetchWays(bounds);
        console.log(`Got ${newWays.length} ways`);
      }
      catch (error) {
        setStatus(`${error}`);
        return;
      }

      let newWayQualities;
      try {
        const wayIds = newWays.map((way) => way.wayId);
        const wayQualitiesArray = await fetchWayQualities(wayIds);
        console.log(`Got ${wayQualitiesArray.length} wayQualities`);

        newWayQualities = new Map<number, Quality>(
          wayQualitiesArray.map(item => [item.wayId, item.quality])
        );
      }
      catch (error) {
        setStatus(`${error}`);
        return;
      }

      setWays(newWays);
      setWayQualities(newWayQualities);
    }, 500);
  }, [map, setWays, setWayQualities]);

  useEffect(() => {
    debouncedFetchWays(); // initial fetch
    map.on('moveend', debouncedFetchWays)
    return () => {
      map.off('moveend', debouncedFetchWays)
    }
  }, [map, debouncedFetchWays]);

  const updateClosestWayQuality = async (quality: Quality) => {
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
          closestWayId = way.wayId;
        }
      }
    });

    if (closestWayId !== null) {
      console.log(`Setting way ${closestWayId} to ${quality}`);
      setWayQualities(new Map(wayQualities).set(closestWayId, quality));
      setStatus('Saving ...');
      try {
        await storeWayQualities([{
          wayId: closestWayId,
          quality,
        }]);
        setStatus('All changes saved.');
      } catch (error) {
        setStatus(`${error}`);
      }
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
      {followUser && <UserLocationTracker />}
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
        <div>{ status }</div>
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
  const [wayQualities, setWayQualities] = useState(new Map<number, Quality>());

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
          wayQualities={wayQualities}
          setWayQualities={setWayQualities}
        />

        {/* Draw all ways */}
        {ways.map((way) => (
          <Polyline
            key={way.wayId}
            positions={way.path}
            pathOptions={{
              color: qualityToColor(wayQualities.get(way.wayId)),
              weight: 5
            }}
          />
        ))}
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
