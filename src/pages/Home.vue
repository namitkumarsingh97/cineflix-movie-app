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
          <div class="view-toggle">
            <button
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
              title="Grid View"
            >
              <Grid3x3 :size="18" />
            </button>
            <button
              :class="['view-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
              title="List View"
            >
              <List :size="18" />
            </button>
          </div>
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
        :class="['movies-container', viewMode]"
      >
        <div
          v-for="movie in paginatedItems"
          :key="movie._id"
          :id="`movie-${movie._id}`"
          class="movie-card"
          @mouseenter="hoveredMovie = movie._id"
          @mouseleave="handleMouseLeave(movie._id)"
        >
          <div class="movie-card-inner">
            <div class="movie-poster">
              <!-- Thumbnail/Poster -->
              <div v-if="playingMovie !== movie._id" class="movie-thumbnail">
                <img
                  :src="getThumbnail(movie)"
                  :alt="movie.title"
                  @error="handleThumbnailError"
                  class="thumbnail-image"
                />
                <div
                  class="movie-overlay"
                  v-if="
                    hoveredMovie === movie._id || playingMovie === movie._id
                  "
                >
                  <button
                    class="play-overlay-btn"
                    @click="playMovieInCard(movie._id)"
                  >
                    <Play :size="20" fill="currentColor" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
              <!-- Video Player (replaces thumbnail when playing) -->
              <div v-else class="movie-player">
                <div class="iframe-wrapper-inline">
                  <div v-html="movie.iframe"></div>
                  <div v-if="movie.error" class="iframe-error">
                    <AlertTriangle :size="32" class="error-icon" />
                    <p>Failed to load video</p>
                    <div class="error-actions">
                      <button class="retry-btn" @click="retryIframe(movie)">
                        <RefreshCw :size="16" />
                        <span>Retry</span>
                      </button>
                      <button
                        class="open-external-btn"
                        @click="openExternal(movie.iframeSrc)"
                      >
                        <span>Open in Browser</span>
                      </button>
                    </div>
                  </div>
                  <button class="close-player-btn" @click="stopPlaying">
                    <X :size="16" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="movie-info">
              <div class="movie-header">
                <h3 class="movie-title" :title="movie.title">
                  {{ movie.title }}
                </h3>
              </div>
              <div class="movie-meta">
                <span class="movie-date">
                  <Calendar :size="14" />
                  <span>{{ formatDate(movie.createdAt) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Film :size="80" class="empty-icon" />
        <h3>No movies found</h3>
        <p>Click "Add Movie" to add your first movie!</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
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
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from "vue";
import { useMovies } from "../composables/useMovies";
import { usePagination } from "../composables/usePagination";
import { formatDate } from "../utils/date";
import { getThumbnail } from "../utils/video";
import Loader from "../components/Loader.vue";
import {
  Film,
  Play,
  X,
  AlertTriangle,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
} from "lucide-vue-next";

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

// Pagination
const {
  currentPage,
  totalPages,
  paginatedItems,
  visiblePages,
  goToPage,
  nextPage,
  prevPage,
} = usePagination(filteredMovies, 40);

// Local state
const viewMode = ref("grid");
const hoveredMovie = ref(null);
const playingMovie = ref(null);

// Methods
function sortMovies() {
  // Sorting is handled by computed property
}

function playMovieInCard(movieId) {
  playingMovie.value = movieId;
  const element = document.getElementById(`movie-${movieId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function stopPlaying() {
  playingMovie.value = null;
}

function handleMouseLeave(movieId) {
  if (playingMovie.value !== movieId) {
    hoveredMovie.value = null;
  }
}

function handleThumbnailError(event) {
  event.target.style.display = "none";
  event.target.parentElement.style.background = "var(--gradient-hero)";
}

function retryIframe(movie) {
  movie.error = false;
}

function openExternal(url) {
  window.open(url, "_blank");
}

function scrollToMovie(movieId) {
  const element = document.getElementById(`movie-${movieId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      playMovieInCard(movieId);
    }, 500);
  }
}

onMounted(() => {
  loadMovies();
});
</script>

<style scoped>
/* Styles are in global style.css */
</style>
