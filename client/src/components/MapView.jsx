import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { isGoogleSourced } from '../utils/googlePlaces';
import {
  getMappableEstablishments,
  getTrustPresentation,
  normalizeTrustStatus,
  TRUST_STATUS,
} from '../utils/trustStatus.js';
import { useLanguage } from '../i18n/index.jsx';
import 'leaflet/dist/leaflet.css';

function pinIcon(status) {
  const color = {
    [TRUST_STATUS.CERTIFIED_APC_BIOTRAB]: '#3d5a45',
    [TRUST_STATUS.COMMUNITY_REPORTED]: '#9a6828',
    [TRUST_STATUS.PENDING_VALIDATION]: '#6f6a60',
  }[status];
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

export default function MapView({ establishments = [], center, onSelectEstablishment }) {
  const { t } = useLanguage();
  const withCoords = getMappableEstablishments(establishments);
  const hasGoogleData = withCoords.some(isGoogleSourced);

  // Atribución de Leaflet (siempre visible, no escondida en un popup) —
  // sumamos el crédito a Google Maps cuando alguno de los pines visibles
  // trae datos de ubicación de la Places API.
  const attribution = hasGoogleData
    ? `&copy; OpenStreetMap contributors | ${t('googleAttribution')}`
    : '&copy; OpenStreetMap contributors';

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={attribution}
      />
      {withCoords.map((e) => {
        const trust = getTrustPresentation(e, t);
        return (
        <Marker key={e._id || e.name} position={[Number(e.lat), Number(e.lng)]} icon={pinIcon(normalizeTrustStatus(e))}>
          <Popup>
            <strong>{e.name}</strong>
            <br />
            {e.address}
            <br />
            <span style={{ color: trust.color, fontWeight: 700 }}>{trust.icon} {trust.label}</span>
            {e.discount && (
              <>
                <br />
                <em>{e.discount}</em>
              </>
            )}
            {isGoogleSourced(e) && (
              <>
                <br />
                <span style={{ fontSize: '10px', color: '#8a8578' }}>{t('googleAttribution')}</span>
              </>
            )}
            {onSelectEstablishment && (
              <>
                <br />
                <button
                  type="button"
                  className="map-popup__action"
                  onClick={() => onSelectEstablishment(e)}
                >
                  {t('viewDetails')}
                </button>
              </>
            )}
          </Popup>
        </Marker>
        );
      })}
    </MapContainer>
  );
}
