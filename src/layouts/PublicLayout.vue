<template>
  <div class="app-container">
    <main class="main-content">
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
              <Film :size="24" class="navbar-logo-icon" />
              <span class="navbar-logo-text">MovieHub</span>
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
              <li class="navbar-nav-item">
                <router-link
                  to="/stories"
                  class="navbar-link"
                  active-class="active"
                  @click="closeMobileMenu"
                >
                  <Heart :size="16" />
                  <span>Stories</span>
                </router-link>
              </li>
            </ul>
          </div>

          <div class="navbar-center">
            <div class="navbar-search">
              <Search :size="18" class="search-icon" />
              <input
                type="text"
                placeholder="Search movies..."
                class="search-input"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
            </div>
          </div>

          <div class="navbar-right">
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
            to="/stories"
            class="mobile-menu-link"
            active-class="active"
            @click="closeMobileMenu"
          >
            <Heart :size="20" />
            <span>Stories</span>
          </router-link>
          <router-link
            v-if="isAdminLoggedIn"
            to="/admin/panel"
            class="mobile-menu-link"
            @click="closeMobileMenu"
          >
            <Shield :size="20" />
            <span>Admin Panel</span>
          </router-link>
          <router-link
            v-else
            to="/admin/login"
            class="mobile-menu-link"
            @click="closeMobileMenu"
          >
            <Shield :size="20" />
            <span>Admin</span>
          </router-link>
        </nav>
      </div>

      <!-- Router View -->
      <router-view />
    </main>

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
              <li><a href="#" class="footer-link">Home</a></li>
              <li><a href="#" class="footer-link">Trending</a></li>
              <li><a href="#" class="footer-link">Categories</a></li>
              <li><a href="#" class="footer-link">Favorites</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-title">Support</h3>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Help Center</a></li>
              <li><a href="#" class="footer-link">Contact Us</a></li>
              <li><a href="#" class="footer-link">Privacy Policy</a></li>
              <li><a href="#" class="footer-link">Terms of Service</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-title">About</h3>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">About Us</a></li>
              <li><a href="#" class="footer-link">Blog</a></li>
              <li><a href="#" class="footer-link">Careers</a></li>
              <li><a href="#" class="footer-link">Newsletter</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">© 2025 MovieHub. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#" class="footer-bottom-link">Privacy</a>
            <span class="footer-separator">|</span>
            <a href="#" class="footer-bottom-link">Terms</a>
            <span class="footer-separator">|</span>
            <a href="#" class="footer-bottom-link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Film,
  Search,
  RefreshCw,
  Home,
  TrendingUp,
  FolderOpen,
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
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue", "refresh", "addMovie"]);

const mobileMenuOpen = ref(false);
const adminMenuOpen = ref(false);
const isAdminLoggedIn = ref(false);
const adminId = ref("");

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

onMounted(() => {
  checkAdminStatus();
  // Check admin status periodically
  const interval = setInterval(checkAdminStatus, 1000);
  window._adminStatusInterval = interval;

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
