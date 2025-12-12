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
              <router-link to="/home" @click="closeMobileMenu">
                <Film :size="24" class="navbar-logo-icon" />
                <span class="navbar-logo-text">MovieHub</span>
              </router-link>
            </div>
            <ul class="navbar-nav">
              <li class="navbar-nav-item">
                <router-link
                  to="/home"
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
                  to="/japanese"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Languages :size="16" />
                  <span>Japanese</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <router-link
                  to="/indian"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Languages :size="16" />
                  <span>Indian</span>
                </router-link>
              </li>
              <!-- Categories temporarily hidden -->
              <!--
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
              -->
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
            <!-- User Menu (if logged in) -->
            <div v-if="isAuthenticated" class="user-menu-wrapper">
              <button
                class="user-menu-btn"
                @click="toggleUserMenu"
                title="Account"
                :class="{ active: userMenuOpen }"
              >
                <div class="user-avatar-circle">
                  <img
                    v-if="user?.avatar"
                    :src="user.avatar"
                    :alt="user?.name || 'User'"
                    class="user-avatar-img"
                  />
                  <User v-else :size="18" class="user-avatar-icon" />
                </div>
                <span class="user-name">{{
                  user?.name?.split(" ")[0] || "User"
                }}</span>
                <ChevronDown
                  :size="16"
                  class="chevron-icon"
                  :class="{ rotated: userMenuOpen }"
                />
              </button>
              <Transition name="dropdown">
                <div v-if="userMenuOpen" class="user-menu-dropdown" @click.stop>
                  <div class="user-menu-header">
                    <div class="user-menu-avatar">
                      <img
                        v-if="user?.avatar"
                        :src="user.avatar"
                        :alt="user?.name || 'User'"
                        class="user-menu-avatar-img"
                      />
                      <div v-else class="user-menu-avatar-placeholder">
                        <User :size="32" />
                      </div>
                    </div>
                    <div class="user-menu-info">
                      <span class="user-menu-name">{{
                        user?.name || "User"
                      }}</span>
                      <span class="user-menu-email">{{ user?.email }}</span>
                    </div>
                  </div>
                  <div class="user-menu-divider"></div>
                  <router-link
                    to="/dashboard"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <Layout :size="18" />
                    <span>Dashboard</span>
                  </router-link>
                  <router-link
                    to="/dashboard?tab=profile"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <User :size="18" />
                    <span>My Profile</span>
                  </router-link>
                  <router-link
                    to="/dashboard?tab=settings"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <Settings :size="18" />
                    <span>Settings</span>
                  </router-link>
                  <router-link
                    to="/dashboard?tab=subscription"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <Crown :size="18" />
                    <span>Subscription</span>
                  </router-link>
                  <router-link
                    to="/premium"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <Crown :size="18" />
                    <span>Premium</span>
                  </router-link>
                  <div class="user-menu-divider"></div>
                  <button
                    class="user-menu-item logout-item"
                    @click="handleLogout"
                  >
                    <LogOut :size="18" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </Transition>
            </div>
            <!-- Login Button (if not logged in and not admin) -->
            <router-link
              v-if="!isAuthenticated && !isAdminLoggedIn"
              to="/login"
              class="navbar-btn login-btn"
              title="Sign In"
            >
              <LogIn :size="18" />
              <span>Sign In</span>
            </router-link>
            <!-- Watch Later Badge -->
            <!-- <router-link
              to="/home"
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
            to="/home"
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
            to="/japanese"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Languages :size="20" />
            <span>Japanese</span>
          </router-link>
          <router-link
            to="/indian"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Languages :size="20" />
            <span>Indian</span>
          </router-link>
          <!-- Categories temporarily hidden
          <router-link
            to="/categories"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <FolderOpen :size="20" />
            <span>Categories</span>
          </router-link>
          -->
          <router-link
            to="/premium"
            class="mobile-menu-link premium-nav-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Crown :size="20" />
            <span>Premium</span>
          </router-link>

          <!-- Category Sidebar Content for Mobile -->
          <div class="mobile-menu-divider"></div>

          <!-- Featured Category -->
          <div class="mobile-menu-section">
            <h3 class="mobile-menu-section-header">CATEGORIES</h3>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', 'mobile-featured-item-divider', { active: route.path === '/double-penetration' }]"
              @click="navigateToMobileDoublePenetration"
            >
              <span>Double Penetration</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', 'mobile-featured-item-divider', { active: route.path === '/amateur' }]"
              @click="navigateToMobileAmateur"
            >
              <span>Amateur</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/anal' }]"
              @click="navigateToMobileAnal"
            >
              <span>Anal</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/asian' }]"
              @click="navigateToMobileAsian"
            >
              <span>Asian</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/bdsm' }]"
              @click="navigateToMobileBdsm"
            >
              <span>BDSM</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/big-ass' }]"
              @click="navigateToMobileBigAss"
            >
              <span>Big Ass</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/big-dick' }]"
              @click="navigateToMobileBigDick"
            >
              <span>Big Dick</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/big-tits' }]"
              @click="navigateToMobileBigTits"
            >
              <span>Big Tits</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/bisexual' }]"
              @click="navigateToMobileBisexual"
            >
              <span>Bisexual</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/blonde' }]"
              @click="navigateToMobileBlonde"
            >
              <span>Blonde</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/blowjob' }]"
              @click="navigateToMobileBlowjob"
            >
              <span>Blowjob</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/brunette' }]"
              @click="navigateToMobileBrunette"
            >
              <span>Brunette</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/bukkake' }]"
              @click="navigateToMobileBukkake"
            >
              <span>Bukkake</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/creampie' }]"
              @click="navigateToMobileCreampie"
            >
              <span>Creampie</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/cumshot' }]"
              @click="navigateToMobileCumshot"
            >
              <span>Cumshot</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/ebony' }]"
              @click="navigateToMobileEbony"
            >
              <span>Ebony</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/for-women' }]"
              @click="navigateToMobileForWomen"
            >
              <span>For Women</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/group-sex' }]"
              @click="navigateToMobileGroupSex"
            >
              <span>Group Sex</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/handjob' }]"
              @click="navigateToMobileHandjob"
            >
              <span>Handjob</span>
            </button>
            <button
              :class="['mobile-menu-link', 'mobile-menu-button', 'mobile-featured-item', { active: route.path === '/hardcore' }]"
              @click="navigateToMobileHardcore"
            >
              <span>Hardcore</span>
            </button>
          </div>

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
                <router-link to="/home" class="footer-link">Home</router-link>
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
import { ref, onMounted, onUnmounted, computed, inject, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMovies } from "../composables/useMovies";
import { useEporner } from "../composables/useEporner";
import {
  Film,
  Search,
  RefreshCw,
  Home,
  TrendingUp,
  Languages,
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
  LogIn,
  Layout,
  ChevronDown,
  RotateCcw,
  Play,
  ThumbsUp,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import PreferencesModal from "../components/PreferencesModal.vue";
import AccessibilitySettings from "../components/AccessibilitySettings.vue";
import PWAInstallPrompt from "../components/PWAInstallPrompt.vue";
import BadgeCount from "../components/BadgeCount.vue";
import { useAccessibility } from "../composables/useAccessibility";
import { useBadgeCounts } from "../composables/useBadgeCounts";
import { usePushNotifications } from "../composables/usePushNotifications";
import { useAuth } from "../composables/useAuth";

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

// User authentication
const { user, isAuthenticated, logout: authLogout, checkAuth } = useAuth();
const userMenuOpen = ref(false);

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
  if (userMenuOpen.value) {
    adminMenuOpen.value = false;
  }
}

