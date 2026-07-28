import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useBlocker, useParams } from 'react-router-dom';
import {
  addBusinessClaimInformation,
  createBusinessChange,
  getBusinessAnalytics,
  getBusinessDashboard,
  getBusinessPromotion,
  getManagedEstablishments,
} from '../services/business';
import ErrorState from '../components/ErrorState';
import { useLanguage } from '../i18n';

const COPY = {
  'pt-PT': {
    brand: 'GlutenFri Negócios', nav: ['Resumo', 'Estabelecimentos', 'Estatísticas', 'Promoção', 'Configuração'],
    statuses: { pending: 'Pendente', needs_information: 'Precisa de informação', rejected: 'Rejeitada', approved: 'Aprovada' },
    emptyTitle: 'Ainda não gere estabelecimentos', emptyBody: 'Reclame uma ficha a partir da página pública do estabelecimento.',
    explore: 'Explorar locais', dashboard: 'Painel do negócio', information: 'Informação', manage: 'Gerir ficha',
    freshness: { never_reviewed: 'Nunca revista pelo negócio', current: 'Atualizada', review_soon: 'Convém rever', stale: 'Desatualizada' },
    sponsored: 'Patrocinado', claimed: 'Perfil reclamado',
    addInfoPrompt: 'Adicione a informação ou evidência solicitada:', addInfo: 'Adicionar informação',
    loadPlaceError: 'Não foi possível carregar esta ficha.', loading: 'A carregar…',
    completeness: 'Completude', pendingChanges: 'alterações pendentes',
    labels: { name: 'Nome comercial', description: 'Descrição', address: 'Morada', lat: 'Latitude', lng: 'Longitude', phone: 'Telefone', email: 'Email público', logoUrl: 'URL do logótipo', websiteUrl: 'URL do website', menuUrl: 'URL do menu', reservationUrl: 'URL de reservas', orderUrl: 'URL de pedidos', whatsapp: 'WhatsApp' },
    note: 'Fotos, logótipo e menu usam URLs HTTPS porque o projeto ainda não dispõe de armazenamento privado seguro. Certificação e dados da comunidade não são editáveis.',
    submitted: 'Alterações enviadas para revisão. A informação pública ainda não foi modificada.',
    unsaved: 'Existem alterações por guardar. Deseja sair desta página?',
    saveError: 'Não foi possível guardar.', sending: 'A enviar…', submit: 'Enviar para revisão',
    stats: 'Estatísticas', promotion: 'Ferramentas de promoção', establishment: 'Estabelecimento',
    noApproved: 'Ainda não existem estabelecimentos aprovados.', loadDataError: 'Não foi possível carregar os dados.',
    impressions: 'Impressões da ficha', actions: 'Ações', conversion: 'Conversão',
    insufficient: 'Dados insuficientes para uma comparação fiável.', badge: 'Selo digital',
    noStats: 'Ainda não existem dados estatísticos para este período.',
    copySnippet: 'Copiar snippet HTML', downloadSvg: 'Descarregar SVG', kit: 'Kit de perfil comercial',
    promotionNote: 'Utilize este selo apenas enquanto a gestão da ficha estiver aprovada.',
    kitDisclaimer: 'A informação comercial não substitui a verificação de ingredientes e protocolos diretamente com o estabelecimento.',
    addDescription: 'Adicione uma descrição publicada para gerar o conteúdo.',
    config: 'Configuração', configEmail: 'Os lembretes de revisão são apresentados no painel. Ainda não existe infraestrutura de envio de email.',
    configPayment: 'Não existe checkout nem plano pago ativo; o patrocínio, quando aplicável, é gerido manualmente por um administrador.',
    backendError: 'O serviço não está disponível. Tente novamente.', back: 'Voltar à app',
  },
  en: {
    brand: 'GlutenFri Business', nav: ['Overview', 'Establishments', 'Analytics', 'Promotion', 'Settings'],
    statuses: { pending: 'Pending', needs_information: 'Needs information', rejected: 'Rejected', approved: 'Approved' },
    emptyTitle: 'You do not manage any establishments yet', emptyBody: 'Claim a listing from its public establishment page.',
    explore: 'Explore places', dashboard: 'Business dashboard', information: 'Information', manage: 'Manage listing',
    freshness: { never_reviewed: 'Never reviewed by the business', current: 'Current', review_soon: 'Review recommended', stale: 'Outdated' },
    sponsored: 'Sponsored', claimed: 'Claimed profile',
    addInfoPrompt: 'Add the requested information or evidence:', addInfo: 'Add information',
    loadPlaceError: 'We could not load this listing.', loading: 'Loading…',
    completeness: 'Completeness', pendingChanges: 'pending changes',
    labels: { name: 'Business name', description: 'Description', address: 'Address', lat: 'Latitude', lng: 'Longitude', phone: 'Phone', email: 'Public email', logoUrl: 'Logo URL', websiteUrl: 'Website URL', menuUrl: 'Menu URL', reservationUrl: 'Reservation URL', orderUrl: 'Ordering URL', whatsapp: 'WhatsApp' },
    note: 'Photos, logo and menu use HTTPS URLs because the project has no secure private storage yet. Certification and community data cannot be edited.',
    submitted: 'Changes sent for review. Public information has not been modified yet.',
    unsaved: 'You have unsaved changes. Do you want to leave this page?',
    saveError: 'We could not save the changes.', sending: 'Sending…', submit: 'Send for review',
    stats: 'Analytics', promotion: 'Promotion tools', establishment: 'Establishment',
    noApproved: 'There are no approved establishments yet.', loadDataError: 'We could not load the data.',
    impressions: 'Listing impressions', actions: 'Actions', conversion: 'Conversion',
    insufficient: 'There is not enough data for a reliable comparison.', badge: 'Digital badge',
    noStats: 'There are no analytics data for this period yet.',
    copySnippet: 'Copy HTML snippet', downloadSvg: 'Download SVG', kit: 'Business profile kit',
    promotionNote: 'Use this badge only while listing management remains approved.',
    kitDisclaimer: 'Business information does not replace checking ingredients and protocols directly with the establishment.',
    addDescription: 'Add a published description to generate this content.',
    config: 'Settings', configEmail: 'Review reminders appear in the dashboard. Email delivery infrastructure is not available yet.',
    configPayment: 'There is no checkout or active paid plan; sponsorship, when applicable, is managed manually by an administrator.',
    backendError: 'The service is unavailable. Please try again.', back: 'Back to app',
  },
  es: {
    brand: 'GlutenFri Negocios', nav: ['Resumen', 'Establecimientos', 'Estadísticas', 'Promoción', 'Configuración'],
    statuses: { pending: 'Pendiente', needs_information: 'Necesita información', rejected: 'Rechazada', approved: 'Aprobada' },
    emptyTitle: 'Todavía no gestionas establecimientos', emptyBody: 'Reclama una ficha desde la página pública del establecimiento.',
    explore: 'Explorar locales', dashboard: 'Panel del negocio', information: 'Información', manage: 'Gestionar ficha',
    freshness: { never_reviewed: 'Nunca revisada por el negocio', current: 'Actualizada', review_soon: 'Conviene revisar', stale: 'Desactualizada' },
    sponsored: 'Patrocinado', claimed: 'Perfil reclamado',
    addInfoPrompt: 'Añade la información o evidencia solicitada:', addInfo: 'Añadir información',
    loadPlaceError: 'No se pudo cargar esta ficha.', loading: 'Cargando…',
    completeness: 'Completitud', pendingChanges: 'cambios pendientes',
    labels: { name: 'Nombre comercial', description: 'Descripción', address: 'Dirección', lat: 'Latitud', lng: 'Longitud', phone: 'Teléfono', email: 'Email público', logoUrl: 'URL del logo', websiteUrl: 'URL del sitio web', menuUrl: 'URL del menú', reservationUrl: 'URL de reservas', orderUrl: 'URL de pedidos', whatsapp: 'WhatsApp' },
    note: 'Las fotos, el logo y el menú usan URLs HTTPS porque el proyecto todavía no dispone de almacenamiento privado seguro. La certificación y los datos comunitarios no son editables.',
    submitted: 'Cambios enviados a revisión. La información pública todavía no se ha modificado.',
    unsaved: 'Hay cambios sin guardar. ¿Quieres salir de esta página?',
    saveError: 'No se pudieron guardar los cambios.', sending: 'Enviando…', submit: 'Enviar a revisión',
    stats: 'Estadísticas', promotion: 'Herramientas de promoción', establishment: 'Establecimiento',
    noApproved: 'Todavía no existen establecimientos aprobados.', loadDataError: 'No se pudieron cargar los datos.',
    impressions: 'Impresiones de la ficha', actions: 'Acciones', conversion: 'Conversión',
    insufficient: 'No hay datos suficientes para una comparación fiable.', badge: 'Sello digital',
    noStats: 'Todavía no existen datos estadísticos para este periodo.',
    copySnippet: 'Copiar snippet HTML', downloadSvg: 'Descargar SVG', kit: 'Kit de perfil comercial',
    promotionNote: 'Utiliza este sello solo mientras la gestión de la ficha siga aprobada.',
    kitDisclaimer: 'La información comercial no sustituye la comprobación de ingredientes y protocolos directamente con el establecimiento.',
    addDescription: 'Añade una descripción publicada para generar el contenido.',
    config: 'Configuración', configEmail: 'Los recordatorios de revisión aparecen en el panel. Todavía no existe infraestructura de envío de email.',
    configPayment: 'No existe checkout ni plan de pago activo; el patrocinio, cuando corresponda, lo gestiona manualmente un administrador.',
    backendError: 'El servicio no está disponible. Inténtalo de nuevo.', back: 'Volver a la app',
  },
};
const NAV_PATHS = ['/negocio', '/negocio/establecimientos', '/negocio/estadisticas', '/negocio/promocion', '/negocio/configuracion'];

