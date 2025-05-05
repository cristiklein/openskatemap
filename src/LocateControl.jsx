import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

import { LocateControl as LC } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

function LocateControl({ options }) {
  const map = useMap();

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

  return null;
}

export default LocateControl;
