import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { isGoogleSourced } from './GoogleAttribution';
import 'leaflet/dist/leaflet.css';

// Pin custom en verde salvia (certificado) o terracota (sin verificar),
// estilo "gota" para que coincida con el mockup en vez del pin azul default de Leaflet.
function pinIcon(certified) {
  const color = certified ? '#3d5a45' : '#c1502e';
  return divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

export default function MapView({ establishments, center }) {
  const withCoords = establishments.filter((e) => e.lat && e.lng);
  const hasGoogleData = withCoords.some(isGoogleSourced);

  // Atribución de Leaflet (siempre visible, no escondida en un popup) —
  // sumamos el crédito a Google Maps cuando alguno de los pines visibles
  // trae datos de ubicación de la Places API.
  const attribution = hasGoogleData
    ? '&copy; OpenStreetMap contributors | Datos de ubicación: Google Maps'
    : '&copy; OpenStreetMap contributors';

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={attribution}
      />
      {withCoords.map((e) => (
        <Marker key={e._id || e.name} position={[e.lat, e.lng]} icon={pinIcon(e.certified)}>
          <Popup>
            <strong>{e.name}</strong>
            <br />
            {e.address}
            <br />
            {e.certified && <span>✅ Certificado APC</span>}
            {e.discount && (
              <>
                <br />
                <em>{e.discount}</em>
              </>
            )}
            {isGoogleSourced(e) && (
              <>
                <br />
                <span style={{ fontSize: '10px', color: '#8a8578' }}>Datos de ubicación: Google Maps</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