function StateLabel({ status, copy }) {
  return <span className={`business-status is-${status}`}>{copy.statuses[status] || status}</span>;
}

function BusinessHome({ state, copy }) {
  const addInformation = async (claim) => {
    const evidenceDescription = window.prompt(copy.addInfoPrompt);
    if (!evidenceDescription || evidenceDescription.trim().length < 10) return;
    await addBusinessClaimInformation(claim._id, { evidenceDescription });
    window.location.reload();
  };
  if (!state.data.length && !state.claims.length) {
    return <div className="business-empty"><h2>{copy.emptyTitle}</h2><p>{copy.emptyBody}</p><Link to="/explorar">{copy.explore}</Link></div>;
  }
  return (
    <>
      <h1>{copy.dashboard}</h1>
      {state.claims.map((claim) => (
        <article className="business-card" key={claim._id}>
          <h2>{claim.establishment?.name}</h2><StateLabel status={claim.status} copy={copy} />
          {claim.adminReason && <p>{claim.adminReason}</p>}
          {claim.status === 'needs_information' && (
            <button className="button-secondary" onClick={() => addInformation(claim)}>{copy.addInfo}</button>
          )}
        </article>
      ))}
      <div className="business-grid">
        {state.data.map((place) => (
          <article className="business-card" key={place._id}>
            <h2>{place.name}</h2>
            <p>{copy.information}: {copy.freshness[place.freshness.status]}</p>
            <span className="business-status">{place.sponsored ? copy.sponsored : copy.claimed}</span>
            <Link to={`/negocio/establecimientos/${place._id}`}>{copy.manage}</Link>
          </article>
        ))}
      </div>
    </>
  );
}

