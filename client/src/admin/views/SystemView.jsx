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
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

export default function SystemView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].system;
  const common = ADMIN_COPY[language].common;
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
      setMessage(copy.refreshStarted);
      load();
    } catch {
      setMessage(copy.refreshError);
    } finally {
      setTriggering(false);
    }
  };

  if (loading || !status) return <div className="admin-loading">{copy.loading}</div>;

  const services = [
    {
      icon: CloudCheck,
      name: 'API del backend',
      state: status.api.status,
      detail:
        status.api.runtime === 'serverless'
          ? copy.serverless
          : formatAdminCopy(copy.activeMinutes, { count: Math.floor(status.api.uptimeSeconds / 60) }),
    },
    {
      icon: Database,
      name: 'MongoDB Atlas',
      state: status.mongo.status,
      detail: status.mongo.database || copy.mainDatabase,
    },
    {
      icon: MapPin,
      name: 'Google Places',
      state: status.googlePlaces.status,
      detail: formatAdminCopy(copy.linkedAndStale, { total: status.googlePlaces.total, stale: status.googlePlaces.stale }),
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          disabled={triggering || status.googlePlaces.job.status === 'running'}
          onClick={refresh}
        >
          <ArrowsClockwise size={17} className={status.googlePlaces.job.status === 'running' ? 'is-spinning' : ''} />
          {status.googlePlaces.job.status === 'running' ? copy.refreshing : triggering ? copy.starting : copy.refreshPlaces}
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
                {healthy ? common.operational : common.attention}
              </span>
            </article>
          );
        })}
      </div>

      <section className="admin-panel admin-refresh-detail">
        <div>
          <h2>{copy.cycleTitle}</h2>
          <p>{copy.cycleDescription}</p>
        </div>
        <dl>
          <div><dt>{copy.lastRefresh}</dt><dd>{status.googlePlaces.lastRefreshAt ? formatRelativeTime(status.googlePlaces.lastRefreshAt, language) : common.noData}</dd></div>
          <div><dt>{copy.processStatus}</dt><dd>{copy.jobStatuses[status.googlePlaces.job.status] || status.googlePlaces.job.status}</dd></div>
          <div><dt>{copy.processed}</dt><dd>{status.googlePlaces.job.updated} / {status.googlePlaces.job.total}</dd></div>
          <div><dt>{copy.errors}</dt><dd>{status.googlePlaces.job.errors}</dd></div>
        </dl>
        {message && <p className={message === copy.refreshStarted ? 'admin-success-message' : 'admin-error'}>{message}</p>}
      </section>
    </>
  );
}
