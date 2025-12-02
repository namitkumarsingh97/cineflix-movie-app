<template>
  <div class="app-container">
    <main class="main-content">
      <!-- Top Navbar -->
      <nav class="navbar">
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
                <router-link to="/" class="navbar-link" active-class="active" @click="closeMobileMenu">
                  <Home :size="16" />
                  <span>Home</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <router-link to="/videos" class="navbar-link" active-class="active" @click="closeMobileMenu">
                  <TrendingUp :size="16" />
                  <span>Videos</span>
                </router-link>
              </li>
              <li class="navbar-nav-item">
                <a href="#" class="navbar-link" @click="closeMobileMenu">
                  <FolderOpen :size="16" />
                  <span>Categories</span>
                </a>
              </li>
              <li class="navbar-nav-item">
                <a href="#" class="navbar-link" @click="closeMobileMenu">
                  <Heart :size="16" />
                  <span>Stories</span>
                </a>
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
            <button
              class="navbar-btn add-movie-btn"
              @click="$emit('addMovie')"
            >
              <span class="btn-text">Add Movie</span>
            </button>
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
      <div
        class="mobile-menu"
        :class="{ 'mobile-menu-open': mobileMenuOpen }"
      >
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
          <router-link to="/" class="mobile-menu-link" active-class="active" @click="closeMobileMenu">
            <Home :size="20" />
            <span>Home</span>
          </router-link>
          <router-link to="/videos" class="mobile-menu-link" active-class="active" @click="closeMobileMenu">
            <TrendingUp :size="20" />
            <span>Videos</span>
          </router-link>
          <a href="#" class="mobile-menu-link" @click="closeMobileMenu">
            <FolderOpen :size="20" />
            <span>Categories</span>
          </a>
          <a href="#" class="mobile-menu-link" @click="closeMobileMenu">
            <Heart :size="20" />
            <span>Stories</span>
          </a>
        </nav>
      </div>

      <!-- Router View -->
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
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
import { ref } from 'vue';
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
} from 'lucide-vue-next';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue', 'refresh', 'addMovie']);

const mobileMenuOpen = ref(false);

function closeMobileMenu() {
  mobileMenuOpen.value = false;
  document.body.style.overflow = '';
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
</script>

