<template>
  <div class="app-container">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🎬</div>
          <span class="logo-text">MovieHub</span>
        </div>
      </div>

      <nav class="nav-section">
        <div class="nav-title">Menu</div>
        <ul class="nav-list">
          <li class="nav-item active">
            <button class="nav-button">
              <span class="nav-icon">🔥</span>
              <span>Trending</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <span>© 2025 MovieHub</span>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button
            class="header-btn refresh-btn"
            @click="loadMovies"
            title="Refresh"
          >
            <span>🔄</span>
          </button>
        </div>
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search movies..."
            class="search-input"
            v-model="searchQuery"
          />
        </div>
        <div class="header-right">
          <button class="add-movie-btn-header" @click="showAddModal = true">
            <span class="btn-icon">➕</span>
            <span>Add Movie</span>
          </button>
          <div class="user-avatar">
            <span>👤</span>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section" v-if="featuredMovie">
        <div
          class="hero-backdrop"
          :style="{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920')`,
          }"
        >
          <div class="hero-content">
            <div class="hero-badge">🎥 Featured</div>
            <h1 class="hero-title">{{ featuredMovie.title }}</h1>
            <p class="hero-description">Watch now in high quality</p>
            <button
              class="hero-play-btn"
              @click="scrollToMovie(featuredMovie._id)"
            >
              ▶ Play Now
            </button>
          </div>
        </div>
      </section>

      <!-- Movies Section -->
      <section class="movies-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🎬</span>
            Trending Movies
            <span class="movie-count">({{ filteredMovies.length }})</span>
          </h2>
          <div class="header-controls">
            <div class="view-toggle">
              <button
                :class="['view-btn', { active: viewMode === 'grid' }]"
                @click="viewMode = 'grid'"
                title="Grid View"
              >
                ⊞
              </button>
              <button
                :class="['view-btn', { active: viewMode === 'list' }]"
                @click="viewMode = 'list'"
                title="List View"
              >
                ☰
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
          <div class="spinner"></div>
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
            :class="{ 'has-iframe-expanded': expandedMovie === movie._id }"
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
                      ▶ Play
                    </button>
                  </div>
                  <div class="movie-number">
                    {{ getMovieIndex(movie._id) + 1 }}
                  </div>
                </div>
                <!-- Video Player (replaces thumbnail when playing) -->
                <div v-else class="movie-player">
                  <div class="iframe-wrapper-inline">
                    <div v-html="movie.iframe"></div>
                    <div v-if="movie.error" class="iframe-error">
                      <p>⚠️ Failed to load video</p>
                      <div class="error-actions">
                        <button class="retry-btn" @click="retryIframe(movie)">
                          Retry
                        </button>
                        <button
                          class="open-external-btn"
                          @click="openExternal(movie.iframeSrc)"
                        >
                          Open in Browser
                        </button>
                      </div>
                    </div>
                    <button class="close-player-btn" @click="stopPlaying">
                      ✕ Close
                    </button>
                  </div>
                </div>
              </div>
              <div class="movie-info">
                <div class="movie-header">
                  <h3 class="movie-title" :title="movie.title">
                    {{ movie.title }}
                  </h3>
                  <!-- <button
                    class="movie-delete-btn"
                    @click.stop="deleteMovie(movie._id)"
                    title="Delete movie"
                  >
                    🗑️
                  </button> -->
                </div>
                <div class="movie-meta">
                  <span class="movie-date">{{
                    formatDate(movie.createdAt)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🎬</div>
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
            ← Previous
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
            Next →
          </button>
        </div>
      </section>
    </main>

    <!-- Add Movie Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>➕ Add New Movie</h3>
          <button class="modal-close" @click="closeAddModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="movieTitle">🎬 Movie Title</label>
            <input
              type="text"
              id="movieTitle"
              v-model="newMovie.title"
              placeholder="Enter movie title"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="iframeCode">📺 Iframe Code</label>
            <textarea
              id="iframeCode"
              v-model="newMovie.iframeCode"
              placeholder='Paste your iframe code here, e.g., &lt;iframe width="720" height="1280" src="https://www.******.com/embed/nEoN849L394/" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;'
              class="form-textarea"
              rows="6"
            ></textarea>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" @click="closeAddModal">Cancel</button>
            <button class="btn-primary" @click="saveMovie" :disabled="saving">
              {{ saving ? "Saving..." : "✨ Add Movie" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

// Use localhost in development mode, Vercel URL in production
// Note: Vite requires VITE_ prefix for env variables
// Force localhost when running locally (development mode)
const API_URL = import.meta.env.DEV
  ? "https://cineflix-api-rho.vercel.app/api" // Always use localhost in dev mode
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Log API URL for debugging
console.log("API URL:", API_URL);
console.log("Environment:", import.meta.env.MODE);

if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("piwik.js") ||
      message.includes("cookie") ||
      message.includes("Permissions policy") ||
      message.includes("xr-spatial-tracking") ||
      message.includes("XRSystem") ||
      message.includes("videojs.plugin")
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("allowfullscreen") ||
      message.includes("videojs.plugin") ||
      message.includes("Permissions policy")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export default {
  name: "App",
  setup() {
    const searchQuery = ref("");
    const sortBy = ref("date");
    const currentPage = ref(1);
    const loading = ref(false);
    const saving = ref(false);
    const showAddModal = ref(false);
    const viewMode = ref("grid");
    const hoveredMovie = ref(null);
    const playingMovie = ref(null);
    const ITEMS_PER_PAGE = 40;

    const movies = ref([]);
    const newMovie = ref({
      title: "",
      iframeCode: "",
    });

    // Load movies from API
    async function loadMovies() {
      loading.value = true;
      try {
        console.log("Fetching movies from:", `${API_URL}/movies`);
        const response = await axios.get(`${API_URL}/movies`);
        console.log("Movies response:", response.data);
        movies.value = response.data.data || response.data;
      } catch (error) {
        console.error("Error loading movies:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load movies";
        alert(`Failed to load movies: ${errorMessage}`);
      } finally {
        loading.value = false;
      }
    }

    // Save new movie
    async function saveMovie() {
      if (!newMovie.value.title.trim()) {
        alert("Please enter a movie title");
        return;
      }

      if (!newMovie.value.iframeCode.trim()) {
        alert("Please enter iframe code");
        return;
      }

      saving.value = true;
      try {
        let iframeSrc = newMovie.value.iframeCode.trim();
        let iframeWidth = "100%";
        let iframeHeight = "100%";

        const iframeMatch = iframeSrc.match(/src=["']([^"']+)["']/);
        if (iframeMatch) {
          iframeSrc = iframeMatch[1];
        }

        const widthMatch = newMovie.value.iframeCode.match(
          /width=["']([^"']+)["']/
        );
        const heightMatch = newMovie.value.iframeCode.match(
          /height=["']([^"']+)["']/
        );
        if (widthMatch) iframeWidth = widthMatch[1];
        if (heightMatch) iframeHeight = heightMatch[1];

        const iframeHtml = `<iframe 
          width="${iframeWidth}" 
          height="${iframeHeight}" 
          src="${iframeSrc}" 
          frameborder="0" 
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; microphone; camera"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          style="border: none;"
        ></iframe>`;

        const response = await axios.post(`${API_URL}/movies`, {
          title: newMovie.value.title.trim(),
          iframe: iframeHtml,
          iframeSrc: iframeSrc,
        });

        console.log("Movie saved response:", response.data);

        if (response.data.success) {
          resetForm();
          closeAddModal();
          await loadMovies();
          alert("Movie added successfully!");
        } else {
          alert(
            `Failed to save movie: ${response.data.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error saving movie:", error);
        console.error("Error response:", error.response?.data);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to save movie. Please try again.";
        alert(`Error: ${errorMessage}`);
      } finally {
        saving.value = false;
      }
    }

    // Delete movie
    async function deleteMovie(id) {
      if (!confirm("Are you sure you want to delete this movie?")) {
        return;
      }

      try {
        await axios.delete(`${API_URL}/movies/${id}`);
        await loadMovies();
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie. Please try again.");
      }
    }

    function resetForm() {
      newMovie.value = { title: "", iframeCode: "" };
    }

    function closeAddModal() {
      showAddModal.value = false;
      resetForm();
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
      // Scroll to movie card
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
      // Use stored thumbnail if available
      if (movie.thumbnail) {
        return movie.thumbnail;
      }

      // Try to extract thumbnail from iframe source
      const src = movie.iframeSrc || "";

      // YouTube thumbnail pattern
      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const videoId = extractYouTubeId(src);
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      // Vimeo thumbnail (would need API, using placeholder for now)
      if (src.includes("vimeo.com")) {
        return `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop`;
      }

      // Default gradient thumbnail with movie title
      return null; // Will use CSS gradient fallback
    }

    function extractYouTubeId(url) {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    }

    function handleThumbnailError(event) {
      // Fallback to gradient background if thumbnail fails to load
      event.target.style.display = "none";
      event.target.parentElement.style.background = "var(--gradient-hero)";
    }

    const filteredMovies = computed(() => {
      let filtered = movies.value;

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((movie) =>
          movie.title.toLowerCase().includes(query)
        );
      }

      if (sortBy.value === "title") {
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy.value === "date") {
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
      saving,
      movies,
      newMovie,
      filteredMovies,
      featuredMovie,
      paginatedMovies,
      totalPages,
      visiblePages,
      viewMode,
      hoveredMovie,
      playingMovie,
      showAddModal,
      loadMovies,
      saveMovie,
      deleteMovie,
      resetForm,
      closeAddModal,
      retryIframe,
      openExternal,
      sortMovies,
      formatDate,
      getMovieIndex,
      playMovieInCard,
      stopPlaying,
      handleMouseLeave,
      getThumbnail,
      extractYouTubeId,
      handleThumbnailError,
    };
  },
};
</script>
