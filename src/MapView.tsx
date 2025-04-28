import { MapContainer, TileLayer } from 'react-leaflet';

const MapView = () => {
  return (
    <MapContainer center={[55.60249267294951, 12.967599313254912]} zoom={16} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MapView;
