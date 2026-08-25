import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowsMerge, CheckCircle, ClipboardText, Database, WarningCircle } from '@phosphor-icons/react';
import {
  getAdminEstablishments,
  getDuplicateCandidates,
  getEstablishmentHistory,
  getEstablishmentReports,
  reviewEstablishmentQuality,
  reviewEstablishmentReport,
} from '../../services/admin';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

const TABS = ['reports', 'duplicates', 'sources'];

export default function DataQualityView() {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].dataQuality;
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [nextReports, nextDuplicates, nextEstablishments] = await Promise.all([
        getEstablishmentReports(),
        getDuplicateCandidates(),
        getAdminEstablishments({ limit: 100 }),
      ]);
      setReports(nextReports);
      setDuplicates(nextDuplicates);
      setEstablishments(nextEstablishments.data);
    } catch {
      setMessage(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError]);

  useEffect(() => { load(); }, [load]);

  const visibleReports = useMemo(
    () => reports.filter((report) => ['pending', 'reviewing'].includes(report.status)),
    [reports]
  );
  const visibleEstablishments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase(language);
    return establishments.filter((establishment) => {
      const matchesSearch = !normalizedSearch || [establishment.name, establishment.address, establishment.sourceName]
        .some((value) => String(value || '').toLocaleLowerCase(language).includes(normalizedSearch));
      const matchesReview = !reviewStatus || (establishment.qualityReviewStatus || 'pending') === reviewStatus;
      const matchesConfidence = !confidence || (establishment.confidenceLevel || 'source_pending_review') === confidence;
      return matchesSearch && matchesReview && matchesConfidence;
    });
  }, [confidence, establishments, language, reviewStatus, search]);

  const chooseEstablishment = async (establishment) => {
    setSelected({ ...establishment });
    setReason('');
    try {
      setHistory(await getEstablishmentHistory(establishment._id));
    } catch {
      setHistory([]);
    }
  };

  const requireReason = () => {
    if (reason.trim().length >= 3) return true;
    setMessage(copy.reasonRequired);
    return false;
  };

  const resolveReport = async (report, status, markClosed = false) => {
    if (!requireReason()) return;
    setSaving(true);
    try {
      await reviewEstablishmentReport(report._id, { status, markClosed, reason: reason.trim() });
      setReason('');
      await load();
      setMessage(copy.saved);
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  const markDuplicate = async (duplicate, primary) => {
    if (!requireReason()) return;
    setSaving(true);
    try {
      await reviewEstablishmentQuality(duplicate._id, {
        duplicateOf: primary._id,
        qualityReviewStatus: 'reviewed',
        reason: reason.trim(),
      });
      setReason('');
      await load();
      setMessage(copy.saved);
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  const saveSourceReview = async () => {
    if (!selected || !requireReason()) return;
    setSaving(true);
    try {
      const saved = await reviewEstablishmentQuality(selected._id, {
        informationCategory: selected.informationCategory || 'community_information',
        sourceType: selected.sourceType || 'source_not_identified',
        confidenceLevel: selected.confidenceLevel || 'source_pending_review',
        informationStatus: selected.informationStatus || 'active',
        sourceName: selected.sourceName || null,
        sourceUrl: selected.sourceUrl || null,
        qualityReviewStatus: 'reviewed',
        reason: reason.trim(),
      });
      setSelected(saved);
      setReason('');
      setHistory(await getEstablishmentHistory(saved._id));
      await load();
      setMessage(copy.saved);
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
        <span className="admin-health"><Database size={18} weight="fill" />{copy.auditActive}</span>
      </div>

      <div className="admin-segmented" role="tablist" aria-label={copy.sections}>
        {TABS.map((key) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => { setTab(key); setSelected(null); setReason(''); }}>
            {copy.tabs[key]}
          </button>
        ))}
      </div>

      {message && <div className="admin-quality-message" role="status">{message}</div>}
      {tab === 'sources' && (
        <div className="admin-filter-bar admin-quality-filters" aria-label={copy.filters}>
          <label className="admin-search-field">
            <span className="admin-visually-hidden">{copy.searchSources}</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.searchSources} />
          </label>
          <label className="admin-form-field">
            <span>{copy.reviewFilter}</span>
            <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>
              <option value="">{copy.allReviewStatuses}</option>
              {Object.entries(copy.reviewStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className="admin-form-field">
            <span>{copy.confidenceFilter}</span>
            <select value={confidence} onChange={(event) => setConfidence(event.target.value)}>
              <option value="">{copy.allConfidences}</option>
              {Object.entries(copy.confidences).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
      )}
      {loading ? <div className="admin-loading">{copy.loading}</div> : (
        <div className="admin-quality-layout">
          <section className="admin-card admin-quality-list">
            {tab === 'reports' && (
              visibleReports.length ? visibleReports.map((report) => (
                <button key={report._id} type="button" className={`admin-quality-row ${selected?._id === report._id ? 'is-selected' : ''}`} onClick={() => { setSelected(report); setReason(''); }}>
                  <ClipboardText size={20} />
                  <span><strong>{report.establishment?.name || copy.unknownEstablishment}</strong><small>{copy.reportReasons[report.reason] || copy.reportReasons.other}</small></span>
                  <span className="admin-status-pill is-warning">{copy.statuses[report.status]}</span>
                </button>
              )) : <Empty icon={CheckCircle} text={copy.noReports} />
            )}
            {tab === 'duplicates' && (
              duplicates.length ? duplicates.map((candidate, index) => (
                <button key={`${candidate.first._id}-${candidate.second._id}`} type="button" className={`admin-quality-row ${selected?.candidateIndex === index ? 'is-selected' : ''}`} onClick={() => { setSelected({ ...candidate, candidateIndex: index }); setReason(''); }}>
                  <ArrowsMerge size={20} />
                  <span><strong>{candidate.first.name}</strong><small>{candidate.second.name} · {copy.duplicateReasons[candidate.reasons[0]]}</small></span>
                  {candidate.distanceMeters !== null && <span>{formatAdminCopy(copy.distance, { count: candidate.distanceMeters })}</span>}
                </button>
              )) : <Empty icon={CheckCircle} text={copy.noDuplicates} />
            )}
            {tab === 'sources' && (visibleEstablishments.length ? visibleEstablishments.map((establishment) => (
              <button key={establishment._id} type="button" className={`admin-quality-row ${selected?._id === establishment._id ? 'is-selected' : ''}`} onClick={() => chooseEstablishment(establishment)}>
                <Database size={20} />
                <span><strong>{establishment.name}</strong><small>{establishment.sourceName || copy.noSource}</small></span>
                <span className={`admin-status-pill ${establishment.qualityReviewStatus === 'reviewed' ? '' : 'is-warning'}`}>{copy.reviewStatuses[establishment.qualityReviewStatus || 'pending']}</span>
              </button>
            )) : <Empty icon={CheckCircle} text={copy.noFilteredSources} />)}
          </section>

          <aside className="admin-card admin-quality-detail">
            {!selected ? <Empty icon={WarningCircle} text={copy.selectItem} /> : (
              <>
                <h2>{tab === 'duplicates' ? copy.compareDuplicate : selected.establishment?.name || selected.name}</h2>
                {tab === 'reports' && <ReportDetail report={selected} copy={copy} reason={reason} setReason={setReason} saving={saving} resolve={resolveReport} />}
                {tab === 'duplicates' && <DuplicateDetail candidate={selected} copy={copy} reason={reason} setReason={setReason} saving={saving} mark={markDuplicate} />}
                {tab === 'sources' && <SourceDetail value={selected} setValue={setSelected} copy={copy} reason={reason} setReason={setReason} saving={saving} save={saveSourceReview} history={history} language={language} />}
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function ReasonField({ copy, value, onChange }) {
  return <label className="admin-form-field"><span>{copy.reason}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={1000} placeholder={copy.reasonPlaceholder} /></label>;
}

function ReportDetail({ report, copy, reason, setReason, saving, resolve }) {
  const canClose = report.reason === 'closed_business';
  return <div className="admin-quality-stack"><p>{report.comment || copy.noComment}</p><p className="admin-quality-meta">{report.establishment?.address || copy.noAddress}</p><ReasonField copy={copy} value={reason} onChange={setReason} /><div className="admin-inline-actions"><button className="admin-secondary-button" type="button" disabled={saving} onClick={() => resolve(report, 'reviewing')}>{copy.startReview}</button><button className="admin-secondary-button" type="button" disabled={saving} onClick={() => resolve(report, 'dismissed')}>{copy.dismiss}</button><button className="admin-primary-button" type="button" disabled={saving} onClick={() => resolve(report, 'resolved', canClose)}>{canClose ? copy.resolveAndClose : copy.resolve}</button></div></div>;
}

function DuplicateDetail({ candidate, copy, reason, setReason, saving, mark }) {
  return <div className="admin-quality-stack"><div className="admin-quality-comparison">{[candidate.first, candidate.second].map((item) => <article key={item._id}><strong>{item.name}</strong><p>{item.address || copy.noAddress}</p><small>{item._id}</small></article>)}</div><p>{copy.duplicateDisclaimer}</p><ReasonField copy={copy} value={reason} onChange={setReason} /><div className="admin-inline-actions"><button className="admin-secondary-button" type="button" disabled={saving} onClick={() => mark(candidate.second, candidate.first)}>{copy.keepFirst}</button><button className="admin-secondary-button" type="button" disabled={saving} onClick={() => mark(candidate.first, candidate.second)}>{copy.keepSecond}</button></div></div>;
}

function SourceDetail({ value, setValue, copy, reason, setReason, saving, save, history, language }) {
  const field = (key, next) => setValue((current) => ({ ...current, [key]: next }));
  return <div className="admin-quality-stack"><div className="admin-quality-form"><Select label={copy.category} value={value.informationCategory || 'community_information'} onChange={(next) => field('informationCategory', next)} options={copy.categories} /><Select label={copy.sourceType} value={value.sourceType || 'source_not_identified'} onChange={(next) => field('sourceType', next)} options={copy.sourceTypes} /><Select label={copy.confidence} value={value.confidenceLevel || 'source_pending_review'} onChange={(next) => field('confidenceLevel', next)} options={copy.confidences} /><Select label={copy.informationStatus} value={value.informationStatus || 'active'} onChange={(next) => field('informationStatus', next)} options={copy.informationStatuses} /><label className="admin-form-field"><span>{copy.sourceName}</span><input value={value.sourceName || ''} onChange={(event) => field('sourceName', event.target.value)} /></label><label className="admin-form-field"><span>{copy.sourceUrl}</span><input type="url" value={value.sourceUrl || ''} onChange={(event) => field('sourceUrl', event.target.value)} placeholder="https://" /></label></div><p>{copy.certificationNotice}</p><ReasonField copy={copy} value={reason} onChange={setReason} /><button className="admin-primary-button" type="button" disabled={saving} onClick={save}>{saving ? copy.saving : copy.saveReview}</button><section className="admin-quality-history"><h3>{copy.history}</h3>{history.length ? history.slice(0, 8).map((item) => <article key={`${item.channel}-${item._id}`}><strong>{copy.actions[item.action] || item.action}</strong><span>{new Date(item.createdAt).toLocaleString(language)}</span><small>{item.actor?.name || copy.deletedAdmin}{item.reason ? ` · ${item.reason}` : ''}</small></article>) : <p>{copy.noHistory}</p>}</section></div>;
}

function Select({ label, value, onChange, options }) {
  return <label className="admin-form-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}

function Empty({ icon: Icon, text }) {
  return <div className="admin-empty"><Icon size={24} /><p>{text}</p></div>;
}
