<template>
  <div class="home-page-container">
    <!-- Category Sidebar -->
    <CategorySidebar 
      v-if="isSidebarEnabled"
      :is-open="sidebarOpen" 
      @filter-change="handleFilterChange"
    />
    
    <!-- Main Content (with sidebar offset) -->
    <div class="home-content">
    <!-- Layout Customizer Button -->
    <div class="layout-customizer-btn-container">
      <button 
        class="layout-customizer-btn" 
        @click="showLayoutCustomizer = true"
        aria-label="Customize homepage layout"
      >
        <Layout :size="18" />
        <span>Customize Layout</span>
      </button>
    </div>

    <!-- Continue Watching Section -->
    <section 
      v-if="continueWatching.length > 0 && isSectionEnabled('continueWatching')" 
      class="movies-section"
      aria-label="Continue watching"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Clock :size="24" class="title-icon" />
          <span>Continue Watching</span>
        </h2>
        <button class="clear-btn" @click="clearContinueWatching">Clear</button>
      </div>
      <div class="youtube-videos-grid">
        <MovieCard
          v-for="item in continueWatching"
          :key="item.id"
          :movie="getMovieById(item.id)"
          @click="navigateToMovie"
        />
      </div>
    </section>

    <!-- Watch Later Section -->
    <section
      id="watch-later-section"
      v-if="watchLaterItems.length > 0 && isSectionEnabled('watchLater')"
      class="movies-section"
      aria-label="Watch later"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Clock :size="24" class="title-icon" />
          <span>Watch Later</span>
        </h2>
      </div>
      <div class="youtube-videos-grid">
        <MovieCard
          v-for="item in watchLaterMovies"
          :key="`wl-movie-${item._id}`"
          :movie="item"
          @click="navigateToMovie"
        />
        <VideoCard
          v-for="item in watchLaterVideos"
          :key="`wl-video-${item.id}`"
          :video="item"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Trending Section (Latest Eporner Videos) -->
    <section 
      v-if="latestVideos.length > 0 && isSectionEnabled('trending')" 
      class="movies-section"
      aria-label="Trending now"
    >
      <div class="section-header">
        <h2 class="section-title">
          <TrendingUp :size="24" class="title-icon" />
          <span>Trending Now</span>
        </h2>
        <router-link to="/videos?order=latest" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <div class="youtube-videos-grid">
        <VideoCard
          v-for="video in latestVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Personalized Stars Section -->
    <section
      id="followed-stars-section"
      v-if="personalizedByStars.length > 0 && isSectionEnabled('yourStars')"
      class="movies-section"
      aria-label="Your favorite stars"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Star :size="24" class="title-icon" />
          <span>Your Stars</span>
        </h2>
      </div>
      <div class="youtube-videos-grid">
        <MovieCard
          v-for="movie in personalizedByStars"
          :key="`favstar-${movie._id}`"
          :movie="movie"
          @click="navigateToMovie"
        />
      </div>
    </section>

    <!-- Indian Section -->
    <section 
      v-if="indianVideos.length > 0 && isSectionEnabled('indian')" 
      class="movies-section"
      aria-label="Indian videos"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Film :size="24" class="title-icon" />
          <span>Indian</span>
        </h2>
        <router-link to="/videos?q=indian" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <SkeletonSection 
        v-if="epornerLoading && indianVideos.length === 0" 
        :count="maxThumbnailsPerPage" 
        :columns="4"
        :show-header="false"
      />
      <div v-else-if="indianVideos.length > 0" class="youtube-videos-grid">
        <VideoCard
          v-for="video in indianVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Recent POV Videos Section -->
    <section 
      v-if="povVideos.length > 0 && isSectionEnabled('pov')" 
      class="movies-section"
      aria-label="Recent POV videos"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Film :size="24" class="title-icon" />
          <span>Recent POV Videos</span>
        </h2>
        <router-link to="/videos?q=pov" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <SkeletonSection 
        v-if="epornerLoading && povVideos.length === 0" 
        :count="maxThumbnailsPerPage" 
        :columns="4"
        :show-header="false"
      />
      <div v-else-if="povVideos.length > 0" class="youtube-videos-grid">
        <VideoCard
          v-for="video in povVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Recent Family Videos Section -->
    <section 
      v-if="familyVideos.length > 0 && isSectionEnabled('family')" 
      class="movies-section"
      aria-label="Recent Family videos"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Film :size="24" class="title-icon" />
          <span>Recent Family Videos</span>
        </h2>
        <router-link to="/videos?q=family" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <SkeletonSection 
        v-if="epornerLoading && familyVideos.length === 0" 
        :count="maxThumbnailsPerPage" 
        :columns="4"
        :show-header="false"
      />
      <div v-else-if="familyVideos.length > 0" class="youtube-videos-grid">
        <VideoCard
          v-for="video in familyVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Premium Section - Professional Showcase -->
    <section 
      v-if="isSectionEnabled('premium')" 
      class="movies-section premium-section premium-showcase"
      aria-label="Premium content"
    >
      <div class="premium-section-background">
        <div class="premium-gradient-overlay"></div>
      </div>
      <div class="premium-content-wrapper">
        <div class="section-header premium-header">
          <div class="section-title-wrapper">
            <div class="premium-badge-header">
              <Crown :size="20" />
              <span>Premium</span>
            </div>
            <h2 class="section-title premium-title">
              Exclusive Premium Content
            </h2>
            <p class="section-description premium-description">
              Unlock unlimited access to premium videos with HD & 4K quality, ad-free experience, offline downloads, and exclusive releases
            </p>
          </div>
          <router-link to="/premium" class="premium-cta-header">
            <span>View All Premium</span>
            <ChevronRight :size="18" />
          </router-link>
        </div>
        
        <SkeletonSection 
          v-if="epornerLoading && (!premiumPreviewVideos || premiumPreviewVideos.length === 0) && (!blurredPreviewVideos || blurredPreviewVideos.length === 0)" 
          :count="maxThumbnailsPerPage" 
          :columns="4"
          :show-header="false"
        />
        <div v-else class="premium-videos-showcase-wrapper">
          <!-- Premium Videos (if available) -->
          <div v-if="premiumPreviewVideos && premiumPreviewVideos.length > 0" class="premium-videos-showcase">
            <PremiumVideoCard
              v-for="video in premiumPreviewVideos"
              :key="video.id"
              :video="video"
              :is-premium="isPremium"
            />
          </div>
          
          <!-- Blurred Video Grid from Regular Videos -->
          <div v-else-if="blurredPreviewVideos && blurredPreviewVideos.length > 0" class="premium-blurred-videos-grid">
            <div
              v-for="video in blurredPreviewVideos"
              :key="video.id"
              class="blurred-video-card"
              @click.stop="handlePremiumVideoClick(video, $event)"
            >
              <div class="blurred-video-thumbnail-wrapper">
                <OptimizedImage
                  :src="video.thumbnail || getDefaultThumbnail(video)"
                  :alt="video.title"
                  image-class="blurred-video-thumbnail"
                />
                <div class="blurred-video-overlay">
                  <div class="blurred-lock-icon">
                    <Lock :size="28" />
                  </div>
                  <div class="blurred-premium-badge">
                    <Crown :size="14" />
                    <span>Premium</span>
                  </div>
                </div>
              </div>
              <!-- Video info hidden for more mystery -->
            </div>
          </div>
          
          <!-- Empty State Overlay (only if no videos at all) -->
          <div v-if="(!premiumPreviewVideos || premiumPreviewVideos.length === 0) && (!blurredPreviewVideos || blurredPreviewVideos.length === 0)" class="premium-empty-overlay">
            <div class="empty-premium-state">
              <div class="empty-premium-icon">
                <Crown :size="64" />
              </div>
              <h3>Premium Content Coming Soon</h3>
              <p>Exclusive premium videos will be available here</p>
              <router-link to="/premium" class="premium-cta-button">
                <Crown :size="18" />
                <span>Explore Premium Plans</span>
              </router-link>
            </div>
          </div>
        </div>
        
        <div v-if="!isPremium && premiumPreviewVideos.length > 0" class="premium-unlock-banner">
          <div class="unlock-banner-content">
            <div class="unlock-icon">
              <Lock :size="24" />
            </div>
            <div class="unlock-text">
              <h3>Unlock Premium Access</h3>
              <p>Get instant access to all premium content and exclusive features</p>
            </div>
            <router-link to="/premium" class="unlock-button">
              <Crown :size="18" />
              <span>Subscribe Now</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Videos Section (Eporner) -->
    <section 
      v-if="isSectionEnabled('trendingVideos')" 
      class="movies-section"
      aria-label="Trending videos"
    >
      <div class="section-header">
        <h2 class="section-title">
          <TrendingUp :size="24" class="title-icon" />
          <span>Trending Videos</span>
        </h2>
        <router-link to="/videos" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <SkeletonSection 
        v-if="epornerLoading && trendingVideos.length === 0" 
        :count="12" 
        :columns="4"
        :show-header="false"
      />
      <div v-else-if="trendingVideos.length > 0" class="youtube-videos-grid">
        <VideoCard
          v-for="video in trendingVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- Recently Added Videos Section (Eporner) -->
    <section 
      v-if="isSectionEnabled('recentlyAddedVideos')" 
      class="movies-section"
      aria-label="Recently added videos"
    >
      <div class="section-header">
        <h2 class="section-title">
          <Calendar :size="24" class="title-icon" />
          <span>Recently Added Videos</span>
        </h2>
        <router-link to="/videos" class="view-all-link">
          View All
          <ChevronRight :size="16" />
        </router-link>
      </div>
      <SkeletonSection 
        v-if="epornerLoading && recentlyAddedVideos.length === 0" 
        :count="12" 
        :columns="4"
        :show-header="false"
      />
      <div v-else-if="recentlyAddedVideos.length > 0" class="youtube-videos-grid">
        <VideoCard
          v-for="video in recentlyAddedVideos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>
    </section>

    <!-- All Movies Section -->
    <section 
      v-if="isSectionEnabled('allMovies')"
      class="movies-section"
      aria-label="All movies"
    >
      <!-- Advanced Search Filters -->
      <AdvancedSearch
        :show-filters="showAdvancedFilters"
        :categories="uniqueCategories"
        :stars="uniqueStars"
        @filter="handleFilter"
      />
      
      <div class="section-header">
        <h2 class="section-title">
          <Film :size="24" class="title-icon" />
          <span>All Movies</span>
          <span class="movie-count">({{ filteredMovies.length }})</span>
        </h2>
        <div class="header-controls">
          <button 
            class="filter-toggle-btn" 
            @click="showAdvancedFilters = !showAdvancedFilters"
            :class="{ active: showAdvancedFilters }"
            title="Filters"
          >
            <Filter :size="18" />
            <span>Filters</span>
          </button>
          <button class="random-btn" @click="pickRandom" title="Random">
            <Shuffle :size="18" />
            <span>Random</span>
          </button>
          <div class="dropdown">
            <select
              class="dropdown-select"
              v-model="sortBy"
              @change="sortMovies"
            >
              <option value="date">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <SkeletonSection 
        v-if="loading && movies.length === 0" 
        :count="maxThumbnailsPerPage" 
        :columns="4"
        :show-header="false"
      />

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

      <div v-else-if="!loading" class="empty-state">
        <Film :size="80" class="empty-icon" />
        <h3>No movies found</h3>
        <p v-if="movies.length === 0">Click "Add Movie" to add your first movie!</p>
        <p v-else>No movies match your current filters. Try adjusting your search or filters.</p>
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

    <!-- Layout Customizer Modal -->
    <HomeLayoutCustomizer 
      :show="showLayoutCustomizer" 
      @close="showLayoutCustomizer = false" 
    />
    </div> <!-- End home-content -->
  </div> <!-- End home-page-container -->
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMovies } from "../composables/useMovies";
import { usePagination } from "../composables/usePagination";
import { useWatchHistory, useFavorites } from "../composables/useWatchHistory";
import { usePreferences } from "../composables/usePreferences";
import Loader from "../components/Loader.vue";
import SkeletonSection from "../components/SkeletonSection.vue";
import MovieCard from "../components/MovieCard.vue";
import AdvancedSearch from "../components/AdvancedSearch.vue";
import HomeLayoutCustomizer from "../components/HomeLayoutCustomizer.vue";
import CategorySidebar from "../components/CategorySidebar.vue";
import { useHomeLayout } from "../composables/useHomeLayout";
import { useWatchLater } from "../composables/useWatchLater";
import { useStarFollows } from "../composables/useStarFollows";
import { useNotifications } from "../composables/useNotifications";
import { useVideos } from "../composables/useVideos";
import { useNetworkQuality } from "../composables/useNetworkQuality";
import { useRecommendations } from "../composables/useRecommendations";
import { useSubscription } from "../composables/useSubscription";

