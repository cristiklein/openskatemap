import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

import('leaflet.locatecontrol/dist/L.Control.Locate.min.css');

function LocateControl({ options }) {
  const map = useMap();

  useEffect(() => {
    let locateControl = null;
    const loadAndConfigure = async () => {
      try {
        if (process.env.NODE_ENV == 'test') {
          console.log("leaflet.locatecontrol doesn't work well in unit testing");
          return;
        }
        const LCM = await import('leaflet.locatecontrol');
        if (locateControl)
          return;
        locateControl = new LCM.LocateControl({
          keepCurrentZoomLevel: true,
          locateOptions: {
            enableHighAccuracy: true,
          },
          ...options,
        })
        locateControl.addTo(map);
      }
      catch (error) {
        console.error('Could not load leaflet.locatecontrol', error);
      }
    }

    // Actual call
    loadAndConfigure();

    return () => {
      if (locateControl)
        map.removeControl(locateControl);
      locateControl = 'dont-load'; // prevent accidental loading after await
    };
  }, [map, options]);

  return null;
}

export default LocateControl;
