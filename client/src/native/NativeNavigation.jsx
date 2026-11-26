import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { isNativeRuntime } from './platform.js';
import { handleNativeBack } from './back.js';

export default function NativeNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNativeRuntime() || Capacitor.getPlatform() !== 'android') return;
    let disposed = false;
    let listener;
    import('@capacitor/app').then(async ({ App }) => {
      const handle = await App.addListener('backButton', () => {
        handleNativeBack({ document, pathname: location.pathname,
          historyIndex: window.history.state?.idx, navigate, minimize: () => App.minimizeApp() });
      });
      if (disposed) await handle.remove();
      else listener = handle;
    }).catch(() => { /* Native default remains available if plugin loading fails. */ });
    return () => {
      disposed = true;
      if (listener) void listener.remove().catch(() => {});
    };
  }, [location.pathname, navigate]);
  return null;
}
