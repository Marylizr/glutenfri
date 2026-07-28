import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import {
  createAdminEstablishment,
  getAdminEstablishments,
  updateAdminEstablishment,
} from '../../services/admin';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

const EMPTY_ESTABLISHMENT = {
  name: '',
  type: 'restaurant',
  address: '',
  phone: '',
  email: '',
  source: 'user',
  trustStatus: 'PENDING_VALIDATION',
  sourceName: '',
  sourceUrl: '',
  lastVerifiedAt: '',
  riskLevel: 'none',
  dedicatedKitchen: false,
  dedicatedGlutenFreeMenu: false,
  staffTrained: false,
  notes: '',
};

export default function EstablishmentsView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].establishments;
  const common = ADMIN_COPY[language].common;
  const TYPE_LABELS = copy.types;
  const RISK_LABELS = copy.risks;
  const TRUST_LABELS = copy.trust;
  const initialQuery = useMemo(() => new URLSearchParams(window.location.search), []);
  const [search, setSearch] = useState(initialQuery.get('q') || '');
  const [type, setType] = useState('');
  const [trustStatus, setTrustStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [source, setSource] = useState('');
  const [result, setResult] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [selected, setSelected] = useState(
    initialQuery.get('new') === '1' ? { ...EMPTY_ESTABLISHMENT, isNew: true } : null
  );
  const [draft, setDraft] = useState(selected);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      getAdminEstablishments({
        page,
        limit: 25,
        search: search || undefined,
        type: type || undefined,
        trustStatus: trustStatus || undefined,
        riskLevel: riskLevel || undefined,
        source: source || undefined,
      })
        .then(setResult)
        .finally(() => setLoading(false));
    },
    [search, type, trustStatus, riskLevel, source]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => load(1), 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openEditor = (establishment) => {
    setSelected(establishment);
    setDraft({ ...establishment });
    setMessage(null);
  };

  const openNew = () => {
    const next = { ...EMPTY_ESTABLISHMENT, isNew: true };
    setSelected(next);
    setDraft(next);
    setMessage(null);
  };

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...draft };
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.isNew;
      delete payload.placeId;
      delete payload.googlePlaceRefreshedAt;
      delete payload.certified;
      const saved = selected.isNew
        ? await createAdminEstablishment(payload)
        : await updateAdminEstablishment(selected._id, payload);
      setSelected(saved);
      setDraft(saved);
      setMessage(copy.saved);
      load(result.page);
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button className="admin-primary-button" type="button" onClick={openNew}>
          <Plus size={17} weight="bold" />
          {copy.newEstablishment}
        </button>
      </div>

      <div className={`admin-split-layout ${selected ? 'has-drawer' : ''}`}>
        <section>
          <div className="admin-filter-bar">
            <label className="admin-search-field">
              <MagnifyingGlass size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.search}
              />
            </label>
            <select className="admin-filter-select" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">{copy.allTypes}</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="admin-filter-select" value={trustStatus} onChange={(event) => setTrustStatus(event.target.value)}>
              <option value="">{copy.trustStatus}</option>
              {Object.entries(TRUST_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="admin-filter-select" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)}>
              <option value="">{copy.allRisks}</option>
              {Object.entries(RISK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="admin-filter-select" value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="">{copy.allSources}</option>
              {['APC', 'Google', 'APC+Google', 'user'].map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-loading">{copy.searching}</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{copy.establishment}</th>
                    <th>{copy.type}</th>
                    <th>{copy.trustStatus}</th>
                    <th>{copy.risk}</th>
                    <th>{copy.source}</th>
                    <th>{copy.updated}</th>
                    <th aria-label={copy.edit} />
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((establishment) => (
                    <tr
                      key={establishment._id}
                      className={selected?._id === establishment._id ? 'is-selected' : ''}
                      onDoubleClick={() => openEditor(establishment)}
                    >
                      <td>
                        <span className="admin-cell-title">{establishment.name}</span>
                        <span className="admin-cell-subtitle">{establishment.address || copy.noAddress}</span>
                      </td>
                      <td>{TYPE_LABELS[establishment.type]}</td>
                      <td>
                        <span className={`admin-status-pill ${establishment.trustStatus === 'PENDING_VALIDATION' ? 'is-warning' : ''}`}>
                          {establishment.trustStatus === 'CERTIFIED_APC_BIOTRAB'
                            ? <CheckCircle size={13} weight="fill" />
                            : <WarningCircle size={13} weight="fill" />}
                          {TRUST_LABELS[establishment.trustStatus] || TRUST_LABELS.PENDING_VALIDATION}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-pill ${establishment.riskLevel === 'high' ? 'is-danger' : establishment.riskLevel === 'moderate' ? 'is-warning' : ''}`}>
                          {RISK_LABELS[establishment.riskLevel || 'none']}
                        </span>
                      </td>
                      <td>{establishment.source}</td>
                      <td>{new Date(establishment.updatedAt).toLocaleDateString(language)}</td>
                      <td>
                        <button className="admin-icon-button" type="button" onClick={() => openEditor(establishment)} aria-label={formatAdminCopy(common.editNamed, { name: establishment.name })}>
                          <PencilSimple size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && result.data.length === 0 && <div className="admin-empty">{copy.noResults}</div>}
            <div className="admin-pagination">
              <span>{formatAdminCopy(copy.total, { count: result.total })}</span>
              <div className="admin-inline-actions">
                <button className="admin-secondary-button" type="button" disabled={result.page <= 1} onClick={() => load(result.page - 1)}>{common.previous}</button>
                <span>{formatAdminCopy(common.page, { page: result.page, total: Math.max(result.totalPages, 1) })}</span>
                <button className="admin-secondary-button" type="button" disabled={result.page >= result.totalPages} onClick={() => load(result.page + 1)}>{common.next}</button>
              </div>
            </div>
          </div>
        </section>

        {selected && draft && (
          <aside className="admin-drawer">
            <div className="admin-drawer-header">
              <div>
                <h2>{selected.isNew ? copy.newEstablishment : copy.editEstablishment}</h2>
                <p>{message || (selected.isNew ? copy.minimumData : copy.auditNotice)}</p>
              </div>
              <button className="admin-icon-button" type="button" onClick={() => setSelected(null)} aria-label={copy.closeEditor}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-drawer-body">
              <Field wide label={copy.name} value={draft.name} onChange={(value) => updateDraft('name', value)} />
              <Field wide label={copy.address} value={draft.address || ''} onChange={(value) => updateDraft('address', value)} />
              <SelectField label={copy.type} value={draft.type} options={TYPE_LABELS} onChange={(value) => updateDraft('type', value)} />
              <SelectField label={copy.risk} value={draft.riskLevel || 'none'} options={RISK_LABELS} onChange={(value) => updateDraft('riskLevel', value)} />
              <Field label={copy.phone} value={draft.phone || ''} onChange={(value) => updateDraft('phone', value)} />
              <Field label={copy.email} value={draft.email || ''} onChange={(value) => updateDraft('email', value)} type="email" />
              <SelectField
                label={copy.source}
                value={draft.source}
                options={{ APC: 'APC', Google: 'Google', 'APC+Google': 'APC + Google', user: copy.internalTeam }}
                onChange={(value) => updateDraft('source', value)}
              />
              <SelectField
                label={copy.trustStatus}
                value={draft.trustStatus || 'PENDING_VALIDATION'}
                options={TRUST_LABELS}
                onChange={(value) => updateDraft('trustStatus', value)}
              />
              <Field wide label={copy.sourceName} value={draft.sourceName || ''} onChange={(value) => updateDraft('sourceName', value)} />
              <Field wide label={copy.sourceUrl} value={draft.sourceUrl || ''} onChange={(value) => updateDraft('sourceUrl', value)} type="url" />
              <Field wide label={copy.lastVerified} value={draft.lastVerifiedAt ? String(draft.lastVerifiedAt).slice(0, 10) : ''} onChange={(value) => updateDraft('lastVerifiedAt', value || null)} type="date" />
              <div className="admin-checkbox-row">
                <Checkbox label={copy.dedicatedKitchen} checked={draft.dedicatedKitchen || false} onChange={(value) => updateDraft('dedicatedKitchen', value)} />
                <Checkbox label={copy.dedicatedMenu} checked={draft.dedicatedGlutenFreeMenu || false} onChange={(value) => updateDraft('dedicatedGlutenFreeMenu', value)} />
                <Checkbox label={copy.trainedStaff} checked={draft.staffTrained || false} onChange={(value) => updateDraft('staffTrained', value)} />
              </div>
              <label className="admin-form-field is-wide">
                {copy.internalNotes}
                <textarea value={draft.notes || ''} onChange={(event) => updateDraft('notes', event.target.value)} maxLength={2000} />
              </label>
            </div>
            <div className="admin-drawer-footer">
              <button className="admin-secondary-button" type="button" onClick={() => setSelected(null)}>{common.cancel}</button>
              <button className="admin-primary-button" type="button" disabled={saving || !draft.name.trim()} onClick={save}>
                {saving ? common.saving : copy.saveChanges}
              </button>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = 'text', wide = false }) {
  return (
    <label className={`admin-form-field ${wide ? 'is-wide' : ''}`}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="admin-form-field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
