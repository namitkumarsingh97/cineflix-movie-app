<template>
  <div class="categories-page">
    <div class="categories-header">
      <h1>
        <FolderOpen :size="28" />
        <span>{{ $t('categories.title') }}</span>
      </h1>
      <p class="categories-subtitle">{{ $t('categories.subtitle') }}</p>
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
            <span class="category-count-text">{{ $t('categories.movies', { count: category.count }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <FolderOpen :size="64" />
      <h3>{{ $t('categories.noCategories') }}</h3>
      <p>{{ $t('categories.noCategoriesDesc') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FolderOpen, ChevronRight } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import Loader from '../components/Loader.vue';

const { t } = useI18n();

const router = useRouter();

const categories = ref([]);
const loading = ref(true);

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    const response = await apiClient.get('/movies/categories');
    if (response.data.success) {
      // Transform the data to include count and thumbnail
      const categoryData = response.data.data || [];
      categories.value = categoryData.map(cat => ({
        name: cat.category || 'Uncategorized',
        count: cat.count || 0,
        thumbnail: cat.thumbnail || null,
      })).filter(cat => cat.count > 0); // Only show categories with movies
      
      // Sort by count (descending)
      categories.value.sort((a, b) => b.count - a.count);
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToCategory(categoryName) {
  router.push(`/category/${encodeURIComponent(categoryName)}`);
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
  padding: 60px;
  max-width: 1600px;
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
}

.categories-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* Responsive Grid Layout for Categories */
.categories-page :deep(.youtube-videos-grid) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

/* Tablet - 2 columns */
@media (min-width: 768px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

/* Large screens - 2-3 columns (fewer columns = bigger cards) */
@media (min-width: 1024px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
  }
}

@media (min-width: 1400px) {
  .categories-page :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
}

.category-card {
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  padding: 8px;
}

.category-card:hover {
  transform: translateY(-8px);
}

.category-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
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

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.category-info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.category-title-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.5;
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

/* Responsive adjustments for padding and header */
@media (min-width: 768px) and (max-width: 1023px) {
  .categories-page {
    padding: 30px;
  }

  .categories-header h1 {
    font-size: 32px;
  }
}

@media (max-width: 767px) {
  .categories-page {
    padding: 20px;
  }

  .categories-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .categories-page {
    padding: 16px;
  }

  .categories-header h1 {
    font-size: 24px;
  }
}
</style>

