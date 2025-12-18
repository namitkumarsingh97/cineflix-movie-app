<template>
  <div class="stories-page">
    <div class="stories-header">
      <h1>
        <FileText :size="28" />
        <span>Stories</span>
      </h1>
      <div class="stories-filters">
        <div class="search-container">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search stories..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''; handleSearch()">×</button>
        </div>
        <select v-model="selectedCategory" class="filter-select" @change="handleCategoryChange">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="selectedLanguage" class="filter-select language-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.flag }} {{ lang.name }}
          </option>
        </select>
      </div>
    </div>

    <Loader v-if="loading" message="Loading stories..." />

    <div v-else-if="stories.length > 0" class="stories-table-container">
      <table class="stories-table">
        <thead>
          <tr>
            <th class="col-icon"></th>
            <th class="col-title">Title & Author</th>
            <th class="col-replies mobile-hide">Replies</th>
            <th class="col-views mobile-hide">Views</th>
            <th class="col-rating mobile-hide">Rating</th>
            <th class="col-last-post mobile-hide">Last Post</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="story in stories"
            :key="story._id"
            class="story-row"
            @click="openStory(story._id)"
          >
            <td class="col-icon">
              <FileText :size="20" class="story-icon" />
            </td>
            <td class="col-title">
              <div class="story-title-wrapper">
                <div class="story-title-row">
                  <ChevronRight :size="16" class="arrow-icon" />
                  <span class="story-title">{{ story.title }}</span>
                </div>
                <div class="story-author">by {{ story.author }}</div>
              </div>
            </td>
            <td class="col-replies mobile-hide">{{ story.likes || 0 }}</td>
            <td class="col-views mobile-hide">{{ formatNumber(story.views || 0) }}</td>
            <td class="col-rating mobile-hide">
              <div class="rating-stars">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :size="14"
                  :class="['star', { filled: i <= getRating(story) }]"
                />
              </div>
            </td>
            <td class="col-last-post mobile-hide">
              <div class="last-post-info">
                <span class="last-post-time">{{ formatTimeAgo(story.updatedAt) }}</span>
                <span class="last-post-author">Last Post: {{ story.author }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || loading"
        >
          <ChevronLeft :size="18" />
          <span>Previous</span>
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-number', { active: page === currentPage, disabled: page === '...' }]"
            @click="page !== '...' && changePage(page)"
            :disabled="page === '...' || loading"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="pagination-btn"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages || loading"
        >
          <span>Next</span>
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else-if="error" class="empty-state error-state">
      <FileText :size="64" />
      <h3>Error loading stories</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadStories">Retry</button>
    </div>
    <div v-else class="empty-state">
      <FileText :size="64" />
      <h3>No stories found</h3>
      <p>Check back later for new stories!</p>
    </div>
  </div>
</template>

<script setup>
import {
	ChevronLeft,
	ChevronRight,
	FileText,
	Languages,
	Search,
	Star,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Loader from "../components/Loader.vue";
import { useStories } from "../composables/useStories";

const router = useRouter();
const route = useRoute();
const {
	stories,
	loading,
	error,
	currentPage,
	totalPages,
	totalCount,
	selectedLanguage,
	languages,
	categories,
	fetchStories,
	filterByCategory,
	filterByLanguage,
} = useStories();

const selectedCategory = ref("");
const searchQuery = ref("");

// Update URL with page parameter
function updateUrlPage(page) {
	const query = { ...route.query };

	if (page === 1) {
		delete query.page;
	} else {
		query.page = page.toString();
	}

	router.push({
		path: "/stories",
		query: query,
	});
}

onMounted(async () => {
	// Get page from URL or default to 1
	const urlPage = route.query.page ? parseInt(route.query.page, 10) : 1;
	const page = urlPage > 0 && !isNaN(urlPage) ? urlPage : 1;

	// Load stories with page from URL
	await fetchStories(page, {
		limit: 20,
		category: route.query.category || selectedCategory.value || undefined,
		search: route.query.search || searchQuery.value || undefined,
	});
});

async function loadStories() {
	const options = {
		limit: 20,
		category: selectedCategory.value || undefined,
		search: searchQuery.value || undefined,
	};
	await fetchStories(currentPage.value, options);
}

async function handleSearch() {
	// Update URL with search query and reset to page 1
	router.push({
		path: "/stories",
		query: {
			...route.query,
			search: searchQuery.value.trim() || undefined,
			page: undefined, // Reset to page 1
		},
	});

	if (searchQuery.value.trim()) {
		await fetchStories(1, { search: searchQuery.value.trim() });
	} else {
		await loadStories();
	}
}

async function handleCategoryChange() {
	// Update URL with category and reset to page 1
	router.push({
		path: "/stories",
		query: {
			...route.query,
			category: selectedCategory.value || undefined,
			page: undefined, // Reset to page 1
		},
	});
	await loadStories();
}

async function handleLanguageChange() {
	// Update URL with language and reset to page 1
	router.push({
		path: "/stories",
		query: {
			...route.query,
			language:
				selectedLanguage.value !== "all" ? selectedLanguage.value : undefined,
			page: undefined, // Reset to page 1
		},
	});
	await filterByLanguage(selectedLanguage.value, 1);
}

// Watch for language changes
watch(selectedLanguage, () => {
	handleLanguageChange();
});

// Watch for page parameter changes (browser back/forward)
watch(
	() => route.query.page,
	async (newPageParam) => {
		if (newPageParam) {
			const page = parseInt(newPageParam, 10);
			if (page > 0 && !isNaN(page) && page !== currentPage.value) {
				await fetchStories(page, {
					limit: 20,
					category: selectedCategory.value || undefined,
					search: searchQuery.value || undefined,
				});
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		} else if (currentPage.value !== 1) {
			// If no page param and we're not on page 1, reset to 1
			await fetchStories(1, {
				limit: 20,
				category: selectedCategory.value || undefined,
				search: searchQuery.value || undefined,
			});
		}
	},
	{ immediate: false },
);

async function changePage(page) {
	if (page >= 1 && page <= totalPages.value) {
		// Update URL first
		updateUrlPage(page);

		// Then load stories
		await fetchStories(page, {
			limit: 20,
			category: selectedCategory.value || undefined,
			search: searchQuery.value || undefined,
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

const visiblePages = computed(() => {
	const current = currentPage.value;
	const total = totalPages.value;
	const pages = [];

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

function openStory(id) {
	router.push(`/story/${id}`);
}

function formatNumber(num) {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
}

function formatTimeAgo(date) {
	if (!date) return "N/A";
	const now = new Date();
	const storyDate = new Date(date);
	const diffMs = now - storyDate;
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	return storyDate.toLocaleDateString();
}

function getRating(story) {
	// Simple rating based on views and likes
	const views = story.views || 0;
	const likes = story.likes || 0;
	if (views > 10000 && likes > 100) return 5;
	if (views > 5000 && likes > 50) return 4;
	if (views > 1000 && likes > 10) return 3;
	if (views > 100) return 2;
	return 1;
}
</script>

<style scoped>
.stories-page {
  min-height: calc(100vh - 200px);
  width: 100%;
  padding: 40px;
  margin: 0 auto;
}

.stories-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.stories-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stories-header h1 svg {
  color: var(--primary);
}

.stories-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--dark-lighter);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 250px;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  /* Focus indicators disabled */
}

.search-icon {
  color: var(--text-secondary);
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  padding: 0;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.clear-search:hover {
  color: var(--text-primary);
}

.filter-select {
  background: var(--dark-lighter);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  /* Focus indicators disabled */
}

.language-select {
  min-width: 180px;
}

.stories-table-container {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 69, 0, 0.1);
  overflow-x: visible;
  width: 100%;
  box-sizing: border-box;
}

.stories-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.stories-table thead {
  background: var(--dark);
  border-radius: 12px;
}

.stories-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(255, 69, 0, 0.1);
}

.story-row {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.story-row:hover {
  background: rgba(255, 69, 0, 0.05);
  transform: translateX(4px);
}

.story-row td {
  padding: 16px;
  vertical-align: middle;
}

.col-icon {
  width: 50px;
  text-align: center;
}

.story-icon {
  color: var(--primary);
}

.col-title {
  min-width: 300px;
}

.story-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.story-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.story-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.story-author {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 24px;
}

.col-replies,
.col-views {
  width: 100px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
}

.col-rating {
  width: 120px;
}

.rating-stars {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.star {
  color: #6b7280;
  fill: #6b7280;
}

.star.filled {
  color: #fbbf24;
  fill: #fbbf24;
}

.col-last-post {
  min-width: 180px;
}

.last-post-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.last-post-time {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.last-post-author {
  font-size: 12px;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 69, 0, 0.1);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark);
  border: 2px solid rgba(255, 69, 0, 0.2);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  min-width: 40px;
  height: 40px;
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(.active):not(.disabled) {
  background: var(--dark-lighter);
  border-color: rgba(255, 69, 0, 0.2);
}

.page-number.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  box-shadow: var(--shadow);
}

.page-number.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-secondary);
  margin-bottom: 24px;
  opacity: 0.5;
}

  .empty-state h3 {
    font-size: 24px;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .error-state {
    color: #ef4444;
  }

  .retry-btn {
    margin-top: 16px;
    padding: 10px 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn:hover {
    background: var(--gradient-primary);
    transform: translateY(-2px);
  }

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .stories-page {
    padding: 32px;
  }

  .stories-header h1 {
    font-size: 28px;
  }

  .stories-table-container {
    padding: 20px;
  }

  .stories-table th,
  .stories-table td {
    padding: 12px;
    font-size: 14px;
  }

  .story-title {
    font-size: 14px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .stories-page {
    padding: 16px;
  }

  .stories-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stories-header h1 {
    font-size: 24px;
  }

  .stories-filters {
    width: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }

  .stories-table-container {
    padding: 12px;
    overflow-x: visible;
  }

  .stories-table {
    width: 100%;
    font-size: 13px;
    display: block;
  }

  .stories-table thead {
    display: none; /* Hide header on mobile */
  }

  .stories-table tbody {
    display: block;
    width: 100%;
  }

  .story-row {
    display: block;
    width: 100%;
    margin-bottom: 16px;
    padding: 16px;
    background: var(--dark);
    border-radius: 12px;
    border: 1px solid rgba(255, 69, 0, 0.1);
  }

  .story-row td {
    display: block;
    padding: 8px 0;
    width: 100%;
    text-align: left;
    border: none;
  }

  .story-row td:before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 4px;
  }

  .col-icon {
    display: none; /* Hide icon column on mobile */
  }

  .mobile-hide {
    display: none !important; /* Hide all columns except title on mobile */
  }

  .col-title {
    min-width: auto;
    width: 100%;
    padding: 0 !important;
  }

  .story-title-wrapper {
    gap: 6px;
  }

  .story-title {
    font-size: 15px;
    line-height: 1.4;
  }

  .story-author {
    font-size: 13px;
    margin-left: 0;
    color: var(--text-secondary);
  }

  .stories-table th {
    padding: 12px 8px;
    font-size: 11px;
  }

  .stories-table td {
    padding: 12px 8px;
  }

  .col-icon {
    width: 40px;
  }

  .story-icon {
    width: 18px;
    height: 18px;
  }

  .col-title {
    min-width: 200px;
  }

  .story-title {
    font-size: 13px;
  }

  .story-author {
    font-size: 11px;
    margin-left: 20px;
  }

  .col-replies,
  .col-views {
    width: 70px;
    font-size: 12px;
  }

  .col-rating {
    width: 100px;
  }

  .star {
    width: 12px;
    height: 12px;
  }

  .col-last-post {
    min-width: 140px;
  }

  .last-post-time {
    font-size: 12px;
  }

  .last-post-author {
    font-size: 11px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 20px;
    margin-top: 24px;
  }

  .pagination-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .page-number {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
  }

  .empty-state {
    padding: 60px 20px;
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
  }

  .empty-state h3 {
    font-size: 20px;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .stories-page {
    padding: 12px;
  }

  .stories-header h1 {
    font-size: 20px;
  }

  .stories-header h1 svg {
    width: 24px;
    height: 24px;
  }

  .stories-filters {
    flex-direction: column;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .stories-table-container {
    padding: 8px;
  }

  .stories-table {
    width: 100%;
  }

  .stories-table th {
    padding: 10px 6px;
    font-size: 10px;
  }

  .stories-table td {
    padding: 10px 6px;
  }

  .pagination-btn {
    padding: 10px 14px;
    font-size: 12px;
  }

  .pagination-btn span {
    display: none;
  }

  .page-number {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .stories-page {
    max-width: 1600px;
  }

  .stories-table {
    font-size: 15px;
  }

  .story-title {
    font-size: 16px;
  }
}
</style>

