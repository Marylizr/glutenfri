import { useCallback, useEffect, useRef, useState } from 'react';
import { getEstablishments } from '../services/establishments.js';
import { useLanguage } from '../i18n/index.jsx';
import { classifyEstablishmentError, createRequestGate } from '../utils/requestState.js';

export default function useEstablishmentList() {
  const { t } = useLanguage();
  const gateRef = useRef(null);
  if (!gateRef.current) gateRef.current = createRequestGate();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    ({ force = false } = {}) => {
      const requestId = gateRef.current.next();
      setLoading(true);
      setError(null);

      return getEstablishments({}, { force })
        .then((list) => {
          if (gateRef.current.isCurrent(requestId)) setEstablishments(list);
        })
        .catch((requestError) => {
          const kind = classifyEstablishmentError(requestError);
          if (kind === 'cancelled' || !gateRef.current.isCurrent(requestId)) return;

          const messageKey = {
            http: 'loadHttpError',
            invalid: 'loadDataError',
            network: 'loadNetworkError',
          }[kind];
          setError(t(messageKey));

          if (import.meta.env.DEV) {
            console.error('[GlutenFri] Error al cargar establecimientos', {
              kind,
              status: requestError?.response?.status,
              message: requestError?.message,
            });
          }
        })
        .finally(() => {
          if (gateRef.current.isCurrent(requestId)) setLoading(false);
        });
    },
    [t]
  );

  useEffect(() => {
    load();
    return () => gateRef.current.invalidate();
  }, [load]);

  return {
    establishments,
    loading,
    error,
    reload: () => load({ force: true }),
  };
}
