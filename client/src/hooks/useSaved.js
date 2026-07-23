import { useCallback, useEffect, useState } from 'react';
import { getSaved, saveEstablishment, unsaveEstablishment } from '../services/saved';

export function useSaved(user) {
  const [establishments, setEstablishments] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    if (!user) {
      setEstablishments([]);
      setSavedIds(new Set());
      return;
    }
    setLoading(true);
    getSaved()
      .then((list) => {
        setEstablishments(list);
        setSavedIds(new Set(list.map((e) => e._id)));
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(
    async (establishmentId) => {
      if (!user) return;
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
    },
    [user, savedIds, reload]
  );

  return { establishments, savedIds, toggle, loading, reload };
}