function BusinessEditor({ copy }) {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const blocker = useBlocker(dirty);
  useEffect(() => {
    getBusinessDashboard(id).then((data) => {
      setDashboard(data);
      const place = data.establishment;
      setForm({
        name: place.name || '', address: place.address || '',
        businessDescription: place.businessDescription || '', phone: place.phone || '',
        publicEmail: place.publicEmail || '', websiteUrl: place.websiteUrl || '',
        logoUrl: place.logoUrl || '', lat: place.lat ?? '', lng: place.lng ?? '',
        menuUrl: place.menuUrl || '', reservationUrl: place.reservationUrl || '',
        orderUrl: place.orderUrl || '', whatsapp: place.whatsapp || '',
      });
    }).catch(() => setError(copy.loadPlaceError));
  }, [copy.loadPlaceError, id]);
  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(copy.unsaved)) blocker.proceed();
    else blocker.reset();
  }, [blocker, copy.unsaved]);
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!dashboard) return <div role="status">{copy.loading}</div>;
  const submit = async (event) => {
    event.preventDefault(); setMessage(''); setError(''); setSaving(true);
    try {
      await createBusinessChange(id, {
        ...form,
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
      }, true);
      setDirty(false);
      setMessage(copy.submitted);
    } catch {
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  };
  const update = (field, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
  };
  return (
    <>
      <div className="business-heading"><div><h1>{dashboard.establishment.name}</h1><p>{copy.completeness}: {dashboard.completeness.percent}% · {dashboard.pendingChanges} {copy.pendingChanges}</p></div><StateLabel status="approved" copy={copy} /></div>
      <form className="business-form" onSubmit={submit}>
        <label>{copy.labels.name}<input maxLength="200" value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
        <label>{copy.labels.description}<textarea maxLength="2000" value={form.businessDescription} onChange={(e) => update('businessDescription', e.target.value)} /></label>
        <label>{copy.labels.address}<input maxLength="300" value={form.address} onChange={(e) => update('address', e.target.value)} /></label>
        <div className="business-form__grid">
          <label>{copy.labels.lat}<input type="number" step="any" min="-90" max="90" value={form.lat} onChange={(e) => update('lat', e.target.value)} /></label>
          <label>{copy.labels.lng}<input type="number" step="any" min="-180" max="180" value={form.lng} onChange={(e) => update('lng', e.target.value)} /></label>
          <label>{copy.labels.phone}<input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
          <label>{copy.labels.email}<input type="email" value={form.publicEmail} onChange={(e) => update('publicEmail', e.target.value)} /></label>
          {['logoUrl', 'websiteUrl', 'menuUrl', 'reservationUrl', 'orderUrl'].map((field) => <label key={field}>{copy.labels[field]}<input type="url" placeholder="https://" value={form[field]} onChange={(e) => update(field, e.target.value)} /></label>)}
          <label>{copy.labels.whatsapp}<input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} /></label>
        </div>
        <p className="business-note">{copy.note}</p>
        {message && <p className="business-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-primary" type="submit" disabled={saving}>{saving ? copy.sending : copy.submit}</button>
      </form>
    </>
  );
}

