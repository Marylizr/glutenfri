import restaurantFallback from './fallbacks/restaurant-v2.jpg';
import bakeryFallback from './fallbacks/bakery-v2.jpg';
import storeFallback from './fallbacks/store-v2.jpg';
import pharmacyFallback from './fallbacks/pharmacy.jpg';
const generalFallback = storeFallback;

export const fallbackByType = Object.freeze({
  restaurant: restaurantFallback,
  bakery: bakeryFallback,
  store: storeFallback,
  pharmacy: pharmacyFallback,
  supermarket: generalFallback,
  default: generalFallback,
});
