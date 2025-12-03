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
            <FolderOpen :size="48" />
          </div>
          <div class="category-overlay">
            <div class="category-overlay-content">
              <FolderOpen :size="24" />
              <span>Browse</span>
            </div>
          </div>
        </div>
        <div class="category-info-section">
          <h3 class="category-title-text" :title="category.name">
            {{ category.name || 'Uncategorized' }}
          </h3>
          <div class="category-meta-info">
            <span class="category-count-text">{{ category.count }} {{ category.count === 1 ? 'movie' : 'movies' }}</span>
          </div>
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
import { FolderOpen, ChevronRight } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import Loader from '../components/Loader.vue';

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
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.categories-header {
  margin-bottom: 40px;
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

.category-card {
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
}

.category-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
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
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.category-info-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-title-text {
  font-size: 14px;
  font-weight: 500;
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
  gap: 4px 8px;
  font-size: 13px;
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

/* Tablet - show 2 cards per row */
@media (min-width: 481px) and (max-width: 768px) {
  .categories-page {
    padding: 20px;
  }

  .categories-header h1 {
    font-size: 28px;
  }


  .category-card {
    padding: 20px;
  }

  .category-icon {
    width: 56px;
    height: 56px;
  }

  .category-name {
    font-size: 16px;
  }
}

/* Small screens - show 1 card per row */
@media (max-width: 480px) {
  .categories-page {
    padding: 16px;
  }

  .categories-header h1 {
    font-size: 24px;
  }


  .category-card {
    padding: 18px;
  }

  .category-icon {
    width: 52px;
    height: 52px;
  }

  .category-name {
    font-size: 15px;
  }
}
</style>

