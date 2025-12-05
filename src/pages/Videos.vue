<template>
  <div class="videos-page">
    <!-- Header with Search -->
    <div class="videos-header">
      <h1 class="videos-title">
        <Video :size="32" />
        <span>Videos</span>
      </h1>
      <p class="videos-subtitle">Browse and search videos</p>
    </div>

    <!-- Search and Filters -->
    <div class="videos-controls">
      <div class="search-container">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search videos..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <Search :size="20" />
        </button>
      </div>

      <div class="filters-container">
        <select v-model="sortOrder" @change="handleSortChange" class="filter-select">
          <option value="latest">Latest</option>
          <option value="most-popular">Most Popular</option>
          <option value="top-weekly">Top Weekly</option>
          <option value="top-monthly">Top Monthly</option>
          <option value="top-rated">Top Rated</option>
          <option value="longest">Longest</option>
          <option value="shortest">Shortest</option>
        </select>

        <select v-model="thumbSize" @change="handleThumbSizeChange" class="filter-select">
          <option value="small">Small Thumbnails</option>
          <option value="medium">Medium Thumbnails</option>
          <option value="big">Big Thumbnails</option>
        </select>
      </div>
    </div>

    <!-- Popular Categories -->
    <div class="popular-tags" v-if="popularCategories.length">
      <div class="popular-tags-header">
        <h3>Popular Tags</h3>
        <p>Select a tag to filter videos by title, description, or categories</p>
      </div>
      <div class="popular-tags-list">
        <button
          v-for="tag in popularCategories"
          :key="tag"
          class="popular-tag"
          @click="selectPopularTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Category Tags (from video keywords) -->
    <div v-if="availableCategories.length > 0" class="categories-section">
      <div class="categories-header">
        <h3>Categories</h3>
      </div>
      <div class="categories-list">
        <button
          v-for="category in availableCategories"
          :key="category"
          :class="['category-tag', { active: selectedCategory === category }]"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
        <button
          v-if="selectedCategory"
          class="category-tag clear"
          @click="clearCategory"
        >
          Clear Filter
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <Loader v-if="loading" message="Loading videos..." />

    <!-- Videos Grid -->
    <div v-else-if="videos.length > 0" class="videos-content">
      <div class="videos-info">
        <p class="videos-count">
          Showing {{ videos.length }} of {{ totalCount }} videos
          <span v-if="searchQuery">for "{{ searchQuery }}"</span>
        </p>
      </div>

      <div class="youtube-videos-grid">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :video="video"
          @click="navigateToVideo"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <div class="pagination-info">
          <span>Page {{ currentPage }} of {{ displayTotalPages }}</span>
        </div>
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1 || loading"
            @click="goToPage(currentPage - 1)"
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
              :disabled="page === '...' || loading"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="pagination-btn"
            :disabled="currentPage >= Math.min(totalPages.value, 1000) || loading"
            @click="goToPage(currentPage + 1)"
          >
            <span>Next</span>
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Video :size="80" class="empty-icon" />
      <h3>No videos found</h3>
      <p v-if="searchQuery">Try a different search term</p>
      <p v-else>Start by searching for videos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEporner } from '../composables/useEporner';
import Loader from '../components/Loader.vue';
import VideoCard from '../components/VideoCard.vue';
import { Video, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const {
  videos,
  loading,
  error,
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
  sortOrder,
  thumbSize,
  searchVideos,
  loadVideos,
  getPopularVideos,
  setSortOrder,
  setThumbSize,
} = useEporner();

const searchInput = ref('');
const selectedCategory = ref('');
const popularCategories = [
  'teen','milf','anal','blonde','brunette','asian','latina','amateur','big tits','big ass',
  'threesome','hardcore','creampie','facial','public','lesbian','bj','bbw','gangbang','mature'
];

// Computed for display total pages (capped at 1000)
const displayTotalPages = computed(() => {
  const total = totalPages.value;
  if (total > 1000) {
    return '1000+';
  }
  return total.toString();
});

// Extract unique categories from videos
const availableCategories = computed(() => {
  const categoriesSet = new Set();
  videos.value.forEach(video => {
    if (video.categories && Array.isArray(video.categories)) {
      video.categories.forEach(cat => {
        if (cat && cat.trim()) {
          categoriesSet.add(cat.trim());
        }
      });
    }
  });
  return Array.from(categoriesSet).sort().slice(0, 20); // Limit to 20 categories
});

// Calculate visible pages for pagination
const visiblePages = computed(() => {
  const pages = [];
  const total = Math.min(totalPages.value, 1000); // Cap at 1000 for display
  const current = currentPage.value;

  // If total is unreasonably large, limit display
  if (total > 1000) {
    // Show first page
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current (max 5 pages around)
    const start = Math.max(2, current - 2);
    const end = Math.min(1000, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < 998) {
      pages.push('...');
      pages.push(1000);
    }
  } else if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show first page
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Show last page
    pages.push(total);
  }

  return pages;
});

