export function isGoogleSourced(establishment) {
  return establishment?.source === 'Google' || establishment?.source === 'APC+Google';
}
