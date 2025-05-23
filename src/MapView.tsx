import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import { latLng, LatLng } from 'leaflet';
import { Quality, Way } from './types';
import debounce from 'lodash.debounce';
import fetchWays from './fetchWays';
import { fetchWayQualities, storeWayQualities } from './wayQualitiesService';
import { getClosestWay } from './utils';

// @ts-expect-error: LocateControl is a JS file without types
import LocateControl from './LocateControl';

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
  {
    wayId: 4,
    path: [
      latLng([55.6010, 12.9665]),
      latLng([55.6013, 12.9670]),
    ],
    quality: undefined,
  },
];

const initialWayQualities: Map<number, Quality> = new Map([
  [1, -1],
  [2, 0],
  [3, 1],
]);

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
  const [status, setStatus] = useState('Changes will be stored on a server.');
  const [error, setError] = useState('');

  const debouncedFetchWays = useMemo(() => {
    return debounce(async () => {
      if (map.getZoom() < minZoomForWays) {
        setWays([]);
        return;
      }

      try {
        const bounds = map.getBounds();
        const newWays = await fetchWays(bounds);
        console.log(`Got ${newWays.length} ways`);

        const wayIds = newWays.map((way) => way.wayId);
        const wayQualitiesArray = await fetchWayQualities(wayIds);
        console.log(`Got ${wayQualitiesArray.length} wayQualities`);

        const newWayQualities = new Map<number, Quality>(
          wayQualitiesArray.map(item => [item.wayId, item.quality])
        );

        setWays(newWays);
        setWayQualities(newWayQualities);
        if (newWays.length === 0) {
          setError('No paths to show on the map. Go to another area to find paths.');
        }
        else {
          setError('');
        }
      }
      catch (error) {
        console.error(error);
        if (error instanceof Error)
          setError(`${error.message}`);
        else
          setError(`${error}`);
      }
    }, 500);
  }, [map, setWays, setWayQualities]);

  useEffect(() => {
    debouncedFetchWays(); // initial fetch
    map.on('move', debouncedFetchWays)
    map.on('zoom', debouncedFetchWays)
    return () => {
      map.off('move', debouncedFetchWays)
      map.off('zoom', debouncedFetchWays)
    }
  }, [map, debouncedFetchWays]);

  const updateClosestWayQuality = async (quality: Quality) => {
    const centerLatLng = map.getCenter();
    const latitude = centerLatLng.lat;
    const longitude = centerLatLng.lng;
    const closestWay = getClosestWay(centerLatLng, ways);

    if (closestWay !== undefined) {
      const closestWayId = closestWay.wayId;

      console.log(`Setting way ${closestWayId} to ${quality} from ${latitude},${longitude}`);
      setWayQualities(new Map(wayQualities).set(closestWayId, quality));
      setStatus('Saving ...');
      try {
        await storeWayQualities([{
          wayId: closestWayId,
          quality,
          latitude,
          longitude,
        }]);
        setStatus('All changes saved.');
      } catch (error) {
        console.error(error);
        setStatus('Could not save changes. Please try again later.');
      }
    }
  };

  const buttons = [
    {
      quality: 1 as Quality,
      label: 'Good',
      color: 'lime',
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
    {
      quality: undefined as Quality,
      label: 'Reset',
      color: 'lightgrey',
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
      <LocateControl />
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
                color: 'black',
                marginRight: '5px',
                minWidth: '64px',
              }}
            >
            { btn.label  }
            </button>
          ))}
        </div>
        <div>{ status }</div>
        { error ? (<div style={{ maxWidth: 250, color: "red" }}>{ error }</div>) : '' }
      </>
    )}
    </div>
  );
};

function qualityToColor(quality: Quality): string {
  switch (quality) {
    case 1:
      return 'lime';
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
  const [wayQualities, setWayQualities] = useState(initialWayQualities);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 1000,
        width: 24,
        height: 24,
        marginLeft: -12,
        marginTop: -12,
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
