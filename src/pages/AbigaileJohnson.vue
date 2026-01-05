<template>
  <div class="actor-page-container">
    <CategorySidebar :is-open="sidebarOpen" @filter-change="handleFilterChange" />
    <div class="actor-content">
      <div class="actor-page">
        <div class="page-header">
          <h1 class="page-title">Abigaile Johnson</h1>
          <p class="page-subtitle">Browse all Abigaile Johnson videos</p>
        </div>
        <SkeletonSection v-if="loading" :count="maxThumbnailsPerPage" :columns="4" />
        <div v-else-if="videos.length > 0" class="videos-content">
          <div class="videos-info">
            <p class="videos-count">Showing {{ videos.length }} of {{ totalCount }} videos</p>
          </div>
          <div class="youtube-videos-grid">
            <VideoCard v-for="video in videos" :key="video.id" :video="video" @click="navigateToVideo" />
          </div>
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <div class="pagination-info"><span>Page {{ currentPage }} of {{ displayTotalPages }}</span></div>
            <div class="pagination">
              <button class="pagination-btn" :disabled="currentPage === 1 || loading" @click="goToPage(currentPage - 1)">
                <ChevronLeft :size="18" /><span>Previous</span>
              </button>
              <div class="page-numbers">
                <button v-for="page in visiblePages" :key="page" :class="['page-number', { active: page === currentPage }]" @click="goToPage(page)" :disabled="page === '...' || loading">{{ page }}</button>
              </div>
              <button class="pagination-btn" :disabled="currentPage >= Math.min(totalPages, 1000) || loading" @click="goToPage(currentPage + 1)">
                <span>Next</span><ChevronRight :size="18" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <Video :size="80" class="empty-icon" />
          <h3>No videos found</h3>
          <p>Try again later</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ChevronLeft, ChevronRight, Video } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import CategorySidebar from "../components/CategorySidebar.vue";
import SkeletonSection from "../components/SkeletonSection.vue";
import VideoCard from "../components/VideoCard.vue";
import { useEporner } from "../composables/useEporner";

const router = useRouter();
const { videos, loading, currentPage, totalPages, totalCount, searchVideos } =
	useEporner();
const sidebarOpen = ref(true);
function handleFilterChange(filter) {
	console.log("Filter changed:", filter);
}
const maxThumbnailsPerPage = 30;
const displayTotalPages = computed(() => {
	const total = totalPages.value;
	if (total > 1000) return "1000+";
	return total.toString();
});
const visiblePages = computed(() => {
	const pages = [];
	const total = Math.min(totalPages.value, 1000);
	const current = currentPage.value;
	if (total <= 7) {
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
function navigateToVideo(video) {
	router.push(`/watch/${video.id}?source=eporner`);
}
function goToPage(page) {
	if (page === "..." || page < 1 || page > totalPages.value) return;
	searchVideos("abigaile johnson", page, { order: "most-popular" });
	window.scrollTo({ top: 0, behavior: "smooth" });
}
onMounted(() => {
	searchVideos("abigaile johnson", 1, { order: "most-popular" });
});
</script>
<style scoped>
.actor-page-container { display: flex; position: relative; align-items: flex-start; gap: 0; }
.actor-content { flex: 1; min-width: 0; }
.actor-page { width: 100%; padding: 40px; margin: 0 auto; max-width: 1600px; }
@media (max-width: 1024px) { .actor-content { margin-left: 0; } }
.page-header { margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
.page-subtitle { color: var(--text-secondary); font-size: 1rem; }
.videos-content { margin-top: 2rem; }
.videos-info { margin-bottom: 1.5rem; }
.videos-count { color: var(--text-secondary); font-size: 14px; }
.pagination-wrapper { margin-top: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.pagination-info { color: var(--text-secondary); font-size: 14px; }
.pagination { display: flex; align-items: center; gap: 8px; }
.pagination-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--dark-lighter); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 14px; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.pagination-btn:hover:not(:disabled) { background: var(--dark-light); border-color: var(--primary); }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.page-number { min-width: 40px; padding: 10px; background: var(--dark-lighter); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 14px; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.page-number:hover:not(:disabled) { background: var(--dark-light); border-color: var(--primary); }
.page-number.active { background: var(--primary); border-color: var(--primary); color: white; }
.page-number:disabled { opacity: 0.5; cursor: not-allowed; }
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
.empty-icon { margin: 0 auto 1rem; opacity: 0.5; }
.empty-state h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
.empty-state p { font-size: 1rem; }
.youtube-videos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
@media (max-width: 768px) { .actor-page { padding: 20px; } .page-title { font-size: 1.5rem; } .youtube-videos-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; } .pagination { flex-wrap: wrap; } }
</style>

