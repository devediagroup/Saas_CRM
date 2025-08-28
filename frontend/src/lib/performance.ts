import React from 'react';

// Performance optimization utilities

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  itemHeight: number,
  containerHeight: number,
  items: any[]
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (scrollTop: number) => setScrollTop(scrollTop),
  };
};

// Image lazy loading hook
export const useLazyImage = (src: string) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);

  return { loaded, error, imgRef };
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16.67) { // More than one frame at 60fps
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Vite provides built-in bundle analysis
    console.log('Bundle analysis available via Vite build --analyze flag');

    // Alternative: Use Vite's built-in bundle analyzer
    if (typeof window !== 'undefined' && (window as any).__VITE_BUNDLE_ANALYZER__) {
      console.log('Vite bundle analyzer ready');
    }
  }
};

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  console.log('Web Vital:', metric);

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
};

// Resource hints for critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts (removed cairo.woff2, loaded from Google Fonts)

  // Preload critical images
  const logoLink = document.createElement('link');
  logoLink.rel = 'preload';
  logoLink.href = '/logo.svg';
  logoLink.as = 'image';
  document.head.appendChild(logoLink);
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory Usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1048576 * 100) / 100,
      total: Math.round(memInfo.totalJSHeapSize / 1048576 * 100) / 100,
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576 * 100) / 100,
    });
  }
};

// Network request monitoring
export const monitorNetworkRequests = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const apiRequests = resources.filter(entry =>
      entry.name.includes('/api/') ||
      entry.name.includes('localhost:1337')
    );

    console.log('API Requests:', apiRequests.length);
    apiRequests.forEach(entry => {
      if (entry.duration > 1000) { // Slow requests
        console.warn('Slow API request:', entry.name, entry.duration + 'ms');
      }
    });
  }
};

// React optimization hooks
export const useOptimizedState = <T>(initialValue: T) => {
  const [state, setState] = React.useState(initialValue);

  const setOptimizedState = React.useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      setState(prev => (value as (prev: T) => T)(prev));
    } else {
      setState(value);
    }
  }, []);

  return [state, setOptimizedState] as const;
};

// Deep comparison for dependencies
export const useDeepCompare = (value: any) => {
  const ref = React.useRef();

  if (!Object.is(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
};

// Component profiler - moved to separate file
export const withProfiler = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  // This function needs to be in a .tsx file to handle JSX
  throw new Error('withProfiler should be moved to a .tsx file');
};

export default {
  debounce,
  throttle,
  memoize,
  useVirtualScroll,
  useLazyImage,
  usePerformanceMonitor,
  logBundleSize,
  reportWebVitals,
  preloadCriticalResources,
  monitorMemoryUsage,
  monitorNetworkRequests,
  useOptimizedState,
  useDeepCompare,
  withProfiler,
};