function SelectTool({ state, mode, copy }) {
  const [selected, setSelected] = useState(state.data[0]?._id || '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!selected) return;
    const load = mode === 'analytics' ? getBusinessAnalytics : getBusinessPromotion;
    load(selected).then(setData).catch(() => setError(copy.loadDataError));
  }, [copy.loadDataError, mode, selected]);
  if (!state.data.length) return <div className="business-empty">{copy.noApproved}</div>;
  const noAnalytics =
    mode === 'analytics' &&
    data &&
    data.impressions === 0 &&
    Object.values(data.actions).every((value) => value === 0);
  return (
    <>
      <h1>{mode === 'analytics' ? copy.stats : copy.promotion}</h1>
      <label className="business-select">{copy.establishment}<select value={selected} onChange={(e) => setSelected(e.target.value)}>{state.data.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
      {error && <p className="form-error">{error}</p>}
      {noAnalytics && <div className="business-empty">{copy.noStats}</div>}
      {mode === 'analytics' && data && !noAnalytics && <div className="business-grid"><article className="business-card"><strong>{data.impressions}</strong><span>{copy.impressions}</span></article><article className="business-card"><strong>{Object.values(data.actions).reduce((a, b) => a + b, 0)}</strong><span>{copy.actions}</span></article><article className="business-card"><strong>{data.conversionRate === null ? '—' : `${data.conversionRate}%`}</strong><span>{copy.conversion}</span></article>{data.insufficientData && <p>{copy.insufficient}</p>}</div>}
      {mode === 'promotion' && data && <div className="business-card promotion-tool"><h2>{copy.badge}</h2><div dangerouslySetInnerHTML={{ __html: data.badge.svg }} /><p>{copy.promotionNote}</p><button className="button-secondary" onClick={() => navigator.clipboard.writeText(data.snippet)}>{copy.copySnippet}</button><a className="button-primary" download={data.badge.filename} href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.badge.svg)}`}>{copy.downloadSvg}</a><h2>{copy.kit}</h2><p>{data.googleProfileKit.longDescription || copy.addDescription}</p><p>{copy.kitDisclaimer}</p></div>}
    </>
  );
}

export default function BusinessShell() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const [state, setState] = useState({ loading: true, data: [], claims: [], error: '' });
  const load = () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    getManagedEstablishments().then((result) => setState({ loading: false, data: result.data, claims: result.claims, error: '' })).catch(() => setState({ loading: false, data: [], claims: [], error: copy.backendError }));
  };
  useEffect(load, [copy.backendError]);
  return (
    <div className="business-app">
      <aside><h2>{copy.brand}</h2><nav>{NAV_PATHS.map((to, index) => <NavLink key={to} to={to} end={to === '/negocio'}>{copy.nav[index]}</NavLink>)}</nav><Link to="/explorar">{copy.back}</Link></aside>
      <main>{state.loading ? <div role="status">{copy.loading}</div> : state.error ? <ErrorState message={state.error} onRetry={load} /> : <Routes><Route index element={<BusinessHome state={state} copy={copy} />} /><Route path="establecimientos" element={<BusinessHome state={state} copy={copy} />} /><Route path="establecimientos/:id" element={<BusinessEditor copy={copy} />} /><Route path="estadisticas" element={<SelectTool state={state} mode="analytics" copy={copy} />} /><Route path="promocion" element={<SelectTool state={state} mode="promotion" copy={copy} />} /><Route path="configuracion" element={<div><h1>{copy.config}</h1><p>{copy.configEmail}</p><p>{copy.configPayment}</p></div>} /></Routes>}</main>
    </div>
  );
}
