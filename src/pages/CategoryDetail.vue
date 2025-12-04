<template>
  <div class="category-detail-page">
    <div class="category-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>{{ $t('category.backToCategories') }}</span>
      </button>
      <div class="category-title-section">
        <div class="category-icon-large">
          <FolderOpen :size="48" />
        </div>
        <div>
          <h1 class="category-title">{{ categoryName || 'Uncategorized' }}</h1>
          <p class="category-meta">{{ movies.length }} {{ $tc('category.moviesInCategory', movies.length) }} in this category</p>
        </div>
      </div>
    </div>

    <Loader v-if="loading" message="Loading movies..." />

    <div v-else-if="movies.length > 0" class="movies-grid">
      <MovieCard
        v-for="movie in movies"
        :key="movie._id"
        :movie="movie"
        @click="navigateToMovie(movie._id)"
      />
    </div>

    <div v-else class="empty-state">
      <Film :size="64" />
      <h3>{{ $t('category.noMovies') }}</h3>
      <p>{{ $t('category.noMoviesDesc') }}</p>
      <button class="btn-primary" @click="goBack">{{ $t('category.backToCategories') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, FolderOpen, Film } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const movies = ref([]);
const loading = ref(true);

const categoryName = computed(() => {
  return decodeURIComponent(route.params.category || 'Uncategorized');
});

onMounted(async () => {
  await loadMovies();
});

async function loadMovies() {
  loading.value = true;
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
  } finally {
    loading.value = false;
  }
}

function navigateToMovie(movieId) {
  router.push(`/watch/${movieId}`);
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
}

.back-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  color: var(--text-primary);
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

.category-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.category-meta {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0;
}

.movies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

/* Tablet - 2 columns */
@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

/* Large screens - 2-3 columns (fewer columns = bigger cards) */
@media (min-width: 1024px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
  }
}

@media (min-width: 1400px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
}

/* Larger card styling for MovieCard components */
.category-detail-page :deep(.youtube-video-card) {
  padding: 8px;
  transition: all 0.3s ease;
}

.category-detail-page :deep(.youtube-video-card):hover {
  transform: translateY(-8px);
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
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Responsive adjustments for padding and header */
@media (min-width: 768px) and (max-width: 1023px) {
  .category-detail-page {
    padding: 30px;
  }

  .category-title {
    font-size: 36px;
  }

  .category-meta {
    font-size: 18px;
  }
}

@media (max-width: 767px) {
  .category-detail-page {
    padding: 20px;
  }

  .category-header {
    margin-bottom: 40px;
  }

  .category-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .category-icon-large {
    width: 80px;
    height: 80px;
  }

  .category-title {
    font-size: 28px;
  }

  .category-meta {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .category-detail-page {
    padding: 16px;
  }

  .category-title {
    font-size: 24px;
  }

  .category-meta {
    font-size: 14px;
  }
}
</style>

