import { useEffect, useState } from 'react';
import api from '../../services/api';
import ErrorState from '../../components/ErrorState';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

export default function CommercialView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].commercial;
  const [tab, setTab] = useState('claims');
  const [status, setStatus] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => {
    setError('');
    setLoading(true);
    api
      .get(`/admin/business/${tab}`, { params: status ? { status } : {} })
      .then((response) => setData(response.data.data))
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
  };
  useEffect(load, [copy.loadError, status, tab]);

  const claimAction = async (item, status) => {
    const statusLabel = copy.statuses[status] || status;
    const reason = window.prompt(formatAdminCopy(copy.reasonPrompt, { status: statusLabel }));
    if (!reason || !window.confirm(formatAdminCopy(copy.actionConfirm, { status: statusLabel, name: item.establishment?.name }))) return;
    try {
      await api.patch(`/admin/business/claims/${item._id}`, { status, reason });
      load();
    } catch {
      setError(copy.actionError);
    }
  };
  const changeAction = async (item, status) => {
    const fields = item.fields?.join(', ');
    const action = status === 'published' ? copy.publish : copy.reject;
    if (!window.confirm(`${formatAdminCopy(copy.affectedFields, { fields })}\n\n${formatAdminCopy(copy.changesConfirm, { action })}`)) return;
    const reason = status === 'rejected' ? window.prompt(copy.rejectionReason) : copy.approvedReason;
    if (status === 'rejected' && !reason) return;
    try {
      await api.patch(`/admin/business/changes/${item._id}`, { status, reason });
      load();
    } catch {
      setError(copy.actionError);
    }
  };

  return (
    <div>
      <header className="admin-page-header"><div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div></header>
      <div className="admin-segmented">
        <button className={tab === 'claims' ? 'is-active' : ''} onClick={() => { setTab('claims'); setStatus(''); }}>{copy.claims}</button>
        <button className={tab === 'changes' ? 'is-active' : ''} onClick={() => { setTab('changes'); setStatus(''); }}>{copy.changes}</button>
      </div>
      <label className="admin-commercial-filter">
        {copy.status}
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">{copy.all}</option>
          {(tab === 'claims'
            ? ['pending', 'needs_information', 'approved', 'rejected', 'revoked', 'cancelled']
            : ['draft', 'pending_review', 'published', 'rejected', 'cancelled']
          ).map((value) => <option key={value} value={value}>{copy.statuses[value] || value}</option>)}
        </select>
      </label>
      {loading ? <div className="admin-empty" role="status">{copy.loading}</div> : error ? <ErrorState message={error} onRetry={load} /> : data.length === 0 ? <div className="admin-empty">{copy.empty}</div> : (
        <div className="admin-commercial-list">
          {data.map((item) => (
            <article className="admin-card" key={item._id}>
              <div><h2>{item.establishment?.name}</h2><span className="admin-status">{copy.statuses[item.status] || item.status}</span></div>
              {tab === 'claims' ? (
                <>
                  <dl><dt>{copy.applicant}</dt><dd>{item.claimant?.name} · {item.claimant?.email}</dd><dt>{copy.relationship}</dt><dd>{item.relationship}</dd><dt>{copy.professionalEmail}</dt><dd>{item.professionalEmail}</dd><dt>{copy.method}</dt><dd>{item.verificationMethod}</dd><dt>{copy.evidence}</dt><dd>{item.evidenceDescription}</dd></dl>
                  <div className="admin-actions">
                    {item.status === 'pending' && <button className="admin-secondary-button" onClick={() => claimAction(item, 'needs_information')}>{copy.requestInformation}</button>}
                    {['pending', 'needs_information'].includes(item.status) && <button className="admin-primary-button" onClick={() => claimAction(item, 'approved')}>{copy.approve}</button>}
                    {['pending', 'needs_information'].includes(item.status) && <button className="admin-danger-button" onClick={() => claimAction(item, 'rejected')}>{copy.rejectButton}</button>}
                    {item.status === 'approved' && <button className="admin-danger-button" onClick={() => claimAction(item, 'revoked')}>{copy.revoke}</button>}
                  </div>
                </>
              ) : (
                <>
                  <p><strong>{copy.fields}:</strong> {item.fields?.join(', ')}</p>
                  <div className="admin-change-comparison">
                    {item.fields?.map((field) => (
                      <div key={field}>
                        <strong>{field}</strong>
                        <span>{copy.current}: {JSON.stringify(item.establishment?.[field] ?? null)}</span>
                        <span>{copy.proposed}: {JSON.stringify(item.changes?.[field] ?? null)}</span>
                      </div>
                    ))}
                  </div>
                  {item.status === 'pending_review' && <div className="admin-actions"><button className="admin-primary-button" onClick={() => changeAction(item, 'published')}>{copy.publishChanges}</button><button className="admin-danger-button" onClick={() => changeAction(item, 'rejected')}>{copy.rejectButton}</button></div>}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