import {
  Film,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Calendar,
  Shuffle,
  Filter,
  Layout,
  Star,
  Play,
  Crown,
  Lock,
} from "lucide-vue-next";
import { useEporner } from "../composables/useEporner";
import VideoCard from "../components/VideoCard.vue";
import PremiumVideoCard from "../components/PremiumVideoCard.vue";
import OptimizedImage from "../components/OptimizedImage.vue";
import { formatViews, formatDuration } from "../utils/date";

const router = useRouter();
const route = useRoute();

// Get search query and refresh trigger from parent
const searchQuery = inject("searchQuery", ref(""));
const refreshTrigger = inject("refreshTrigger", ref(0));

// Use composables
const { movies, sortBy, loading, featuredMovie, loadMovies } =
  useMovies(searchQuery);

const { getContinueWatching, clearHistory, getWatchHistory } = useWatchHistory();
const { getPreferredCategories } = usePreferences();
const { isSectionEnabled } = useHomeLayout();
const { items: watchLaterItems } = useWatchLater();
const { stars: followedStars } = useStarFollows();
const { notify, requestPermission } = useNotifications();

// Eporner videos
const {
  videos: epornerVideos,
  loading: epornerLoading,
  getPopularVideos,
  loadVideos: loadEpornerVideos,
  searchVideos,
} = useEporner();

