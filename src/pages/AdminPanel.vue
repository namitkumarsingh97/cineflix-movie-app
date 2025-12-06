<template>
  <div class="admin-panel-container">
    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <div class="admin-panel-content">
      <div
        class="admin-sidebar"
        :class="{ 'sidebar-open': sidebarOpen }"
      >
        <div class="sidebar-header">
          <router-link to="/" class="sidebar-logo">
            <Shield :size="24" />
            <span>Admin Panel</span>
          </router-link>
          <button
            class="mobile-menu-toggle"
            @click="toggleSidebar"
            title="Toggle Menu"
          >
            <X :size="20" />
          </button>
        </div>
        <nav class="admin-nav">
          <router-link 
            to="/" 
            class="admin-nav-item home-nav-item"
            @click="handleHomeClick"
          >
            <Home :size="20" />
            <span>Back to Home</span>
          </router-link>
          <button
            v-for="item in navItems"
            :key="item.id"
            :class="['admin-nav-item', { active: activeSection === item.id }]"
            @click="changeSection(item.id)"
          >
            <component :is="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
        <div class="sidebar-footer">
          <div class="profile-section">
            <div class="profile-info">
              <div class="profile-avatar">
                <User :size="20" />
              </div>
              <div class="profile-details">
                <span class="profile-name">{{ adminName || 'Admin' }}</span>
                <span class="profile-role">Administrator</span>
              </div>
            </div>
            <button class="profile-signout-btn" @click="handleLogout" title="Sign Out">
              <LogOut :size="18" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div class="admin-main">
        <div class="admin-mobile-header">
          <button
            class="mobile-hamburger-btn"
            @click="toggleSidebar"
            title="Open Menu"
          >
            <Menu :size="24" />
          </button>
          <h2 class="mobile-page-title">{{ getPageTitle() }}</h2>
        </div>
        <div class="admin-main-content">
          <!-- Add Movie Section -->
          <div v-if="activeSection === 'add-movie'" class="admin-section">
          <div class="section-header">
            <h2>
              <Plus :size="24" />
              <span>Add New Movie</span>
            </h2>
          </div>
          <AddMovieForm @saved="handleMovieSaved" />
        </div>

        <!-- Manage Movies Section -->
        <div v-if="activeSection === 'manage-movies'" class="admin-section">
          <div class="section-header">
            <h2>
              <Film :size="24" />
              <span>Manage Movies</span>
            </h2>
          </div>
          <ManageMovies />
        </div>

        <!-- Category Management Section -->
        <div v-if="activeSection === 'categories'" class="admin-section">
          <div class="section-header">
            <h2>
              <FolderOpen :size="24" />
              <span>Category Management</span>
            </h2>
          </div>
          <CategoryManagement />
        </div>

        <!-- Stories Management Section -->
        <div v-if="activeSection === 'stories'" class="admin-section">
          <div class="section-header">
            <h2>
              <FileText :size="24" />
              <span>Stories Management</span>
            </h2>
          </div>
          <ManageStories />
        </div>

        <!-- Payment Verifications Section -->
        <div v-if="activeSection === 'payment-verifications'" class="admin-section">
          <div class="section-header">
            <h2>
              <CreditCard :size="24" />
              <span>Payment Verifications</span>
            </h2>
          </div>
          <PaymentVerificationReview />
        </div>

        <!-- Dashboard Section -->
        <div v-if="activeSection === 'dashboard'" class="admin-section">
          <div class="section-header">
            <h2>
              <BarChart3 :size="24" />
              <span>Dashboard</span>
            </h2>
          </div>
          <div class="dashboard-stats">
            <div class="stat-card">
              <Film :size="24" />
              <div>
                <h3>{{ stats.totalMovies }}</h3>
                <p>Total Movies</p>
              </div>
            </div>
            <div class="stat-card">
              <TrendingUp :size="24" />
              <div>
                <h3>{{ stats.recentMovies }}</h3>
                <p>Added This Week</p>
              </div>
            </div>
            <div class="stat-card">
              <FolderOpen :size="24" />
              <div>
                <h3>{{ stats.totalCategories }}</h3>
                <p>Categories</p>
              </div>
            </div>
            <div class="stat-card">
              <Calendar :size="24" />
              <div>
                <h3>{{ stats.thisMonth }}</h3>
                <p>Added This Month</p>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div v-if="stats.categoryBreakdown.length > 0" class="category-breakdown">
            <h3 class="breakdown-title">
              <BarChart3 :size="20" />
              <span>Movies by Category</span>
            </h3>
            <div class="category-list">
              <div
                v-for="item in stats.categoryBreakdown"
                :key="item.category"
                class="category-item"
              >
                <span class="category-name">{{ item.category || 'Uncategorized' }}</span>
                <div class="category-bar">
                  <div
                    class="category-fill"
                    :style="{ width: `${(item.count / stats.totalMovies) * 100}%` }"
                  ></div>
                </div>
                <span class="category-count">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Analytics Charts -->
          <div class="analytics-section">
            <AnalyticsChart
              v-if="stats.monthlyData.length > 0"
              title="Movies Added Over Time"
              :icon="TrendingUp"
              :data="stats.monthlyData"
              @period-change="handlePeriodChange"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Shield,
  Plus,
  Film,
  BarChart3,
  LogOut,
  TrendingUp,
  FolderOpen,
  Calendar,
  Menu,
  X,
  User,
  ChevronDown,
  Home,
  FileText,
  CreditCard,
} from 'lucide-vue-next';
import AddMovieForm from '../components/AddMovieForm.vue';
import ManageMovies from '../components/ManageMovies.vue';
import CategoryManagement from '../components/CategoryManagement.vue';
import ManageStories from '../components/ManageStories.vue';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import PaymentVerificationReview from '../components/PaymentVerificationReview.vue';
import apiClient from '../plugins/axios';

