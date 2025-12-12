import { ref, computed } from 'vue';
import { useWatchHistory, useFavorites } from './useWatchHistory';

/**
 * AI Thumbnail Generator - Personalized thumbnails based on user preferences
 * Generates custom thumbnails showing the most appealing frame for each user
 */
export function useAIThumbnails() {
  const { getHistory } = useWatchHistory();
  const { getFavorites } = useFavorites();
  
  const thumbnailPreferences = ref({
    preferredFrames: [], // Types of frames user clicks on most
    preferredContentTypes: [], // What content appears in preferred thumbnails
    colorPreferences: [], // Color schemes user prefers
    compositionPreferences: [], // Composition styles (close-up, wide, etc.)
  });

  /**
   * Analyze user click patterns to determine thumbnail preferences
   */
  function analyzeThumbnailPreferences() {
    const history = getHistory();
    const favorites = getFavorites();
    
    // Analyze which videos user clicked on vs skipped
    // This would ideally come from click tracking, but we'll use watch history as proxy
    const clickedVideos = [...history, ...favorites];
    
    // Extract common patterns from clicked videos
    const contentTypes = new Map();
    const categories = new Map();
    
    clickedVideos.forEach(video => {
      if (video.category) {
        categories.set(video.category, (categories.get(video.category) || 0) + 1);
      }
      
      // Analyze title keywords to infer content type preferences
      if (video.title) {
        const title = video.title.toLowerCase();
        if (title.includes('close') || title.includes('up')) {
          contentTypes.set('close-up', (contentTypes.get('close-up') || 0) + 1);
        }
        if (title.includes('wide') || title.includes('full')) {
          contentTypes.set('wide-shot', (contentTypes.get('wide-shot') || 0) + 1);
        }
      }
    });
    
    thumbnailPreferences.value = {
      preferredFrames: Array.from(contentTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type),
      preferredContentTypes: Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category),
      colorPreferences: [], // Would need image analysis
      compositionPreferences: [], // Would need image analysis
    };
  }

  /**
   * Generate personalized thumbnail URL for a video
   * @param {Object} video - Video object
   * @param {string} defaultThumbnail - Default thumbnail URL
   * @returns {string} Personalized thumbnail URL
   */
  function getPersonalizedThumbnail(video, defaultThumbnail) {
    if (!video) return defaultThumbnail;
    
    analyzeThumbnailPreferences();
    
    // If video has multiple thumbnails, select based on preferences
    if (video.thumbnails && Array.isArray(video.thumbnails) && video.thumbnails.length > 1) {
      // Prefer thumbnails that match user's preferred content types
      const preferred = thumbnailPreferences.value.preferredContentTypes;
      
      // Score each thumbnail based on preferences
      const scoredThumbnails = video.thumbnails.map((thumb, index) => {
        let score = 0;
        
        // Check if thumbnail category matches preferences
        if (video.category && preferred.includes(video.category)) {
          score += 10;
        }
        
        // Prefer larger thumbnails (usually better quality)
        if (thumb.size && thumb.size.includes('big')) {
          score += 5;
        }
        
        // Prefer medium thumbnails as fallback
        if (thumb.size && thumb.size.includes('medium')) {
          score += 3;
        }
        
        return { thumb, score, index };
      });
      
      // Sort by score and return best match
      scoredThumbnails.sort((a, b) => b.score - a.score);
      return scoredThumbnails[0].thumb.src || defaultThumbnail;
    }
    
    // If video has a single thumbnail or thumbnails array with one item
    if (video.thumbnail) {
      return video.thumbnail;
    }
    
    if (video.thumbnails && video.thumbnails.length === 1) {
      return video.thumbnails[0].src || defaultThumbnail;
    }
    
    return defaultThumbnail;
  }

  /**
   * Get optimized thumbnail with lazy loading and quality based on network
   * @param {Object} video - Video object
   * @param {string} defaultThumbnail - Default thumbnail URL
   * @param {string} networkQuality - Network quality ('4g', '3g', '2g', etc.)
   * @returns {Object} Thumbnail configuration
   */
  function getOptimizedThumbnail(video, defaultThumbnail, networkQuality = '4g') {
    const personalizedUrl = getPersonalizedThumbnail(video, defaultThumbnail);
    
    // Adjust thumbnail quality based on network
    let quality = 'high';
    if (networkQuality === '2g' || networkQuality === 'slow-2g') {
      quality = 'low';
    } else if (networkQuality === '3g') {
      quality = 'medium';
    }
    
    // Modify URL if possible to get different quality (depends on API)
    let optimizedUrl = personalizedUrl;
    if (personalizedUrl && quality !== 'high') {
      // Try to get lower quality version (if API supports it)
      // This is API-specific and would need to be adjusted
      if (personalizedUrl.includes('thumb')) {
        optimizedUrl = personalizedUrl.replace(/thumb[^/]*/, `thumb${quality}`);
      }
    }
    
    return {
      url: optimizedUrl,
      quality,
      personalized: personalizedUrl !== defaultThumbnail,
      loading: networkQuality === '2g' || networkQuality === 'slow-2g' ? 'lazy' : 'eager',
    };
  }

  /**
   * Pre-generate thumbnails for a list of videos
   * @param {Array} videos - Array of video objects
   * @returns {Array} Array of optimized thumbnail configs
   */
  function generateThumbnailsForVideos(videos, networkQuality = '4g') {
    analyzeThumbnailPreferences();
    
    return videos.map(video => {
      const defaultThumb = video.thumbnail || 
                          (video.thumbnails && video.thumbnails[0]?.src) ||
                          'https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Video';
      
      return {
        video,
        thumbnail: getOptimizedThumbnail(video, defaultThumb, networkQuality),
      };
    });
  }

  return {
    thumbnailPreferences: computed(() => thumbnailPreferences.value),
    getPersonalizedThumbnail,
    getOptimizedThumbnail,
    generateThumbnailsForVideos,
    analyzeThumbnailPreferences,
  };
}

