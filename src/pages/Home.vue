<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section" v-if="featuredMovie">
      <div
        class="hero-backdrop"
        :style="{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920')`,
        }"
      >
        <div class="hero-content">
          <div class="hero-badge">Featured</div>
          <h1 class="hero-title">{{ featuredMovie.title }}</h1>
          <p class="hero-description">Watch now in high quality</p>
          <!-- <button
            class="hero-play-btn"
            @click="scrollToMovie(featuredMovie._id)"
          >
            <Play :size="20" fill="currentColor" />
            <span>Play Now</span>
          </button> -->
        </div>
      </div>
    </section>

    <!-- Movies Section -->
    <section class="movies-section">
      <div class="section-header">
        <h2 class="section-title">
          <Film :size="24" class="title-icon" />
          <span>Trending Movies</span>
          <span class="movie-count">({{ filteredMovies.length }})</span>
        </h2>
        <div class="header-controls">
          <div class="dropdown">
            <select
              class="dropdown-select"
              v-model="sortBy"
              @change="sortMovies"
            >
              <option value="date">Recent</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <Loader v-if="loading" message="Loading movies..." />

      <div
        v-else-if="filteredMovies.length > 0"
        class="youtube-videos-grid"
      >
        <MovieCard
          v-for="movie in paginatedItems"
          :key="movie._id"
          :movie="movie"
          @click="navigateToMovie"
        />
      </div>

      <div v-else class="empty-state">
        <Film :size="80" class="empty-icon" />
        <h3>No movies found</h3>
        <p>Click "Add Movie" to add your first movie!</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredMovies.length > 0 && totalPages > 1" class="pagination-wrapper">
        <div class="pagination-info">
          <span>Showing {{ getStartIndex() }}-{{ getEndIndex() }} of {{ filteredMovies.length }} movies</span>
        </div>
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <ChevronLeft :size="18" />
            <span>Previous</span>
          </button>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-number', { active: page === currentPage }]"
              @click="goToPage(page)"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="pagination-btn"
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            <span>Next</span>
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from "vue";
import { useRouter } from "vue-router";
import { useMovies } from "../composables/useMovies";
import { usePagination } from "../composables/usePagination";
import Loader from "../components/Loader.vue";
import MovieCard from "../components/MovieCard.vue";
import {
  Film,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";

const router = useRouter();

// Get search query and refresh trigger from parent
const searchQuery = inject("searchQuery", ref(""));
const refreshTrigger = inject("refreshTrigger", ref(0));

// Use composables
const { movies, sortBy, loading, filteredMovies, featuredMovie, loadMovies } =
  useMovies(searchQuery);

// Watch for refresh trigger
watch(refreshTrigger, () => {
  loadMovies();
});

// Pagination - reduced items per page for better UX
const {
  currentPage,
  totalPages,
  paginatedItems,
  visiblePages,
  goToPage,
  nextPage,
  prevPage,
} = usePagination(filteredMovies, 12);

// Reset to page 1 when filteredMovies changes (search/filter)
watch(filteredMovies, () => {
  if (currentPage.value > 1) {
    currentPage.value = 1;
  }
});

// Local state
const viewMode = ref("grid");

// Methods
function sortMovies() {
  // Sorting is handled by computed property
}

function navigateToMovie(movie) {
  // Navigate to watch page with movie ID
  router.push(`/watch/${movie._id}`);
}

function getStartIndex() {
  return (currentPage.value - 1) * 12 + 1;
}

function getEndIndex() {
  return Math.min(currentPage.value * 12, filteredMovies.value.length);
}

onMounted(() => {
  loadMovies();
});
</script>

<style scoped>
/* Styles are in global style.css */
</style>
