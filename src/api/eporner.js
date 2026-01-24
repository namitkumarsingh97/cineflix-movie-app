// Eporner API v2 integration
// Documentation: https://www.eporner.com/api/v2/
const EPORNER_API_BASE = 'https://www.eporner.com/api/v2';

/**
 * Eporner API service
 * Documentation: https://www.eporner.com/api/v2/
 * 
 * All API calls must be made using HTTP GET to:
 * https://www.eporner.com/api/v2/METHOD/
 * 
 * Available methods:
 * - search: Get video list matching criteria
 * - id: Get information about one specific video
 * - removed: Return list of all removed video ids
 */
export const epornerApi = {
  /**
   * Search videos
   * Endpoint: /api/v2/video/search/
   * 
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query (default: 'all'). Special value 'all' can be used to query for all videos
   * @param {number} params.per_page - Results per page (1-1000, default: 30)
   * @param {number} params.page - Page number (1-1000000, default: 1)
   * @param {string} params.thumbsize - Thumbnail size: 'small' (190x152), 'medium' (427x240), 'big' (640x360) (default: 'medium')
   * @param {string} params.order - Sort order: 'latest', 'longest', 'shortest', 'top-rated', 'most-popular', 'top-weekly', 'top-monthly' (default: 'latest')
   * @param {number} params.gay - Include gay content: 0=no, 1=yes, 2=only (default: 0)
   * @param {number} params.lq - Include low quality: 0=no, 1=yes, 2=only (default: 1)
   * @param {string} params.format - Response format: 'json', 'xml' (default: 'json')
   * 
   * @returns {Promise<Object>} Response object with:
   *   - count: Number of videos returned on current page
   *   - start: First video number in current page
   *   - per_page: Number of videos per page
   *   - page: Current page number
   *   - time_ms: Execution time in ms
   *   - total_count: Total number of videos found
   *   - total_pages: Total number of pages
   *   - videos: Array of video objects
   */
  search: async (params = {}) => {
    const {
      query = 'all',
      per_page = 30,
      page = 1,
      thumbsize = 'big',
      order = 'latest',
      gay = 0,
      lq = 1,
      format = 'json',
    } = params;

    const queryParams = new URLSearchParams({
      query: query.toString(),
      per_page: per_page.toString(),
      page: page.toString(),
      thumbsize,
      order,
      gay: gay.toString(),
      lq: lq.toString(),
      format,
    });

    const url = `${EPORNER_API_BASE}/video/search/?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Suppress console errors for expected failures (CORS, rate limiting, network issues)
      const isExpectedError = error?.message?.includes('Failed to fetch') || 
                              error?.message?.includes('CORS') ||
                              error?.message?.includes('503') ||
                              error?.message?.includes('NetworkError') ||
                              error?.message?.includes('Service Unavailable') ||
                              error?.name === 'TypeError';
      
      if (!isExpectedError) {
        console.error('Eporner API search error:', error);
      }
      throw error;
    }
  },

  /**
   * Get video by ID
   * Endpoint: /api/v2/video/id/
   * 
   * Can be used to get information about one specific video or to check if video is still alive.
   * Returns empty array [] if video is removed.
   * 
   * @param {string} id - Video ID (required, case-sensitive, 11 chars)
   * @param {string} thumbsize - Thumbnail size: 'small' (190x152), 'medium' (427x240), 'big' (640x360) (default: 'medium')
   * @param {string} format - Response format: 'json', 'xml' (default: 'json')
   * 
   * @returns {Promise<Object|null>} Video object with:
   *   - id: Unique video ID (11 chars, case-sensitive)
   *   - title: Video title
   *   - keywords: Keywords/tags
   *   - views: Estimated number of views
   *   - rate: Video rate (0.00-5.00)
   *   - url: URL of video on Eporner
   *   - added: Added date (YYYY-MM-DD hh:mm:ss)
   *   - length_sec: Video length in seconds
   *   - length_min: Video length (mm:ss or hh:mm:ss)
   *   - embed: URL of video embed for iframe
   *   - default_thumb: Default thumbnail object
   *   - thumbs: Array of thumbnail objects
   *   Returns null if video is removed or not found
   */
  getById: async (id, thumbsize = 'big', format = 'json') => {
    if (!id) {
      throw new Error('Video ID is required');
    }

    const queryParams = new URLSearchParams({
      id: id.toString(),
      thumbsize,
      format,
    });

    const url = `${EPORNER_API_BASE}/video/id/?${queryParams.toString()}`;

    try {
      console.log('Fetching Eporner video from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Eporner API HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Eporner API raw response:', data);
      
      // According to API v2 docs:
      // - JSON response: Returns array with video object [{...}] or empty array [] for removed videos
      // - XML response: Returns <root><video>...</video></root> or <root><video/></root> for removed
      // - Sometimes API might return object directly (legacy behavior)
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // API returns array with single video object
          return data[0];
        } else {
          // Empty array means video is removed
          console.warn('Eporner API returned empty array - video may be removed');
          return null;
        }
      } else if (data && typeof data === 'object') {
        // Handle case where API returns object directly (legacy or XML parsed)
        if (data.video) {
          // XML parsed format
          return Array.isArray(data.video) ? data.video[0] : data.video;
        }
        // Direct object format
        return data;
      }
      
      return null;
    } catch (error) {
      // Suppress console errors for expected failures (CORS, rate limiting, network issues)
      const isExpectedError = error?.message?.includes('Failed to fetch') || 
                              error?.message?.includes('CORS') ||
                              error?.message?.includes('503') ||
                              error?.message?.includes('NetworkError') ||
                              error?.message?.includes('Service Unavailable') ||
                              error?.name === 'TypeError';
      
      if (!isExpectedError) {
        console.error('Eporner API getById error:', error);
      }
      throw error;
    }
  },

  /**
   * Get removed video IDs
   * Endpoint: /api/v2/video/removed/
   * 
   * Returns all removed video IDs in a single call. Can be multiple megabytes.
   * Use 'txt' format when possible as it generates about 60% smaller output.
   * 
   * @param {string} format - Response format: 'json', 'xml', 'txt' (default: 'json')
   *   - json: Array of objects with id field [{id: "..."}, ...]
   *   - xml: XML format with <video><id>...</id></video> elements
   *   - txt: Plain text with one ID per line (smallest size)
   * 
   * @returns {Promise<Array|string>} 
   *   - For json: Array of objects [{id: "..."}, ...]
   *   - For xml: XML string
   *   - For txt: Plain text string with one ID per line
   */
  getRemoved: async (format = 'json') => {
    const queryParams = new URLSearchParams({ format });
    const url = `${EPORNER_API_BASE}/video/removed/?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (format === 'txt') {
        // Return plain text for txt format
        const text = await response.text();
        return text.trim().split('\n').filter(id => id.length > 0);
      } else if (format === 'xml') {
        // Return XML string
        return await response.text();
      } else {
        // Default: JSON format
      const data = await response.json();
      return data;
      }
    } catch (error) {
      console.error('Eporner API getRemoved error:', error);
      throw error;
    }
  },
};

