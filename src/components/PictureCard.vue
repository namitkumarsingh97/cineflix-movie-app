<template>
  <div 
    class="picture-card" 
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    ref="cardRef"
  >
    <div class="picture-image-wrapper">
      <OptimizedImage
        :src="picture.thumbnail || picture.imageUrl || getDefaultImage()"
        :alt="picture.title"
        :loading="shouldPreloadThumbnails ? 'eager' : 'lazy'"
        :fetchpriority="shouldPreloadThumbnails ? 'high' : 'auto'"
        :sizes="'(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'"
        image-class="picture-image"
        @error="handleImageError"
      />
      <div class="picture-rating-badge" v-if="picture.rating && picture.rating > 0">
        <Star :size="12" fill="currentColor" />
        {{ picture.rating.toFixed(1) }}
      </div>
      <div class="picture-overlay">
        <div class="picture-stats">
          <span v-if="picture.views" class="stat-item">
            <Eye :size="14" />
            {{ formatViews(picture.views) }}
          </span>
          <span v-if="picture.likes" class="stat-item">
            <Heart :size="14" />
            {{ formatViews(picture.likes) }}
          </span>
        </div>
      </div>
    </div>
    <div class="picture-info-section">
      <div class="picture-details">
        <h3 class="picture-title-text" :title="picture.title">
          {{ picture.title }}
        </h3>
        <div class="picture-meta-info">
          <span class="upload-time" v-if="picture.added">{{ formatTimeAgo(picture.added) }}</span>
        </div>
        <!-- Tags -->
        <div class="picture-tags" v-if="picture.tags && picture.tags.length > 0">
          <span
            v-for="(tag, index) in picture.tags.slice(0, 3)"
            :key="index"
            class="tag-badge"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Star, Eye, Heart } from 'lucide-vue-next';
import { useNetworkQuality } from '../composables/useNetworkQuality';
import OptimizedImage from './OptimizedImage.vue';

const { shouldPreloadThumbnails } = useNetworkQuality();

const props = defineProps({
  picture: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click']);

const cardRef = ref(null);

function handleClick() {
  emit('click', props.picture);
}

function handleMouseEnter() {
  // Could add hover preview here if needed
}

function handleMouseLeave() {
  // Could hide hover preview here if needed
}

function getDefaultImage() {
  return 'https://via.placeholder.com/400x600/1a1a2e/ffffff?text=Image';
}

function handleImageError(event) {
  event.target.src = getDefaultImage();
}

function formatTimeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  let uploadDate;
  
  try {
    uploadDate = new Date(date);
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
</script>

<style scoped>
.picture-card {
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s ease;
}

.picture-card:hover {
  transform: translateY(-4px);
}

.picture-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 150%; /* 2:3 aspect ratio for vertical images */
  background: var(--dark-lighter);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  height: 0;
}

.picture-image-wrapper :deep(.optimized-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.picture-image-wrapper :deep(.optimized-image picture),
.picture-image-wrapper :deep(.optimized-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.picture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-rating-badge {
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
  z-index: 2;
}

.picture-rating-badge svg {
  width: 10px;
  height: 10px;
}

.picture-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.picture-card:hover .picture-overlay {
  opacity: 1;
}

.picture-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 11px;
  font-weight: 500;
}

.stat-item svg {
  width: 12px;
  height: 12px;
}

.picture-info-section {
  display: flex;
  gap: 8px;
  min-height: 0;
}

.picture-details {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.picture-title-text {
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

.picture-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 6px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-bottom: 4px;
}

.upload-time {
  display: inline-block;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
  max-height: 1.5em;
  overflow: hidden;
}

.tag-badge {
  padding: 2px 5px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.3;
}

@media (max-width: 768px) {
  .picture-image-wrapper {
    border-radius: 6px;
    margin-bottom: 6px;
    padding-top: 140%;
  }

  .picture-title-text {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .picture-meta-info {
    font-size: 10px;
    gap: 2px 4px;
  }

  .picture-info-section {
    gap: 6px;
  }

  .picture-rating-badge {
    top: 4px;
    right: 4px;
    padding: 2px 5px;
    font-size: 9px;
  }

  .picture-rating-badge svg {
    width: 9px;
    height: 9px;
  }

  .tag-badge {
    padding: 1px 4px;
    font-size: 9px;
  }

  .picture-tags {
    gap: 2px;
    margin-top: 3px;
  }
}
</style>

