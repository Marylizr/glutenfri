import { useCallback, useEffect, useRef, useState } from 'react';
import { getEstablishments } from '../services/establishments.js';
import { useLanguage } from '../i18n/index.jsx';
import { classifyEstablishmentError, createRequestGate, establishmentErrorKey } from '../utils/requestState.js';

export default function useEstablishmentList() {
  const { t } = useLanguage();
  const [gate] = useState(createRequestGate);
  const busyRef = useRef(false);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setError] = useState(null);

  const load = useCallback(
    ({ force = false } = {}) => {
      if (force && busyRef.current) return;
      busyRef.current = true;
      const requestId = gate.next();
      setLoading(true);
      setError(null);

      return getEstablishments({}, { force })
        .then((list) => {
          if (gate.isCurrent(requestId)) setEstablishments(list);
        })
        .catch((requestError) => {
          const kind = classifyEstablishmentError(requestError);
          if (kind === 'cancelled' || !gate.isCurrent(requestId)) return;

          setError(establishmentErrorKey(requestError));

          if (import.meta.env.DEV) {
            console.error('[GlutenFri] Error al cargar establecimientos', {
              kind,
              status: requestError?.response?.status,
            });
          }
        })
        .finally(() => {
          if (gate.isCurrent(requestId)) { busyRef.current = false; setLoading(false); }
        });
    },
    [gate]
  );

  useEffect(() => {
    load();
    return () => { gate.invalidate(); busyRef.current = false; };
  }, [gate, load]);

  return {
    establishments,
    loading,
    error: errorKey ? t(errorKey) : null,
    reload: () => load({ force: true }),
  };
}
