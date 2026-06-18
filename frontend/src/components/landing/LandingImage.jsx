import { useState } from 'react';
import { Leaf } from 'lucide-react';

export default function LandingImage({ src, alt, className = '', priority = false }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="text-center text-primary-200">
          <Leaf className="mx-auto h-12 w-12 opacity-60" />
          <p className="mt-2 px-4 text-xs font-medium opacity-80">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setError(true)}
    />
  );
}
