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

export default function ModerationView() {
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
      .catch(() => setError('No pudimos cargar la cola de moderación.'))
      .finally(() => setLoading(false));
  }, [reasonFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const decideVisibility = async () => {
    if (!selected) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = selected.hidden
        ? await restoreReview(selected._id, decisionNote || 'Restaurada desde moderación')
        : await hideReview(selected._id, decisionNote || 'Ocultada tras revisión');
      const next = { ...selected, hidden: updated.hidden };
      setSelected(next);
      setReviews((current) => current.map((item) => item._id === next._id ? next : item));
      setDecisionNote('');
    } catch {
      setError('No pudimos registrar la decisión.');
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
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos suspender la cuenta.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Moderación de reseñas</h1>
          <p>Revisa evidencia, motivos y contexto antes de tomar una decisión.</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <label className="admin-search-field">
          <MagnifyingGlass size={18} />
          <input placeholder="Buscar en la cola…" disabled aria-label="Buscar en la cola" />
        </label>
        <select className="admin-filter-select" value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value)}>
          <option value="">Todos los motivos</option>
          <option value="incorrect_safety">Seguridad incorrecta</option>
          <option value="offensive">Contenido ofensivo</option>
          <option value="spam">Spam</option>
          <option value="personal_data">Datos personales</option>
          <option value="other">Otros</option>
        </select>
        <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Todos los estados</option>
          <option value="visible">Visibles</option>
          <option value="hidden">Ocultas</option>
        </select>
      </div>

      <div className="admin-review-layout">
        <section className="admin-panel admin-queue">
          {loading && <div className="admin-loading">Cargando reportes…</div>}
          {!loading && reviews.length === 0 && <div className="admin-empty">La cola está vacía.</div>}
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
              <strong>{review.reports[0]?.reasonLabel || 'Reporte pendiente'}</strong>
              <span>{review.user?.name} · {review.establishment?.name}</span>
              <span>{review.reportsCount} {review.reportsCount === 1 ? 'reporte' : 'reportes'} · {formatRelativeTime(review.updatedAt)}</span>
            </button>
          ))}
        </section>

        <section className="admin-panel">
          {!selected ? (
            <div className="admin-empty">Selecciona una reseña para revisar su contexto.</div>
          ) : (
            <div className="admin-review-detail">
              <div className="admin-inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className={`admin-status-pill ${selected.hidden ? 'is-warning' : ''}`}>
                  {selected.hidden ? <EyeSlash size={14} /> : <Eye size={14} />}
                  {selected.hidden ? 'Oculta' : 'Visible'}
                </span>
                <span className="admin-status-pill is-danger">
                  <Flag size={14} weight="fill" />
                  {selected.reportsCount} reportes
                </span>
              </div>

              <h2 style={{ marginTop: 18 }}>{selected.establishment?.name}</h2>
              <p className="admin-cell-subtitle">
                {selected.user?.name} · {selected.user?.email} · ⭐ {selected.rating}
              </p>

              <div className="admin-review-copy">
                {selected.comment || 'La reseña no contiene comentario escrito.'}
              </div>

              <div className="admin-safety-summary">
                <span><strong>Personal</strong>{selected.staffUnderstanding}</span>
                <span><strong>Menú dedicado</strong>{selected.hasDedicatedMenu ? 'Sí' : 'No'}</span>
                <span><strong>Cocina dedicada</strong>{selected.dedicatedKitchen ? 'Sí' : 'No'}</span>
                <span><strong>Riesgo</strong>{selected.riskLevel}</span>
              </div>

              <h3>Motivos enviados</h3>
              <ul className="admin-report-reasons">
                {selected.reports.map((report) => (
                  <li key={report._id || `${report.reason}-${report.createdAt}`}>
                    <strong>{report.reasonLabel}</strong>
                    {report.details && <span>{report.details}</span>}
                    <small>{formatRelativeTime(report.createdAt)}</small>
                  </li>
                ))}
              </ul>

              <div className="admin-decision-box">
                <strong>Tomar decisión</strong>
                <p>Toda acción quedará registrada con tu cuenta, fecha y motivo.</p>
                <textarea
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder="Nota interna o justificación de la decisión"
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
                    {updating ? 'Guardando…' : selected.hidden ? 'Restaurar reseña' : 'Ocultar reseña'}
                  </button>
                  <button
                    className="admin-secondary-button"
                    type="button"
                    disabled={updating || Boolean(selected.user?.suspendedAt) || decisionNote.trim().length < 3}
                    onClick={suspendAuthor}
                  >
                    {selected.user?.suspendedAt ? <ShieldWarning size={16} /> : <UserMinus size={16} />}
                    {selected.user?.suspendedAt ? 'Cuenta suspendida' : 'Suspender usuario'}
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
