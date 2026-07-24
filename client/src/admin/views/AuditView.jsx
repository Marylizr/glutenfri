import { useCallback, useEffect, useState } from 'react';
import {
  Buildings,
  ClockCounterClockwise,
  GearSix,
  ShieldCheck,
  Star,
  Users,
} from '@phosphor-icons/react';
import { getAuditLog } from '../../services/admin';
import { formatRelativeTime } from '../../utils/time';

const ACTION_LABELS = {
  review_hidden: 'Reseña ocultada',
  review_restored: 'Reseña restaurada',
  user_suspended: 'Usuario suspendido',
  user_restored: 'Usuario restaurado',
  admin_granted: 'Permiso de admin concedido',
  admin_revoked: 'Permiso de admin retirado',
  establishment_created: 'Establecimiento creado',
  establishment_updated: 'Establecimiento actualizado',
  places_refresh_started: 'Refresco de Places iniciado',
};

const TARGET_ICONS = {
  review: Star,
  user: Users,
  establishment: Buildings,
  system: GearSix,
};

export default function AuditView() {
  const [targetType, setTargetType] = useState('');
  const [result, setResult] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      getAuditLog({ page, limit: 30, targetType: targetType || undefined })
        .then(setResult)
        .finally(() => setLoading(false));
    },
    [targetType]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Actividad administrativa</h1>
          <p>Registro inmutable de las decisiones realizadas desde el backoffice.</p>
        </div>
        <span className="admin-status-pill"><ShieldCheck size={14} weight="fill" />Auditoría activa</span>
      </div>

      <div className="admin-filter-bar">
        <select className="admin-filter-select" value={targetType} onChange={(event) => setTargetType(event.target.value)}>
          <option value="">Todos los recursos</option>
          <option value="review">Reseñas</option>
          <option value="user">Usuarios</option>
          <option value="establishment">Establecimientos</option>
          <option value="system">Sistema</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Leyendo el historial…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Administrador</th>
                <th>Recurso</th>
                <th>Motivo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((action) => {
                const Icon = TARGET_ICONS[action.targetType] || ClockCounterClockwise;
                return (
                  <tr key={action._id}>
                    <td>
                      <span className="admin-cell-title admin-inline-actions">
                        <Icon size={16} />
                        {ACTION_LABELS[action.action] || action.action}
                      </span>
                    </td>
                    <td>
                      <span className="admin-cell-title">{action.actor?.name || 'Cuenta eliminada'}</span>
                      <span className="admin-cell-subtitle">{action.actor?.email}</span>
                    </td>
                    <td>{action.targetLabel || action.targetType}</td>
                    <td>{action.reason || '—'}</td>
                    <td>
                      <span className="admin-cell-title">{new Date(action.createdAt).toLocaleString('es-ES')}</span>
                      <span className="admin-cell-subtitle">{formatRelativeTime(action.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && result.data.length === 0 && <div className="admin-empty">Todavía no hay acciones registradas.</div>}
        <div className="admin-pagination">
          <span>{result.total} acciones</span>
          <div className="admin-inline-actions">
            <button className="admin-secondary-button" type="button" disabled={result.page <= 1} onClick={() => load(result.page - 1)}>Anterior</button>
            <span>Página {result.page} de {Math.max(result.totalPages, 1)}</span>
            <button className="admin-secondary-button" type="button" disabled={result.page >= result.totalPages} onClick={() => load(result.page + 1)}>Siguiente</button>
          </div>
        </div>
      </div>
    </>
  );
}
