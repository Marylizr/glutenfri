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

function pinIcon(status, selected = false) {
  const color = {
    [TRUST_STATUS.CERTIFIED_APC_BIOTRAB]: '#3d5a45',
    [TRUST_STATUS.COMMUNITY_REPORTED]: '#9a6828',
    [TRUST_STATUS.PENDING_VALIDATION]: '#6f6a60',
  }[status];
  return divIcon({
    className: '',
    html: `<svg width="${selected ? 34 : 28}" height="${selected ? 44 : 36}" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 1C6.8 1 1 6.8 1 14c0 9.7 13 20.5 13 20.5S27 23.7 27 14C27 6.8 21.2 1 14 1z" fill="${color}" stroke="${selected ? '#2b2620' : '#fff'}" stroke-width="${selected ? 2.5 : 1}"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>`,
    iconSize: selected ? [34, 44] : [28, 36],
    iconAnchor: selected ? [17, 44] : [14, 36],
    popupAnchor: [0, -32],
  });
}

export default function MapView({
  establishments = [],
  center,
  onSelectEstablishment,
  selectedId,
  onHighlightEstablishment,
}) {
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
        <Marker
          key={e._id || e.name}
          position={[Number(e.lat), Number(e.lng)]}
          icon={pinIcon(normalizeTrustStatus(e), selectedId === e._id)}
          alt={t(selectedId === e._id ? 'selectedMapMarkerLabel' : 'mapMarkerLabel', { name: e.name })}
          title={t(selectedId === e._id ? 'selectedMapMarkerLabel' : 'mapMarkerLabel', { name: e.name })}
          keyboard
          riseOnHover
          eventHandlers={{ click: () => onHighlightEstablishment?.(e) }}
        >
          <Popup>
            <strong>{e.name}</strong>
            {e.address && (
              <>
                <br />
                {e.address}
              </>
            )}
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
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{t('googleAttribution')}</span>
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
