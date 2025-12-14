import { ref, computed } from 'vue';

const stories = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const selectedLanguage = ref('all'); // 'all', 'en', 'hi', 'es', 'fr', 'de', 'it', 'pt'

// Language options
const languages = [
  { code: 'all', name: 'All Languages', flag: '🌍' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
];

// Story sources configuration
const storySources = [
  {
    id: 'xossipy',
    name: 'Xossipy',
    baseUrl: 'https://xossipy.org',
    enabled: true,
    languages: ['en', 'hi'],
    // Note: This would require a backend proxy due to CORS
  },
  {
    id: 'literotica',
    name: 'Literotica',
    baseUrl: 'https://www.literotica.com',
    enabled: true,
    languages: ['en'],
    // Note: This would require a backend proxy due to CORS
  },
  {
    id: 'nifty',
    name: 'Nifty Archive',
    baseUrl: 'https://www.nifty.org',
    enabled: true,
    languages: ['en'],
    // Note: This would require a backend proxy due to CORS
  },
];

/**
 * Fetch stories from backend API (which can aggregate from multiple sources)
 */
async function fetchStories(page = 1, options = {}) {
  loading.value = true;
  error.value = null;
  
  try {
    const params = {
      page,
      limit: options.limit || 20,
      language: selectedLanguage.value !== 'all' ? selectedLanguage.value : undefined,
      category: options.category,
      source: options.source,
      search: options.search,
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    // Use backend API endpoint that aggregates stories
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stories/aggregated?${new URLSearchParams(params)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      stories.value = data.data || [];
      currentPage.value = data.pagination?.page || page;
      totalPages.value = data.pagination?.pages || 1;
      totalCount.value = data.pagination?.total || 0;
    } else {
      throw new Error(data.message || 'Failed to fetch stories');
    }
  } catch (err) {
    console.error('Error fetching stories:', err);
    error.value = err.message;
    stories.value = [];
    
    // Fallback: Return mock data for development
    if (import.meta.env.DEV) {
      stories.value = getMockStories();
      totalCount.value = stories.value.length;
      totalPages.value = 1;
    }
  } finally {
    loading.value = false;
  }
}

/**
 * Fetch a single story by ID
 */
async function fetchStoryById(id) {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stories/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch story: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch story');
    }
  } catch (err) {
    console.error('Error fetching story:', err);
    error.value = err.message;
    
    // Fallback: Return mock story for development
    if (import.meta.env.DEV) {
      return getMockStory(id);
    }
    return null;
  } finally {
    loading.value = false;
  }
}

/**
 * Parse RSS feed (if available)
 */
async function parseRSSFeed(feedUrl) {
  try {
    // Use a CORS proxy or backend endpoint
    const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/proxy/rss?url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Failed to fetch RSS feed');
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    const parsedStories = [];
    
    items.forEach(item => {
      parsedStories.push({
        id: item.querySelector('guid')?.textContent || Date.now().toString(),
        title: item.querySelector('title')?.textContent || '',
        author: item.querySelector('author')?.textContent || item.querySelector('dc:creator')?.textContent || 'Unknown',
        content: item.querySelector('description')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
        category: item.querySelector('category')?.textContent || 'General',
        language: detectLanguage(item.querySelector('title')?.textContent || ''),
        source: 'rss',
      });
    });
    
    return parsedStories;
  } catch (err) {
    console.error('Error parsing RSS feed:', err);
    return [];
  }
}

/**
 * Detect language from text
 */
function detectLanguage(text) {
  if (!text) return 'en';
  
  // Simple language detection based on character sets
  const hindiPattern = /[\u0900-\u097F]/;
  const spanishPattern = /[áéíóúñüÁÉÍÓÚÑÜ]/;
  const frenchPattern = /[àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/;
  const germanPattern = /[äöüßÄÖÜ]/;
  const italianPattern = /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/;
  const portuguesePattern = /[ãõáéíóúâêôçÃÕÁÉÍÓÚÂÊÔÇ]/;
  
  if (hindiPattern.test(text)) return 'hi';
  if (spanishPattern.test(text)) return 'es';
  if (frenchPattern.test(text)) return 'fr';
  if (germanPattern.test(text)) return 'de';
  if (italianPattern.test(text)) return 'it';
  if (portuguesePattern.test(text)) return 'pt';
  
  return 'en';
}

/**
 * Mock stories for development (when API is not available)
 */
function getMockStories() {
  return [
    {
      _id: '1',
      title: 'Sample Story Title in English',
      author: 'Author Name',
      content: 'This is a sample story content...',
      category: 'Romance',
      language: 'en',
      views: 1250,
      likes: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'mock',
    },
    {
      _id: '2',
      title: 'हिंदी में कहानी का शीर्षक',
      author: 'लेखक का नाम',
      content: 'यह एक नमूना कहानी सामग्री है...',
      category: 'रोमांस',
      language: 'hi',
      views: 890,
      likes: 32,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'mock',
    },
  ];
}

function getMockStory(id) {
  return {
    _id: id,
    title: 'Sample Story Title',
    author: 'Author Name',
    content: 'This is a full story content that would be displayed when the user clicks on a story...',
    category: 'Romance',
    language: 'en',
    views: 1250,
    likes: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'mock',
  };
}

/**
 * Search stories
 */
async function searchStories(query, page = 1) {
  return fetchStories(page, { search: query });
}

/**
 * Filter by category
 */
async function filterByCategory(category, page = 1) {
  return fetchStories(page, { category });
}

/**
 * Filter by language
 */
async function filterByLanguage(language, page = 1) {
  selectedLanguage.value = language;
  return fetchStories(page);
}

/**
 * Get story categories
 */
const categories = computed(() => {
  const cats = new Set();
  stories.value.forEach(story => {
    if (story.category) {
      cats.add(story.category);
    }
  });
  return Array.from(cats).sort();
});

export function useStories() {
  return {
    // State
    stories,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    selectedLanguage,
    languages,
    categories,
    storySources,
    
    // Methods
    fetchStories,
    fetchStoryById,
    searchStories,
    filterByCategory,
    filterByLanguage,
    parseRSSFeed,
    detectLanguage,
  };
}

