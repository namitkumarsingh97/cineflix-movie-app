<template>
  <div class="videos-page">
    <div class="videos-header">
      <h1 class="videos-title">
        <Video :size="32" />
        <span>Videos from S3</span>
      </h1>
      <p class="videos-subtitle">Watch videos directly from AWS S3 bucket</p>
    </div>

    <div v-if="loading" class="loading-container">
      <Loader2 :size="50" class="spinner-icon" />
      <p>Loading videos...</p>
    </div>

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

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import {
  Video,
  Play,
  X,
  Calendar,
  Loader2,
} from "lucide-vue-next";

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:5000/api" 
    : "https://cineflix-api-rho.vercel.app/api");

export default {
  name: "Videos",
  setup() {
    const videos = ref([]);
    const loading = ref(false);
    const selectedVideo = ref(null);

    async function loadVideos() {
      loading.value = true;
      try {
        const response = await axios.get(`${API_URL}/videos`);
        if (response.data.success && response.data.data) {
          videos.value = response.data.data;
        } else {
          console.error("Invalid API response:", response.data);
          videos.value = [];
        }
      } catch (error) {
        console.error("Error loading videos:", error);
        // Show error but don't crash - empty state will be shown
        videos.value = [];
      } finally {
        loading.value = false;
      }
    }

    function openVideoPlayer(video) {
      selectedVideo.value = video;
      document.body.style.overflow = "hidden";
    }

    function closeVideoPlayer() {
      selectedVideo.value = null;
      document.body.style.overflow = "";
    }

    function formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    function formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function getDefaultThumbnail() {
      return "https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Video+Thumbnail";
    }

    function handleThumbnailError(event) {
      event.target.src = getDefaultThumbnail();
    }

    onMounted(() => {
      loadVideos();
    });

    return {
      videos,
      loading,
      selectedVideo,
      openVideoPlayer,
      closeVideoPlayer,
      formatDate,
      formatDuration,
      getDefaultThumbnail,
      handleThumbnailError,
      Video,
      Play,
      X,
      Calendar,
      Loader2,
    };
  },
};
</script>

<style scoped>
.videos-page {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.videos-header {
  margin-bottom: 40px;
}

.videos-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.videos-title svg {
  color: var(--primary);
}

.videos-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.video-card {
  background: var(--dark-light);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.video-thumbnail-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.play-button-large {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all 0.3s ease;
}

.video-card:hover .play-button-large {
  transform: scale(1.1);
  background: white;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.video-info {
  padding: 20px;
}

.video-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 13px;
  color: var(--text-secondary);
}

.video-date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-date svg {
  width: 14px;
  height: 14px;
}

/* Video Player Modal */
.video-player-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.video-player-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  background: var(--dark-light);
  border-radius: 20px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.video-player-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.video-player-close:hover {
  background: var(--danger);
  transform: scale(1.1);
}

.video-player-close svg {
  width: 24px;
  height: 24px;
}

.video-player-content {
  padding: 30px;
}

.video-player-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-player-info {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .videos-page {
    padding: 20px;
  }

  .videos-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .video-player-container {
    max-width: 100%;
  }

  .video-player-content {
    padding: 20px;
  }
}
</style>

