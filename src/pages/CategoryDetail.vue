<template>
  <div class="category-detail-page">
    <div class="category-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>Back to Categories</span>
      </button>
      <div class="category-title-section">
        <div class="category-icon-large">
          <FolderOpen :size="48" />
        </div>
        <div>
          <h1 class="category-title">{{ categoryName || 'Uncategorized' }}</h1>
          <p class="category-meta">
            {{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }} in this category
            <span v-if="movies.length > 0 && videos.length > 0">
              ({{ movies.length }} {{ movies.length === 1 ? 'movie' : 'movies' }}, 
              {{ videos.length }} {{ videos.length === 1 ? 'video' : 'videos' }})
            </span>
            <span v-else-if="movies.length > 0">
              ({{ movies.length }} {{ movies.length === 1 ? 'movie' : 'movies' }})
            </span>
            <span v-else-if="videos.length > 0">
              ({{ videos.length }} {{ videos.length === 1 ? 'video' : 'videos' }})
            </span>
          </p>
        </div>
      </div>
    </div>

    <Loader v-if="loading" message="Loading content..." />

    <div v-else-if="totalItems > 0" class="content-grid">
      <!-- Movies -->
      <MovieCard
        v-for="movie in movies"
        :key="movie._id"
        :movie="movie"
        @click="navigateToMovie(movie._id)"
      />
      <!-- Videos -->
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @click="navigateToVideo(video)"
      />
    </div>

    <div v-else class="empty-state">
      <Film :size="64" />
      <h3>No content found</h3>
      <p>There is no content in this category yet.</p>
      <button class="btn-primary" @click="goBack">Back to Categories</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, FolderOpen, Film } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import { useEporner } from '../composables/useEporner';
import MovieCard from '../components/MovieCard.vue';
import VideoCard from '../components/VideoCard.vue';
import Loader from '../components/Loader.vue';

const route = useRoute();
const router = useRouter();
const { videos: epornerVideos, searchVideos } = useEporner();

const movies = ref([]);
const videos = ref([]);
const loading = ref(true);

const categoryName = computed(() => {
  return decodeURIComponent(route.params.category || 'Uncategorized');
});

const totalItems = computed(() => {
  return movies.value.length + videos.value.length;
});

onMounted(async () => {
  await Promise.all([loadMovies(), loadVideos()]);
});

async function loadMovies() {
  try {
    const response = await apiClient.get('/movies', {
      params: {
        category: categoryName.value === 'Uncategorized' ? '' : categoryName.value,
      },
    });
    
    if (response.data.success) {
      // Filter movies by category
      const allMovies = response.data.data || [];
      if (categoryName.value === 'Uncategorized') {
        movies.value = allMovies.filter(m => !m.category || m.category.trim() === '');
      } else {
        movies.value = allMovies.filter(m => m.category === categoryName.value);
      }
    }
  } catch (error) {
    console.error('Failed to load movies:', error);
  }
}

async function loadVideos() {
  try {
    // Search for videos with this category name
    // The search API will return videos matching the category name
    const allVideos = [];
    const seenIds = new Set();
    
    // Fetch first 5 pages (150 videos max)
    for (let page = 1; page <= 5; page++) {
      await searchVideos(categoryName.value, page, { perPage: 30, order: 'most-popular' });
      
      // Filter videos that have this category as their FIRST category only
      // This ensures videos don't appear in multiple categories
      epornerVideos.value.forEach(video => {
        if (!seenIds.has(video.id)) {
          if (video.categories && Array.isArray(video.categories) && video.categories.length > 0) {
            // Sort categories alphabetically and check if this is the first category
            const sortedCategories = video.categories
              .map(cat => cat && cat.trim() ? cat.trim() : null)
              .filter(cat => cat !== null)
              .sort();
            
            if (sortedCategories.length > 0) {
              const firstCategory = sortedCategories[0];
              // Only include video if this category is its first category
              if (firstCategory.toLowerCase() === categoryName.value.toLowerCase()) {
                seenIds.add(video.id);
                allVideos.push(video);
              }
            }
          }
        }
      });
      
      // Stop if we got less than per_page (last page)
      if (epornerVideos.value.length < 30) break;
    }
    
    videos.value = allVideos;
  } catch (error) {
    console.error('Failed to load videos:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToMovie(movieId) {
  router.push(`/watch/${movieId}`);
}

function navigateToVideo(video) {
  router.push(`/watch/${video.id}?source=eporner`);
}

function goBack() {
  router.push('/categories');
}
</script>

<style scoped>
.category-detail-page {
  min-height: calc(100vh - 200px);
  padding: 60px;
  max-width: 1600px;
  margin: 0 auto;
}

.category-header {
  margin-bottom: 60px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 0, 110, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  color: var(--text-primary);
}

.back-btn:active {
  transform: scale(0.98);
}

.back-btn svg {
  flex-shrink: 0;
}

.category-title-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.category-icon-large {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 0, 110, 0.4);
}

.category-icon-large svg {
  width: 48px;
  height: 48px;
}

.category-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.2;
  word-break: break-word;
}

