<template>
  <div class="category-detail-page">
    <div class="category-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>Back to Categories</span>
      </button>
      <div class="category-title-section">
        <div class="category-icon-large">
          <FolderOpen :size="48" />
        </div>
        <div>
          <h1 class="category-title">{{ categoryName || 'Uncategorized' }}</h1>
      <p class="category-meta">
        {{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }} in this category
      </p>
        </div>
      </div>
    </div>

    <div class="controls-row">
      <div class="count-pill">
        {{ videoTotal }} total videos
      </div>
      <div class="controls">
        <label class="control-label" for="sort">Sort by</label>
        <select id="sort" v-model="sortOrder" @change="changeSort(sortOrder)" class="sort-select">
          <option value="latest">Latest</option>
          <option value="most-popular">Most Popular</option>
          <option value="top-weekly">Top Weekly</option>
          <option value="top-monthly">Top Monthly</option>
          <option value="top-rated">Top Rated</option>
        </select>
      </div>
    </div>

    <Loader v-if="loading" message="Loading content..." />

    <div v-else-if="totalItems > 0" class="content-grid">
      <VideoCard
        v-for="video in videos"
        :key="video.id || video._id"
        :video="video"
        @click="navigateToVideo(video)"
      />
    </div>

    <div v-if="videoTotalPages > 1" class="pagination-wrapper">
      <div class="pagination-info">
        Videos: Page {{ videoPage }} of {{ videoTotalPages }}
      </div>
      <div class="pagination">
        <button
          class="pagination-btn"
          :disabled="videoPage === 1 || loading"
          @click="changeVideoPage(videoPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="page in videoTotalPages"
          :key="`v-${page}`"
          :class="['page-number', { active: page === videoPage }]"
          @click="changeVideoPage(page)"
          :disabled="loading"
        >
          {{ page }}
        </button>
        <button
          class="pagination-btn"
          :disabled="videoPage === videoTotalPages || loading"
          @click="changeVideoPage(videoPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <Film :size="64" />
      <h3>No content found</h3>
      <p>There is no content in this category yet.</p>
      <button class="btn-primary" @click="goBack">Back to Categories</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, FolderOpen, Film } from 'lucide-vue-next';
import { moviesApi } from '../api/movies';
import { videosApi } from '../api/videos';
import VideoCard from '../components/VideoCard.vue';
import Loader from '../components/Loader.vue';

const route = useRoute();
const router = useRouter();

const videos = ref([]);
const loading = ref(true);
const sortOrder = ref('latest');

const videoPage = ref(1);
const pageSize = ref(20);

const videoTotal = ref(0);
const videoTotalPages = ref(1);

const categoryName = computed(() => {
  return decodeURIComponent(route.params.category || 'Uncategorized');
});

const totalItems = computed(() => {
  return videoTotal.value;
});

onMounted(async () => {
  await loadVideos();
});

async function loadVideos(page = videoPage.value) {
  try {
    videoPage.value = page;
    const { data } = await videosApi.getByCategory(categoryName.value, {
      page: videoPage.value,
      limit: pageSize.value,
      sort: sortOrder.value,
    });

    const items = data?.data || data?.videos || data || [];
    videos.value = items;
    videoTotal.value = data?.meta?.total || data?.total || items.length;
    videoTotalPages.value =
      data?.meta?.totalPages ||
      data?.totalPages ||
      Math.max(1, Math.ceil(videoTotal.value / pageSize.value));
  } catch (error) {
    console.error('Failed to load videos:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToMovie(movieId) {
  // Movies not shown on category page per request
}

function navigateToVideo(video) {
  const id = video._id || video.id;
  router.push(`/watch/${id}`);
}

function changeSort(order) {
  sortOrder.value = order;
  loadVideos(1);
}

function changeVideoPage(page) {
  if (page < 1 || page > videoTotalPages.value) return;
  loadVideos(page);
}


function goBack() {
  router.push('/categories');
}
</script>

<style scoped>
.category-detail-page {
  min-height: calc(100vh - 200px);
  padding: 60px;
  max-width: 1600px;
  margin: 0 auto;
}

.category-header {
  margin-bottom: 60px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 69, 0, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:hover {
  background: rgba(255, 69, 0, 0.1);
  border-color: rgba(255, 69, 0, 0.3);
  color: var(--text-primary);
}

.back-btn:active {
  transform: scale(0.98);
}

.back-btn svg {
  flex-shrink: 0;
}

.category-title-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.category-icon-large {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 69, 0, 0.4);
}

.category-icon-large svg {
  width: 48px;
  height: 48px;
}

.category-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.2;
  word-break: break-word;
}

.category-meta {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0 24px;
  flex-wrap: wrap;
}

.count-pill {
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 14px;
  color: var(--text-secondary);
  font-size: 14px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.sort-select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--dark-lighter);
  color: var(--text-primary);
  font-size: 14px;
}

