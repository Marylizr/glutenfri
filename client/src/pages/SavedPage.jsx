import RestaurantCard from '../components/RestaurantCard';
import PublicPageHeader from '../components/PublicPageHeader';
import ErrorState from '../components/ErrorState';
import LoginRequiredState from '../components/LoginRequiredState';
import { useUserLocation } from '../hooks/useUserLocation';
import { useLanguage } from '../i18n/index.jsx';

export default function SavedPage({ auth, saved, onSelectEstablishment, onGoToProfile }) {
  const { position } = useUserLocation();
  const { language, t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PublicPageHeader title={t('saved')} />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {!auth.user && (
          <LoginRequiredState
            icon="♡"
            title={t('saved')}
            message={t('informationNotice')}
            onGoToProfile={onGoToProfile}
          />
        )}

        {auth.user && (
          <>
            {saved.loading && <div role="status" style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>}

            {!saved.loading && saved.error && <ErrorState message={saved.error} onRetry={saved.reload} />}

            {!saved.loading && !saved.error && saved.establishments.length === 0 && (
              <div style={{ color: 'var(--color-text-muted)', padding: '24px 0', textAlign: 'center' }}>
                {{
                  'pt-PT': 'Ainda não guardaste nenhum local. Seleciona o ♡ de um cartão para o guardar.',
                  en: 'You have not saved any places yet. Select the ♡ on a card to save it.',
                  es: 'Todavía no has guardado ningún lugar. Selecciona el ♡ de una tarjeta para guardarlo.',
                }[language]}
              </div>
            )}

            {saved.establishments.map((e) => (
              <RestaurantCard
                key={e._id}
                establishment={e}
                userPosition={position}
                onSelect={onSelectEstablishment}
                saved={saved.savedIds.has(e._id)}
                onToggleSaved={saved.toggle}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