const router = useRouter();

const activeSection = ref('dashboard');
const sidebarOpen = ref(false);
const adminName = ref('');
const stats = ref({
  totalMovies: 0,
  recentMovies: 0,
  thisMonth: 0,
  totalCategories: 0,
  categoryBreakdown: [],
  monthlyData: [],
});

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
  if (sidebarOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeSidebar() {
  sidebarOpen.value = false;
  document.body.style.overflow = '';
}

// Close sidebar when section changes on mobile
function changeSection(sectionId) {
  activeSection.value = sectionId;
  if (window.innerWidth <= 1024) {
    closeSidebar();
  }
}

function handleHomeClick() {
  // Close sidebar on mobile/tablet when navigating home
  if (window.innerWidth <= 1024) {
    closeSidebar();
  }
}

function getPageTitle() {
  const item = navItems.find(item => item.id === activeSection.value);
  return item ? item.label : 'Dashboard';
}


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'add-movie', label: 'Add Movie', icon: Plus },
  { id: 'manage-movies', label: 'Manage Movies', icon: Film },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'stories', label: 'Stories', icon: FileText },
  { id: 'payment-verifications', label: 'Payment Verifications', icon: CreditCard },
];

onMounted(async () => {
  // Check if admin is logged in
  const token = localStorage.getItem('adminToken');
  const adminId = localStorage.getItem('adminId');
  if (!token) {
    router.push('/admin/login');
    return;
  }

  // Set admin name
  adminName.value = adminId || 'Admin';

  // Load stats
  await loadStats();

  // Handle window resize
  const handleResize = () => {
    if (window.innerWidth > 768 && sidebarOpen.value) {
      closeSidebar();
    }
  };

  window.addEventListener('resize', handleResize);
  
  // Store cleanup function
  window._adminPanelResizeHandler = handleResize;

});

onUnmounted(() => {
  // Cleanup
  document.body.style.overflow = '';
  if (window._adminPanelResizeHandler) {
    window.removeEventListener('resize', window._adminPanelResizeHandler);
    delete window._adminPanelResizeHandler;
  }
});

async function loadStats() {
  try {
    const response = await apiClient.get('/movies');
    if (response.data.success) {
      const movies = response.data.data || [];
      stats.value.totalMovies = movies.length;
      
      // Count movies added in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      stats.value.recentMovies = movies.filter(movie => {
        const movieDate = new Date(movie.createdAt);
        return movieDate >= weekAgo;
      }).length;

      // Count movies added this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      stats.value.thisMonth = movies.filter(movie => {
        const movieDate = new Date(movie.createdAt);
        return movieDate >= monthAgo;
      }).length;

      // Category breakdown
      const categoryMap = {};
      movies.forEach(movie => {
        const category = movie.category || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      stats.value.categoryBreakdown = Object.entries(categoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      stats.value.totalCategories = Object.keys(categoryMap).length;

      // Monthly data for chart
      const monthlyMap = {};
      movies.forEach(movie => {
        const date = new Date(movie.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
      });

      // Get last 12 months
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData.push({
          label: monthName,
          value: monthlyMap[monthKey] || 0,
        });
      }
      stats.value.monthlyData = monthlyData;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function handlePeriodChange(period) {
  // Reload stats with different period
  loadStats();
}

function handleLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminId');
  router.push('/admin/login');
}

function handleMovieSaved() {
  loadStats();
  activeSection.value = 'manage-movies';
}
</script>

<style scoped>
.admin-panel-container {
  min-height: 100vh;
  background: var(--dark);
  position: relative;
  z-index: 1;
}

.admin-panel-header {
  background: var(--dark-lighter);
  border-bottom: 1px solid rgba(255, 69, 0, 0.1);
  padding: 24px 40px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.mobile-menu-toggle {
  display: none;
  background: var(--dark);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: var(--dark-lighter);
}

.mobile-menu-toggle svg {
  width: 24px;
  height: 24px;
}

.admin-icon {
  color: var(--primary);
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.header-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  display: block;
}

.logout-text {
  display: inline;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-panel-content {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
}

.admin-sidebar {
  width: 280px;
  background: var(--dark-lighter);
  border-right: 1px solid rgba(255, 69, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 69, 0, 0.1);
  background: rgba(255, 69, 0, 0.03);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 4px;
  flex: 1;
}

.sidebar-logo:hover {
  background: rgba(255, 69, 0, 0.1);
  transform: translateX(2px);
}

.sidebar-logo svg {
  color: var(--primary);
  filter: drop-shadow(0 0 6px rgba(255, 69, 0, 0.4));
}

.mobile-menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(255, 69, 0, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.profile-section {
  position: relative;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%);
  border-radius: 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 69, 0, 0.15);
  transition: all 0.2s ease;
}

.profile-info:hover {
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%);
  border-color: rgba(255, 69, 0, 0.25);
  transform: translateY(-1px);
}

.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.profile-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.profile-role {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-signout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-signout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
}

.profile-signout-btn svg {
  width: 18px;
  height: 18px;
}


.sidebar-overlay {
  display: none;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 16px;
  flex: 1;
  overflow-y: auto;
}

.admin-nav::-webkit-scrollbar {
  width: 4px;
}

.admin-nav::-webkit-scrollbar-track {
  background: transparent;
}

.admin-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 69, 0, 0.3);
  border-radius: 2px;
}

