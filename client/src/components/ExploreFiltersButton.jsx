import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { getAdvancedFilterCount } from '../utils/establishmentFilters.js';

export default function ExploreFiltersButton({
  certifiedOnly,
  onCertifiedChange,
}) {
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const activeCount = getAdvancedFilterCount({ certifiedOnly });

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close(true);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const clear = () => {
    onCertifiedChange(false);
  };

  return (
    <div className="explore-filter" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`explore-filter__trigger${activeCount ? ' is-active' : ''}`}
        aria-label={t('filters')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((visible) => !visible)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">instant_mix</span>
        <span className="explore-filter__trigger-label">{t('filters')}</span>
        {activeCount > 0 && <span className="explore-filter__count">{activeCount}</span>}
      </button>

      {open && (
        <section
          id={panelId}
          className="explore-filter__panel"
          aria-labelledby={`${panelId}-title`}
        >
          <div className="explore-filter__heading">
            <strong id={`${panelId}-title`}>{t('trustInformation')}</strong>
          </div>

          <label className="explore-filter__check">
            <input
              type="checkbox"
              checked={certifiedOnly}
              onChange={(event) => onCertifiedChange(event.target.checked)}
            />
            <span className="explore-filter__option-copy">
              <strong>{t('certificationFilter')}</strong>
            </span>
            <span className="explore-filter__switch" aria-hidden="true">
              <span />
            </span>
          </label>

          {activeCount > 0 && (
            <div className="explore-filter__actions">
              <button type="button" onClick={clear}>{t('clearFilters')}</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