// Regular videos (from backend)
const { videos, loadVideos: loadBackendVideos } = useVideos();

// Network quality detection
const { thumbnailDensity, maxThumbnailsPerPage, shouldPreloadThumbnails } = useNetworkQuality();

// Smart recommendations
const { getTrendingByContext, getPersonalized } = useRecommendations();

const trendingVideos = ref([]);
const recentlyAddedVideos = ref([]);
const latestVideos = ref([]);
const indianVideos = ref([]);
const povVideos = ref([]);
const familyVideos = ref([]);
const premiumPreviewVideos = ref([]);
const blurredPreviewVideos = ref([]);

// Premium subscription
const { isPremium, checkPremiumStatus } = useSubscription();

const showLayoutCustomizer = ref(false);
const sidebarOpen = ref(true);

// Sidebar visibility preference
const isSidebarEnabled = ref(true);

// Load sidebar preference
function loadSidebarPreference() {
  const sidebarPref = localStorage.getItem('categorySidebarEnabled');
  isSidebarEnabled.value = sidebarPref !== null ? sidebarPref === 'true' : true;
}

function handleFilterChange(filter) {
  console.log('Filter changed:', filter);
  // Handle filter changes if needed
}
const lastNotifiedAtKey = 'cineflix_last_content_notified';

