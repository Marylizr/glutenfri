import { useState } from 'react';
import { APP_LOGO_URL, APP_NAME } from '../config/brand';

export default function BrandLogo({ className = '', priority = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span className={`brand-logo-fallback ${className}`.trim()}>
        {APP_NAME}
      </span>
    );
  }

  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={APP_LOGO_URL}
      width="933"
      height="427"
      alt={APP_NAME}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setImageFailed(true)}
    />
  );
}
