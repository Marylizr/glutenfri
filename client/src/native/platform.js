import { Capacitor } from '@capacitor/core';

export function isNativeRuntime() {
  return import.meta.env?.VITE_NATIVE_APP === 'true' && Capacitor.isNativePlatform();
}