function closeUserMenu() {
  userMenuOpen.value = false;
}

async function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    await authLogout();
    closeUserMenu();
  }
}
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

// Mobile category sidebar state
const selectedMobileTopNav = ref(null);
const selectedMobileProduction = ref("all");
const selectedMobileCategory = ref("all");
const mobileCategories = ref([]);
const loadingMobileCategories = ref(false);
const mobileCategoryCurrentPage = ref(1);
const mobileCategoryTotalPages = ref(1);
const mobileCategoryLimit = 20;

// Mobile top navigation items
const mobileTopNavItems = [
  { id: "history", label: "History", icon: RotateCcw },
  { id: "newest", label: "Newest videos", icon: Play },
  { id: "best", label: "Best Videos", icon: ThumbsUp },
  { id: "top-rated", label: "Top rated", icon: Star },
  { id: "most-viewed", label: "Most viewed", icon: Eye },
];

// Mobile production items
const mobileProductionItems = ref([
  { id: "all", label: "All", count: 0 },
  { id: "professional", label: "Professional", count: 0 },
  { id: "homemade", label: "Homemade", count: 0 },
]);

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

// Watch for auth state changes to update UI immediately
watch(
  isAuthenticated,
  async (newValue) => {
    if (newValue) {
      // User just logged in, refresh auth state
      await checkAuth();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  checkAdminStatus();
  // Check admin status periodically
  const interval = setInterval(checkAdminStatus, 1000);
  window._adminStatusInterval = interval;

  // Check auth status on mount to ensure UI updates
  await checkAuth();

  // Load production counts for mobile
  try {
    const { videosApi } = await import("../api/videos");
    const response = await videosApi.getAll({ limit: 1 });
    const total = response.data?.total || response.data?.totalCount || 0;
    mobileProductionItems.value[0].count = total;
    mobileProductionItems.value[1].count = Math.floor(total * 0.7);
    mobileProductionItems.value[2].count = Math.floor(total * 0.3);
  } catch (error) {
    // Ignore errors
  }

  // Initialize push notifications if supported and logged in
  if (
    pushSupported.value &&
    (localStorage.getItem("cineflix_auth_token") ||
      localStorage.getItem("adminToken"))
  ) {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      await subscribe();
    }
  }

  // Close admin menu and user menu when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest(".profile-menu-wrapper")) {
      adminMenuOpen.value = false;
    }
    if (!event.target.closest(".user-menu-wrapper")) {
      userMenuOpen.value = false;
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
    // Load categories when menu opens
    if (mobileCategories.value.length === 0) {
      loadMobileCategories(1);
    }
  } else {
    document.body.style.overflow = "";
  }
}

