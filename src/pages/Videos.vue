<template>
  <div class="videos-page">
    <div class="videos-header">
      <h1 class="videos-title">
        <Video :size="32" />
        <span>Videos from S3</span>
      </h1>
      <p class="videos-subtitle">Watch videos directly from AWS S3 bucket</p>
    </div>

    <Loader v-if="loading" message="Loading videos..." />

    <div v-else-if="videos.length > 0" class="videos-grid">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-card"
        @click="openVideoPlayer(video)"
      >
        <div class="video-thumbnail-container">
          <img
            :src="video.thumbnail || getDefaultThumbnail()"
            :alt="video.title"
            class="video-thumbnail"
            @error="handleThumbnailError"
          />
          <div class="video-overlay">
            <div class="play-button-large">
              <Play :size="48" fill="currentColor" />
            </div>
            <div class="video-duration" v-if="video.duration">
              {{ formatDuration(video.duration) }}
            </div>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description" v-if="video.description">
            {{ video.description }}
          </p>
          <div class="video-meta">
            <span class="video-date">
              <Calendar :size="14" />
              <span>{{ formatDate(video.uploadedAt) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Video :size="80" class="empty-icon" />
      <h3>No videos available</h3>
      <p>Videos will appear here once uploaded to S3 bucket</p>
    </div>

    <!-- Video Player Modal -->
    <div
      v-if="selectedVideo"
      class="video-player-modal"
      @click.self="closeVideoPlayer"
    >
      <div class="video-player-container">
        <button class="video-player-close" @click="closeVideoPlayer">
          <X :size="24" />
        </button>
        <div class="video-player-content">
          <h2 class="video-player-title">{{ selectedVideo.title }}</h2>
          <div class="video-player-wrapper">
            <video
              :src="selectedVideo.url"
              controls
              autoplay
              class="video-player"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div class="video-player-info" v-if="selectedVideo.description">
            <p>{{ selectedVideo.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useVideos } from '../composables/useVideos';
import { formatDate, formatDuration } from '../utils/date';
import Loader from '../components/Loader.vue';
import { Video, Play, X, Calendar } from 'lucide-vue-next';

const { videos, loading, loadVideos } = useVideos();
const selectedVideo = ref(null);

function openVideoPlayer(video) {
  selectedVideo.value = video;
  document.body.style.overflow = 'hidden';
}

function closeVideoPlayer() {
  selectedVideo.value = null;
  document.body.style.overflow = '';
}

function getDefaultThumbnail() {
  return 'https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Video+Thumbnail';
}

function handleThumbnailError(event) {
  event.target.src = getDefaultThumbnail();
}

onMounted(() => {
  loadVideos();
});
</script>

<style scoped>
/* Styles are in global style.css - keeping existing styles from Videos.vue */
</style>

