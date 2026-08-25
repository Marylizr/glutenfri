import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { useLanguage } from '../i18n/index.jsx';
import { recordCommercialAnalyticsEvent } from '../utils/commercialAnalytics.js';

const COPY = {
  'pt-PT': {
    title: 'Melhora a presença digital do teu estabelecimento',
    intro: 'A PixelTrend Studio ajuda restaurantes, lojas e negócios especializados a comunicar melhor os seus serviços, melhorar a experiência móvel e transformar visitas em contactos e reservas.',
    services: 'Como podemos ajudar',
    serviceItems: ['Website', 'Branding', 'UX/UI', 'SEO local', 'Menu digital', 'Reservas', 'Automatizações', 'Analítica', 'Growth', 'Desenvolvimento de produto digital'],
    packages: 'Hipóteses de pacotes para validar',
    packageNotice: 'Os pacotes abaixo são hipóteses de validação, sem preço definitivo, pagamento ou subscrição ativa.',
    packageItems: [
      ['Ficha gerida', 'Para atualizar dados comerciais permitidos, horários, menu, imagens e contactos, sempre sujeitos a revisão administrativa.'],
      ['Presença digital', 'Para um website, UX/UI, SEO local, menu digital ou reservas, contratados diretamente à PixelTrend Studio.'],
      ['Projeto personalizado', 'Para necessidades que exigem diagnóstico, prioridades e uma proposta independente de desenvolvimento digital.'],
    ],
    cases: 'Casos de uso',
    caseText: 'Lançar uma presença digital, corrigir uma experiência móvel difícil, tornar menus e contactos mais acessíveis ou medir melhor a procura.',
    process: 'Processo de trabalho',
    steps: ['Diagnóstico e objetivos', 'Proposta e prioridades', 'Design e desenvolvimento', 'Validação e evolução'],
    formTitle: 'Solicitar diagnóstico digital',
    name: 'Nome', business: 'Estabelecimento ou projeto', email: 'Email profissional', phone: 'Telefone (opcional)', service: 'Serviço de interesse', need: 'O que gostarias de melhorar?', consent: 'Li e aceito a política de privacidade para preparar este pedido.', privacy: 'política de privacidade',
    prepare: 'Preparar pedido', prepared: 'Pedido preparado apenas neste dispositivo. Não foi enviado, guardado nem partilhado.', copy: 'Copiar resumo fictício para QA', copied: 'Resumo copiado localmente.', qaNotice: 'Para QA, usa apenas dados fictícios. A cópia é manual e não cria um contacto ou lead.',
    chooseService: 'Seleciona um serviço', requestNotice: 'Este pedido é para serviços digitais da PixelTrend Studio; não é um pedido de certificação, alteração de fonte nem validação institucional.',
    separation: 'Contratar a PixelTrend Studio é opcional e não altera a categoria, fonte, estado de revisão ou posição de uma ficha no GlutenFri. GlutenFri não certifica estabelecimentos.',
    faq: 'Perguntas comerciais frequentes',
    faqItems: [
      ['Reclamar uma ficha', 'Serve para pedir gestão de informação comercial permitida. Exige verificação e não concede certificação nem altera confiança.', 'Iniciar uma reclamação numa ficha'],
      ['Pedir uma atualização', 'Depois de a gestão ser aprovada, a pessoa responsável pode propor alterações comerciais; a equipa revê-as antes de publicar.', 'Aceder à área de gestão'],
      ['Pedir serviços digitais', 'É um pedido independente à PixelTrend Studio para melhorar a presença digital. Não muda a posição, categoria ou fonte no GlutenFri.', 'Preparar diagnóstico digital'],
      ['Pedir certificação externa', 'GlutenFri não atribui certificações. Uma certificação externa depende exclusivamente da entidade emissora e da respetiva fonte.', 'Como interpretamos a informação'],
    ],
  },
  en: {
    title: 'Improve your establishment’s digital presence',
    intro: 'PixelTrend Studio helps restaurants, shops and specialist businesses communicate their services, improve mobile experiences and turn visits into contacts and bookings.',
    services: 'How we can help',
    serviceItems: ['Website', 'Branding', 'UX/UI', 'Local SEO', 'Digital menu', 'Bookings', 'Automation', 'Analytics', 'Growth', 'Digital product development'],
    packages: 'Package hypotheses to validate',
    packageNotice: 'These packages are validation hypotheses, with no final price, payment or active subscription.',
    packageItems: [
      ['Managed listing', 'For permitted business updates, opening hours, menus, images and contact details, always subject to administrative review.'],
      ['Digital presence', 'For a website, UX/UI, local SEO, digital menu or bookings, contracted directly with PixelTrend Studio.'],
      ['Custom project', 'For needs that require diagnosis, priorities and an independent digital development proposal.'],
    ],
    cases: 'Use cases',
    caseText: 'Launch a digital presence, fix a difficult mobile experience, make menus and contacts easier to use, or understand demand more clearly.',
    process: 'How we work',
    steps: ['Diagnosis and goals', 'Proposal and priorities', 'Design and development', 'Validation and iteration'],
    formTitle: 'Request a digital diagnosis',
    name: 'Name', business: 'Establishment or project', email: 'Professional email', phone: 'Phone (optional)', service: 'Service of interest', need: 'What would you like to improve?', consent: 'I have read and accept the privacy policy to prepare this request.', privacy: 'privacy policy',
    prepare: 'Prepare request', prepared: 'The request was prepared on this device only. It was not sent, stored or shared.', copy: 'Copy fictional QA summary', copied: 'Summary copied locally.', qaNotice: 'For QA, use fictional data only. Copying is manual and does not create a contact or lead.',
    chooseService: 'Select a service', requestNotice: 'This request is for PixelTrend Studio digital services; it is not a certification request, source change or institutional validation.',
    separation: 'Hiring PixelTrend Studio is optional and does not change a listing’s category, source, review status or position on GlutenFri. GlutenFri does not certify establishments.',
    faq: 'Commercial FAQ',
    faqItems: [
      ['Claim a listing', 'This requests management of permitted business information. It requires verification and does not grant certification or change trust.', 'Start a claim from a listing'],
      ['Request an update', 'After management is approved, the responsible person can propose business updates; the team reviews them before publishing.', 'Open the management area'],
      ['Request digital services', 'This is an independent request to PixelTrend Studio to improve a digital presence. It does not change GlutenFri ranking, category or source.', 'Prepare a digital diagnosis'],
      ['Request external certification', 'GlutenFri does not grant certifications. External certification depends only on the issuing body and its source.', 'How we interpret information'],
    ],
  },
  es: {
    title: 'Mejora la presencia digital de tu establecimiento',
    intro: 'PixelTrend Studio ayuda a restaurantes, tiendas y negocios especializados a comunicar mejor sus servicios, mejorar la experiencia móvil y convertir visitas en contactos y reservas.',
    services: 'Cómo podemos ayudar',
    serviceItems: ['Website', 'Branding', 'UX/UI', 'SEO local', 'Menú digital', 'Reservas', 'Automatizaciones', 'Analítica', 'Growth', 'Desarrollo de producto digital'],
    packages: 'Hipótesis de paquetes para validar',
    packageNotice: 'Los paquetes siguientes son hipótesis de validación, sin precio definitivo, pago ni suscripción activa.',
    packageItems: [
      ['Ficha gestionada', 'Para actualizar datos comerciales permitidos, horarios, menú, imágenes y contactos, siempre sujetos a revisión administrativa.'],
      ['Presencia digital', 'Para web, UX/UI, SEO local, menú digital o reservas, contratados directamente con PixelTrend Studio.'],
      ['Proyecto personalizado', 'Para necesidades que requieren diagnóstico, prioridades y una propuesta independiente de desarrollo digital.'],
    ],
    cases: 'Casos de uso',
    caseText: 'Lanzar una presencia digital, corregir una experiencia móvil difícil, hacer más accesibles menús y contactos o comprender mejor la demanda.',
    process: 'Proceso de trabajo',
    steps: ['Diagnóstico y objetivos', 'Propuesta y prioridades', 'Diseño y desarrollo', 'Validación y evolución'],
    formTitle: 'Solicitar diagnóstico digital',
    name: 'Nombre', business: 'Establecimiento o proyecto', email: 'Email profesional', phone: 'Teléfono (opcional)', service: 'Servicio de interés', need: '¿Qué te gustaría mejorar?', consent: 'He leído y acepto la política de privacidad para preparar esta solicitud.', privacy: 'política de privacidad',
    prepare: 'Preparar solicitud', prepared: 'La solicitud se ha preparado solo en este dispositivo. No se ha enviado, guardado ni compartido.', copy: 'Copiar resumen ficticio para QA', copied: 'Resumen copiado localmente.', qaNotice: 'Para QA, utiliza solo datos ficticios. La copia es manual y no crea un contacto ni un lead.',
    chooseService: 'Selecciona un servicio', requestNotice: 'Esta solicitud es para servicios digitales de PixelTrend Studio; no es una solicitud de certificación, cambio de fuente ni validación institucional.',
    separation: 'Contratar PixelTrend Studio es opcional y no altera la categoría, fuente, estado de revisión ni posición de una ficha en GlutenFri. GlutenFri no certifica establecimientos.',
    faq: 'Preguntas frecuentes comerciales',
    faqItems: [
      ['Reclamar una ficha', 'Sirve para pedir la gestión de información comercial permitida. Requiere verificación y no concede certificación ni cambia la confianza.', 'Iniciar una reclamación desde una ficha'],
      ['Solicitar una actualización', 'Cuando la gestión está aprobada, la persona responsable puede proponer cambios comerciales; el equipo los revisa antes de publicarlos.', 'Abrir el área de gestión'],
      ['Solicitar servicios digitales', 'Es una solicitud independiente a PixelTrend Studio para mejorar la presencia digital. No cambia el ranking, categoría ni fuente en GlutenFri.', 'Preparar diagnóstico digital'],
      ['Solicitar certificación externa', 'GlutenFri no concede certificaciones. La certificación externa depende solo de la entidad emisora y de su fuente.', 'Cómo interpretamos la información'],
    ],
  },
};