/* Small tablets - 2 columns */
@media (min-width: 640px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Tablet - 2 columns */
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

/* Large screens - 2-3 columns (fewer columns = bigger cards) */
@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

@media (min-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
}

/* Larger card styling for MovieCard components */
.category-detail-page :deep(.youtube-video-card) {
  padding: 8px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.category-detail-page :deep(.youtube-video-card):hover {
  transform: translateY(-8px);
}

.category-detail-page :deep(.youtube-video-card):active {
  transform: translateY(-4px);
}

.category-detail-page :deep(.video-thumbnail-wrapper) {
  border-radius: 20px;
  margin-bottom: 20px;
}

.category-detail-page :deep(.video-title-text) {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
}

.category-detail-page :deep(.video-meta-info) {
  font-size: 17px;
  gap: 6px 12px;
}

.category-detail-page :deep(.avatar-circle) {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.category-detail-page :deep(.video-info-section) {
  gap: 16px;
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

.pagination-wrapper {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn,
.page-number {
  padding: 10px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;
}

.pagination-btn:hover:not(:disabled),
.page-number:hover:not(:disabled) {
  background: var(--dark-light);
  border-color: var(--primary);
}

.page-number.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: #fff;
}

.pagination-btn:disabled,
.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Responsive adjustments for padding and header */
@media (min-width: 1200px) {
  .category-detail-page {
    padding: 60px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .category-detail-page {
    padding: 40px 30px;
  }

  .category-header {
    margin-bottom: 40px;
  }

  .back-btn {
    padding: 10px 18px;
    font-size: 15px;
    margin-bottom: 28px;
  }

  .category-title-section {
    gap: 20px;
  }

  .category-icon-large {
    width: 90px;
    height: 90px;
    border-radius: 18px;
  }

  .category-icon-large svg {
    width: 44px;
    height: 44px;
  }

  .category-title {
    font-size: 36px;
  }

  .category-meta {
    font-size: 18px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 20px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 16px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 16px;
    margin-bottom: 18px;
  }
}

@media (max-width: 767px) {
  .category-detail-page {
    padding: 24px 20px;
  }

  .category-header {
    margin-bottom: 32px;
  }

  .back-btn {
    padding: 10px 16px;
    font-size: 14px;
    margin-bottom: 24px;
    gap: 8px;
  }

  .back-btn svg {
    width: 18px;
    height: 18px;
  }

  .category-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .category-icon-large {
    width: 70px;
    height: 70px;
    border-radius: 16px;
  }

  .category-icon-large svg {
    width: 36px;
    height: 36px;
  }

  .category-title {
    font-size: 28px;
  }

  .category-meta {
    font-size: 16px;
  }

  .content-grid {
    gap: 20px;
  }

  .category-detail-page :deep(.youtube-video-card) {
    padding: 4px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 14px;
    gap: 4px 8px;
  }

  .category-detail-page :deep(.avatar-circle) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .category-detail-page :deep(.video-info-section) {
    gap: 12px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 20px;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: 13px;
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .category-detail-page {
    padding: 16px 12px;
  }

  .category-header {
    margin-bottom: 24px;
  }

  .back-btn {
    padding: 8px 14px;
    font-size: 13px;
    margin-bottom: 20px;
    gap: 6px;
    border-radius: 10px;
  }

  .back-btn svg {
    width: 16px;
    height: 16px;
  }

  .back-btn span {
    display: none;
  }

  .category-title-section {
    gap: 12px;
  }

  .category-icon-large {
    width: 60px;
    height: 60px;
    border-radius: 12px;
  }

  .category-icon-large svg {
    width: 28px;
    height: 28px;
  }

  .category-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .category-meta {
    font-size: 14px;
  }

  .content-grid {
    gap: 16px;
  }

  .category-detail-page :deep(.youtube-video-card) {
    padding: 2px;
  }

  .category-detail-page :deep(.video-thumbnail-wrapper) {
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .category-detail-page :deep(.video-title-text) {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .category-detail-page :deep(.video-meta-info) {
    font-size: 12px;
    gap: 4px 6px;
  }

  .category-detail-page :deep(.avatar-circle) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .category-detail-page :deep(.video-info-section) {
    gap: 10px;
  }

  .empty-state {
    padding: 40px 12px;
  }

  .empty-state svg {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    font-size: 18px;
  }

  .btn-primary {
    padding: 10px 18px;
    font-size: 12px;
    margin-top: 16px;
    border-radius: 10px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .category-detail-page :deep(.youtube-video-card):hover {
    transform: none;
  }

  .category-detail-page :deep(.youtube-video-card):active {
    transform: scale(0.98);
  }

  .back-btn:hover {
    background: var(--dark-lighter);
    border-color: rgba(255, 69, 0, 0.2);
    color: var(--text-secondary);
  }

  .back-btn:active {
    background: rgba(255, 69, 0, 0.1);
    border-color: rgba(255, 69, 0, 0.3);
    color: var(--text-primary);
  }

  .btn-primary:hover {
    transform: none;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }
}
</style>