// Local state
const viewMode = ref("grid");
const showAdvancedFilters = ref(false);
const activeFilters = ref({
  category: '',
  star: '',
  sortBy: 'date',
  dateRange: ''
});

// Enhanced filtered movies with category filter and preferences
const filteredMovies = computed(() => {
  let filtered = movies.value;
  const preferredCategories = getPreferredCategories();

  // Apply category preferences if set (show preferred categories first, then others)
  if (preferredCategories.length > 0 && !activeFilters.value.category) {
    // Sort: preferred categories first
    filtered = [...filtered].sort((a, b) => {
      const aPreferred = preferredCategories.includes(a.category || '');
      const bPreferred = preferredCategories.includes(b.category || '');
      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
      return 0;
    });
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );
  }

  // Category filter from AdvancedSearch
  if (activeFilters.value.category) {
    filtered = filtered.filter((movie) => 
      movie.category === activeFilters.value.category
    );
  }

  // Star filter from AdvancedSearch
  if (activeFilters.value.star) {
    filtered = filtered.filter((movie) => 
      movie.stars && movie.stars.some(star => 
        star.toLowerCase().includes(activeFilters.value.star.toLowerCase())
      )
    );
  }

  // Date range filter
  if (activeFilters.value.dateRange) {
    const now = new Date();
    const filterDate = new Date();
    
    switch (activeFilters.value.dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filtered = filtered.filter((movie) => {
      const movieDate = new Date(movie.createdAt || movie.uploadedAt || 0);
      return movieDate >= filterDate;
    });
  }

  // Sort (handled by useMovies, but we apply here if needed)
  if (sortBy.value === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'date') {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortBy.value === 'popular') {
    filtered = [...filtered].sort((a, b) => {
      const aScore = (a.views || 0) + (a.likes || 0) * 2;
      const bScore = (b.views || 0) + (b.likes || 0) * 2;
      return bScore - aScore;
    });
  }

  return filtered;
});