// Handle search
function handleSearch() {
  const query = searchInput.value.trim() || 'all';
  selectedCategory.value = '';
  searchVideos(query, 1, { order: sortOrder.value });
}

// Handle sort change
function handleSortChange() {
  setSortOrder(sortOrder.value);
  const query = searchQuery.value || searchInput.value.trim() || 'all';
  searchVideos(query, 1, { order: sortOrder.value });
}

// Handle thumb size change
function handleThumbSizeChange() {
  setThumbSize(thumbSize.value);
  const query = searchQuery.value || searchInput.value.trim() || 'all';
  searchVideos(query, currentPage.value, {
    order: sortOrder.value,
    thumbsize: thumbSize.value,
  });
}

// Select category
function selectCategory(category) {
  selectedCategory.value = category;
  searchVideos(category, 1, { order: sortOrder.value });
}

// Clear category filter
function clearCategory() {
  selectedCategory.value = '';
  searchInput.value = '';
  loadVideos(1);
}

// Select a popular tag
function selectPopularTag(tag) {
  searchInput.value = tag;
  selectedCategory.value = '';
  searchVideos(tag, 1, { order: sortOrder.value });
}

// Navigate to video
function navigateToVideo(video) {
  router.push(`/watch/${video.id}?source=eporner`);
}

// Go to page
function goToPage(page) {
  if (page === '...' || page < 1 || page > totalPages.value) return;
  
  const query = searchQuery.value || searchInput.value.trim() || 'all';
  searchVideos(query, page, { order: sortOrder.value });
}

// Load videos on mount with default sort (Most Popular) or search query
onMounted(() => {
  // Check if there's an order parameter from URL (e.g., from "View All" link)
  const urlOrder = route.query.order;
  if (urlOrder && ['latest', 'most-popular', 'top-weekly', 'top-monthly', 'top-rated', 'longest', 'shortest'].includes(urlOrder)) {
    setSortOrder(urlOrder);
    sortOrder.value = urlOrder;
    // Load videos with the specified order
    searchVideos('all', 1, { order: urlOrder });
    return;
  }
  
  // Check if there's a search query from URL
  const urlQuery = route.query.q;
  if (urlQuery && urlQuery.trim()) {
    // Set search input and perform search
    searchInput.value = urlQuery.trim();
    handleSearch();
  } else {
    // Set default sort to most-popular and load
    setSortOrder('most-popular');
    getPopularVideos(1);
  }
});

// Watch for route query changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery.trim()) {
    searchInput.value = newQuery.trim();
    handleSearch();
  }
});

// Watch for order parameter changes
watch(() => route.query.order, (newOrder) => {
  if (newOrder && ['latest', 'most-popular', 'top-weekly', 'top-monthly', 'top-rated', 'longest', 'shortest'].includes(newOrder)) {
    setSortOrder(newOrder);
    sortOrder.value = newOrder;
    searchVideos('all', 1, { order: newOrder });
  }
});
</script>

<style scoped>
.videos-page {
  width: 100%;
  padding: 40px;
  margin: 0 auto;
}

.videos-header {
  margin-bottom: 2rem;
}

.videos-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.videos-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.videos-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
}

.search-btn {
  padding: 12px 20px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.filters-container {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 12px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: var(--primary);
}

.categories-section {
  margin-bottom: 2rem;
}

.categories-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tags {
  margin-bottom: 1.5rem;
}

.popular-tags-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.popular-tags-header p {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.popular-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tag {
  padding: 8px 14px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.popular-tag:hover {
  background: var(--dark-light);
  border-color: var(--primary);
  color: var(--text-primary);
}

.category-tag {
  padding: 8px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tag:hover {
  background: var(--dark-light);
  color: var(--text-primary);
}

.category-tag.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
}

.category-tag.clear {
  background: transparent;
  border-color: var(--primary);
  color: var(--primary);
}

.videos-content {
  margin-top: 2rem;
}

.videos-info {
  margin-bottom: 1.5rem;
}

.videos-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--dark-light);
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-number {
  min-width: 40px;
  padding: 10px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.page-number:hover:not(:disabled) {
  background: var(--dark-light);
  border-color: var(--primary);
}

.page-number.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
}

.page-number:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .videos-page {
    padding: 24px;
  }

  .videos-controls {
    flex-direction: column;
  }

  .filters-container {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .videos-page {
    padding: 16px;
  }

  .videos-controls {
    flex-direction: column;
  }

  .search-container {
    min-width: 100%;
  }

  .pagination {
    gap: 4px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .pagination-btn span {
    display: none;
  }

  .page-number {
    min-width: 36px;
    padding: 8px;
    font-size: 12px;
  }

  .pagination-info {
    font-size: 12px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
    gap: 8px;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .page-numbers {
    width: 100%;
    justify-content: center;
  }
}
</style>

