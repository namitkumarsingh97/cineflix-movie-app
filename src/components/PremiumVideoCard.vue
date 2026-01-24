<template>
  <div 
    class="premium-video-card"
    :class="{ locked: !isPremium, unlocked: isPremium }"
    @click.stop="handleClick"
  >
    <div class="video-thumbnail-wrapper">
      <OptimizedImage
        :src="video.thumbnail || getDefaultThumbnail()"
        :alt="video.title"
        image-class="video-thumbnail"
        :class="{ blurred: !isPremium }"
      />
      <div v-if="!isPremium" class="premium-overlay">
        <div class="premium-lock">
          <Lock :size="32" />
        </div>
        <div class="premium-badge-overlay">
          <Crown :size="16" />
          <span>Premium</span>
        </div>
      </div>
      <div v-if="isPremium" class="video-duration" v-show="video.duration">
        {{ formatDuration(video.duration) }}
      </div>
      <div v-if="isPremium" class="play-overlay">
        <Play :size="48" fill="currentColor" />
      </div>
    </div>
    <div class="video-info">
      <h3 class="video-title">{{ video.title }}</h3>
      <div class="video-meta">
        <span v-if="video.views" class="video-views">
          <Eye :size="14" />
          {{ formatViews(video.views) }}
        </span>
        <span v-if="video.rating" class="video-rating">
          <Star :size="14" fill="currentColor" />
          {{ video.rating.toFixed(1) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock, Crown, Play, Eye, Star } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import OptimizedImage from './OptimizedImage.vue';
import { formatDuration, formatViews } from '../utils/date';

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);
const router = useRouter();

function handleClick(event) {
  // ALWAYS prevent default and stop ALL propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  
  // Premium route removed - using Eporner API directly, no premium required
  // FORCE redirect to premium page - NO other navigation allowed in this section
  // Even if user is premium, all clicks in premium section go to premium page
  // console.log('Premium section: All clicks blocked, redirecting to /premium');
  // router.push('/premium').catch(() => {});
  return false;
}

function getDefaultThumbnail() {
  return 'https://via.placeholder.com/320x180/1a1a2e/ffffff?text=Video';
}
</script>

<style scoped>
.premium-video-card {
  background: var(--dark-lighter);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  /* Prevent all nested elements from being clickable */
  pointer-events: auto;
}

.premium-video-card * {
  pointer-events: none;
}

.premium-video-card {
  pointer-events: auto;
}

.premium-video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

.premium-video-card.locked {
  opacity: 0.8;
  user-select: none;
  -webkit-user-select: none;
}

.premium-video-card.locked:active {
  transform: scale(0.98);
}

.video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark);
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.video-thumbnail.blurred {
  filter: blur(20px);
  transform: scale(1.1);
}

.premium-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.premium-lock {
  width: 64px;
  height: 64px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 20px rgba(255, 69, 0, 0.5);
}

.premium-badge-overlay {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 69, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.premium-video-card.unlocked:hover .play-overlay {
  opacity: 1;
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.video-views,
.video-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-rating svg {
  color: #ffd700;
}
</style>