export default function ServicesPage() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '', service: '', need: '', consent: false });
  const [prepared, setPrepared] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    recordCommercialAnalyticsEvent('services_page_viewed');
  }, []);
  const summary = useMemo(
    () => `${copy.formTitle}\n${copy.name}: ${form.name}\n${copy.business}: ${form.business}\n${copy.email}: ${form.email}\n${copy.phone}: ${form.phone || '—'}\n${copy.service}: ${form.service}\n${copy.need}: ${form.need}`,
    [copy, form]
  );
  const update = (field, value) => {
    setPrepared(false);
    setCopied(false);
    setForm((current) => ({ ...current, [field]: value }));
  };
  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  };

  return (
    <LegalPageLayout title={copy.title}>
      <p className="services-lead">{copy.intro}</p>
      <section><h2>{copy.services}</h2><ul>{copy.serviceItems.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h2>{copy.cases}</h2><p>{copy.caseText}</p></section>
      <section><h2>{copy.process}</h2><ol>{copy.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className="services-request" aria-labelledby="diagnosis-title">
        <h2 id="diagnosis-title">{copy.formTitle}</h2>
        <p>{copy.requestNotice}</p>
        <form onSubmit={(event) => {
          event.preventDefault();
          recordCommercialAnalyticsEvent('digital_diagnosis_requested');
          recordCommercialAnalyticsEvent('commercial_request_submitted');
          setPrepared(true);
        }}>
          <label>{copy.name}<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label>{copy.business}<input required value={form.business} onChange={(event) => update('business', event.target.value)} /></label>
          <label>{copy.email}<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>{copy.phone}<input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          <label>{copy.service}<select required value={form.service} onChange={(event) => {
            update('service', event.target.value);
            if (event.target.value) recordCommercialAnalyticsEvent('service_selected');
          }}><option value="">{copy.chooseService}</option>{copy.serviceItems.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>{copy.need}<textarea required minLength="20" maxLength="1200" value={form.need} onChange={(event) => update('need', event.target.value)} /></label>
          <label className="services-request__consent"><input type="checkbox" required checked={form.consent} onChange={(event) => update('consent', event.target.checked)} /><span>{copy.consent} <Link to="/privacidad">{copy.privacy}</Link>.</span></label>
          <button className="button-primary" type="submit" onClick={() => recordCommercialAnalyticsEvent('digital_diagnosis_clicked')}>{copy.prepare}</button>
        </form>
        {prepared && <div className="services-request__prepared" role="status"><p>{copy.prepared}</p><pre>{summary}</pre><button className="button-secondary" type="button" onClick={copySummary}>{copied ? copy.copied : copy.copy}</button><p>{copy.qaNotice}</p></div>}
      </section>
      <section aria-labelledby="packages-title"><h2 id="packages-title">{copy.packages}</h2><p>{copy.packageNotice}</p><div className="commercial-packages">{copy.packageItems.map(([name, description]) => <article key={name}><h3>{name}</h3><p>{description}</p></article>)}</div></section>
      <section aria-labelledby="commercial-faq-title"><h2 id="commercial-faq-title">{copy.faq}</h2><div className="commercial-faq">{copy.faqItems.map(([question, answer, action], index) => <article key={question}><h3>{question}</h3><p>{answer}</p>{index === 0 ? <Link to="/explorar">{action}</Link> : index === 1 ? <Link to="/negocio">{action}</Link> : index === 2 ? <a href="#diagnosis-title">{action}</a> : <Link to="/informacion-sin-gluten">{action}</Link>}</article>)}</div></section>
      <p className="institutional-notice">{copy.separation}</p>
    </LegalPageLayout>
  );
}
