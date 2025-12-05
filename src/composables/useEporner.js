import { ref, computed } from 'vue';
import { epornerApi } from '../api/eporner';

/**
 * Composable for Eporner API integration
 */
export function useEporner() {
  const videos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const perPage = ref(30);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const searchQuery = ref('');
  const sortOrder = ref('most-popular'); // Default to Most Popular
  const thumbSize = ref('big');
  const includeGay = ref(0);
  const includeLowQuality = ref(1);

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
      url: epornerVideo.url,
      embedUrl: epornerVideo.embed,
      added: epornerVideo.added,
      categories,
      keywords: keywords,
      // Additional metadata
      _source: 'eporner',
      _raw: epornerVideo,
    };
  };

  /**
   * Search videos
   */
  const searchVideos = async (query = 'all', page = 1, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        query: query || 'all',
        page: page || 1,
        per_page: options.perPage || perPage.value,
        thumbsize: options.thumbsize || thumbSize.value,
        order: options.order || sortOrder.value,
        gay: options.gay !== undefined ? options.gay : includeGay.value,
        lq: options.lq !== undefined ? options.lq : includeLowQuality.value,
        format: 'json',
      };

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
      } else {
        videos.value = [];
        totalPages.value = 1;
        totalCount.value = 0;
      }
    } catch (err) {
      console.error('Error searching Eporner videos:', err);
      error.value = err.message || 'Failed to fetch videos';
      videos.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get video by ID
   */
  const getVideoById = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('useEporner.getVideoById called with ID:', id);
      const video = await epornerApi.getById(id, thumbSize.value);
      console.log('useEporner.getVideoById raw video:', video);
      
      if (video) {
        const transformed = transformVideo(video);
        console.log('useEporner.getVideoById transformed video:', transformed);
        return transformed;
      } else {
        console.warn('useEporner.getVideoById: video is null');
        return null;
      }
    } catch (err) {
      console.error('Error fetching video by ID:', err);
      error.value = err.message || 'Failed to fetch video';
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load videos (default: latest)
   */
  const loadVideos = async (page = 1) => {
    await searchVideos('all', page, {
      order: sortOrder.value,
    });
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
   */
  const getPopularVideos = async (page = 1) => {
    await searchVideos('all', page, {
      order: 'most-popular',
    });
  };

  /**
   * Get top weekly videos
   */
  const getTopWeeklyVideos = async (page = 1) => {
    await searchVideos('all', page, {
      order: 'top-weekly',
    });
  };

  /**
   * Get top monthly videos
   */
  const getTopMonthlyVideos = async (page = 1) => {
    await searchVideos('all', page, {
      order: 'top-monthly',
    });
  };

  /**
   * Get top rated videos
   */
  const getTopRatedVideos = async (page = 1) => {
    await searchVideos('all', page, {
      order: 'top-rated',
    });
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

