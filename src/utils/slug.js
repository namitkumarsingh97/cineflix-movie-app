/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slug
 */
export function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    // Limit length to 100 characters
    .substring(0, 100);
}

/**
 * Generate a watch URL with slug and optional ID
 * @param {object} video - Video object with id and title
 * @param {object} options - Options object
 * @param {string} options.source - Source type (eporner, etc.)
 * @returns {string} - The watch URL
 */
export function generateWatchUrl(video, options = {}) {
  if (!video) return '/';
  
  const id = video.id || video._id;
  const title = video.title || '';
  const slug = generateSlug(title);
  
  // If no slug can be generated, fall back to ID
  if (!slug) {
    const queryParams = new URLSearchParams();
    if (options.source) queryParams.set('source', options.source);
    return `/watch/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  }
  
  // Use slug in path, ID in query for lookup
  const queryParams = new URLSearchParams();
  if (id) queryParams.set('id', id);
  if (options.source) queryParams.set('source', options.source);
  
  return `/watch/${slug}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
}

