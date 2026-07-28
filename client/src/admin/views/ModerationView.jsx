import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle,
  Eye,
  EyeSlash,
  Flag,
  MagnifyingGlass,
  ShieldWarning,
  UserMinus,
} from '@phosphor-icons/react';
import {
  getReportedReviews,
  hideReview,
  restoreReview,
  setUserSuspension,
} from '../../services/admin';
import { formatRelativeTime } from '../../utils/time';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY } from '../adminCopy';

export default function ModerationView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].moderation;
  const common = ADMIN_COPY[language].common;
  const riskLabels = ADMIN_COPY[language].establishments.risks;
  const [reasonFilter, setReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getReportedReviews({
      reason: reasonFilter || undefined,
      status: statusFilter || undefined,
    })
      .then((items) => {
        setReviews(items);
        setSelected((current) => items.find((item) => item._id === current?._id) || items[0] || null);
      })
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
  }, [copy.loadError, reasonFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const decideVisibility = async () => {
    if (!selected) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = selected.hidden
        ? await restoreReview(selected._id, decisionNote || copy.restoredReason)
        : await hideReview(selected._id, decisionNote || copy.hiddenReason);
      const next = { ...selected, hidden: updated.hidden };
      setSelected(next);
      setReviews((current) => current.map((item) => item._id === next._id ? next : item));
      setDecisionNote('');
    } catch {
      setError(copy.decisionError);
    } finally {
      setUpdating(false);
    }
  };

  const suspendAuthor = async () => {
    if (!selected?.user?._id || decisionNote.trim().length < 3) return;
    setUpdating(true);
    setError(null);
    try {
      await setUserSuspension(selected.user._id, {
        suspended: true,
        reason: decisionNote,
      });
      setSelected((current) => ({
        ...current,
        user: { ...current.user, suspendedAt: new Date().toISOString() },
      }));
      setDecisionNote('');
    } catch {
      setError(copy.suspensionError);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <label className="admin-search-field">
          <MagnifyingGlass size={18} />
          <input placeholder={copy.search} disabled aria-label={copy.search} />
        </label>
        <select className="admin-filter-select" value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value)}>
          <option value="">{copy.allReasons}</option>
          {Object.entries(copy.reasons).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">{copy.allStatuses}</option>
          <option value="visible">{copy.visiblePlural}</option>
          <option value="hidden">{copy.hiddenPlural}</option>
        </select>
      </div>

      <div className="admin-review-layout">
        <section className="admin-panel admin-queue">
          {loading && <div className="admin-loading">{copy.loading}</div>}
          {!loading && reviews.length === 0 && <div className="admin-empty">{copy.emptyQueue}</div>}
          {reviews.map((review) => (
            <button
              key={review._id}
              type="button"
              className={`admin-queue-item ${selected?._id === review._id ? 'is-active' : ''}`}
              onClick={() => {
                setSelected(review);
                setDecisionNote('');
              }}
            >
              <strong>{copy.reasons[review.reports[0]?.reason] || copy.pendingReport}</strong>
              <span>{review.user?.name} · {review.establishment?.name}</span>
              <span>{review.reportsCount} {review.reportsCount === 1 ? copy.reportOne : copy.reportOther} · {formatRelativeTime(review.updatedAt, language)}</span>
            </button>
          ))}
        </section>

        <section className="admin-panel">
          {!selected ? (
            <div className="admin-empty">{copy.selectReview}</div>
          ) : (
            <div className="admin-review-detail">
              <div className="admin-inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className={`admin-status-pill ${selected.hidden ? 'is-warning' : ''}`}>
                  {selected.hidden ? <EyeSlash size={14} /> : <Eye size={14} />}
                  {selected.hidden ? copy.hidden : copy.visible}
                </span>
                <span className="admin-status-pill is-danger">
                  <Flag size={14} weight="fill" />
                  {selected.reportsCount} {selected.reportsCount === 1 ? copy.reportOne : copy.reportOther}
                </span>
              </div>

              <h2 style={{ marginTop: 18 }}>{selected.establishment?.name}</h2>
              <p className="admin-cell-subtitle">
                {selected.user?.name} · {selected.user?.email} · ⭐ {selected.rating}
              </p>

              <div className="admin-review-copy">
                {selected.comment || copy.noComment}
              </div>

              <div className="admin-safety-summary">
                <span><strong>{copy.staff}</strong>{copy.staffLevels[selected.staffUnderstanding] || selected.staffUnderstanding}</span>
                <span><strong>{copy.dedicatedMenu}</strong>{selected.hasDedicatedMenu ? common.yes : common.no}</span>
                <span><strong>{copy.dedicatedKitchen}</strong>{selected.dedicatedKitchen ? common.yes : common.no}</span>
                <span><strong>{copy.risk}</strong>{riskLabels[selected.riskLevel] || selected.riskLevel}</span>
              </div>

              <h3>{copy.submittedReasons}</h3>
              <ul className="admin-report-reasons">
                {selected.reports.map((report) => (
                  <li key={report._id || `${report.reason}-${report.createdAt}`}>
                    <strong>{copy.reasons[report.reason] || copy.pendingReport}</strong>
                    {report.details && <span>{report.details}</span>}
                    <small>{formatRelativeTime(report.createdAt, language)}</small>
                  </li>
                ))}
              </ul>

              <div className="admin-decision-box">
                <strong>{copy.decide}</strong>
                <p>{copy.auditNotice}</p>
                <textarea
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder={copy.notePlaceholder}
                  maxLength={500}
                />
                <div className="admin-inline-actions">
                  <button
                    className={selected.hidden ? 'admin-secondary-button' : 'admin-danger-button'}
                    type="button"
                    disabled={updating}
                    onClick={decideVisibility}
                  >
                    {selected.hidden ? <CheckCircle size={16} /> : <EyeSlash size={16} />}
                    {updating ? common.saving : selected.hidden ? copy.restoreReview : copy.hideReview}
                  </button>
                  <button
                    className="admin-secondary-button"
                    type="button"
                    disabled={updating || Boolean(selected.user?.suspendedAt) || decisionNote.trim().length < 3}
                    onClick={suspendAuthor}
                  >
                    {selected.user?.suspendedAt ? <ShieldWarning size={16} /> : <UserMinus size={16} />}
                    {selected.user?.suspendedAt ? copy.accountSuspended : copy.suspendUser}
                  </button>
                </div>
                {error && <p className="admin-error">{error}</p>}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
