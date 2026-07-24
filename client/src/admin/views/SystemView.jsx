import { useCallback, useEffect, useState } from 'react';
import {
  ArrowsClockwise,
  CheckCircle,
  CloudCheck,
  Database,
  MapPin,
  WarningCircle,
} from '@phosphor-icons/react';
import { getSystemStatus, triggerGooglePlacesRefresh } from '../../services/admin';
import { formatRelativeTime } from '../../utils/time';

export default function SystemView() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => {
    getSystemStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  const refresh = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      await triggerGooglePlacesRefresh();
      setMessage('Refresco iniciado. Esta pantalla se actualizará automáticamente.');
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'No pudimos iniciar el refresco.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading || !status) return <div className="admin-loading">Comprobando servicios…</div>;

  const services = [
    {
      icon: CloudCheck,
      name: 'API del backend',
      state: status.api.status,
      detail: `Activa durante ${Math.floor(status.api.uptimeSeconds / 60)} minutos`,
    },
    {
      icon: Database,
      name: 'MongoDB Atlas',
      state: status.mongo.status,
      detail: status.mongo.database || 'Base principal',
    },
    {
      icon: MapPin,
      name: 'Google Places',
      state: status.googlePlaces.status,
      detail: `${status.googlePlaces.total} vinculados · ${status.googlePlaces.stale} por refrescar`,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Estado del sistema</h1>
          <p>Disponibilidad del backend, Atlas y ciclo de datos de Google Places.</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          disabled={triggering || status.googlePlaces.job.status === 'running'}
          onClick={refresh}
        >
          <ArrowsClockwise size={17} className={status.googlePlaces.job.status === 'running' ? 'is-spinning' : ''} />
          {status.googlePlaces.job.status === 'running' ? 'Refrescando…' : triggering ? 'Iniciando…' : 'Refrescar Places'}
        </button>
      </div>

      <div className="admin-system-grid">
        {services.map(({ icon: Icon, name, state, detail }) => {
          const healthy = state === 'operational';
          return (
            <article key={name} className="admin-panel admin-service-card">
              <span className="admin-system-icon"><Icon size={22} /></span>
              <div>
                <h2>{name}</h2>
                <p>{detail}</p>
              </div>
              <span className={`admin-status-pill ${healthy ? '' : 'is-warning'}`}>
                {healthy ? <CheckCircle size={14} weight="fill" /> : <WarningCircle size={14} weight="fill" />}
                {healthy ? 'Operativo' : 'Atención'}
              </span>
            </article>
          );
        })}
      </div>

      <section className="admin-panel admin-refresh-detail">
        <div>
          <h2>Ciclo de refresco de Google Places</h2>
          <p>
            El workflow semanal actualiza coordenadas con 23 días de antigüedad, dejando margen
            antes del límite de 30 días. También puedes iniciarlo manualmente desde aquí.
          </p>
        </div>
        <dl>
          <div><dt>Último refresco</dt><dd>{status.googlePlaces.lastRefreshAt ? formatRelativeTime(status.googlePlaces.lastRefreshAt) : 'Sin datos'}</dd></div>
          <div><dt>Estado del proceso</dt><dd>{status.googlePlaces.job.status}</dd></div>
          <div><dt>Procesados</dt><dd>{status.googlePlaces.job.updated} / {status.googlePlaces.job.total}</dd></div>
          <div><dt>Errores</dt><dd>{status.googlePlaces.job.errors}</dd></div>
        </dl>
        {message && <p className={message.includes('iniciado') ? 'admin-success-message' : 'admin-error'}>{message}</p>}
      </section>
    </>
  );
}
