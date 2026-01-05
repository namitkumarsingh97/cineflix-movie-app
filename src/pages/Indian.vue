<template>
  <div class="videos-page">
    <div class="videos-header">
      <h1 class="videos-title">
        <Video :size="32" />
        <span>Indian</span>
      </h1>
      <p class="videos-subtitle">Browse Indian/Desi videos</p>
    </div>

    <div class="videos-controls">
      <div class="search-container">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search within Indian/Desi..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <Search :size="20" />
        </button>
      </div>

      <div class="filters-container">
        <select v-model="sortOrder" @change="handleSortChange" class="filter-select">
          <option value="most-popular">Most Popular</option>
          <option value="latest">Latest</option>
          <option value="top-weekly">Top Weekly</option>
          <option value="top-monthly">Top Monthly</option>
          <option value="top-rated">Top Rated</option>
          <option value="longest">Longest</option>
          <option value="shortest">Shortest</option>
        </select>
      </div>
    </div>

    <SkeletonSection
      v-if="loading"
      :count="maxThumbnailsPerPage"
      :columns="4"
    />

    <div v-else-if="videos.length > 0" class="videos-content">
      <div class="videos-info">
        <p class="videos-count">
          Showing {{ videos.length }} of {{ totalCount }} Indian/Desi videos
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

    <div v-else class="empty-state">
      <Video :size="80" class="empty-icon" />
      <h3>No Indian/Desi videos found</h3>
      <p v-if="searchQuery">Try a different search term</p>
      <p v-else>Try again later</p>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight, Search, Video } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SkeletonSection from "../components/SkeletonSection.vue";
import VideoCard from "../components/VideoCard.vue";
import { useEporner } from "../composables/useEporner";

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
	searchVideos,
	getPopularVideos,
	setSortOrder,
} = useEporner();

const searchInput = ref("indian desi");

const displayTotalPages = computed(() => {
	const total = totalPages.value;
	if (total > 1000) {
		return "1000+";
	}
	return total.toString();
});

const visiblePages = computed(() => {
	const pages = [];
	const total = Math.min(totalPages.value, 1000);
	const current = currentPage.value;

	if (total > 1000) {
		pages.push(1);
		if (current > 3) pages.push("...");
		const start = Math.max(2, current - 2);
		const end = Math.min(1000, current + 2);
		for (let i = start; i <= end; i++) pages.push(i);
		if (current < 998) {
			pages.push("...");
			pages.push(1000);
		}
	} else if (total <= 7) {
		for (let i = 1; i <= total; i++) pages.push(i);
	} else {
		pages.push(1);
		if (current > 3) pages.push("...");
		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);
		for (let i = start; i <= end; i++) pages.push(i);
		if (current < total - 2) pages.push("...");
		pages.push(total);
	}

	return pages;
});

const maxThumbnailsPerPage = 20;

function handleSearch() {
	const query = (searchInput.value.trim() || "indian desi") + " indian desi";
	searchVideos(query, 1, { order: sortOrder.value });
}

function handleSortChange() {
	setSortOrder(sortOrder.value);
	const query = (searchInput.value.trim() || "indian desi") + " indian desi";
	searchVideos(query, 1, { order: sortOrder.value });
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
		path: "/indian",
		query: query,
	});
}

function goToPage(page) {
	if (page === "..." || page < 1 || page > totalPages.value) return;

	// Update URL first
	updateUrlPage(page);

	// Then load videos
	const query = (searchInput.value.trim() || "indian desi") + " indian desi";
	searchVideos(query, page, { order: sortOrder.value });
}

onMounted(() => {
	setSortOrder("most-popular");
	// Get page from URL or default to 1
	const urlPage = route.query.page ? parseInt(route.query.page, 10) : 1;
	const page = urlPage > 0 && !isNaN(urlPage) ? urlPage : 1;
	// Initial load focused on Indian/Desi
	searchVideos("indian desi", page, { order: "most-popular" });
});

// Watch for page parameter changes (browser back/forward)
watch(
	() => route.query.page,
	(newPageParam) => {
		if (newPageParam) {
			const page = parseInt(newPageParam, 10);
			if (page > 0 && !isNaN(page) && page !== currentPage.value) {
				const query =
					(searchInput.value.trim() || "indian desi") + " indian desi";
				searchVideos(query, page, { order: sortOrder.value });
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		} else if (currentPage.value !== 1) {
			// If no page param and we're not on page 1, reset to 1
			const query =
				(searchInput.value.trim() || "indian desi") + " indian desi";
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

