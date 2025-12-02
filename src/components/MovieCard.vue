<template>
  <div class="youtube-video-card" @click="handleClick">
    <div class="video-thumbnail-wrapper">
      <img
        :src="getThumbnail(movie)"
        :alt="movie.title"
        class="video-thumbnail-img"
        @error="handleThumbnailError"
      />
    </div>
    <div class="video-info-section">
      <div class="video-channel-avatar" v-if="showChannel">
        <div class="avatar-circle">
          {{ getInitials('MovieHub') }}
        </div>
      </div>
      <div class="video-details">
        <h3 class="video-title-text" :title="movie.title">
          {{ movie.title }}
        </h3>
        <div class="video-meta-info">
          <span class="channel-name" v-if="showChannel">MovieHub</span>
          <span class="upload-time">{{ formatTimeAgo(movie.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getThumbnail } from '../utils/video';

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
  showChannel: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['click']);

function handleClick() {
  emit('click', props.movie);
}

function handleThumbnailError(event) {
  event.target.style.display = 'none';
  event.target.parentElement.style.background = 'var(--gradient-hero)';
}

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const uploadDate = new Date(date);
  const diffInSeconds = Math.floor((now - uploadDate) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
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
}

.video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.video-thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info-section {
  display: flex;
  gap: 12px;
}

.video-channel-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-title-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.channel-name,
.upload-time {
  display: inline-block;
}

.channel-name::after {
  content: '•';
  margin-left: 4px;
}

.upload-time::after {
  display: none;
}

@media (max-width: 768px) {
  .video-title-text {
    font-size: 13px;
  }
  
  .video-meta-info {
    font-size: 12px;
  }
}
</style>