// Watch for refresh trigger
watch(refreshTrigger, () => {
  loadMovies();
});

// Continue watching
const continueWatching = computed(() => {
  return getContinueWatching();
});

const watchLaterMovies = computed(() =>
  watchLaterItems.value
    .filter((item) => item.type === 'movie')
    .map((saved) => movies.value.find((m) => m._id === saved.id))
    .filter(Boolean)
);

const watchLaterVideos = computed(() =>
  watchLaterItems.value
    .filter((item) => item.type === 'eporner' || item.type === 'video')
    .map((saved) => {
      // Try eporner videos first
      const epornerVideo = epornerVideos.value.find((v) => v.id === saved.id);
      if (epornerVideo) return epornerVideo;
      // Then try backend videos
      if (videos.value && Array.isArray(videos.value)) {
        return videos.value.find((v) => v.id === saved.id || v._id === saved.id);
      }
      return null;
    })
    .filter(Boolean)
);

// Trending movies (most viewed/liked) - network-aware limit with smart recommendations
const trendingMovies = computed(() => {
  const allMovies = [...filteredMovies.value];
  const limit = Math.min(maxThumbnailsPerPage.value, 12);
  
  // Use smart recommendations for trending
  const smartTrending = getTrendingByContext(allMovies, limit);
  if (smartTrending.length > 0) {
    return smartTrending;
  }
  
  // Fallback to simple sorting
  return allMovies
    .sort((a, b) => {
      const aScore = (a.views || 0) + (a.likes || 0) * 2;
      const bScore = (b.views || 0) + (b.likes || 0) * 2;
      return bScore - aScore;
    })
    .slice(0, limit);
});

// Recently added movies - network-aware limit
const recentlyAdded = computed(() => {
  const allMovies = [...filteredMovies.value];
  const limit = Math.min(maxThumbnailsPerPage.value, 12);
  return allMovies
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt || 0);
      const dateB = new Date(b.createdAt || b.uploadedAt || 0);
      return dateB - dateA;
    })
    .slice(0, limit);
});

// Pagination - network-aware items per page
const {
  currentPage,
  totalPages,
  paginatedItems,
  visiblePages,
  goToPage,
  nextPage,
  prevPage,
} = usePagination(filteredMovies, maxThumbnailsPerPage);

// Reset to page 1 when filteredMovies changes (search/filter)
watch(filteredMovies, () => {
  if (currentPage.value > 1) {
    currentPage.value = 1;
  }
});

// Unique categories for filter dropdown
const uniqueCategories = computed(() => {
  const categories = new Set();
  movies.value.forEach(movie => {
    if (movie.category) {
      categories.add(movie.category);
    }
  });
  return Array.from(categories).sort();
});

// Unique stars for filter dropdown
const uniqueStars = computed(() => {
  const starsSet = new Set();
  movies.value.forEach(movie => {
    if (movie.stars && Array.isArray(movie.stars)) {
      movie.stars.forEach(star => {
        if (star && star.trim()) {
          starsSet.add(star.trim());
        }
      });
    }
  });
  return Array.from(starsSet).sort();
});

// Personalized movies based on followed stars
// Personalized by followed stars - enhanced with smart recommendations
const personalizedByStars = computed(() => {
  const allItems = [
    ...movies.value,
    ...epornerVideos.value,
    ...(videos.value || [])
  ];
  
  // Use smart personalized recommendations
  const smartPersonalized = getPersonalized(allItems, 12);
  if (smartPersonalized.length > 0) {
    return smartPersonalized;
  }
  
  // Fallback to simple star filtering
  if (!followedStars.value.length) return [];
  return movies.value
    .filter(
      (movie) =>
        Array.isArray(movie.stars) &&
        movie.stars.some((star) => followedStars.value.includes(star))
    )
    .slice(0, 12);
});

