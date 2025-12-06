<template>
  <div class="app-container">
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="skip-to-main" @click.prevent="skipToMain">
      Skip to main content
    </a>
    <main id="main-content" class="main-content" role="main">
      <!-- Top Navbar -->
      <nav v-if="!isAdminRoute" class="navbar">
        <div class="navbar-container">
          <div class="navbar-left">
            <button
              class="navbar-btn mobile-menu-btn"
              @click="toggleMobileMenu"
              title="Menu"
            >
              <Menu v-if="!mobileMenuOpen" :size="20" />
              <X v-else :size="20" />
            </button>
            <div class="navbar-logo">
              <router-link to="/" @click="closeMobileMenu">
                <Film :size="24" class="navbar-logo-icon" />
                <span class="navbar-logo-text">MovieHub</span>
              </router-link>
            </div>
            <ul class="navbar-nav">
              <li class="navbar-nav-item">
                <router-link
                  to="/"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Home :size="16" />
                  <span>Home</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <router-link
                  to="/videos"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <TrendingUp :size="16" />
                  <span>Videos</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <router-link
                  to="/categories"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <FolderOpen :size="16" />
                  <span>Categories</span>
                </router-link>
              </li>
              <!-- <li class="navbar-nav-item">
                <router-link
                  to="/stories"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Heart :size="16" />
                  <span>Stories</span>
                </router-link>
              </li> -->
              <li class="navbar-nav-item">
                <router-link
                  to="/playlists"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <ListMusic :size="16" />
                  <span>Playlists</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <router-link
                  to="/premium"
                  class="navbar-link premium-nav-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Crown :size="16" />
                  <span>Premium</span>
                </router-link>
              </li>
            </ul>
          </div>

          <div class="navbar-center">
            <div
              class="navbar-search"
              :class="{
                'has-suggestions': showSuggestions && suggestions.length > 0,
              }"
            >
              <Search :size="18" class="search-icon" />
              <input
                type="text"
                placeholder="Search movies and videos..."
                class="search-input"
                :value="modelValue"
                @input="handleSearchInput"
                @focus="showSuggestions = true"
                @blur="handleBlur"
                @keydown.enter="handleSearch"
                @keydown.down.prevent="navigateSuggestions(1)"
                @keydown.up.prevent="navigateSuggestions(-1)"
                ref="searchInput"
              />
              <!-- Search Suggestions Dropdown -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="search-suggestions"
              >
                <div
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  class="suggestion-item"
                  :class="{ active: selectedIndex === index }"
                  @mousedown="selectSuggestion(suggestion)"
                  @mouseenter="selectedIndex = index"
                >
                  <Search :size="14" />
                  <span class="suggestion-title">{{
                    suggestion.title || suggestion
                  }}</span>
                  <span v-if="suggestion.type" class="suggestion-type">{{
                    suggestion.type
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="navbar-right">
            <!-- Watch Later Badge -->
            <!-- <router-link
              to="/"
              class="navbar-btn badge-wrapper"
              title="Watch Later"
              aria-label="Watch Later"
            >
              <Clock :size="20" />
              <BadgeCount :count="watchLaterCount" />
            </router-link> -->
            <!-- Followed Stars badge -> Home anchor -->
            <!-- <router-link
              to="/?section=followed-stars"
              class="navbar-btn badge-wrapper"
              title="My Followed Stars"
              aria-label="My Followed Stars"
            >
              <Star :size="20" />
              <BadgeCount :count="followedStarsCount" />
            </router-link> -->
            <button
              class="navbar-btn preferences-btn"
              @click="showPreferences = true"
              title="Preferences"
              aria-label="Open preferences"
            >
              <Settings :size="20" />
            </button>
            <button
              class="navbar-btn accessibility-btn"
              @click="showAccessibility = true"
              title="Accessibility Settings"
              aria-label="Open accessibility settings"
            >
              <Accessibility :size="20" />
            </button>
            <button
              class="navbar-btn refresh-btn"
              @click="$emit('refresh')"
              title="Refresh"
            >
              <RefreshCw :size="20" />
            </button>
            <!-- Admin Profile Menu (if logged in) -->
            <div v-if="isAdminLoggedIn" class="profile-menu-wrapper">
              <button
                class="profile-menu-btn"
                @click="toggleAdminMenu"
                title="Admin Menu"
              >
                <User :size="20" />
              </button>
              <div v-if="adminMenuOpen" class="profile-menu-dropdown">
                <div class="profile-menu-header">
                  <div class="profile-menu-avatar">
                    <Shield :size="18" />
                  </div>
                  <div class="profile-menu-info">
                    <span class="profile-menu-name">{{
                      adminId || "Admin"
                    }}</span>
                    <span class="profile-menu-role">Administrator</span>
                  </div>
                </div>
                <div class="profile-menu-divider"></div>
                <router-link
                  to="/admin/panel"
                  class="profile-menu-item"
                  @click="closeAdminMenu"
                >
                  <Shield :size="16" />
                  <span>Admin Panel</span>
                </router-link>
                <button
                  class="profile-menu-item logout-item"
                  @click="handleAdminLogout"
                >
                  <LogOut :size="16" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <!-- Admin Login Link (if not logged in) -->
            <router-link
              v-else
              to="/admin/login"
              class="navbar-link admin-link"
              style="display: none"
            >
              <Shield :size="16" />
              <span>Admin</span>
            </router-link>
            <!-- <button
              class="navbar-btn add-movie-btn"
              @click="$emit('addMovie')"
            >
              <span class="btn-text">Add Movie</span>
            </button> -->
          </div>
        </div>
      </nav>

      <!-- Mobile Menu Overlay -->
      <div
        class="mobile-menu-overlay"
        :class="{ active: mobileMenuOpen }"
        @click="closeMobileMenu"
      ></div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
        <div class="mobile-menu-header">
          <div class="mobile-menu-logo">
            <Film :size="24" />
            <span>MovieHub</span>
          </div>
          <button class="mobile-menu-close" @click="closeMobileMenu">
            <X :size="24" />
          </button>
        </div>
        <nav class="mobile-menu-nav">
          <router-link
            to="/"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Home :size="20" />
            <span>Home</span>
          </router-link>
          <router-link
            to="/videos"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <TrendingUp :size="20" />
            <span>Videos</span>
          </router-link>
          <router-link
            to="/categories"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <FolderOpen :size="20" />
            <span>Categories</span>
          </router-link>
          <router-link
            to="/premium"
            class="mobile-menu-link premium-nav-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Crown :size="20" />
            <span>Premium</span>
          </router-link>
          <!-- <router-link
            to="/stories"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Heart :size="20" />
            <span>Stories</span>
          </router-link> -->
          <router-link
            v-if="isAdminLoggedIn"
            to="/admin/panel"
            class="mobile-menu-link"
            @click="closeMobileMenu"
          >
            <Shield :size="20" />
            <span>Admin Panel</span>
          </router-link>
          <!-- <router-link
            v-else
            to="/admin/login"
            class="mobile-menu-link"
            @click="closeMobileMenu"
          >
            <Shield :size="20" />
            <span>Admin</span>
          </router-link> -->
        </nav>
      </div>

      <!-- Router View -->
      <router-view />
    </main>

    <!-- Preferences Modal -->
    <PreferencesModal
      :show="showPreferences"
      :categories="availableCategories"
      @close="showPreferences = false"
    />

    <!-- Accessibility Settings -->
    <AccessibilitySettings
      :show="showAccessibility"
      @close="showAccessibility = false"
    />

    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />

    <!-- Footer -->
    <footer v-if="!isAdminRoute" class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <Film :size="32" class="footer-logo-icon" />
              <span class="footer-logo-text">MovieHub</span>
            </div>
            <p class="footer-description">
              Your ultimate destination for streaming movies and videos.
              Discover, watch, and enjoy your favorite content.
            </p>
            <div class="footer-social">
              <a href="#" class="social-link" title="Facebook">
                <Facebook :size="20" />
              </a>
              <a href="#" class="social-link" title="Twitter">
                <Twitter :size="20" />
              </a>
              <a href="#" class="social-link" title="Instagram">
                <Instagram :size="20" />
              </a>
              <a href="#" class="social-link" title="YouTube">
                <Youtube :size="20" />
              </a>
            </div>
          </div>

          <div class="footer-section">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-links">
              <li>
                <router-link to="/" class="footer-link">Home</router-link>
              </li>
              <li>
                <router-link to="/videos" class="footer-link"
                  >Videos</router-link
                >
              </li>
              <li>
                <router-link to="/categories" class="footer-link"
                  >Categories</router-link
                >
              </li>
              <li>
                <router-link to="/playlists" class="footer-link"
                  >Playlists</router-link
                >
              </li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-title">Legal</h3>
            <ul class="footer-links">
              <li>
                <router-link to="/privacy" class="footer-link"
                  >Privacy Policy</router-link
                >
              </li>
              <li>
                <router-link to="/terms" class="footer-link"
                  >Terms of Service</router-link
                >
              </li>
              <li>
                <router-link to="/cookies" class="footer-link"
                  >Cookie Policy</router-link
                >
              </li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-title">About</h3>
            <ul class="footer-links">
              <li>
                <router-link to="/about" class="footer-link"
                  >About Us</router-link
                >
              </li>
              <li>
                <router-link to="/contact" class="footer-link"
                  >Contact Us</router-link
                >
              </li>
              <li>
                <router-link to="/help" class="footer-link"
                  >Help Center</router-link
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">© 2025 MovieHub. All rights reserved.</p>
          <div class="footer-bottom-links">
            <router-link to="/privacy" class="footer-bottom-link"
              >Privacy</router-link
            >
            <span class="footer-separator">|</span>
            <router-link to="/terms" class="footer-bottom-link"
              >Terms</router-link
            >
            <span class="footer-separator">|</span>
            <router-link to="/cookies" class="footer-bottom-link"
              >Cookies</router-link
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMovies } from "../composables/useMovies";
import { useEporner } from "../composables/useEporner";
import {
  Film,
  Search,
  RefreshCw,
  Home,
  TrendingUp,
  Image,
  FolderOpen,
  Star,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  Shield,
  User,
  LogOut,
  Settings,
  Accessibility,
  Clock,
  ListMusic,
  Crown,
} from "lucide-vue-next";
import PreferencesModal from "../components/PreferencesModal.vue";
import AccessibilitySettings from "../components/AccessibilitySettings.vue";
import PWAInstallPrompt from "../components/PWAInstallPrompt.vue";
import BadgeCount from "../components/BadgeCount.vue";
import { useAccessibility } from "../composables/useAccessibility";
import { useBadgeCounts } from "../composables/useBadgeCounts";
import { usePushNotifications } from "../composables/usePushNotifications";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "refresh", "addMovie"]);

