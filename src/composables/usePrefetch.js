/**
 * Composable for prefetching critical routes and resources
 * @param {Router} router - Vue Router instance (optional, will try to get from context if not provided)
 */
export function usePrefetch(router = null) {
  // Get router from context if not provided
  let routerInstance = router;
  
  // Try to get router from window if available (set by main.js)
  if (!routerInstance && window.__VUE_ROUTER__) {
    routerInstance = window.__VUE_ROUTER__;
  }

  // Prefetch a route component
  const prefetchRoute = async (routeName) => {
    try {
      if (!routerInstance) {
        console.warn('Router not available for prefetching');
        return;
      }
      
      const route = routerInstance.resolve({ name: routeName });
      if (route.matched && route.matched.length > 0) {
        const component = route.matched[0].components?.default;
        if (component && typeof component === 'function') {
          await component();
        }
      }
    } catch (err) {
      console.warn(`Failed to prefetch route ${routeName}:`, err);
    }
  };

  // Prefetch critical routes
  const prefetchCriticalRoutes = async () => {
    const criticalRoutes = ['Home', 'Videos', 'Watch'];
    
    // Prefetch in sequence to avoid overwhelming the network
    for (const routeName of criticalRoutes) {
      try {
        await prefetchRoute(routeName);
        // Small delay between prefetches
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`Failed to prefetch ${routeName}:`, err);
      }
    }
  };

  // Prefetch on idle using requestIdleCallback
  const prefetchOnIdle = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          prefetchCriticalRoutes();
        },
        { timeout: 2000 } // Fallback after 2 seconds
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchCriticalRoutes();
      }, 2000);
    }
  };

  // Prefetch on link hover (for better UX)
  const setupLinkPrefetch = () => {
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href) {
          const routeName = getRouteNameFromPath(href);
          if (routeName) {
            prefetchRoute(routeName);
          }
        }
      }, { once: true });
    });
  };

  // Get route name from path
  const getRouteNameFromPath = (path) => {
    const routeMap = {
      '/': 'Home',
      '/videos': 'Videos',
      '/watch': 'Watch',
      '/stories': 'Stories',
      '/categories': 'Categories',
    };
    
    // Match exact paths or paths that start with the key
    for (const [key, name] of Object.entries(routeMap)) {
      if (path === key || path.startsWith(key + '/')) {
        return name;
      }
    }
    return null;
  };

  // Prefetch API data for trending/home
  const prefetchTrendingData = async () => {
    try {
      // Prefetch trending videos API call
      const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
      const trendingUrl = `${apiBase}/api/movies?sortBy=popular&limit=12`;
      
      // Use link prefetch for API calls
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = trendingUrl;
          link.as = 'fetch';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      }
    } catch (err) {
      console.warn('Failed to prefetch trending data:', err);
    }
  };

  // Initialize prefetching
  const init = () => {
    // Prefetch on idle after initial load
    if (document.readyState === 'complete') {
      prefetchOnIdle();
      prefetchTrendingData();
    } else {
      window.addEventListener('load', () => {
        prefetchOnIdle();
        prefetchTrendingData();
      });
    }

    // Setup link prefetch on hover
    setupLinkPrefetch();
  };

  return {
    prefetchRoute,
    prefetchCriticalRoutes,
    prefetchOnIdle,
    setupLinkPrefetch,
    prefetchTrendingData,
    init,
  };
}

