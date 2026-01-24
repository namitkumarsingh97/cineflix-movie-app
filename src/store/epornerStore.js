import { ref, reactive, computed } from 'vue';

/**
 * Global Eporner Store
 * Acts like Redux - loads data once, stores it, and reuses on subsequent loads
 */
const STORAGE_KEY = 'eporner_store';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Global reactive state
const state = reactive({
  // Popular videos cache
  popularVideos: [],
  popularVideosLoaded: false,
  popularVideosTimestamp: null,
  
  // Latest videos cache
  latestVideos: [],
  latestVideosLoaded: false,
  latestVideosTimestamp: null,
  
  // Top weekly videos cache
  topWeeklyVideos: [],
  topWeeklyVideosLoaded: false,
  topWeeklyVideosTimestamp: null,
  
  // Top monthly videos cache
  topMonthlyVideos: [],
  topMonthlyVideosLoaded: false,
  topMonthlyVideosTimestamp: null,
  
  // Top rated videos cache
  topRatedVideos: [],
  topRatedVideosLoaded: false,
  topRatedVideosTimestamp: null,
  
  // Search results cache (keyed by query)
  searchCache: new Map(),
  
  // Video details cache (keyed by video ID)
  videoDetailsCache: new Map(),
  
  // Loading states
  isLoading: false,
  lastLoadTime: null,
});

/**
 * Load state from localStorage
 */
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();
      
      // Check if cache is still valid (within 24 hours)
      if (data.timestamp && (now - data.timestamp) < CACHE_EXPIRY_MS) {
        // Restore popular videos
        if (data.popularVideos) {
          state.popularVideos = data.popularVideos;
          state.popularVideosLoaded = true;
          state.popularVideosTimestamp = data.timestamp;
        }
        
        // Restore latest videos
        if (data.latestVideos) {
          state.latestVideos = data.latestVideos;
          state.latestVideosLoaded = true;
          state.latestVideosTimestamp = data.timestamp;
        }
        
        // Restore top weekly videos
        if (data.topWeeklyVideos) {
          state.topWeeklyVideos = data.topWeeklyVideos;
          state.topWeeklyVideosLoaded = true;
          state.topWeeklyVideosTimestamp = data.timestamp;
        }
        
        // Restore top monthly videos
        if (data.topMonthlyVideos) {
          state.topMonthlyVideos = data.topMonthlyVideos;
          state.topMonthlyVideosLoaded = true;
          state.topMonthlyVideosTimestamp = data.timestamp;
        }
        
        // Restore top rated videos
        if (data.topRatedVideos) {
          state.topRatedVideos = data.topRatedVideos;
          state.topRatedVideosLoaded = true;
          state.topRatedVideosTimestamp = data.timestamp;
        }
        
        // Restore search cache
        if (data.searchCache && Array.isArray(data.searchCache)) {
          data.searchCache.forEach(([key, value]) => {
            state.searchCache.set(key, value);
          });
        }
        
        // Restore video details cache
        if (data.videoDetailsCache && Array.isArray(data.videoDetailsCache)) {
          data.videoDetailsCache.forEach(([key, value]) => {
            state.videoDetailsCache.set(key, value);
          });
        }
        
        state.lastLoadTime = data.timestamp;
        return true;
      } else {
        // Cache expired, clear it
        clearStorage();
      }
    }
  } catch (error) {
    console.error('Error loading Eporner store from storage:', error);
    clearStorage();
  }
  return false;
}

/**
 * Save state to localStorage
 */
