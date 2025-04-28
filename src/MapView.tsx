import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

const position: LatLngExpression = [55.60249267294951, 12.967599313254912];

const MapView = () => {
  return (
    <MapContainer
      style={{ height: "100vh", width: "100%" }}
      center={position}
      zoom={16}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MapView;
