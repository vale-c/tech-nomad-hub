'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CountryImageProps {
  src: string;
  alt: string;
  isLoading?: boolean;
}

export function CountryImage({
  src,
  alt,
  isLoading = false,
}: CountryImageProps) {
  const [error, setError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const showLoadingState = isLoading || imageLoading;

  return (
    <div className="relative w-full h-40 rounded-t-lg overflow-hidden bg-gray-200">
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          showLoadingState ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          console.log('Error is: ', error);
          setError(true);
          setImageLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={true}
      />
      {showLoadingState && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
