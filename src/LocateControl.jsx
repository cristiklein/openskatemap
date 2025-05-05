import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

import('leaflet.locatecontrol/dist/L.Control.Locate.min.css');

let LC = null;
try {
  const locatecontrol = await import('leaflet.locatecontrol');
  LC = locatecontrol.LocateControl;
}
catch (error) {
  console.error('Could not load leaflet.locatecontrol');
}

function LocateControl({ options }) {
  const map = useMap();

  if (LC) {
    useEffect(() => {
      const locateControl = new LC({
        keepCurrentZoomLevel: true,
        ...options,
      })
      locateControl.addTo(map);

      return () => {
        map.removeControl(locateControl);
      };
    }, [map, options]);
  }

  return null;
}

export default LocateControl;