function saveToStorage() {
  try {
    const data = {
      timestamp: Date.now(),
      popularVideos: state.popularVideos,
      latestVideos: state.latestVideos,
      topWeeklyVideos: state.topWeeklyVideos,
      topMonthlyVideos: state.topMonthlyVideos,
      topRatedVideos: state.topRatedVideos,
      searchCache: Array.from(state.searchCache.entries()),
      videoDetailsCache: Array.from(state.videoDetailsCache.entries()),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving Eporner store to storage:', error);
    // If storage is full, clear old cache entries
    if (error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
    }
  }
}

/**
 * Clear storage
 */
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing Eporner store:', error);
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCacheEntries() {
  // Keep only the most recent 50 search results and 100 video details
  const searchEntries = Array.from(state.searchCache.entries())
    .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
    .slice(0, 50);
  state.searchCache.clear();
  searchEntries.forEach(([key, value]) => {
    state.searchCache.set(key, value);
  });
  
  const videoEntries = Array.from(state.videoDetailsCache.entries())
    .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
    .slice(0, 100);
  state.videoDetailsCache.clear();
  videoEntries.forEach(([key, value]) => {
    state.videoDetailsCache.set(key, value);
  });
  
  saveToStorage();
}

/**
 * Check if cache is valid
 */
function isCacheValid(timestamp) {
  if (!timestamp) return false;
  return (Date.now() - timestamp) < CACHE_EXPIRY_MS;
}

/**
 * Eporner Store
 */
export function useEpornerStore() {
  // Initialize: Load from storage on first use
  if (!state.lastLoadTime) {
    loadFromStorage();
  }
  
  /**
   * Get popular videos (cached)
   */
  const getPopularVideos = computed(() => {
    if (state.popularVideosLoaded && isCacheValid(state.popularVideosTimestamp)) {
      return state.popularVideos;
    }
    return [];
  });
  
  /**
   * Set popular videos
   */
  const setPopularVideos = (videos) => {
    state.popularVideos = videos;
    state.popularVideosLoaded = true;
    state.popularVideosTimestamp = Date.now();
    saveToStorage();
  };
  
  /**
   * Get latest videos (cached)
   */
  const getLatestVideos = computed(() => {
    if (state.latestVideosLoaded && isCacheValid(state.latestVideosTimestamp)) {
      return state.latestVideos;
    }
    return [];
  });
  
  /**
   * Set latest videos
   */
  const setLatestVideos = (videos) => {
    state.latestVideos = videos;
    state.latestVideosLoaded = true;
    state.latestVideosTimestamp = Date.now();
    saveToStorage();
  };
  
  /**
   * Get top weekly videos (cached)
   */
  const getTopWeeklyVideos = computed(() => {
    if (state.topWeeklyVideosLoaded && isCacheValid(state.topWeeklyVideosTimestamp)) {
      return state.topWeeklyVideos;
    }
    return [];
  });
  
  /**
   * Set top weekly videos
   */
  const setTopWeeklyVideos = (videos) => {
    state.topWeeklyVideos = videos;
    state.topWeeklyVideosLoaded = true;
    state.topWeeklyVideosTimestamp = Date.now();
    saveToStorage();
  };
  
  /**
   * Get top monthly videos (cached)
   */
  const getTopMonthlyVideos = computed(() => {
    if (state.topMonthlyVideosLoaded && isCacheValid(state.topMonthlyVideosTimestamp)) {
      return state.topMonthlyVideos;
    }
    return [];
  });
  
  /**
   * Set top monthly videos
   */
  const setTopMonthlyVideos = (videos) => {
    state.topMonthlyVideos = videos;
    state.topMonthlyVideosLoaded = true;
    state.topMonthlyVideosTimestamp = Date.now();
    saveToStorage();
  };
  
  /**
   * Get top rated videos (cached)
   */
  const getTopRatedVideos = computed(() => {
    if (state.topRatedVideosLoaded && isCacheValid(state.topRatedVideosTimestamp)) {
      return state.topRatedVideos;
    }
    return [];
  });
  
  /**
   * Set top rated videos
   */
  const setTopRatedVideos = (videos) => {
    state.topRatedVideos = videos;
    state.topRatedVideosLoaded = true;
    state.topRatedVideosTimestamp = Date.now();
    saveToStorage();
  };
  
  /**
   * Get cached search results
   */
  const getCachedSearch = (query, page = 1, order = 'latest') => {
    const cacheKey = `${query}|${page}|${order}`;
    const cached = state.searchCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  };
  
  /**
   * Set cached search results
   */
  const setCachedSearch = (query, page, order, data) => {
    const cacheKey = `${query}|${page}|${order}`;
    state.searchCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    saveToStorage();
  };
  
  /**
   * Get cached video details
   */
  const getCachedVideoDetails = (videoId) => {
    const cached = state.videoDetailsCache.get(videoId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  };
  
  /**
   * Set cached video details
   */
  const setCachedVideoDetails = (videoId, data) => {
    state.videoDetailsCache.set(videoId, {
      data,
      timestamp: Date.now(),
    });
    saveToStorage();
  };
  
  /**
   * Check if data needs to be loaded
   */
  const needsLoad = (type) => {
    switch (type) {
      case 'popular':
        return !state.popularVideosLoaded || !isCacheValid(state.popularVideosTimestamp);
      case 'latest':
        return !state.latestVideosLoaded || !isCacheValid(state.latestVideosTimestamp);
      case 'topWeekly':
        return !state.topWeeklyVideosLoaded || !isCacheValid(state.topWeeklyVideosTimestamp);
      case 'topMonthly':
        return !state.topMonthlyVideosLoaded || !isCacheValid(state.topMonthlyVideosTimestamp);
      case 'topRated':
        return !state.topRatedVideosLoaded || !isCacheValid(state.topRatedVideosTimestamp);
      default:
        return true;
    }
  };
  
  /**
   * Clear all cache
   */
  const clearCache = () => {
    state.popularVideos = [];
    state.popularVideosLoaded = false;
    state.latestVideos = [];
    state.latestVideosLoaded = false;
    state.topWeeklyVideos = [];
    state.topWeeklyVideosLoaded = false;
    state.topMonthlyVideos = [];
    state.topMonthlyVideosLoaded = false;
    state.topRatedVideos = [];
    state.topRatedVideosLoaded = false;
    state.searchCache.clear();
    state.videoDetailsCache.clear();
    clearStorage();
  };
  
  return {
    // State
    state: computed(() => state),
    isLoading: computed(() => state.isLoading),
    
    // Getters
    getPopularVideos,
    getLatestVideos,
    getTopWeeklyVideos,
    getTopMonthlyVideos,
    getTopRatedVideos,
    getCachedSearch,
    getCachedVideoDetails,
    
    // Setters
    setPopularVideos,
    setLatestVideos,
    setTopWeeklyVideos,
    setTopMonthlyVideos,
    setTopRatedVideos,
    setCachedSearch,
    setCachedVideoDetails,
    
    // Utilities
    needsLoad,
    clearCache,
    loadFromStorage,
    saveToStorage,
  };
}

// Export singleton instance
export const epornerStore = useEpornerStore();

