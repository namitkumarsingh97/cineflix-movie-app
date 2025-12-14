# Stories API Setup Guide

## Overview

This guide explains how to set up a backend API to aggregate adult stories from multiple sources (Xossipy, Literotica, Nifty, etc.) in multiple languages (Hindi, English, Spanish, French, German, Italian, Portuguese).

## Important Notes

⚠️ **No Open APIs Available**: Research shows that platforms like Xossipy, Literotica, and Nifty do **NOT** provide public APIs. You'll need to:
1. Use RSS feeds (if available)
2. Create a backend proxy service (to handle CORS)
3. Implement web scraping (with proper ToS compliance)
4. Use a content aggregation service

## Backend API Endpoints Required

### 1. Aggregated Stories Endpoint

```
GET /api/stories/aggregated
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `language` (string): Language code (en, hi, es, fr, de, it, pt) or 'all'
- `category` (string): Story category filter
- `source` (string): Source filter (xossipy, literotica, nifty)
- `search` (string): Search query

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "story-id",
      "title": "Story Title",
      "author": "Author Name",
      "content": "Full story content...",
      "excerpt": "Short excerpt...",
      "category": "Romance",
      "language": "en",
      "views": 1250,
      "likes": 45,
      "source": "xossipy",
      "link": "https://source-url.com/story",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 2. Single Story Endpoint

```
GET /api/stories/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "story-id",
    "title": "Story Title",
    "author": "Author Name",
    "content": "Full story content...",
    "category": "Romance",
    "language": "en",
    "views": 1250,
    "likes": 45,
    "source": "xossipy",
    "link": "https://source-url.com/story",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. RSS Proxy Endpoint

```
GET /api/proxy/rss?url={encoded_rss_url}
```

**Response:** Raw RSS XML (to be parsed by frontend)

## Implementation Options

### Option 1: Node.js/Express Backend

```javascript
// routes/stories.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const RSSParser = require('rss-parser');

const parser = new RSSParser();

// Aggregated stories endpoint
router.get('/aggregated', async (req, res) => {
  try {
    const { page = 1, limit = 20, language, category, source, search } = req.query;
    
    // Fetch from multiple sources
    const sources = [];
    
    if (!source || source === 'xossipy') {
      sources.push(fetchXossipyStories({ language, category, search }));
    }
    if (!source || source === 'literotica') {
      sources.push(fetchLiteroticaStories({ language, category, search }));
    }
    if (!source || source === 'nifty') {
      sources.push(fetchNiftyStories({ language, category, search }));
    }
    
    const results = await Promise.allSettled(sources);
    const allStories = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(story => {
        if (language && language !== 'all' && story.language !== language) return false;
        if (category && story.category !== category) return false;
        if (search && !story.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
    
    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = allStories.slice(start, end);
    
    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allStories.length,
        pages: Math.ceil(allStories.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch from Xossipy (example - requires proper implementation)
async function fetchXossipyStories(options) {
  try {
    // Use RSS feed if available, otherwise scrape
    const rssUrl = 'https://xossipy.org/rss'; // Check if this exists
    const feed = await parser.parseURL(rssUrl);
    
    return feed.items.map(item => ({
      _id: item.guid || item.link,
      title: item.title,
      author: item.creator || 'Unknown',
      content: item.content || item.contentSnippet,
      excerpt: item.contentSnippet,
      category: item.categories?.[0] || 'General',
      language: detectLanguage(item.title + ' ' + item.content),
      source: 'xossipy',
      link: item.link,
      createdAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      updatedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      views: 0,
      likes: 0
    }));
  } catch (error) {
    console.error('Error fetching Xossipy stories:', error);
    return [];
  }
}

// Language detection
function detectLanguage(text) {
  if (!text) return 'en';
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

module.exports = router;
```

### Option 2: Python/Flask Backend

```python
# routes/stories.py
from flask import Blueprint, request, jsonify
import requests
from bs4 import BeautifulSoup
import feedparser
import re

stories_bp = Blueprint('stories', __name__)

@stories_bp.route('/aggregated', methods=['GET'])
def get_aggregated_stories():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    language = request.args.get('language', 'all')
    category = request.args.get('category')
    source = request.args.get('source')
    search = request.args.get('search')
    
    all_stories = []
    
    if not source or source == 'xossipy':
        all_stories.extend(fetch_xossipy_stories(language, category, search))
    if not source or source == 'literotica':
        all_stories.extend(fetch_literotica_stories(language, category, search))
    if not source or source == 'nifty':
        all_stories.extend(fetch_nifty_stories(language, category, search))
    
    # Filter and paginate
    filtered = [s for s in all_stories if matches_filter(s, language, category, search)]
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]
    
    return jsonify({
        'success': True,
        'data': paginated,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': len(filtered),
            'pages': (len(filtered) + limit - 1) // limit
        }
    })

def detect_language(text):
    if not text:
        return 'en'
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
    if re.search(r'[áéíóúñüÁÉÍÓÚÑÜ]', text):
        return 'es'
    # Add more language patterns...
    return 'en'
```

## RSS Feed Sources (If Available)

Check if these platforms provide RSS feeds:
- Xossipy: `https://xossipy.org/rss` or `https://xossipy.org/feed`
- Literotica: `https://www.literotica.com/rss`
- Nifty: `https://www.nifty.org/rss`

## Web Scraping Considerations

⚠️ **Important**: Before implementing web scraping:

1. **Check Terms of Service**: Most platforms prohibit scraping
2. **Use Rate Limiting**: Don't overwhelm servers
3. **Respect robots.txt**: Check `https://domain.com/robots.txt`
4. **Use Proper Headers**: Include User-Agent, Referer
5. **Cache Results**: Don't scrape repeatedly
6. **Consider Legal Issues**: Consult with legal counsel

## Alternative: Use a Content Aggregation Service

Consider using services like:
- **Puppeteer/Playwright**: For dynamic content
- **Scrapy**: Python-based scraping framework
- **Apify**: Web scraping platform
- **Bright Data**: Data collection platform

## Caching Strategy

Implement caching to reduce API calls:
- Cache stories for 24 hours
- Use Redis or MongoDB for caching
- Invalidate cache when new stories are added

## Environment Variables

```env
# Backend .env
STORIES_CACHE_TTL=86400
XOSSIPY_RSS_URL=https://xossipy.org/rss
LITEROTICA_RSS_URL=https://www.literotica.com/rss
NIFTY_RSS_URL=https://www.nifty.org/rss
ENABLE_SCRAPING=false
SCRAPING_RATE_LIMIT=10
```

## Testing

Test the API endpoints:
```bash
# Get aggregated stories
curl "http://localhost:5000/api/stories/aggregated?page=1&limit=20&language=en"

# Get single story
curl "http://localhost:5000/api/stories/story-id-123"

# Search stories
curl "http://localhost:5000/api/stories/aggregated?search=romance&language=hi"
```

## Next Steps

1. **Set up backend server** with the required endpoints
2. **Implement RSS feed parsing** for available sources
3. **Add web scraping** (if ToS allows) with proper rate limiting
4. **Implement caching** to reduce load
5. **Add language detection** for multi-language support
6. **Test thoroughly** before deploying

## Frontend Integration

The frontend is already set up to use these endpoints. Just ensure:
1. `VITE_API_URL` is set in `.env`
2. Backend CORS is configured to allow frontend origin
3. Endpoints match the expected format

## Support

For questions or issues, refer to:
- Backend API documentation
- Frontend composable: `src/composables/useStories.js`
- Stories page: `src/pages/Stories.vue`

