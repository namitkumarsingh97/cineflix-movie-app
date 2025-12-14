/**
 * Image optimization utilities for WebP/AVIF support, responsive srcsets, and blurhash
 */

// Check browser support for modern image formats
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

const supportsAVIF = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Cache format support
let webpSupported = null;
let avifSupported = null;

const checkFormatSupport = () => {
  if (webpSupported === null) {
    webpSupported = supportsWebP();
  }
  if (avifSupported === null) {
    avifSupported = supportsAVIF();
  }
};

// Get optimal image format based on browser support
export const getOptimalFormat = () => {
  checkFormatSupport();
  if (avifSupported) return 'avif';
  if (webpSupported) return 'webp';
  return 'jpg';
};

// Generate responsive srcset for an image
export const generateSrcSet = (baseUrl, widths = [320, 640, 960, 1280, 1920], format = null) => {
  if (!baseUrl) return '';
  
  const optimalFormat = format || getOptimalFormat();
  const srcset = widths
    .map(width => {
      // Try to generate optimized URL (this depends on your CDN/image service)
      const optimizedUrl = optimizeImageUrl(baseUrl, width, optimalFormat);
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
  
  return srcset;
};

// Optimize image URL with CDN parameters
export const optimizeImageUrl = (url, width = null, format = null, quality = 85) => {
  if (!url) return '';
  
  // Skip optimization for data URLs or already optimized URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // If URL is from a CDN that supports image optimization (e.g., Cloudinary, Imgix)
  // Add optimization parameters
  try {
    const urlObj = new URL(url);
    
    // Example: Cloudinary CDN
    if (urlObj.hostname.includes('cloudinary.com') || urlObj.hostname.includes('res.cloudinary.com')) {
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.findIndex(p => p === 'upload');
      if (uploadIndex !== -1) {
        const transformations = [];
        if (width) transformations.push(`w_${width}`);
        if (format) transformations.push(`f_${format}`);
        transformations.push(`q_${quality}`);
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
        urlObj.pathname = pathParts.join('/');
        return urlObj.toString();
      }
    }
    
    // Example: Imgix CDN
    if (urlObj.hostname.includes('imgix.net') || urlObj.hostname.includes('.imgix.net')) {
      if (width) urlObj.searchParams.set('w', width);
      if (format) urlObj.searchParams.set('fm', format);
      urlObj.searchParams.set('q', quality);
      urlObj.searchParams.set('auto', 'format,compress');
      return urlObj.toString();
    }
    
    // Generic optimization (add query params)
    if (width) urlObj.searchParams.set('w', width);
    if (format) urlObj.searchParams.set('fm', format);
    urlObj.searchParams.set('q', quality);
    
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
};

// Generate picture element sources for modern formats
export const generatePictureSources = (baseUrl, widths = [320, 640, 960, 1280, 1920]) => {
  if (!baseUrl) return [];
  
  const sources = [];
  
  // AVIF source (best compression)
  if (avifSupported) {
    sources.push({
      type: 'image/avif',
      srcset: generateSrcSet(baseUrl, widths, 'avif'),
      sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px'
    });
  }
  
  // WebP source (good compression, wider support)
  if (webpSupported) {
    sources.push({
      type: 'image/webp',
      srcset: generateSrcSet(baseUrl, widths, 'webp'),
      sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px'
    });
  }
  
  // Fallback JPEG source
  sources.push({
    type: 'image/jpeg',
    srcset: generateSrcSet(baseUrl, widths, 'jpg'),
    sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px'
  });
  
  return sources;
};

// Generate blurhash placeholder (simplified - you'd use a blurhash library in production)
export const generateBlurPlaceholder = (blurhash = null, width = 20, height = 20) => {
  if (blurhash) {
    // In production, decode blurhash to data URL
    // For now, return a tiny placeholder
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
      </svg>`
    )}`;
  }
  
  // Generate a tiny blurred version of the image
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <rect width="100%" height="100%" fill-opacity="0.3" fill="#2a2a2a"/>
    </svg>`
  )}`;
};

// Get optimal image size based on viewport and DPR
export const getOptimalImageSize = (containerWidth = 320, dpr = window.devicePixelRatio || 1) => {
  const sizes = [320, 640, 960, 1280, 1920];
  const targetSize = containerWidth * dpr;
  
  // Find the smallest size that's >= target
  for (const size of sizes) {
    if (size >= targetSize) {
      return size;
    }
  }
  
  // Return largest size if target is bigger
  return sizes[sizes.length - 1];
};

// Preload critical images
export const preloadImage = (url, format = null) => {
  if (!url || typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizeImageUrl(url, null, format || getOptimalFormat());
  
  // Add fetchpriority for critical images
  link.setAttribute('fetchpriority', 'high');
  
  document.head.appendChild(link);
};

// Check if element is in viewport
const isInViewport = (element) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Lazy load image with intersection observer
export const setupLazyImage = (imgElement, src, srcset = null, placeholder = null) => {
  if (!imgElement || !src) return;
  
  // Set placeholder if provided
  if (placeholder) {
    imgElement.src = placeholder;
    imgElement.style.filter = 'blur(10px)';
    imgElement.style.transition = 'filter 0.3s';
    imgElement.style.opacity = '0.7';
  }
  
  // Check if image is already in viewport - load immediately
  const loadImage = () => {
    if (srcset) {
      imgElement.srcset = srcset;
    }
    imgElement.src = src;
    
    // Remove blur and restore opacity when loaded
    imgElement.addEventListener('load', () => {
      imgElement.style.filter = 'none';
      imgElement.style.opacity = '1';
    }, { once: true });
    
    // Fallback: remove blur even if load event doesn't fire (for cached images)
    if (imgElement.complete && imgElement.naturalHeight !== 0) {
      imgElement.style.filter = 'none';
      imgElement.style.opacity = '1';
    }
  };
  
  // If already in viewport, load immediately
  if (isInViewport(imgElement)) {
    loadImage();
    return;
  }
  
  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '100px' // Increased from 50px to 100px for better small screen support
    });
    
    observer.observe(imgElement);
    
    // Fallback timeout: if observer doesn't trigger within 1 second, load anyway
    setTimeout(() => {
      if (imgElement.src === placeholder || imgElement.src === '') {
        loadImage();
        observer.unobserve(imgElement);
      }
    }, 1000);
  } else {
    // Fallback for browsers without IntersectionObserver
    loadImage();
  }
};