// Apply filters from AdvancedSearch component
function handleFilter(filters) {
  activeFilters.value = { ...filters };
  // Update sortBy if changed
  if (filters.sortBy) {
    sortBy.value = filters.sortBy;
  }
}

// Methods
function sortMovies() {
  // Sorting is handled by computed property
}

function navigateToMovie(movie) {
  // Navigate to watch page with movie ID
  router.push(`/watch/${movie._id}`);
}

function navigateToVideo(video) {
  // Navigate to watch page with video ID and eporner source
  router.push(`/watch/${video.id}?source=eporner`);
}

function handlePremiumVideoClick(video, event) {
  // ALWAYS prevent default behavior and stop all propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  
  // FORCE redirect to premium page - NO other navigation allowed in this section
  console.log('Premium section: All clicks blocked, redirecting to /premium');
  router.push('/premium').catch(() => {});
  return false;
}

function getDefaultThumbnail(video) {
  return video?.thumbnail || 'https://via.placeholder.com/320x180/1a1a2e/ffffff?text=Video';
}


function getStartIndex() {
  const perPage = maxThumbnailsPerPage.value || 12;
  return (currentPage.value - 1) * perPage + 1;
}

function getEndIndex() {
  const perPage = maxThumbnailsPerPage.value || 12;
  return Math.min(currentPage.value * perPage, filteredMovies.value.length);
}

function getMovieById(id) {
  return movies.value.find(m => m._id === id) || {};
}

function clearContinueWatching() {
  if (confirm('Clear continue watching history?')) {
    const history = getContinueWatching();
    history.forEach(item => {
      // Reset progress to 0 or remove from history
      // For now, we'll just clear all history
    });
    clearHistory();
  }
}

function pickRandom() {
  if (filteredMovies.value.length === 0) return;
  const randomIndex = Math.floor(Math.random() * filteredMovies.value.length);
  const randomMovie = filteredMovies.value[randomIndex];
  navigateToMovie(randomMovie);
}

// Load Eporner videos - network-aware limits
async function loadEpornerSections() {
  try {
    const limit = Math.min(maxThumbnailsPerPage.value, 12);
    
    // Load trending videos (Most Popular)
    await getPopularVideos(1);
    trendingVideos.value = epornerVideos.value.slice(0, limit);
    
    // Load recently added videos (Latest)
    await loadEpornerVideos(1);
    recentlyAddedVideos.value = epornerVideos.value.slice(0, limit);
    
    // Load latest videos for "Trending Now" section
    await searchVideos('all', 1, { perPage: limit, order: 'latest' });
    latestVideos.value = epornerVideos.value.slice(0, limit);
    
    // Load Indian category videos
    await searchVideos('indian', 1, { perPage: limit * 2, order: 'most-popular' });
    indianVideos.value = epornerVideos.value
      .filter(video => {
        // Check if video has "indian" in categories, title, or tags
        const categories = video.categories || [];
        const title = (video.title || '').toLowerCase();
        const tags = (video.tags || []).map(t => t.toLowerCase());
        return categories.some(cat => cat.toLowerCase().includes('indian')) ||
               title.includes('indian') ||
               tags.some(tag => tag.includes('indian'));
      })
      .slice(0, limit);
    
    // Load POV category videos (recent)
    await searchVideos('pov', 1, { perPage: limit * 2, order: 'latest' });
    povVideos.value = epornerVideos.value
      .filter(video => {
        // Check if video has "pov" in categories, title, or tags
        const categories = video.categories || [];
        const title = (video.title || '').toLowerCase();
        const tags = (video.tags || []).map(t => t.toLowerCase());
        return categories.some(cat => cat.toLowerCase().includes('pov')) ||
               title.includes('pov') ||
               tags.some(tag => tag.includes('pov'));
      })
      .slice(0, limit);
    
    // Load Family category videos (recent)
    await searchVideos('family', 1, { perPage: limit * 2, order: 'latest' });
    familyVideos.value = epornerVideos.value
      .filter(video => {
        // Check if video has "family" in categories, title, or tags
        const categories = video.categories || [];
        const title = (video.title || '').toLowerCase();
        const tags = (video.tags || []).map(t => t.toLowerCase());
        return categories.some(cat => cat.toLowerCase().includes('family')) ||
               title.includes('family') ||
               tags.some(tag => tag.includes('family'));
      })
      .slice(0, limit);
    
    // Load Premium preview videos (blurred for non-premium users)
    await searchVideos('premium', 1, { perPage: limit, order: 'most-popular' });
    premiumPreviewVideos.value = epornerVideos.value
      .filter(video => video.isPremium || video.tags?.includes('premium'))
      .slice(0, limit);
    
    // If no premium videos, use regular videos with blur effect for hype
    if (!premiumPreviewVideos.value || premiumPreviewVideos.value.length === 0) {
      // Get popular/trending videos and use them as blurred preview
      const allVideos = [
        ...(latestVideos.value || []), 
        ...(trendingVideos.value || []), 
        ...(recentlyAddedVideos.value || []),
        ...(epornerVideos.value || [])
      ];
      // Remove duplicates and get unique videos
      const uniqueVideos = Array.from(
        new Map(allVideos.filter(v => v && v.id).map(v => [v.id, v])).values()
      );
      blurredPreviewVideos.value = uniqueVideos
        .filter(video => video && video.thumbnail && video.title)
        .slice(0, 12); // Show 12 blurred videos
    } else {
      // Clear blurred videos if premium videos are available
      blurredPreviewVideos.value = [];
    }
  } catch (error) {
    console.error('Error loading Eporner videos:', error);
  }
}

