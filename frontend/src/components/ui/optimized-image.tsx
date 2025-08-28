import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  blurDataURL,
  priority = false,
  quality = 75,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate optimized image URL with quality parameter
  const getOptimizedSrc = (src: string) => {
    if (!src.includes('?')) return src;
    return `${src}&q=${quality}`;
  };

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : getOptimizedSrc(src);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover scale-110 blur-sm transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !blurDataURL && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse',
          className
        )} />
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 flex items-center justify-center',
          className
        )}>
          <div className="text-gray-400 text-sm text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p>فشل في تحميل الصورة</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for preloading critical images
export const useImagePreloader = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [src]);

  return isLoaded;
};

// Utility for generating blur data URLs
export const generateBlurDataURL = (width: number = 10, height: number = 6): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Create a simple gradient blur placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL();
};

export default OptimizedImage;
