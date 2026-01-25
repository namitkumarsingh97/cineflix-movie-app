import { ref, computed } from 'vue';
import { epornerApi } from '../api/eporner';
import { useNetworkQuality } from './useNetworkQuality';
import { epornerStore } from '../store/epornerStore';

/**
 * Composable for Eporner API integration
 * Now uses global store for caching - loads once, stores, and reuses
 */
export function useEporner() {
  const videos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const perPage = ref(50); // Increased from 30 to 50 for better default experience
  const totalPages = ref(1);
  const totalCount = ref(0);
  const searchQuery = ref('');
  const sortOrder = ref('most-popular'); // Default to Most Popular
  const thumbSize = ref('big');
  const includeGay = ref(0);
  const includeLowQuality = ref(1);
  const queryCache = new Map();
  const videoCache = new Map();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  
  // Global store for persistent caching (singleton)
  const store = epornerStore;
  
  // Network quality detection
  const { thumbnailDensity, maxThumbnailsPerPage, shouldPreloadThumbnails } = useNetworkQuality();

  /**
   * Transform Eporner video to app format
   */
  const transformVideo = (epornerVideo) => {
    if (!epornerVideo) return null;

    // Extract categories from keywords
    const keywords = epornerVideo.keywords || '';
    const categories = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, 5); // Limit to 5 categories

    // Extract direct video URL - prefer direct URL over embed
    // Eporner API may return url as direct MP4 or as embed URL
    // Check if url is a direct video file (ends with .mp4, .webm, etc.) or is an embed URL
    let directVideoUrl = epornerVideo.url || '';
    const isDirectVideo = directVideoUrl && (
      directVideoUrl.endsWith('.mp4') || 
      directVideoUrl.endsWith('.webm') || 
      directVideoUrl.endsWith('.m3u8') ||
      directVideoUrl.includes('/video/') && !directVideoUrl.includes('/embed/')
    );
    
    // If url is not a direct video, try to extract from embed URL or use embed as fallback
    if (!isDirectVideo && epornerVideo.embed) {
      // Try to extract direct video URL from embed URL if possible
      // Otherwise, we'll need to use a proxy or different approach
      directVideoUrl = epornerVideo.embed;
    }

    return {
      id: epornerVideo.id,
      title: epornerVideo.title,
      description: epornerVideo.keywords || '',
      thumbnail: epornerVideo.default_thumb?.src || (epornerVideo.thumbs?.[0]?.src),
      thumbnails: epornerVideo.thumbs || [],
      duration: epornerVideo.length_sec || 0,
      durationFormatted: epornerVideo.length_min || '0:00',
      views: epornerVideo.views || 0,
      rating: parseFloat(epornerVideo.rate) || 0,
      url: directVideoUrl, // Use direct video URL
      embedUrl: epornerVideo.embed, // Keep embed URL for reference but don't use it
      added: epornerVideo.added,
      categories,
      keywords: keywords,
      // Additional metadata
      _source: 'eporner',
      _raw: epornerVideo,
    };
  };

  const getNetworkPreferences = () => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const saveData = Boolean(connection?.saveData);
    const effectiveType = connection?.effectiveType || '';
    const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g';

    return { saveData, isSlow, effectiveType };
  };

  const buildQueryCacheKey = (params) => {
    return [
      params.query,
      params.page,
      params.per_page,
      params.thumbsize,
      params.order,
      params.gay,
      params.lq,
    ].join('|');
  };

  const cacheResult = (key, payload) => {
    queryCache.set(key, {
      ts: Date.now(),
      payload,
    });
  };

  const getCachedResult = (key) => {
    const cached = queryCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.ts > CACHE_TTL_MS) {
      queryCache.delete(key);
      return null;
    }
    return cached.payload;
  };

  const getAdaptiveParams = (basePerPage, baseThumbsize, options) => {
    const { saveData, isSlow } = getNetworkPreferences();
    // Use network-aware max thumbnails
    const perPageAdaptive = Math.min(
      basePerPage,
      maxThumbnailsPerPage.value
    );
    // Adjust thumbnail size based on network density
    let thumbsizeAdaptive = baseThumbsize;
    if (thumbnailDensity.value === 'low') {
      thumbsizeAdaptive = 'small';
    } else if (thumbnailDensity.value === 'medium') {
      thumbsizeAdaptive = 'medium';
    } else {
      thumbsizeAdaptive = options.thumbsize || baseThumbsize;
    }

    return { perPageAdaptive, thumbsizeAdaptive };
  };

  /**
   * Search videos
   * Uses store cache for search results - loads once, stores, and reuses
   */
  const searchVideos = async (query = 'all', page = 1, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const { perPageAdaptive, thumbsizeAdaptive } = getAdaptiveParams(
        options.perPage || perPage.value,
        options.thumbsize || thumbSize.value,
        options
      );

      const params = {
        query: query || 'all',
        page: page || 1,
        per_page: perPageAdaptive,
        thumbsize: thumbsizeAdaptive,
        order: options.order || sortOrder.value,
        gay: options.gay !== undefined ? options.gay : includeGay.value,
        lq: options.lq !== undefined ? options.lq : includeLowQuality.value,
        format: 'json',
      };

      // Check store cache first
      const storeCacheKey = `${query}|${page}|${params.order}`;
      const storeCached = store.getCachedSearch(query, page, params.order);
      if (storeCached) {
        videos.value = storeCached.videos || [];
        currentPage.value = storeCached.page || page;
        totalCount.value = storeCached.totalCount || 0;
        totalPages.value = storeCached.totalPages || 1;
        searchQuery.value = query;
        loading.value = false;
        return;
      }

      // Check in-memory cache
      const cacheKey = buildQueryCacheKey(params);
      const cached = getCachedResult(cacheKey);
      if (cached) {
        videos.value = cached.videos;
        currentPage.value = cached.page;
        totalCount.value = cached.totalCount;
        totalPages.value = cached.totalPages;
        searchQuery.value = query;
        loading.value = false;
        return;
      }

      const response = await epornerApi.search(params);

      if (response && response.videos) {
        videos.value = response.videos.map(transformVideo).filter(v => v !== null);
        currentPage.value = response.page || page;
        totalCount.value = response.total_count || 0;
        searchQuery.value = query;
        
        // Calculate total pages from total_count and per_page
        const perPageCount = options.perPage || perPage.value;
        const calculatedPages = totalCount.value > 0 
          ? Math.ceil(totalCount.value / perPageCount) 
          : 1;
        
        // Use API's total_pages if it's reasonable, otherwise use calculated
        const apiTotalPages = response.total_pages || calculatedPages;
        
        // Cap total pages at a reasonable maximum (e.g., 1000 pages)
        // This prevents issues with incorrect API responses
        const MAX_PAGES = 1000;
        totalPages.value = apiTotalPages > MAX_PAGES ? MAX_PAGES : (apiTotalPages || calculatedPages);
        
        // Ensure totalPages is at least 1
        if (totalPages.value < 1) {
          totalPages.value = 1;
        }

        // Cache in memory
        cacheResult(cacheKey, {
          videos: [...videos.value],
          page: currentPage.value,
          totalPages: totalPages.value,
          totalCount: totalCount.value,
        });
        
        // Also cache in store for persistence
        store.setCachedSearch(query, page, params.order, {
          videos: [...videos.value],
          page: currentPage.value,
          totalPages: totalPages.value,
          totalCount: totalCount.value,
        });
      } else {
        videos.value = [];
        totalPages.value = 1;
        totalCount.value = 0;
      }
    } catch (err) {
      // Suppress console errors for expected failures (CORS, rate limiting, network issues)
      const isExpectedError = err?.message?.includes('Failed to fetch') || 
                              err?.message?.includes('CORS') ||
                              err?.message?.includes('503') ||
                              err?.message?.includes('NetworkError') ||
                              err?.message?.includes('Service Unavailable');
      
      if (!isExpectedError) {
        console.error('Error searching Eporner videos:', err);
      }
      error.value = err.message || 'Failed to fetch videos';
      videos.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get video by ID
   * Uses store cache - loads once, stores, and reuses
   */
  const getVideoById = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('useEporner.getVideoById called with ID:', id);
      
      // Check store cache first
      const storeCached = store.getCachedVideoDetails(id);
      if (storeCached) {
        loading.value = false;
        return storeCached;
      }
      
      // Check in-memory cache
      const cached = videoCache.get(id);
      if (cached && Date.now() - cached.ts <= CACHE_TTL_MS) {
        return cached.video;
      }

      const networkVideo = await epornerApi.getById(id, thumbSize.value);
      console.log('useEporner.getVideoById raw video:', networkVideo);
      
      if (networkVideo) {
        const transformed = transformVideo(networkVideo);
        console.log('useEporner.getVideoById transformed video:', transformed);
        
        // Cache in memory
        videoCache.set(id, { ts: Date.now(), video: transformed });
        
        // Also cache in store for persistence
        store.setCachedVideoDetails(id, transformed);
        
        return transformed;
      }

      console.warn('useEporner.getVideoById: video is null');
      return null;
    } catch (err) {
      // Suppress console errors for expected failures (CORS, rate limiting, network issues)
      const isExpectedError = err?.message?.includes('Failed to fetch') || 
                              err?.message?.includes('CORS') ||
                              err?.message?.includes('503') ||
                              err?.message?.includes('NetworkError') ||
                              err?.message?.includes('Service Unavailable') ||
                              err?.name === 'TypeError';
      
      if (!isExpectedError) {
        console.error('Error fetching video by ID:', err);
      }
      error.value = err.message || 'Failed to fetch video';
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load videos (default: latest)
   * Uses store cache for latest videos - loads once, stores, and reuses
   */
  const loadVideos = async (page = 1) => {
    // If loading latest videos, check store first
    if (sortOrder.value === 'latest' && page === 1 && !store.needsLoad('latest')) {
      const cached = store.getLatestVideos.value;
      if (cached && cached.length > 0) {
        videos.value = cached;
        currentPage.value = 1;
        totalCount.value = cached.length;
        totalPages.value = 1;
        searchQuery.value = 'all';
        return;
      }
    }
    
    // Load from API if not cached or different order/page
    await searchVideos('all', page, {
      order: sortOrder.value,
    });
    
    // Save to store if latest videos and page 1
    if (sortOrder.value === 'latest' && page === 1 && videos.value.length > 0) {
      store.setLatestVideos(videos.value);
    }
  };

  /**
   * Load more videos (next page)
   */
  const loadMore = async () => {
    if (currentPage.value < totalPages.value && !loading.value) {
      await searchVideos(searchQuery.value, currentPage.value + 1);
    }
  };

  /**
   * Get videos by category (using keywords)
   */
  const getVideosByCategory = async (category, page = 1) => {
    await searchVideos(category, page);
  };

  /**
   * Get popular videos
   * Uses store cache - loads once, stores, and reuses
   */
  const getPopularVideos = async (page = 1) => {
    // Check store first
    if (page === 1 && !store.needsLoad('popular')) {
      const cached = store.getPopularVideos.value;
      if (cached && cached.length > 0) {
        videos.value = cached;
        currentPage.value = 1;
        totalCount.value = cached.length;
        totalPages.value = 1;
        searchQuery.value = 'all';
        return;
      }
    }
    
    // Load from API if not cached or page > 1
    await searchVideos('all', page, {
      order: 'most-popular',
    });
    
    // Save to store if page 1
    if (page === 1 && videos.value.length > 0) {
      store.setPopularVideos(videos.value);
    }
  };

  /**
   * Get top weekly videos
   * Uses store cache - loads once, stores, and reuses
   */
  const getTopWeeklyVideos = async (page = 1) => {
    // Check store first
    if (page === 1 && !store.needsLoad('topWeekly')) {
      const cached = store.getTopWeeklyVideos.value;
      if (cached && cached.length > 0) {
        videos.value = cached;
        currentPage.value = 1;
        totalCount.value = cached.length;
        totalPages.value = 1;
        searchQuery.value = 'all';
        return;
      }
    }
    
    // Load from API if not cached or page > 1
    await searchVideos('all', page, {
      order: 'top-weekly',
    });
    
    // Save to store if page 1
    if (page === 1 && videos.value.length > 0) {
      store.setTopWeeklyVideos(videos.value);
    }
  };

  /**
   * Get top monthly videos
   * Uses store cache - loads once, stores, and reuses
   */
  const getTopMonthlyVideos = async (page = 1) => {
    // Check store first
    if (page === 1 && !store.needsLoad('topMonthly')) {
      const cached = store.getTopMonthlyVideos.value;
      if (cached && cached.length > 0) {
        videos.value = cached;
        currentPage.value = 1;
        totalCount.value = cached.length;
        totalPages.value = 1;
        searchQuery.value = 'all';
        return;
      }
    }
    
    // Load from API if not cached or page > 1
    await searchVideos('all', page, {
      order: 'top-monthly',
    });
    
    // Save to store if page 1
    if (page === 1 && videos.value.length > 0) {
      store.setTopMonthlyVideos(videos.value);
    }
  };

  /**
   * Get top rated videos
   * Uses store cache - loads once, stores, and reuses
   */
  const getTopRatedVideos = async (page = 1) => {
    // Check store first
    if (page === 1 && !store.needsLoad('topRated')) {
      const cached = store.getTopRatedVideos.value;
      if (cached && cached.length > 0) {
        videos.value = cached;
        currentPage.value = 1;
        totalCount.value = cached.length;
        totalPages.value = 1;
        searchQuery.value = 'all';
        return;
      }
    }
    
    // Load from API if not cached or page > 1
    await searchVideos('all', page, {
      order: 'top-rated',
    });
    
    // Save to store if page 1
    if (page === 1 && videos.value.length > 0) {
      store.setTopRatedVideos(videos.value);
    }
  };

  // Computed properties
  const hasMore = computed(() => currentPage.value < totalPages.value);
  const isEmpty = computed(() => !loading.value && videos.value.length === 0);
  const hasError = computed(() => error.value !== null);

  return {
    // State
    videos,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    searchQuery,
    sortOrder,
    thumbSize,
    includeGay,
    includeLowQuality,

    // Computed
    hasMore,
    isEmpty,
    hasError,

    // Methods
    searchVideos,
    loadVideos,
    loadMore,
    getVideoById,
    getVideosByCategory,
    getPopularVideos,
    getTopWeeklyVideos,
    getTopMonthlyVideos,
    getTopRatedVideos,

    // Setters
    setSortOrder: (order) => { sortOrder.value = order; },
    setThumbSize: (size) => { thumbSize.value = size; },
    setIncludeGay: (value) => { includeGay.value = value; },
    setIncludeLowQuality: (value) => { includeLowQuality.value = value; },
  };
}