function latestContentTimestamp() {
  const movieNewest = movies.value[0]?.createdAt
    ? new Date(movies.value[0].createdAt).getTime()
    : 0;
  const epornerNewest = latestVideos.value[0]?.added
    ? new Date(latestVideos.value[0].added).getTime()
    : 0;
  return Math.max(movieNewest, epornerNewest);
}

async function maybeNotifyNewContent() {
  const lastSeen = Number(localStorage.getItem(lastNotifiedAtKey) || 0);
  const newest = latestContentTimestamp();
  if (!newest || newest <= lastSeen) return;
  const permission = await requestPermission();
  if (permission !== 'granted') return;
  await notify('New videos just dropped', {
    body: 'Tap to open the latest additions.',
  });
  localStorage.setItem(lastNotifiedAtKey, String(newest));
}


onMounted(() => {
  loadSidebarPreference();
  loadMovies();
  loadBackendVideos();
  loadEpornerSections();
  maybeNotifyNewContent();
  checkPremiumStatus();
  checkPremiumStatus();

  const section = route.query.section;
  if (section) {
    scrollToSection(section);
  }

  // Listen for preference changes
  window.addEventListener('sidebarPreferenceChanged', (e) => {
    isSidebarEnabled.value = e.detail.enabled;
  });
});

watch(
  () => route.query.section,
  (section) => {
    if (section) {
      scrollToSection(section);
    }
  }
);

function scrollToSection(section) {
  const id =
    section === "watch-later"
      ? "watch-later-section"
      : section === "followed-stars"
      ? "followed-stars-section"
      : "";
  if (!id) return;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
</script>

<style scoped>
.layout-customizer-btn-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.layout-customizer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
  transition: all 0.3s ease;
}

.layout-customizer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.5);
}

.layout-customizer-btn:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 6px;
}

.view-all-link:hover {
  background: rgba(255, 69, 0, 0.1);
  color: var(--primary);
  transform: translateX(4px);
}

.view-all-link svg {
  transition: transform 0.3s ease;
}

.view-all-link:hover svg {
  transform: translateX(2px);
}

/* Home Page Container with Sidebar */
.home-page-container {
  display: flex;
  position: relative;
  align-items: flex-start;
  gap: 0;
}

.home-content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1024px) {
  .home-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .layout-customizer-btn-container {
    bottom: 80px;
    right: 16px;
  }

  .layout-customizer-btn {
    padding: 10px 16px;
    font-size: 12px;
  }

  .layout-customizer-btn span {
    display: none;
  }
}
</style>
