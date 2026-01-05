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
          <button
            class="hero-play-btn"
            @click="scrollToMovie(featuredMovie._id)"
          >
            <Play :size="20" fill="currentColor" />
            <span>Play Now</span>
          </button>
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

      <div v-if="loading" class="loading-container">
        <Loader2 :size="50" class="spinner-icon" />
        <p>Loading movies...</p>
      </div>

      <div
        v-else-if="filteredMovies.length > 0"
        :class="['movies-container', viewMode]"
      >
        <div
          v-for="movie in paginatedMovies"
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
          @click="currentPage--"
        >
          <ChevronLeft :size="18" />
          <span>Previous</span>
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-number', { active: page === currentPage }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="pagination-btn"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          <span>Next</span>
          <ChevronRight :size="18" />
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import {
	AlertTriangle,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Film,
	Grid3x3,
	List,
	Loader2,
	Play,
	RefreshCw,
	X,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";

const API_URL = import.meta.env.DEV
	? "https://cineflix-api-rho.vercel.app/api"
	: import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default {
	name: "Home",
	setup() {
		const searchQuery = ref("");
		const sortBy = ref("date");
		const currentPage = ref(1);
		const loading = ref(false);
		const viewMode = ref("grid");
		const hoveredMovie = ref(null);
		const playingMovie = ref(null);
		const ITEMS_PER_PAGE = 40;

		const movies = ref([]);

		async function loadMovies() {
			loading.value = true;
			try {
				const response = await axios.get(`${API_URL}/movies`);
				movies.value = response.data.data || response.data;
			} catch (error) {
				console.error("Error loading movies:", error);
				alert(`Failed to load movies: ${error.message}`);
			} finally {
				loading.value = false;
			}
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

		function getMovieIndex(id) {
			return filteredMovies.value.findIndex((m) => m._id === id);
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

		function getThumbnail(movie) {
			if (movie.thumbnail) {
				return movie.thumbnail;
			}
			const src = movie.iframeSrc || "";
			if (src.includes("youtube.com") || src.includes("youtu.be")) {
				const videoId = extractYouTubeId(src);
				if (videoId) {
					return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
				}
			}
			return null;
		}

		function extractYouTubeId(url) {
			const regExp =
				/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
			const match = url.match(regExp);
			return match && match[2].length === 11 ? match[2] : null;
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

		function sortMovies() {
			// Sorting is handled by computed property
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

		const filteredMovies = computed(() => {
			let filtered = movies.value;
			if (searchQuery.value.trim()) {
				const query = searchQuery.value.toLowerCase();
				filtered = filtered.filter((movie) =>
					movie.title.toLowerCase().includes(query),
				);
			}
			if (sortBy.value === "title") {
				filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
			} else if (sortBy.value === "date") {
				filtered = [...filtered].sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
				);
			}
			return filtered;
		});

		const featuredMovie = computed(() => {
			return filteredMovies.value.length > 0 ? filteredMovies.value[0] : null;
		});

		const totalPages = computed(() => {
			return Math.ceil(filteredMovies.value.length / ITEMS_PER_PAGE);
		});

		const paginatedMovies = computed(() => {
			const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
			const end = start + ITEMS_PER_PAGE;
			return filteredMovies.value.slice(start, end);
		});

		const visiblePages = computed(() => {
			const pages = [];
			const total = totalPages.value;
			const current = currentPage.value;
			if (total <= 7) {
				for (let i = 1; i <= total; i++) {
					pages.push(i);
				}
			} else {
				if (current <= 3) {
					for (let i = 1; i <= 5; i++) pages.push(i);
					pages.push("...");
					pages.push(total);
				} else if (current >= total - 2) {
					pages.push(1);
					pages.push("...");
					for (let i = total - 4; i <= total; i++) pages.push(i);
				} else {
					pages.push(1);
					pages.push("...");
					for (let i = current - 1; i <= current + 1; i++) pages.push(i);
					pages.push("...");
					pages.push(total);
				}
			}
			return pages;
		});

		watch(currentPage, () => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		});

		onMounted(() => {
			loadMovies();
		});

		return {
			searchQuery,
			sortBy,
			currentPage,
			loading,
			movies,
			filteredMovies,
			featuredMovie,
			paginatedMovies,
			totalPages,
			visiblePages,
			viewMode,
			hoveredMovie,
			playingMovie,
			loadMovies,
			sortMovies,
			formatDate,
			getMovieIndex,
			playMovieInCard,
			stopPlaying,
			handleMouseLeave,
			getThumbnail,
			extractYouTubeId,
			handleThumbnailError,
			retryIframe,
			openExternal,
			scrollToMovie,
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
			Loader2,
		};
	},
};
</script>

