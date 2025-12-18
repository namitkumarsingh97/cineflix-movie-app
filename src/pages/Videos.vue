<template>
  <div class="videos-page">
    <!-- Header with Search -->
    <div class="videos-header">
      <div class="videos-header-content">
        <div>
          <h1 class="videos-title">
            <Video :size="32" />
            <span>Videos</span>
          </h1>
          <p class="videos-subtitle">Browse and search videos</p>
        </div>
        <button 
          class="surprise-me-btn" 
          @click="pickRandomVideo"
          title="Surprise Me"
          aria-label="Pick a random video to watch"
        >
          <Shuffle :size="20" />
          <span>Surprise Me</span>
        </button>
      </div>
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

    <!-- Loading State -->
    <SkeletonSection 
      v-if="loading" 
      :count="maxThumbnailsPerPage" 
      :columns="4"
    />

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
import {
	ChevronLeft,
	ChevronRight,
	Search,
	Shuffle,
	Video,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Loader from "../components/Loader.vue";
import SkeletonSection from "../components/SkeletonSection.vue";
import VideoCard from "../components/VideoCard.vue";
import { useEporner } from "../composables/useEporner";
import { useNetworkQuality } from "../composables/useNetworkQuality";

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

const searchInput = ref("");
const selectedCategory = ref("");
const popularCategories = [
	"teen",
	"milf",
	"anal",
	"blonde",
	"brunette",
	"asian",
	"latina",
	"amateur",
	"big tits",
	"big ass",
	"threesome",
	"hardcore",
	"creampie",
	"facial",
	"public",
	"lesbian",
	"bj",
	"bbw",
	"gangbang",
	"mature",
];

// Computed for display total pages (capped at 1000)
const displayTotalPages = computed(() => {
	const total = totalPages.value;
	if (total > 1000) {
		return "1000+";
	}
	return total.toString();
});

// Extract unique categories from videos
const availableCategories = computed(() => {
	const categoriesSet = new Set();
	videos.value.forEach((video) => {
		if (video.categories && Array.isArray(video.categories)) {
			video.categories.forEach((cat) => {
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
			pages.push("...");
		}

		// Show pages around current (max 5 pages around)
		const start = Math.max(2, current - 2);
		const end = Math.min(1000, current + 2);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (current < 998) {
			pages.push("...");
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
			pages.push("...");
		}

		// Show pages around current
		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (current < total - 2) {
			pages.push("...");
		}

		// Show last page
		pages.push(total);
	}

	return pages;
});

// Handle search
function handleSearch() {
	const query = searchInput.value.trim() || "all";
	selectedCategory.value = "";
	// Update URL with search query and reset to page 1
	router.push({
		path: "/videos",
		query: {
			...route.query,
			q: query !== "all" ? query : undefined,
			page: undefined, // Reset to page 1
		},
	});
	searchVideos(query, 1, { order: sortOrder.value });
}

// Handle sort change
function handleSortChange() {
	setSortOrder(sortOrder.value);
	const query = searchQuery.value || searchInput.value.trim() || "all";
	// Update URL with sort order and reset to page 1
	router.push({
		path: "/videos",
		query: {
			...route.query,
			order: sortOrder.value,
			page: undefined, // Reset to page 1
		},
	});
	searchVideos(query, 1, { order: sortOrder.value });
}

// Handle thumb size change
function handleThumbSizeChange() {
	setThumbSize(thumbSize.value);
	const query = searchQuery.value || searchInput.value.trim() || "all";
	searchVideos(query, currentPage.value, {
		order: sortOrder.value,
		thumbsize: thumbSize.value,
	});
}

// Select category
function selectCategory(category) {
	selectedCategory.value = category;
	// Update URL with category and reset to page 1
	router.push({
		path: "/videos",
		query: {
			...route.query,
			category: category || undefined,
			page: undefined, // Reset to page 1
		},
	});
	searchVideos(category, 1, { order: sortOrder.value });
}

// Clear category filter
function clearCategory() {
	selectedCategory.value = "";
	searchInput.value = "";
	loadVideos(1);
}

// Select a popular tag
function selectPopularTag(tag) {
	searchInput.value = tag;
	selectedCategory.value = "";
	searchVideos(tag, 1, { order: sortOrder.value });
}

// Navigate to video
// Pick random video from all available videos
async function pickRandomVideo() {
	try {
		// Fetch a random page (between 1 and 100 to get variety)
		const randomPage = Math.floor(Math.random() * 100) + 1;

		// Search for all videos on a random page
		await searchVideos("all", randomPage, {
			order: "most-popular",
			perPage: 50, // Get more videos to choose from
		});

		if (videos.value && videos.value.length > 0) {
			// Pick a random video from the fetched results
			const randomIndex = Math.floor(Math.random() * videos.value.length);
			const randomVideo = videos.value[randomIndex];
			navigateToVideo(randomVideo);
		} else {
			// Fallback: try latest videos
			await searchVideos("all", 1, { order: "latest", perPage: 50 });
			if (videos.value && videos.value.length > 0) {
				const randomIndex = Math.floor(Math.random() * videos.value.length);
				navigateToVideo(videos.value[randomIndex]);
			}
		}
	} catch (error) {
		console.error("Error picking random video:", error);
		// Fallback to first video if available
		if (videos.value && videos.value.length > 0) {
			navigateToVideo(videos.value[0]);
		}
	}
}

import { generateWatchUrl } from "../utils/slug";

function navigateToVideo(video) {
	const url = generateWatchUrl(video, { source: "eporner" });
	router.push(url);
}

// Update URL with page parameter
function updateUrlPage(page) {
	const query = { ...route.query };

	if (page === 1) {
		delete query.page;
	} else {
		query.page = page.toString();
	}

	router.push({
		path: "/videos",
		query: query,
	});
}

// Go to page
function goToPage(page) {
	if (page === "..." || page < 1 || page > totalPages.value) return;

	// Update URL first
	updateUrlPage(page);

	// Then load videos
	const query = searchQuery.value || searchInput.value.trim() || "all";
	searchVideos(query, page, { order: sortOrder.value });
}

// Load videos on mount with default sort (Most Popular) or search query
onMounted(() => {
	// Get page from URL or default to 1
	const urlPage = route.query.page ? parseInt(route.query.page, 10) : 1;
	const page = urlPage > 0 && !isNaN(urlPage) ? urlPage : 1;

	// Check if there's an order parameter from URL (e.g., from "View All" link)
	const urlOrder = route.query.order;
	if (
		urlOrder &&
		[
			"latest",
			"most-popular",
			"top-weekly",
			"top-monthly",
			"top-rated",
			"longest",
			"shortest",
		].includes(urlOrder)
	) {
		setSortOrder(urlOrder);
		sortOrder.value = urlOrder;
		// Load videos with the specified order and page
		searchVideos("all", page, { order: urlOrder });
		return;
	}

	// Check if there's a search query from URL
	const urlQuery = route.query.q;
	if (urlQuery && urlQuery.trim()) {
		// Set search input and perform search with page
		searchInput.value = urlQuery.trim();
		searchVideos(urlQuery.trim(), page, { order: sortOrder.value });
	} else {
		// Set default sort to most-popular and load with page
		setSortOrder("most-popular");
		if (page > 1) {
			getPopularVideos(page);
		} else {
			getPopularVideos(1);
		}
	}
});

// Watch for route query changes
watch(
	() => route.query.q,
	(newQuery) => {
		if (newQuery && newQuery.trim()) {
			searchInput.value = newQuery.trim();
			const page = route.query.page ? parseInt(route.query.page, 10) : 1;
			searchVideos(newQuery.trim(), page > 0 && !isNaN(page) ? page : 1, {
				order: sortOrder.value,
			});
		}
	},
);

// Watch for order parameter changes
watch(
	() => route.query.order,
	(newOrder) => {
		if (
			newOrder &&
			[
				"latest",
				"most-popular",
				"top-weekly",
				"top-monthly",
				"top-rated",
				"longest",
				"shortest",
			].includes(newOrder)
		) {
			setSortOrder(newOrder);
			sortOrder.value = newOrder;
			const page = route.query.page ? parseInt(route.query.page, 10) : 1;
			searchVideos("all", page > 0 && !isNaN(page) ? page : 1, {
				order: newOrder,
			});
		}
	},
);

// Watch for page parameter changes (browser back/forward)
watch(
	() => route.query.page,
	(newPageParam) => {
		if (newPageParam) {
			const page = parseInt(newPageParam, 10);
			if (page > 0 && !isNaN(page) && page !== currentPage.value) {
				const query = searchQuery.value || searchInput.value.trim() || "all";
				searchVideos(query, page, { order: sortOrder.value });
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		} else if (currentPage.value !== 1) {
			// If no page param and we're not on page 1, reset to 1
			const query = searchQuery.value || searchInput.value.trim() || "all";
			searchVideos(query, 1, { order: sortOrder.value });
		}
	},
	{ immediate: false },
);
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

.videos-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.surprise-me-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
  white-space: nowrap;
}

.surprise-me-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(230, 57, 70, 0.4);
}

.surprise-me-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.surprise-me-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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
  /* Focus indicators disabled */
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
  /* Focus indicators disabled */
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
  .videos-header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .surprise-me-btn {
    width: 100%;
    justify-content: center;
  }
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

