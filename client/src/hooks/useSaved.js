import { useCallback, useEffect, useState } from 'react';
import { getSaved, saveEstablishment, unsaveEstablishment } from '../services/saved';

export function useSaved(user) {
  const [establishments, setEstablishments] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!user) {
      setEstablishments([]);
      setSavedIds(new Set());
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getSaved()
      .then((list) => {
        setEstablishments(list);
        setSavedIds(new Set(list.map((e) => e._id)));
      })
      .catch(() => {
        setError('No pudimos cargar tus lugares guardados. Intenta de nuevo.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(
    async (establishmentId) => {
      if (!user) return;
      try {
        if (savedIds.has(establishmentId)) {
          await unsaveEstablishment(establishmentId);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(establishmentId);
            return next;
          });
          setEstablishments((prev) => prev.filter((e) => e._id !== establishmentId));
        } else {
          await saveEstablishment(establishmentId);
          setSavedIds((prev) => new Set(prev).add(establishmentId));
          reload();
        }
      } catch (err) {
        // Un 401 con sesión vencida ya lo maneja el interceptor global de
        // services/api.js (redirige a login). Para cualquier otro error no
        // rompemos la UI — el corazón simplemente no cambia de estado.
        if (err.response?.status !== 401) {
          console.error('No se pudo actualizar guardados', err);
        }
      }
    },
    [user, savedIds, reload]
  );

  return { establishments, savedIds, toggle, loading, error, reload };
}
