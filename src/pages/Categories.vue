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
    </div>

    <div v-else class="empty-state">
      <FolderOpen :size="64" />
      <h3>No categories found</h3>
      <p>Categories will appear here once movies are added.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FolderOpen, ChevronRight } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import { useEporner } from '../composables/useEporner';
import Loader from '../components/Loader.vue';

const router = useRouter();
const { videos: epornerVideos, searchVideos } = useEporner();

const categories = ref([]);
const loading = ref(true);

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    // Load movie categories
    const movieCategories = [];
    try {
      const response = await apiClient.get('/movies/categories');
      if (response.data.success) {
        const categoryData = response.data.data || [];
        categoryData.forEach(cat => {
          if (cat.category && cat.count > 0) {
            movieCategories.push({
              name: cat.category,
              movieCount: cat.count || 0,
              videoCount: 0,
              thumbnail: cat.thumbnail || null,
              source: 'movie'
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to load movie categories:', error);
    }

    // Load video categories from Eporner
    const videoCategoriesMap = new Map();
    const assignedVideoIds = new Set(); // Track videos already assigned to a category
    try {
      // Fetch first 3 pages to get a good sample of categories (90 videos)
      for (let page = 1; page <= 3; page++) {
        await searchVideos('all', page, { perPage: 30, order: 'most-popular' });
        
        epornerVideos.value.forEach(video => {
          // Skip if video already assigned to a category
          if (assignedVideoIds.has(video.id)) {
            return;
          }
          
          if (video.categories && Array.isArray(video.categories) && video.categories.length > 0) {
            // Sort categories alphabetically and assign video to first category only
            const sortedCategories = video.categories
              .map(cat => cat && cat.trim() ? cat.trim() : null)
              .filter(cat => cat !== null)
              .sort();
            
            if (sortedCategories.length > 0) {
              const firstCategory = sortedCategories[0];
              
              // Initialize category if it doesn't exist
              if (!videoCategoriesMap.has(firstCategory)) {
                videoCategoriesMap.set(firstCategory, {
                  name: firstCategory,
                  movieCount: 0,
                  videoCount: 0,
                  thumbnail: video.thumbnail || null,
                  source: 'video'
                });
              }
              
              // Assign video to this category only
              videoCategoriesMap.get(firstCategory).videoCount++;
              assignedVideoIds.add(video.id);
              
              // Use video thumbnail if category doesn't have one yet
              if (!videoCategoriesMap.get(firstCategory).thumbnail && video.thumbnail) {
                videoCategoriesMap.get(firstCategory).thumbnail = video.thumbnail;
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load video categories:', error);
    }

    // Combine categories
    const combinedCategories = new Map();
    
    // Add movie categories
    movieCategories.forEach(cat => {
      combinedCategories.set(cat.name, { ...cat });
    });

    // Add or merge video categories
    videoCategoriesMap.forEach((videoCat, name) => {
      if (combinedCategories.has(name)) {
        // Merge: add video count to existing category
        combinedCategories.get(name).videoCount = videoCat.videoCount;
        // Use video thumbnail if movie doesn't have one
        if (!combinedCategories.get(name).thumbnail && videoCat.thumbnail) {
          combinedCategories.get(name).thumbnail = videoCat.thumbnail;
        }
      } else {
        // New category from videos
        combinedCategories.set(name, { ...videoCat });
      }
    });

    // Convert to array and calculate total count
    categories.value = Array.from(combinedCategories.values()).map(cat => ({
      name: cat.name,
      count: cat.movieCount + cat.videoCount,
      movieCount: cat.movieCount,
      videoCount: cat.videoCount,
      thumbnail: cat.thumbnail,
    })).filter(cat => cat.count > 0); // Only show categories with content
    
    // Sort by total count (descending)
    categories.value.sort((a, b) => b.count - a.count);
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