const mobileMenuOpen = ref(false);
const adminMenuOpen = ref(false);
const isAdminLoggedIn = ref(false);
const adminId = ref("");
const showPreferences = ref(false);
const showAccessibility = ref(false);
const { skipToMain } = useAccessibility();
const { watchLaterCount, followedStarsCount } = useBadgeCounts();
const {
  subscribe,
  requestPermission,
  isSupported: pushSupported,
} = usePushNotifications();

// Get available categories for preferences
const availableCategories = computed(() => {
  const categories = new Set();
  movies.value.forEach((movie) => {
    if (movie.category) {
      categories.add(movie.category);
    }
  });
  return Array.from(categories).sort();
});

// Search autocomplete
const searchQuery = inject("searchQuery", ref(""));
const { movies, loadMovies } = useMovies(searchQuery);
const { videos: epornerVideos, searchVideos } = useEporner();
const showSuggestions = ref(false);
const suggestions = ref([]);
const selectedIndex = ref(-1);
const searchInput = ref(null);

// Load movies and videos on mount for autocomplete
onMounted(async () => {
  await loadMovies();
  // Load some popular videos for autocomplete
  await searchVideos("all", 1, { perPage: 20, order: "most-popular" });
});

// Generate search suggestions from both movies and videos
const generateSuggestions = (query) => {
  if (!query || query.length < 2) {
    suggestions.value = [];
    return;
  }

  const queryLower = query.toLowerCase();
  const suggestionsList = [];

  // Add movie titles
  movies.value.forEach((movie) => {
    if (movie.title && movie.title.toLowerCase().includes(queryLower)) {
      suggestionsList.push({
        title: movie.title,
        type: "Movie",
        id: movie._id,
        source: "movie",
      });
    }
    // Add stars
    if (movie.stars && Array.isArray(movie.stars)) {
      movie.stars.forEach((star) => {
        if (star && star.toLowerCase().includes(queryLower)) {
          suggestionsList.push({
            title: star,
            type: "Star",
            id: movie._id,
            source: "movie",
          });
        }
      });
    }
  });

  // Add Eporner video titles
  epornerVideos.value.forEach((video) => {
    if (video.title && video.title.toLowerCase().includes(queryLower)) {
      suggestionsList.push({
        title: video.title,
        type: "Video",
        id: video.id,
        source: "eporner",
      });
    }
    // Add video categories
    if (video.categories && Array.isArray(video.categories)) {
      video.categories.forEach((cat) => {
        if (cat && cat.toLowerCase().includes(queryLower)) {
          suggestionsList.push({
            title: cat,
            type: "Category",
            id: video.id,
            source: "eporner",
          });
        }
      });
    }
  });

  // Limit to 8 suggestions and remove duplicates
  const seen = new Set();
  suggestions.value = suggestionsList
    .filter((item) => {
      const key = `${item.title}-${item.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
};

const handleSearchInput = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);
  generateSuggestions(value);
  showSuggestions.value = true;
  selectedIndex.value = -1;
};

const selectSuggestion = (suggestion) => {
  const searchText =
    typeof suggestion === "string" ? suggestion : suggestion.title;
  emit("update:modelValue", searchText);
  showSuggestions.value = false;
  suggestions.value = [];

  // Navigate to search results or watch page
  if (typeof suggestion === "object" && suggestion.id) {
    if (suggestion.source === "eporner") {
      router.push(`/watch/${suggestion.id}?source=eporner`);
    } else {
      router.push(`/watch/${suggestion.id}`);
    }
  } else {
    // Navigate to Videos page with search query
    handleSearch();
  }
};

const handleSearch = () => {
  const query = props.modelValue || searchInput.value?.value || "";
  if (query.trim()) {
    showSuggestions.value = false;
    // Navigate to Videos page with search query
    router.push({
      path: "/videos",
      query: { q: query.trim() },
    });
    emit("update:modelValue", "");
    if (searchInput.value) {
      searchInput.value.value = "";
      searchInput.value.blur();
    }
  }
};

const navigateSuggestions = (direction) => {
  if (suggestions.value.length === 0) return;

  selectedIndex.value += direction;

  if (selectedIndex.value < 0) {
    selectedIndex.value = suggestions.value.length - 1;
  } else if (selectedIndex.value >= suggestions.value.length) {
    selectedIndex.value = 0;
  }
};

const handleBlur = () => {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});

onMounted(async () => {
  checkAdminStatus();
  // Check admin status periodically
  const interval = setInterval(checkAdminStatus, 1000);
  window._adminStatusInterval = interval;

  // Initialize push notifications if supported and logged in
  if (
    pushSupported.value &&
    (localStorage.getItem("token") || localStorage.getItem("adminToken"))
  ) {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      await subscribe();
    }
  }

  // Close admin menu when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest(".profile-menu-wrapper")) {
      adminMenuOpen.value = false;
    }
  };
  document.addEventListener("click", handleClickOutside);
  window._adminMenuClickHandler = handleClickOutside;
});

onUnmounted(() => {
  if (window._adminStatusInterval) {
    clearInterval(window._adminStatusInterval);
    delete window._adminStatusInterval;
  }
  if (window._adminMenuClickHandler) {
    document.removeEventListener("click", window._adminMenuClickHandler);
    delete window._adminMenuClickHandler;
  }
});

function checkAdminStatus() {
  const token = localStorage.getItem("adminToken");
  const id = localStorage.getItem("adminId");
  isAdminLoggedIn.value = !!token;
  adminId.value = id || "";
}

function toggleAdminMenu() {
  adminMenuOpen.value = !adminMenuOpen.value;
}

function closeAdminMenu() {
  adminMenuOpen.value = false;
}

function handleAdminLogout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminId");
  isAdminLoggedIn.value = false;
  adminId.value = "";
  adminMenuOpen.value = false;
  router.push("/");
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
  document.body.style.overflow = "";
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}
</script>