.category-meta {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Small tablets - 2 columns */
@media (min-width: 640px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Tablet - 2 columns */
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

/* Large screens - 2-3 columns (fewer columns = bigger cards) */
@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

@media (min-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
}

/* Larger card styling for MovieCard components */
.category-detail-page :deep(.youtube-video-card) {
  padding: 8px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.category-detail-page :deep(.youtube-video-card):hover {
  transform: translateY(-8px);
}

.category-detail-page :deep(.youtube-video-card):active {
  transform: translateY(-4px);
}

.category-detail-page :deep(.video-thumbnail-wrapper) {
  border-radius: 20px;
  margin-bottom: 20px;
}

.category-detail-page :deep(.video-title-text) {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
}

.category-detail-page :deep(.video-meta-info) {
  font-size: 17px;
  gap: 6px 12px;
}

.category-detail-page :deep(.avatar-circle) {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.category-detail-page :deep(.video-info-section) {
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-secondary);
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.btn-primary {
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Responsive adjustments for padding and header */
@media (min-width: 1200px) {
  .category-detail-page {
    padding: 60px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .category-detail-page {
    padding: 40px 30px;
  }

  .category-header {
    margin-bottom: 40px;
  }

  .back-btn {
    padding: 10px 18px;
    font-size: 15px;
    margin-bottom: 28px;
  }

  .category-title-section {
    gap: 20px;
  }

  .category-icon-large {
    width: 90px;
    height: 90px;
    border-radius: 18px;
  }

  .category-icon-large svg {
    width: 44px;
    height: 44px;
  }

  .category-title {
    font-size: 36px;
  }

  .category-meta {
    font-size: 18px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 20px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 16px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 16px;
    margin-bottom: 18px;
  }
}

@media (max-width: 767px) {
  .category-detail-page {
    padding: 24px 20px;
  }

  .category-header {
    margin-bottom: 32px;
  }

  .back-btn {
    padding: 10px 16px;
    font-size: 14px;
    margin-bottom: 24px;
    gap: 8px;
  }

  .back-btn svg {
    width: 18px;
    height: 18px;
  }

  .category-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .category-icon-large {
    width: 70px;
    height: 70px;
    border-radius: 16px;
  }

  .category-icon-large svg {
    width: 36px;
    height: 36px;
  }

  .category-title {
    font-size: 28px;
  }

  .category-meta {
    font-size: 16px;
  }

  .content-grid {
    gap: 20px;
  }

  .category-detail-page :deep(.youtube-video-card) {
    padding: 4px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 14px;
    gap: 4px 8px;
  }

  .category-detail-page :deep(.avatar-circle) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .category-detail-page :deep(.video-info-section) {
    gap: 12px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 20px;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: 13px;
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .category-detail-page {
    padding: 16px 12px;
  }

  .category-header {
    margin-bottom: 24px;
  }

  .back-btn {
    padding: 8px 14px;
    font-size: 13px;
    margin-bottom: 20px;
    gap: 6px;
    border-radius: 10px;
  }

  .back-btn svg {
    width: 16px;
    height: 16px;
  }

  .back-btn span {
    display: none;
  }

  .category-title-section {
    gap: 12px;
  }

  .category-icon-large {
    width: 60px;
    height: 60px;
    border-radius: 12px;
  }

  .category-icon-large svg {
    width: 28px;
    height: 28px;
  }

  .category-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .category-meta {
    font-size: 14px;
  }

  .content-grid {
    gap: 16px;
  }

  .category-detail-page :deep(.youtube-video-card) {
    padding: 2px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 12px;
    gap: 4px 6px;
  }

  .category-detail-page :deep(.avatar-circle) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .category-detail-page :deep(.video-info-section) {
    gap: 10px;
  }

  .empty-state {
    padding: 40px 12px;
  }

  .empty-state svg {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    font-size: 18px;
  }

  .btn-primary {
    padding: 10px 18px;
    font-size: 12px;
    margin-top: 16px;
    border-radius: 10px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .category-detail-page :deep(.youtube-video-card):hover {
    transform: none;
  }

  .category-detail-page :deep(.youtube-video-card):active {
    transform: scale(0.98);
  }

  .back-btn:hover {
    background: var(--dark-lighter);
    border-color: rgba(255, 0, 110, 0.2);
    color: var(--text-secondary);
  }

  .back-btn:active {
    background: rgba(255, 0, 110, 0.1);
    border-color: rgba(255, 0, 110, 0.3);
    color: var(--text-primary);
  }

  .btn-primary:hover {
    transform: none;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }
}
</style>

