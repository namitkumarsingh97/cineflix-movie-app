/**
 * Performance optimization utilities
 */

// Debounce function to limit function calls
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit function calls
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Use requestIdleCallback with fallback
export function requestIdleCallbackPolyfill(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback: use setTimeout with small delay
  return setTimeout(callback, options.timeout || 1);
}

// Use cancelIdleCallback with fallback
export function cancelIdleCallbackPolyfill(id) {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
}

// Defer non-critical work
export function deferNonCriticalWork(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 0);
  }
}

// Batch DOM updates
export function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Optimize scroll handlers
export function createOptimizedScrollHandler(handler) {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        handler.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Preload critical resources
export function preloadResource(href, as = 'script', crossorigin = false) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

// Prefetch resources for next navigation
export function prefetchResource(href, as = 'document') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