// Mobile category functions
async function loadMobileCategories(page = 1) {
  loadingMobileCategories.value = true;
  try {
    const { videosApi } = await import("../api/videos");
    const response = await videosApi.getAll({
      page,
      limit: mobileCategoryLimit,
    });

    const categoryMap = new Map();
    const videos =
      response.data?.data || response.data?.videos || response.data || [];

    videos.forEach((video) => {
      if (video.categories && Array.isArray(video.categories)) {
        video.categories.forEach((cat) => {
          if (cat && cat.trim()) {
            const catName = cat.trim();
            if (!categoryMap.has(catName)) {
              categoryMap.set(catName, { name: catName, count: 0 });
            }
            categoryMap.get(catName).count++;
          }
        });
      }
    });

    mobileCategories.value = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const total =
      response.data?.total || response.data?.totalCount || videos.length;
    mobileCategoryTotalPages.value =
      Math.ceil(total / mobileCategoryLimit) || 1;
    mobileCategoryCurrentPage.value = page;
  } catch (error) {
    console.error("Failed to load mobile categories:", error);
    mobileCategories.value = [];
  } finally {
    loadingMobileCategories.value = false;
  }
}

function loadMobileCategoryPage(page) {
  if (page >= 1 && page <= mobileCategoryTotalPages.value) {
    loadMobileCategories(page);
  }
}

