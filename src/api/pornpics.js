// PornPics API integration
const PORNPICS_API_BASE = 'https://www.pornpics.com';

// CORS proxy fallback
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Check if response is JSON
 */
function isJSONResponse(response) {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
}

/**
 * Generate mock picture data for fallback
 */
function generateMockPictures(query = '', limit = 99, offset = 0) {
  const categories = query 
    ? [query.toLowerCase()] 
    : ['teen', 'milf', 'anal', 'blonde', 'brunette', 'asian', 'latina', 'amateur'];
  
  const mockPictures = [];
  for (let i = 0; i < limit; i++) {
    const category = categories[i % categories.length];
    const id = offset + i + 1;
    mockPictures.push({
      id: `mock-${id}`,
      _id: `mock-${id}`,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Picture ${id}`,
      description: `High quality ${category} content`,
      thumbnail: `https://picsum.photos/400/600?random=${id}`,
      imageUrl: `https://picsum.photos/800/1200?random=${id}`,
      views: Math.floor(Math.random() * 100000) + 1000,
      likes: Math.floor(Math.random() * 5000) + 100,
      rating: (Math.random() * 2 + 3).toFixed(1),
      tags: [category, 'adult', 'nsfw'],
      categories: [category],
      added: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      _source: 'mock',
    });
  }
  
  return {
    pictures: mockPictures,
    data: mockPictures,
    page: Math.floor(offset / limit) + 1,
    total_count: 10000,
    totalCount: 10000,
    total_pages: Math.ceil(10000 / limit),
    totalPages: Math.ceil(10000 / limit),
  };
}

/**
 * Fetch with CORS proxy fallback
 */
async function fetchWithProxy(url, useProxy = false) {
  const targetUrl = useProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
  
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Check if response is JSON
  if (!isJSONResponse(response)) {
    const text = await response.text();
    // If it starts with HTML, it's not JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error('Response is HTML, not JSON. API endpoint may not exist.');
    }
    // Try to parse as JSON anyway
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Response is not valid JSON');
    }
  }
  
  return await response.json();
}

/**
 * PornPics API service
 */
export const pornpicsApi = {
  /**
   * Get popular pictures
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 99)
   */
  getPopular: async (params = {}) => {
    const { page = 1, limit = 99 } = params;
    
    try {
      const url = `${PORNPICS_API_BASE}/popular/?page=${page}&limit=${limit}`;
      
      // Try direct fetch first
      try {
        const data = await fetchWithProxy(url, false);
        return data;
      } catch (error) {
        console.warn('Direct fetch failed, trying CORS proxy:', error.message);
        
        // Try with CORS proxy
        try {
          const data = await fetchWithProxy(url, true);
          return data;
        } catch (proxyError) {
          console.warn('CORS proxy also failed, using mock data:', proxyError.message);
          // Fallback to mock data
          const offset = (page - 1) * limit;
          return generateMockPictures('', limit, offset);
        }
      }
    } catch (error) {
      console.error('PornPics API getPopular error:', error);
      // Final fallback to mock data
      const offset = (page - 1) * limit;
      return generateMockPictures('', limit, offset);
    }
  },

  /**
   * Search pictures
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query/keyword (default: '')
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 99)
   */
  search: async (params = {}) => {
    const { query = '', page = 1, limit = 99 } = params;
    
    try {
      // Calculate offset from page number
      const offset = (page - 1) * limit;
      
      // If query is empty, use 'popular' as default keyword
      if (!query || !query.trim()) {
        const url = `${PORNPICS_API_BASE}/popular/recent/?limit=${limit}&offset=${offset}`;
        
        try {
          const data = await fetchWithProxy(url, false);
          return data;
        } catch (error) {
          console.warn('Direct fetch failed, trying CORS proxy:', error.message);
          
          try {
            const data = await fetchWithProxy(url, true);
            return data;
          } catch (proxyError) {
            console.warn('CORS proxy also failed, using mock data:', proxyError.message);
            return generateMockPictures('', limit, offset);
          }
        }
      }
      
      // Format keyword: trim, lowercase, replace spaces with hyphens
      const keyword = query.trim().toLowerCase().replace(/\s+/g, '-');
      
      // Use the format: https://www.pornpics.com/{keyword}/recent/?limit=99&offset=10
      const url = `${PORNPICS_API_BASE}/${keyword}/recent/?limit=${limit}&offset=${offset}`;
      
      // Try direct fetch first
      try {
        const data = await fetchWithProxy(url, false);
        return data;
      } catch (error) {
        console.warn('Direct fetch failed, trying CORS proxy:', error.message);
        
        // Try with CORS proxy
        try {
          const data = await fetchWithProxy(url, true);
          return data;
        } catch (proxyError) {
          console.warn('CORS proxy also failed, using mock data:', proxyError.message);
          // Fallback to mock data with the search query
          return generateMockPictures(query, limit, offset);
        }
      }
    } catch (error) {
      console.error('PornPics API search error:', error);
      // Final fallback to mock data
      const offset = (page - 1) * limit;
      return generateMockPictures(query, limit, offset);
    }
  },
};

