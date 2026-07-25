import restaurantFallback from './fallbacks/restaurant.jpg';
import bakeryFallback from './fallbacks/bakery.jpg';
import storeFallback from './fallbacks/store.jpg';
import pharmacyFallback from './fallbacks/pharmacy.jpg';
import generalFallback from './fallbacks/default.jpg';

export const fallbackByType = Object.freeze({
  restaurant: restaurantFallback,
  bakery: bakeryFallback,
  store: storeFallback,
  pharmacy: pharmacyFallback,
  supermarket: generalFallback,
  default: generalFallback,
});
