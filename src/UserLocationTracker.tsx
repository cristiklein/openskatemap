import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const UserLocationTracker = () => {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not available in this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], map.getZoom());
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  return null;
};

export default UserLocationTracker;
