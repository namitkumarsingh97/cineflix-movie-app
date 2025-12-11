<template>
  <div class="categories-page">
    <div class="categories-header">
      <h1>
        <FolderOpen :size="28" />
        <span>Categories</span>
      </h1>
      <p class="categories-subtitle">Browse movies by category</p>
    </div>

    <Loader v-if="loading" message="Loading categories..." />

    <div v-else-if="categories.length > 0" class="youtube-videos-grid">
      <div
        v-for="category in categories"
        :key="category.name"
        class="category-card"
        @click="navigateToCategory(category.name)"
      >
        <div class="category-thumbnail-wrapper">
          <img
            v-if="category.thumbnail"
            :src="category.thumbnail"
            :alt="category.name"
            class="category-thumbnail-img"
            @error="handleThumbnailError"
          />
          <div v-else class="category-thumbnail-placeholder">
            <FolderOpen :size="80" />
          </div>
          <div class="category-overlay">
            <div class="category-overlay-content">
              <FolderOpen :size="48" />
              <span>Browse</span>
            </div>
          </div>
        </div>
        <div class="category-info-section">
          <h3 class="category-title-text" :title="category.name">
            {{ category.name || 'Uncategorized' }}
          </h3>
          <div class="category-meta-info">
            <span class="category-count-text">
              {{ category.count }} {{ category.count === 1 ? 'item' : 'items' }}
              <span v-if="category.movieCount > 0 && category.videoCount > 0" class="category-breakdown">
                ({{ category.movieCount }} {{ category.movieCount === 1 ? 'movie' : 'movies' }}, 
                {{ category.videoCount }} {{ category.videoCount === 1 ? 'video' : 'videos' }})
              </span>
              <span v-else-if="category.movieCount > 0" class="category-breakdown">
                ({{ category.movieCount }} {{ category.movieCount === 1 ? 'movie' : 'movies' }})
              </span>
              <span v-else-if="category.videoCount > 0" class="category-breakdown">
                ({{ category.videoCount }} {{ category.videoCount === 1 ? 'video' : 'videos' }})
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <div class="pagination-info">
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <span class="pagination-total">• {{ totalCount }} categories</span>
        </div>
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1 || loading"
            @click="handlePageChange(currentPage - 1)"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            :class="['page-number', { active: page === currentPage }]"
            @click="handlePageChange(page)"
            :disabled="loading"
          >
            {{ page }}
          </button>
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages || loading"
            @click="handlePageChange(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <FolderOpen :size="64" />
      <h3>No categories found</h3>
      <p>Categories will appear here once movies are added.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FolderOpen } from 'lucide-vue-next';
import { videosApi } from '../api/videos';
import Loader from '../components/Loader.vue';

const router = useRouter();

const categories = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(20);
const totalPages = ref(1);
const totalCount = ref(0);

onMounted(async () => {
  await loadCategories();
});

async function loadCategories(page = 1) {
  loading.value = true;
  currentPage.value = page;

  try {
    let categoryData = [];
    let metaTotal = 0;
    let metaTotalPages = 1;

    try {
      // Primary: use dedicated categories endpoint
      const { data } = await videosApi.getCategories({
        page,
        limit: pageSize.value,
      });
      categoryData = data?.data || data?.categories || [];
      metaTotal = data?.meta?.total || data?.total || categoryData.length;
      metaTotalPages =
        data?.meta?.totalPages ||
        data?.totalPages ||
        Math.max(1, Math.ceil(metaTotal / pageSize.value));
    } catch (err) {
      console.warn('videos/categories endpoint failed, falling back to videos list', err);
      // Fallback: derive categories from paginated videos list
      const { data } = await videosApi.getAll({
        params: {
          page,
          limit: pageSize.value,
        },
      });
      const videos = data?.data || data?.videos || data || [];
      const counts = new Map();
      videos.forEach((video) => {
        (video.categories || []).forEach((cat) => {
          if (!cat || !cat.trim()) return;
          const name = cat.trim();
          const current = counts.get(name) || {
            name,
            videoCount: 0,
            thumbnail: video.thumbnail || null,
          };
          current.videoCount += 1;
          if (!current.thumbnail && video.thumbnail) {
            current.thumbnail = video.thumbnail;
          }
          counts.set(name, current);
        });
      });
      categoryData = Array.from(counts.values());
      metaTotal = data?.meta?.total || data?.total || categoryData.length;
      metaTotalPages =
        data?.meta?.totalPages ||
        data?.totalPages ||
        Math.max(1, Math.ceil(metaTotal / pageSize.value));
    }

    categories.value = categoryData
      .map((cat) => {
        const name = cat.name || cat.category;
        if (!name) return null;
        const videoCount = cat.count || cat.videoCount || 0;
        return {
          name,
          movieCount: 0,
          videoCount,
          count: videoCount,
          thumbnail: cat.thumbnail || null,
        };
      })
      .filter(Boolean)
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    totalPages.value = metaTotalPages;
    totalCount.value = metaTotal || categories.value.length;
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToCategory(categoryName) {
  router.push(`/category/${encodeURIComponent(categoryName)}`);
}

function handlePageChange(page) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  loadCategories(page);
}

function handleThumbnailError(event) {
  event.target.style.display = 'none';
  const placeholder = event.target.parentElement.querySelector('.category-thumbnail-placeholder');
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}
</script>

<style scoped>
.categories-page {
  min-height: calc(100vh - 200px);
  width: 100%;
  padding: 60px;
  margin: 0 auto;
}

.categories-header {
  margin-bottom: 60px;
  text-align: center;
}

.categories-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.categories-header h1 svg {
  color: var(--primary);
  flex-shrink: 0;
}

.categories-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.category-breakdown {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.8;
  margin-left: 3px;
}

/* Responsive Grid Layout for Categories */
.categories-page :deep(.youtube-videos-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  align-items: stretch;
}

/* Small tablets - 3 columns */
@media (min-width: 640px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
}

/* Tablet - 4 columns */
@media (min-width: 768px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
}

/* Large screens - 5 columns */
@media (min-width: 1024px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 18px;
  }
}

