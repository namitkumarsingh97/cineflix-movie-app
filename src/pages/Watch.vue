<template>
  <div class="watch-page">
    <div class="watch-container">
      <!-- Main Video Player Section -->
      <div class="watch-main">
        <!-- Video Player -->
        <div class="video-player-section">
          <div class="video-player-wrapper">
            <!-- Iframe for movies -->
            <div v-if="video && video.iframe" class="watch-iframe-container">
              <div v-html="video.iframe" class="watch-iframe-player"></div>
            </div>
            <!-- Video tag for S3 videos -->
            <video
              v-else-if="video && video.url"
              :src="video.url"
              controls
              autoplay
              class="watch-video-player"
              @loadedmetadata="handleVideoLoaded"
            >
              Your browser does not support the video tag.
            </video>
            <Loader v-else message="Loading video..." />
          </div>

          <!-- Video Info -->
          <div class="video-info-section" v-if="video">
            <h1 class="video-title-main">{{ video.title }}</h1>
            
            <div class="video-actions-bar">
              <div class="video-stats">
                <span class="view-count-main" v-if="!isMovie">{{ formatViews(video.views || 0) }} views</span>
                <span class="upload-date-main">{{ formatTimeAgo(video.uploadedAt || video.createdAt) }}</span>
              </div>
              <div class="action-buttons">
                <button class="action-btn like-btn">
                  <ThumbsUp :size="20" />
                  <span>{{ formatViews(video.likes || 0) }}</span>
                </button>
                <button class="action-btn">
                  <ThumbsDown :size="20" />
                </button>
                <button class="action-btn">
                  <Share2 :size="20" />
                  <span>Share</span>
                </button>
                <button class="action-btn">
                  <Download :size="20" />
                  <span>Download</span>
                </button>
                <button class="action-btn">
                  <MoreVertical :size="20" />
                </button>
              </div>
            </div>

            <div class="channel-info">
              <div class="channel-header">
                <div class="channel-avatar-large">
                  {{ getInitials(video.channel || 'MovieHub') }}
                </div>
                <div class="channel-details">
                  <h3 class="channel-name-main">{{ video.channel || 'MovieHub' }}</h3>
                  <p class="subscriber-count" v-if="!isMovie">{{ formatViews(video.subscribers || 0) }} subscribers</p>
                </div>
                <button class="subscribe-btn" v-if="!isMovie">Subscribe</button>
              </div>
              <div class="video-description" v-if="video.description">
                <p>{{ video.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar with Recommendations -->
      <div class="watch-sidebar">
        <div class="recommendations-header">
          <h3>Up next</h3>
        </div>
        <div class="recommendations-list">
          <template v-if="!isMovie">
            <VideoCard
              v-for="recVideo in recommendations"
              :key="recVideo.id"
              :video="recVideo"
              @click="navigateToVideo(recVideo)"
            />
          </template>
          <template v-else>
            <MovieCard
              v-for="recMovie in recommendations"
              :key="recMovie._id"
              :movie="recMovie"
              @click="navigateToVideo(recMovie)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videosApi } from '../api/videos';
import { moviesApi } from '../api/movies';
import { useVideos } from '../composables/useVideos';
import { useMovies } from '../composables/useMovies';
import VideoCard from '../components/VideoCard.vue';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreVertical,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const video = ref(null);
const loading = ref(true);
const { videos, loadVideos } = useVideos();
const { movies, loadMovies } = useMovies();

const videoId = computed(() => route.params.id);
const isMovie = ref(false);

const recommendations = computed(() => {
  if (isMovie.value) {
    // Show other movies as recommendations
    return movies.value.filter(m => m._id !== videoId.value).slice(0, 10);
  } else {
    // Show other videos as recommendations
    return videos.value.filter(v => v.id !== videoId.value).slice(0, 10);
  }
});

// Watch for route changes
watch(() => route.params.id, () => {
  loadVideo();
});

async function loadVideo() {
  if (!videoId.value) return;
  
  loading.value = true;
  try {
    // Try to load as video first
    try {
      const videoResponse = await videosApi.getById(videoId.value);
      if (videoResponse.data.success) {
        video.value = videoResponse.data.data;
        isMovie.value = false;
        loading.value = false;
        return;
      }
    } catch (videoError) {
      // If not found as video, try as movie
    }
    
    // Try to load as movie
    try {
      const movieResponse = await moviesApi.getById(videoId.value);
      if (movieResponse.data.success || movieResponse.data) {
        video.value = movieResponse.data.data || movieResponse.data;
        isMovie.value = true;
      }
    } catch (movieError) {
      console.error('Error loading video/movie:', movieError);
    }
  } catch (error) {
    console.error('Error loading video:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToVideo(video) {
  router.push(`/watch/${video.id || video._id}`);
}

function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
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

function handleVideoLoaded() {
  // Video metadata loaded
}

function processIframe() {
  // Process iframe after it's inserted via v-html
  if (video.value && video.value.iframe) {
    nextTick(() => {
      const iframe = document.querySelector('.watch-iframe-player iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.maxWidth = '100%';
        iframe.style.maxHeight = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
      }
    });
  }
}

// Watch for video changes to process iframe
watch(() => video.value, () => {
  processIframe();
}, { deep: true });

onMounted(async () => {
  await Promise.all([loadVideos(), loadMovies()]);
  await loadVideo();
  processIframe();
});
</script>

<style scoped>
.watch-page {
  background: var(--dark);
  min-height: 100vh;
  padding: 24px 24px 24px 0;
  margin-top: -64px; /* Offset navbar height */
  padding-top: 88px; /* Navbar height + padding */
}

.watch-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
}

.watch-main {
  flex: 1;
  min-width: 0;
}

.video-player-section {
  width: 100%;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  max-height: calc(100vh - 200px);
  min-height: 400px;
}

.watch-video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  object-fit: contain;
}

.watch-iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch-iframe-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.watch-iframe-player iframe {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border: none !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  object-fit: contain;
  box-sizing: border-box;
}

.video-info-section {
  padding: 0 8px;
}

.video-title-main {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.video-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.video-stats {
  display: flex;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark-lighter);
  border: none;
  border-radius: 18px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--dark-lighter);
  opacity: 0.8;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.channel-info {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.channel-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.channel-details {
  flex: 1;
  min-width: 0;
}

.channel-name-main {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.subscriber-count {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.subscribe-btn {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscribe-btn:hover {
  background: var(--primary-dark);
}

.video-description {
  padding: 12px;
  background: var(--dark-lighter);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.watch-sidebar {
  width: 402px;
  flex-shrink: 0;
}

.recommendations-header {
  margin-bottom: 16px;
}

.recommendations-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 1024px) {
  .watch-container {
    flex-direction: column;
  }
  
  .watch-sidebar {
    width: 100%;
  }
  
  .recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .watch-page {
    padding: 16px;
    margin-top: 0;
    padding-top: 80px;
  }
  
  .video-title-main {
    font-size: 18px;
  }
  
  .video-actions-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>

