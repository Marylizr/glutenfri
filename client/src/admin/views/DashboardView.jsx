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

const ACTION_LABELS = {
  review_hidden: 'ocultó una reseña',
  review_restored: 'restauró una reseña',
  user_suspended: 'suspendió una cuenta',
  user_restored: 'restauró una cuenta',
  admin_granted: 'asignó un rol de admin',
  admin_revoked: 'retiró un rol de admin',
  establishment_created: 'creó un establecimiento',
  establishment_updated: 'actualizó un establecimiento',
  places_refresh_started: 'inició el refresco de Google Places',
};

export default function DashboardView({ auth, navigate }) {
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
      .catch(() => setError('No pudimos cargar el resumen operativo.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const quickHide = async (review) => {
    setUpdatingId(review._id);
    try {
      await hideReview(review._id, 'Acción rápida desde el dashboard');
      setReports((current) => current.map((item) => (
        item._id === review._id ? { ...item, hidden: true } : item
      )));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="admin-loading">Preparando el resumen operativo…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const metrics = [
    { label: 'Usuarios', value: data.metrics.users, icon: Users, detail: `${data.metrics.suspendedUsers} suspendidos` },
    { label: 'Reseñas', value: data.metrics.reviews, icon: Star, detail: 'Actividad de la comunidad' },
    { label: 'Establecimientos', value: data.metrics.establishments, icon: Buildings, detail: 'Directorio activo' },
    {
      label: 'Reportes pendientes',
      value: data.metrics.reportsPending,
      icon: Flag,
      detail: 'Necesitan revisión',
      warning: data.metrics.reportsPending > 0,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Buenos días, {auth.user.name.split(' ')[0]}</h1>
          <p>Resumen operativo de Gluten Free Porto</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => navigate('/admin/establecimientos?new=1')}
        >
          <Plus size={17} weight="bold" />
          Añadir establecimiento
        </button>
      </div>

      <section className="admin-kpis" aria-label="Métricas principales">
        {metrics.map(({ label, value, icon: Icon, detail, warning }) => (
          <article key={label} className={`admin-kpi ${warning ? 'is-warning' : ''}`}>
            <span className="admin-kpi-icon"><Icon size={23} /></span>
            <span>
              <small>{label}</small>
              <strong>{new Intl.NumberFormat('es-ES').format(value)}</strong>
              <span>{detail}</span>
            </span>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section>
          <h2 className="admin-section-title">Necesita atención</h2>
          <div className="admin-table-wrap">
            {reports.length === 0 ? (
              <div className="admin-empty">
                <CheckCircle size={26} weight="fill" />
                <p>No hay reseñas reportadas.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Motivo</th>
                    <th>Establecimiento</th>
                    <th>Autor</th>
                    <th>Reportes</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <span className="admin-cell-title">
                          {review.reports[0]?.reasonLabel || 'Sin motivo'}
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
                            Revisar
                          </button>
                          {!review.hidden && (
                            <button
                              type="button"
                              className="admin-ghost-button"
                              disabled={updatingId === review._id}
                              onClick={() => quickHide(review)}
                            >
                              {updatingId === review._id ? 'Ocultando…' : 'Ocultar'}
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
                Ver todos los reportes pendientes
              </button>
            </div>
          </div>
        </section>

        <aside>
          <h2 className="admin-section-title">Estado del sistema</h2>
          <div className="admin-panel admin-system-list">
            <SystemRow
              icon={CloudCheck}
              label="API"
              detail={`${Math.floor((system.api.uptimeSeconds || 0) / 60)} min activa`}
              status={system.api.status}
            />
            <SystemRow
              icon={Database}
              label="MongoDB Atlas"
              detail={system.mongo.database || 'Cluster principal'}
              status={system.mongo.status}
            />
            <SystemRow
              icon={MapPin}
              label="Google Places"
              detail={`${system.googlePlaces.stale} registros por refrescar`}
              status={system.googlePlaces.status}
            />
          </div>

          <h2 className="admin-section-title" style={{ marginTop: 26 }}>Actividad reciente</h2>
          <div className="admin-panel">
            <ul className="admin-activity-list">
              {data.recentActions.length === 0 && (
                <li><Clock size={14} /> Todavía no hay acciones registradas.</li>
              )}
              {data.recentActions.map((action) => (
                <li key={action._id}>
                  <Clock size={13} />
                  <span>
                    <strong>{action.actor?.name || 'Administrador'}</strong>{' '}
                    {ACTION_LABELS[action.action] || action.action}
                    {action.targetLabel ? ` en “${action.targetLabel}”` : ''}.
                    <small>{formatRelativeTime(action.createdAt)}</small>
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
        {healthy ? 'Operativo' : 'Atención'}
      </span>
    </div>
  );
}