.admin-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 69, 0, 0.5);
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  position: relative;
}

.admin-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
  transition: height 0.2s ease;
}

.admin-nav-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.admin-nav-item:hover {
  background: rgba(255, 69, 0, 0.08);
  color: var(--text-primary);
  transform: translateX(4px);
}

.admin-nav-item:hover::before {
  height: 50%;
}

.admin-nav-item.active {
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%);
  color: var(--primary);
  font-weight: 600;
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.admin-nav-item.active::before {
  height: 70%;
  box-shadow: 0 0 8px rgba(255, 69, 0, 0.6);
}

.admin-nav-item.active svg {
  color: var(--primary);
  transform: scale(1.1);
}

.admin-nav-item.home-nav-item {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  text-decoration: none;
  margin-bottom: 8px;
}

.admin-nav-item.home-nav-item:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.admin-nav-item.home-nav-item svg {
  color: #3b82f6;
}

.admin-nav-item.home-nav-item:hover svg {
  color: #60a5fa;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 280px;
}

.admin-main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.admin-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-header h2 svg {
  color: var(--primary);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.stat-card {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.stat-card svg {
  color: var(--primary);
  flex-shrink: 0;
}

.stat-card h3 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-card p {
  color: var(--text-secondary);
  font-size: 14px;
}

.category-breakdown {
  margin-top: 32px;
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.breakdown-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.breakdown-title svg {
  color: var(--primary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-name {
  min-width: 120px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: var(--dark);
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
}

.category-count {
  min-width: 40px;
  text-align: right;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.analytics-section {
  margin-top: 32px;
}

.admin-mobile-header {
  display: none;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--dark-lighter);
  border-bottom: 1px solid rgba(255, 69, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.mobile-hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--dark);
  border: 1px solid rgba(255, 69, 0, 0.1);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-hamburger-btn:hover {
  background: rgba(255, 69, 0, 0.1);
  border-color: rgba(255, 69, 0, 0.2);
  transform: scale(1.05);
}

.mobile-hamburger-btn svg {
  width: 24px;
  height: 24px;
}

.mobile-page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .admin-mobile-header {
    display: flex;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .admin-panel-content {
    position: relative;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99;
    animation: fadeIn 0.3s ease;
  }

  .admin-main {
    margin-left: 0;
  }

  .admin-sidebar {
    width: 280px;
    max-width: 85vw;
    transform: translateX(-100%);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .admin-nav {
    flex-direction: column;
    padding: 16px;
    gap: 8px;
  }

  .admin-nav-item {
    white-space: normal;
    width: 100%;
    justify-content: flex-start;
  }

  .admin-main-content {
    padding: 20px;
    width: 100%;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-card h3 {
    font-size: 28px;
  }

  .category-breakdown {
    padding: 20px;
  }

  .category-item {
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-name {
    min-width: 100px;
    font-size: 13px;
  }

  .category-bar {
    flex: 1;
    min-width: 100px;
  }
}

/* Desktop - Hide mobile header */
@media (min-width: 1025px) {
  .admin-mobile-header {
    display: none !important;
  }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .admin-mobile-header {
    display: flex;
  }

  .admin-main {
    margin-left: 0;
  }

  .admin-sidebar {
    width: 260px;
    transform: translateX(-100%);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .mobile-menu-toggle {
    display: block;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99;
    animation: fadeIn 0.3s ease;
  }

  .admin-main-content {
    padding: 32px;
  }

  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .admin-mobile-header {
    padding: 12px 16px;
  }

  .mobile-page-title {
    font-size: 18px;
  }

  .admin-sidebar {
    width: 260px;
    max-width: 90vw;
  }

  .admin-main-content {
    padding: 16px;
  }

  .admin-sidebar {
    width: 260px;
    max-width: 90vw;
  }

  .admin-main {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 24px;
  }

  .section-header h2 {
    font-size: 20px;
  }
}
</style>

