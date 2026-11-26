import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { useUserLocation } from './useUserLocation.js';
import useEstablishmentList from './useEstablishmentList.js';
import { filterEstablishments, parseExploreParams, serializeExploreParams, sortEstablishments } from '../utils/establishmentFilters.js';
import { getOpenStatus } from '../utils/openingHours.js';
import useMinuteClock from './useMinuteClock.js';

// One URL contract and result pipeline for both list and map; no parallel filter state.
export default function useDiscovery() {
  const list = useEstablishmentList();
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => parseExploreParams(params), [params]);
  const location = useUserLocation();
  const now = useMinuteClock();
  const filtered = useMemo(() => {
    const openStatusById = Object.fromEntries(list.establishments.map((place) => [place._id, getOpenStatus(place, now).status]));
    return sortEstablishments(filterEstablishments(list.establishments, { ...state, language, openStatusById }), state.sort, location.position);
  }, [list.establishments, state, language, location.position, now]);
  const available = {
    discount: list.establishments.some((p) => p.discount),
    delivery: list.establishments.some((p) => p.delivery === true),
    takeaway: list.establishments.some((p) => p.takeaway === true),
    hours: list.establishments.some((p) => p.timezone && (p.weeklyHours || p.specialHours?.length)),
  };
  return { ...list, ...location, state, filtered, available,
    updateState: (patch, replace = false) => setParams(serializeExploreParams({ ...state, ...patch }), { replace }),
    search: serializeExploreParams(state).toString(),
  };
}
