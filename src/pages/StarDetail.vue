<template>
  <div class="star-detail-page">
    <div class="star-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>{{ $t('star.backToStars') }}</span>
      </button>
      <div class="star-title-section">
        <div class="star-icon-large">
          <Star :size="48" />
        </div>
        <div>
          <h1 class="star-title">{{ starName }}</h1>
          <p class="star-meta">{{ movies.length }} {{ $tc('star.moviesWithStar', movies.length) }} with this star</p>
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
      <h3>{{ $t('star.noMovies') }}</h3>
      <p>{{ $t('star.noMoviesDesc') }}</p>
      <button class="btn-primary" @click="goBack">{{ $t('star.backToStars') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Star, Film } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const starName = computed(() => decodeURIComponent(route.params.star || ''));
const movies = ref([]);
const loading = ref(true);

onMounted(async () => {
  await loadMovies();
});

async function loadMovies() {
  loading.value = true;
  try {
    const response = await apiClient.get('/movies', {
      params: {
        star: starName.value
      }
    });
    if (response.data.success) {
      movies.value = response.data.data || [];
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
  router.push('/stars');
}
</script>

<style scoped>
.star-detail-page {
  padding: 60px 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.star-header {
  margin-bottom: 60px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  margin-bottom: 24px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-tertiary);
}

.star-title-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.star-icon-large {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 20px;
  color: var(--accent-color);
}

.star-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.star-meta {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0;
}

.movies-grid {
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
  }
}

@media (min-width: 1200px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* MovieCard styling */
:deep(.movies-grid .movie-card) {
  border-radius: 20px;
}

:deep(.movies-grid .movie-card .movie-title) {
  font-size: 22px;
  font-weight: 700;
}

:deep(.movies-grid .movie-card .movie-meta) {
  font-size: 17px;
}

:deep(.movies-grid .movie-card .movie-avatar) {
  width: 48px;
  height: 48px;
}

:deep(.movies-grid .movie-card:hover) {
  transform: translateY(-8px);
}
</style>

