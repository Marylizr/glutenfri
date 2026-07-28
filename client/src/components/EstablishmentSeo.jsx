import { useEffect } from 'react';
import { getCanonicalPlaceUrl } from '../utils/share.js';
import { useLanguage } from '../i18n/index.jsx';
import { buildPlaceStructuredData } from '../utils/seo.js';

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const [name, content] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || [];
    if (name) element.setAttribute(name, content);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
  return element;
}

export default function EstablishmentSeo({ establishment }) {
  const { t } = useLanguage();

  useEffect(() => {
    const previousTitle = document.title;
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
    ];
    const metaSnapshots = metaSelectors.map((selector) => {
      const element = document.head.querySelector(selector);
      return { selector, element, content: element?.getAttribute('content') };
    });
    const previousCanonical = document.head.querySelector('link[rel="canonical"]');
    const previousCanonicalHref = previousCanonical?.getAttribute('href');
    const canonicalUrl = getCanonicalPlaceUrl(establishment._id);
    const description = t('placeMetaDescription', {
      name: establishment.name,
      location: establishment.address || t('northernPortugal'),
    });
    document.title = `${establishment.name} · GlutenFri`;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', document.title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const structuredData = buildPlaceStructuredData(establishment, canonicalUrl);
    let script = document.head.querySelector('script[data-glutenfri-place-seo]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.glutenfriPlaceSeo = 'true';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      script.remove();
      if (previousCanonical) previousCanonical.setAttribute('href', previousCanonicalHref || '');
      else canonical.remove();
      for (const snapshot of metaSnapshots) {
        const current = document.head.querySelector(snapshot.selector);
        if (snapshot.element) snapshot.element.setAttribute('content', snapshot.content || '');
        else current?.remove();
      }
      document.title = previousTitle || t('metaTitle');
    };
  }, [establishment, t]);

  return null;
}
