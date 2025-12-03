<template>
  <div class="category-detail-page">
    <div class="category-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>Back to Categories</span>
      </button>
      <div class="category-title-section">
        <div class="category-icon-large">
          <FolderOpen :size="32" />
        </div>
        <div>
          <h1 class="category-title">{{ categoryName || 'Uncategorized' }}</h1>
          <p class="category-meta">{{ movies.length }} {{ movies.length === 1 ? 'movie' : 'movies' }} in this category</p>
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
      <h3>No movies found</h3>
      <p>There are no movies in this category yet.</p>
      <button class="btn-primary" @click="goBack">Browse Categories</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, FolderOpen, Film } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';

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
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.category-header {
  margin-bottom: 40px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 0, 110, 0.2);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.back-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  color: var(--text-primary);
}

.category-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-icon-large {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 0, 110, 0.4);
}

.category-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.category-meta {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
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

@media (max-width: 768px) {
  .category-detail-page {
    padding: 20px;
  }

  .category-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .category-icon-large {
    width: 64px;
    height: 64px;
  }

  .category-title {
    font-size: 24px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>