@media (min-width: 1400px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
}

.category-card {
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  padding: 4px;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-8px);
}

.category-card:active {
  transform: translateY(-4px);
}

.category-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.category-thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.category-thumbnail-placeholder svg {
  width: 40px;
  height: 40px;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay,
.category-card:active .category-overlay {
  opacity: 1;
}

.category-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.category-overlay-content svg {
  width: 32px;
  height: 32px;
}

.category-info-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 0;
  flex: 1;
  min-height: 60px;
}

.category-title-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 39px; /* Fixed height for 2 lines (15px * 1.3 * 2) */
}

.category-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.category-count-text {
  display: inline-block;
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
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
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

/* Responsive adjustments for padding and header */
@media (min-width: 1200px) {
  .categories-page {
    padding: 60px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .categories-page {
    padding: 40px 30px;
  }

  .categories-header {
    margin-bottom: 40px;
  }

  .categories-header h1 {
    font-size: 32px;
  }

  .categories-subtitle {
    font-size: 15px;
  }

  .category-title-text {
    font-size: 22px;
  }

  .category-meta-info {
    font-size: 16px;
  }

  .category-thumbnail-wrapper {
    border-radius: 16px;
    margin-bottom: 18px;
  }

  .category-overlay-content {
    font-size: 20px;
    gap: 10px;
  }

  .category-overlay-content svg {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 767px) {
  .categories-page {
    padding: 24px 20px;
  }

  .categories-header {
    margin-bottom: 32px;
  }

  .categories-header h1 {
    font-size: 26px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .categories-header h1 svg {
    width: 24px;
    height: 24px;
  }

  .categories-subtitle {
    font-size: 14px;
  }

  .category-breakdown {
    font-size: 12px;
    display: block;
    margin-left: 0;
    margin-top: 4px;
  }

  .category-card {
    padding: 4px;
  }

  .category-thumbnail-wrapper {
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .category-thumbnail-placeholder svg {
    width: 32px;
    height: 32px;
  }

  .category-overlay-content {
    font-size: 16px;
    gap: 6px;
  }

  .category-overlay-content svg {
    width: 28px;
    height: 28px;
  }

  .category-title-text {
    font-size: 18px;
  }

  .category-meta-info {
    font-size: 13px;
    gap: 4px 8px;
  }

  .category-info-section {
    gap: 6px;
    padding: 2px 0;
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
}

@media (max-width: 480px) {
  .categories-page {
    padding: 16px 12px;
  }

  .categories-header {
    margin-bottom: 24px;
  }

  .categories-header h1 {
    font-size: 22px;
    gap: 6px;
  }

  .categories-header h1 svg {
    width: 20px;
    height: 20px;
  }

  .categories-subtitle {
    font-size: 13px;
  }

  .categories-page :deep(.youtube-videos-grid) {
    gap: 16px;
  }

  .category-card {
    padding: 2px;
  }

  .category-thumbnail-wrapper {
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .category-thumbnail-placeholder svg {
    width: 28px;
    height: 28px;
  }

  .category-overlay-content {
    font-size: 14px;
    gap: 4px;
  }

  .category-overlay-content svg {
    width: 24px;
    height: 24px;
  }

  .category-title-text {
    font-size: 16px;
    -webkit-line-clamp: 2;
  }

  .category-meta-info {
    font-size: 12px;
    gap: 4px 6px;
    flex-direction: column;
  }

  .category-breakdown {
    font-size: 11px;
  }

  .category-info-section {
    gap: 4px;
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
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .category-card:hover {
    transform: none;
  }

  .category-card:active {
    transform: scale(0.98);
  }

  .category-overlay {
    opacity: 0.3;
  }

  .category-card:active .category-overlay {
    opacity: 0.7;
  }
}
</style>

