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
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

const TARGET_ICONS = {
  review: Star,
  user: Users,
  establishment: Buildings,
  system: GearSix,
};

export default function AuditView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].audit;
  const common = ADMIN_COPY[language].common;
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
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <span className="admin-status-pill"><ShieldCheck size={14} weight="fill" />{copy.active}</span>
      </div>

      <div className="admin-filter-bar">
        <select className="admin-filter-select" value={targetType} onChange={(event) => setTargetType(event.target.value)}>
          <option value="">{copy.allResources}</option>
          <option value="review">{copy.reviews}</option>
          <option value="user">{copy.users}</option>
          <option value="establishment">{copy.establishments}</option>
          <option value="system">{copy.system}</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">{copy.loading}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.action}</th>
                <th>{copy.administrator}</th>
                <th>{copy.resource}</th>
                <th>{copy.reason}</th>
                <th>{copy.date}</th>
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
                        {copy.actionsMap[action.action] || action.action}
                      </span>
                    </td>
                    <td>
                      <span className="admin-cell-title">{action.actor?.name || copy.deletedAccount}</span>
                      <span className="admin-cell-subtitle">{action.actor?.email}</span>
                    </td>
                    <td>{action.targetLabel || action.targetType}</td>
                    <td>{action.reason || '—'}</td>
                    <td>
                      <span className="admin-cell-title">{new Date(action.createdAt).toLocaleString(language)}</span>
                      <span className="admin-cell-subtitle">{formatRelativeTime(action.createdAt, language)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && result.data.length === 0 && <div className="admin-empty">{copy.noActions}</div>}
        <div className="admin-pagination">
          <span>{formatAdminCopy(copy.total, { count: result.total })}</span>
          <div className="admin-inline-actions">
            <button className="admin-secondary-button" type="button" disabled={result.page <= 1} onClick={() => load(result.page - 1)}>{common.previous}</button>
            <span>{formatAdminCopy(common.page, { page: result.page, total: Math.max(result.totalPages, 1) })}</span>
            <button className="admin-secondary-button" type="button" disabled={result.page >= result.totalPages} onClick={() => load(result.page + 1)}>{common.next}</button>
          </div>
        </div>
      </div>
    </>
  );
}