function formatMobileCount(count) {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function handleMobileTopNav(id) {
  selectedMobileTopNav.value = selectedMobileTopNav.value === id ? null : id;
  selectedMobileProduction.value = "all";
  selectedMobileCategory.value = "all";

  if (id === "newest") {
    router.push("/videos?order=latest");
  } else if (id === "best") {
    router.push("/videos?order=most-popular");
  } else if (id === "top-rated") {
    router.push("/videos?order=top-rated");
  } else if (id === "most-viewed") {
    router.push("/videos?order=most-popular");
  } else if (id === "history") {
    router.push("/dashboard?tab=history");
  }

  closeMobileMenu();
}

function handleMobileProduction(id) {
  selectedMobileProduction.value = id;
  selectedMobileCategory.value = "all";
  selectedMobileTopNav.value = null;

  const query = id === "all" ? "all" : id;
  searchVideos(query, 1, { order: "most-popular" });
  router.push(`/videos?q=${encodeURIComponent(query)}`);
  closeMobileMenu();
}

function handleMobileCategory(categoryName) {
  selectedMobileCategory.value = categoryName;
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;

  const query = categoryName === "all" ? "all" : categoryName;
  searchVideos(query, 1, { order: "most-popular" });
  router.push(`/videos?q=${encodeURIComponent(query)}`);
  closeMobileMenu();
}

function navigateToMobileDoublePenetration() {
  selectedMobileCategory.value = "double penetration";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/double-penetration");
  closeMobileMenu();
}

function navigateToMobileAmateur() {
  selectedMobileCategory.value = "amateur";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/amateur");
  closeMobileMenu();
}

function navigateToMobileAnal() {
  selectedMobileCategory.value = "anal";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/anal");
  closeMobileMenu();
}

function navigateToMobileAsian() {
  selectedMobileCategory.value = "asian";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/asian");
  closeMobileMenu();
}

function navigateToMobileBdsm() {
  selectedMobileCategory.value = "bdsm";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/bdsm");
  closeMobileMenu();
}

function navigateToMobileBigAss() {
  selectedMobileCategory.value = "big ass";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/big-ass");
  closeMobileMenu();
}

function navigateToMobileBigDick() {
  selectedMobileCategory.value = "big dick";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/big-dick");
  closeMobileMenu();
}

function navigateToMobileBigTits() {
  selectedMobileCategory.value = "big tits";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/big-tits");
  closeMobileMenu();
}

function navigateToMobileBisexual() {
  selectedMobileCategory.value = "bisexual";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/bisexual");
  closeMobileMenu();
}

function navigateToMobileBlonde() {
  selectedMobileCategory.value = "blonde";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/blonde");
  closeMobileMenu();
}

function navigateToMobileBlowjob() {
  selectedMobileCategory.value = "blowjob";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/blowjob");
  closeMobileMenu();
}

function navigateToMobileBrunette() {
  selectedMobileCategory.value = "brunette";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/brunette");
  closeMobileMenu();
}

function navigateToMobileBukkake() {
  selectedMobileCategory.value = "bukkake";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/bukkake");
  closeMobileMenu();
}

function navigateToMobileCreampie() {
  selectedMobileCategory.value = "creampie";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/creampie");
  closeMobileMenu();
}

function navigateToMobileCumshot() {
  selectedMobileCategory.value = "cumshot";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/cumshot");
  closeMobileMenu();
}

function navigateToMobileEbony() {
  selectedMobileCategory.value = "ebony";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/ebony");
  closeMobileMenu();
}

function navigateToMobileForWomen() {
  selectedMobileCategory.value = "for women";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/for-women");
  closeMobileMenu();
}

function navigateToMobileGroupSex() {
  selectedMobileCategory.value = "group sex";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/group-sex");
  closeMobileMenu();
}

function navigateToMobileHandjob() {
  selectedMobileCategory.value = "handjob";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/handjob");
  closeMobileMenu();
}

function navigateToMobileHardcore() {
  selectedMobileCategory.value = "hardcore";
  selectedMobileProduction.value = "all";
  selectedMobileTopNav.value = null;
  router.push("/hardcore");
  closeMobileMenu();
}

// Load production counts for mobile
onMounted(async () => {
  try {
    const { videosApi } = await import("../api/videos");
    const response = await videosApi.getAll({ limit: 1 });
    const total = response.data?.total || response.data?.totalCount || 0;
    mobileProductionItems.value[0].count = total;
    mobileProductionItems.value[1].count = Math.floor(total * 0.7);
    mobileProductionItems.value[2].count = Math.floor(total * 0.3);
  } catch (error) {
    // Ignore errors
  }
});
</script>
