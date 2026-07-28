import { useCallback, useEffect, useState } from 'react';
import {
  Buildings,
  CloudCheck,
  Database,
  Flag,
  MapPin,
  Plus,
  Star,
  Users,
  CheckCircle,
  WarningCircle,
  Clock,
} from '@phosphor-icons/react';
import {
  getAdminDashboard,
  getReportedReviews,
  getSystemStatus,
  hideReview,
} from '../../services/admin';
import { formatRelativeTime } from '../../utils/time';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

export default function DashboardView({ auth, navigate }) {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].dashboard;
  const moderationCopy = ADMIN_COPY[language].moderation;
  const [data, setData] = useState(null);
  const [reports, setReports] = useState([]);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getAdminDashboard(), getReportedReviews(), getSystemStatus()])
      .then(([dashboard, reported, systemStatus]) => {
        setData(dashboard);
        setReports(reported.slice(0, 5));
        setSystem(systemStatus);
      })
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
  }, [copy.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const quickHide = async (review) => {
    setUpdatingId(review._id);
    try {
      await hideReview(review._id, copy.quickActionReason);
      setReports((current) => current.map((item) => (
        item._id === review._id ? { ...item, hidden: true } : item
      )));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="admin-loading">{copy.loading}</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const metrics = [
    { label: copy.users, value: data.metrics.users, icon: Users, detail: formatAdminCopy(copy.suspendedCount, { count: data.metrics.suspendedUsers }) },
    { label: copy.reviews, value: data.metrics.reviews, icon: Star, detail: copy.communityActivity },
    { label: copy.establishments, value: data.metrics.establishments, icon: Buildings, detail: copy.activeDirectory },
    {
      label: copy.pendingReports,
      value: data.metrics.reportsPending,
      icon: Flag,
      detail: copy.needReview,
      warning: data.metrics.reportsPending > 0,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{formatAdminCopy(copy.greeting, { name: auth.user.name.split(' ')[0] })}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => navigate('/admin/establecimientos?new=1')}
        >
          <Plus size={17} weight="bold" />
          {copy.addEstablishment}
        </button>
      </div>

      <section className="admin-kpis" aria-label={copy.mainMetrics}>
        {metrics.map(({ label, value, icon: Icon, detail, warning }) => (
          <article key={label} className={`admin-kpi ${warning ? 'is-warning' : ''}`}>
            <span className="admin-kpi-icon"><Icon size={23} /></span>
            <span>
              <small>{label}</small>
              <strong>{new Intl.NumberFormat(language).format(value)}</strong>
              <span>{detail}</span>
            </span>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section>
          <h2 className="admin-section-title">{copy.needsAttention}</h2>
          <div className="admin-table-wrap">
            {reports.length === 0 ? (
              <div className="admin-empty">
                <CheckCircle size={26} weight="fill" />
                <p>{copy.noReportedReviews}</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{copy.reason}</th>
                    <th>{copy.establishment}</th>
                    <th>{copy.author}</th>
                    <th>{copy.reports}</th>
                    <th>{copy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <span className="admin-cell-title">
                          {moderationCopy.reasons[review.reports[0]?.reason] || copy.noReason}
                        </span>
                      </td>
                      <td>
                        <span className="admin-cell-title">{review.establishment?.name}</span>
                        <span className="admin-cell-subtitle">{review.establishment?.type}</span>
                      </td>
                      <td>
                        <span className="admin-cell-title">{review.user?.name}</span>
                        <span className="admin-cell-subtitle">{review.user?.email}</span>
                      </td>
                      <td>
                        <span className="admin-status-pill is-warning">
                          <WarningCircle size={13} weight="fill" />
                          {review.reportsCount}
                        </span>
                      </td>
                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => navigate('/admin/moderacion')}
                          >
                            {copy.review}
                          </button>
                          {!review.hidden && (
                            <button
                              type="button"
                              className="admin-ghost-button"
                              disabled={updatingId === review._id}
                              onClick={() => quickHide(review)}
                            >
                              {updatingId === review._id ? copy.hiding : copy.hide}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="admin-pagination">
              <button className="admin-ghost-button" type="button" onClick={() => navigate('/admin/moderacion')}>
                {copy.viewAllReports}
              </button>
            </div>
          </div>
        </section>

        <aside>
          <h2 className="admin-section-title">{copy.systemStatus}</h2>
          <div className="admin-panel admin-system-list">
            <SystemRow
              icon={CloudCheck}
              label="API"
              detail={
                system.api.runtime === 'serverless'
                  ? copy.serverless
                  : formatAdminCopy(copy.activeMinutes, { count: Math.floor((system.api.uptimeSeconds || 0) / 60) })
              }
              status={system.api.status}
            />
            <SystemRow
              icon={Database}
              label="MongoDB Atlas"
              detail={system.mongo.database || copy.mainCluster}
              status={system.mongo.status}
            />
            <SystemRow
              icon={MapPin}
              label="Google Places"
              detail={formatAdminCopy(copy.placesToRefresh, { count: system.googlePlaces.stale })}
              status={system.googlePlaces.status}
            />
          </div>

          <h2 className="admin-section-title" style={{ marginTop: 26 }}>{copy.recentActivity}</h2>
          <div className="admin-panel">
            <ul className="admin-activity-list">
              {data.recentActions.length === 0 && (
                <li><Clock size={14} /> {copy.noActions}</li>
              )}
              {data.recentActions.map((action) => (
                <li key={action._id}>
                  <Clock size={13} />
                  <span>
                    <strong>{action.actor?.name || copy.defaultAdmin}</strong>{' '}
                    {copy.actionsMap[action.action] || action.action}
                    {action.targetLabel ? formatAdminCopy(copy.targetAt, { target: action.targetLabel }) : ''}.
                    <small>{formatRelativeTime(action.createdAt, language)}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function SystemRow({ icon: Icon, label, detail, status }) {
  const { language } = useLanguage();
  const labels = ADMIN_COPY[language].common;
  const healthy = status === 'operational';
  return (
    <div className="admin-system-row">
      <span className="admin-system-icon"><Icon size={19} /></span>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <span className={`admin-status-pill ${healthy ? '' : 'is-warning'}`}>
        {healthy ? <CheckCircle size={13} weight="fill" /> : <WarningCircle size={13} weight="fill" />}
        {healthy ? labels.operational : labels.attention}
      </span>
    </div>
  );
}
