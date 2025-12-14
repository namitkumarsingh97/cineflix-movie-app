<template>
  <router-link 
    :to="watchUrl" 
    class="youtube-video-card"
    @click="handleClick"
  >
    <div class="video-thumbnail-wrapper">
      <OptimizedImage
        :src="personalizedThumbnail"
        :alt="video.title"
        :loading="shouldPreloadThumbnails ? 'eager' : 'lazy'"
        :fetchpriority="shouldPreloadThumbnails ? 'high' : 'auto'"
        :blurhash="video.blurhash"
        :sizes="'(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'"
        image-class="video-thumbnail-img"
        @error="handleThumbnailError"
      />
      <div class="video-duration-badge" v-if="video.duration || video.durationFormatted">
        {{ video.durationFormatted || formatDuration(video.duration) }}
      </div>
      <div class="video-rating-badge" v-if="video.rating && video.rating > 0">
        <Star :size="12" fill="currentColor" />
        {{ video.rating.toFixed(1) }}
      </div>
    </div>
    <div class="video-info-section">
      <div class="video-details">
        <h3 class="video-title-text" :title="video.title">
          {{ video.title }}
        </h3>
        <div class="video-meta-info">
          <span class="view-count" v-if="video.views">{{ formatViews(video.views) }} views</span>
          <span class="upload-time" v-if="video.added || video.uploadedAt">{{ formatTimeAgo(video.added || video.uploadedAt) }}</span>
        </div>
        <!-- Categories/Tags -->
        <div class="video-categories" v-if="video.categories && video.categories.length > 0">
          <span
            v-for="(cat, index) in video.categories.slice(0, 3)"
            :key="index"
            class="category-badge"
          >
            {{ cat }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { formatDuration } from '../utils/date';
import { Star } from 'lucide-vue-next';
import { useNetworkQuality } from '../composables/useNetworkQuality';
import { useAIThumbnails } from '../composables/useAIThumbnails';
import OptimizedImage from './OptimizedImage.vue';

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  showChannel: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const { shouldPreloadThumbnails } = useNetworkQuality();
const { getOptimizedThumbnail } = useAIThumbnails();

// Generate watch URL for router-link
const watchUrl = computed(() => {
  if (!props.video) return '/';
  // Check if it's an Eporner video (has id but no _id)
  if (props.video.id && !props.video._id) {
    return `/watch/${props.video.id}?source=eporner`;
  }
  // Regular video from backend
  if (props.video._id) {
    return `/watch/${props.video._id}`;
  }
  // Fallback to id
  if (props.video.id) {
    return `/watch/${props.video.id}`;
  }
  return '/';
});

function getDefaultThumbnail() {
  return 'https://via.placeholder.com/320x180/1a1a2e/ffffff?text=Video';
}

// Get network quality for thumbnail optimization
const networkQuality = computed(() => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection?.effectiveType || '4g';
});

// Get personalized thumbnail
const personalizedThumbnail = computed(() => {
  if (!props.video) {
    return getDefaultThumbnail();
  }
  
  try {
    const defaultThumb = props.video.thumbnail || getDefaultThumbnail();
    
    // On small screens or slow networks, use default thumbnail directly to avoid optimization delays
    if (window.innerWidth < 768 || networkQuality.value === '2g' || networkQuality.value === 'slow-2g') {
      return defaultThumb;
    }
    
    const optimized = getOptimizedThumbnail(props.video, defaultThumb, networkQuality.value);
    const thumbnailUrl = optimized?.url || defaultThumb;
    
    // Ensure we always return a valid URL
    if (!thumbnailUrl || thumbnailUrl === 'undefined' || thumbnailUrl === 'null') {
      return defaultThumb;
    }
    
    return thumbnailUrl;
  } catch (error) {
    console.error('Error getting personalized thumbnail:', error);
    return props.video.thumbnail || getDefaultThumbnail();
  }
});

function handleClick(event) {
  // Allow right-click, middle-click, and modifier keys to work normally (open in new tab)
  // event.button: 0=left, 1=middle, 2=right
  if (event.button === 2 || event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey) {
    return; // Let the browser/router-link handle it naturally
  }
  // For regular left-click, emit the event
  // The router-link will handle navigation automatically
  emit('click', props.video);
}

function handleThumbnailError(event) {
  event.target.src = getDefaultThumbnail();
}

function formatTimeAgo(date) {
  if (!date) return '';
  
  // Handle Eporner date format: "2019-11-21 11:42:47"
  const now = new Date();
  let uploadDate;
  
  try {
    uploadDate = new Date(date);
    // Check if date is valid
    if (isNaN(uploadDate.getTime())) {
      return '';
    }
  } catch (e) {
    return '';
  }
  
  const diffInSeconds = Math.floor((now - uploadDate) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
</script>

<style scoped>
.youtube-video-card {
  cursor: pointer;
  width: 100%;
  display: block;
  text-decoration: none;
  color: inherit;
}

.video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  height: 0;
}

.video-thumbnail-wrapper :deep(.optimized-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-thumbnail-wrapper :deep(.optimized-image picture),
.video-thumbnail-wrapper :deep(.optimized-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.3;
}

.video-info-section {
  display: flex;
  gap: 8px;
  min-height: 0;
}

.video-details {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.video-title-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 3px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.6em;
}

.video-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 6px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.view-count,
.upload-time {
  display: inline-block;
}

.view-count::after {
  content: '•';
  margin-left: 4px;
}

.upload-time::after {
  display: none;
}

.video-rating-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffd700;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  line-height: 1.3;
}

.video-rating-badge svg {
  width: 10px;
  height: 10px;
}

.video-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
  max-height: 1.5em;
  overflow: hidden;
}

.category-badge {
  padding: 2px 5px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.3;
}

@media (max-width: 768px) {
  .video-thumbnail-wrapper {
    border-radius: 6px;
    margin-bottom: 6px;
  }

  .video-title-text {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .video-meta-info {
    font-size: 10px;
    gap: 2px 4px;
  }

  .video-info-section {
    gap: 6px;
  }

  .video-duration-badge {
    bottom: 4px;
    right: 4px;
    padding: 1px 4px;
    font-size: 9px;
  }

  .video-rating-badge {
    top: 4px;
    right: 4px;
    padding: 2px 5px;
    font-size: 9px;
  }

  .video-rating-badge svg {
    width: 9px;
    height: 9px;
  }

  .category-badge {
    padding: 1px 4px;
    font-size: 9px;
  }

  .video-categories {
    gap: 2px;
    margin-top: 3px;
  }
}
</style>

