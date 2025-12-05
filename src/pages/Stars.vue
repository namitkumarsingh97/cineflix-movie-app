<template>
  <div class="stars-page">
    <Loader v-if="loading" message="Loading starred videos..." />

    <div v-else-if="displayedStars.length > 0" class="youtube-videos-grid">
      <div
        v-for="star in displayedStars"
        :key="star.star"
        class="category-card"
      >
        <div class="category-thumbnail-wrapper">
          <img
            v-if="star.thumbnail"
            :src="star.thumbnail"
            :alt="star.star"
            class="category-thumbnail-img"
            @error="handleThumbnailError"
          />
          <div v-else class="category-thumbnail-placeholder">
            <Star :size="80" />
          </div>
          <div class="category-overlay">
            <div class="category-overlay-content">
              <Star :size="48" />
              <span>Browse</span>
            </div>
          </div>
        </div>
        <div class="category-info-section">
          <h3 class="category-title-text" :title="star.star">
            {{ star.star }}
          </h3>
          <div class="category-meta-info" v-if="star.count !== null && star.count !== undefined">
            <span class="category-count-text" v-if="star.count !== null">
              {{ star.count }} {{ star.count === 1 ? 'movie' : 'movies' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Star :size="64" />
      <h3 v-if="showingFollowed">No followed stars yet</h3>
      <h3 v-else>No stars found</h3>
      <p v-if="showingFollowed">Follow a star from any video page to see them here.</p>
      <p v-else>Stars will appear here once movies with star information are added.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Star } from 'lucide-vue-next';
import { moviesApi } from '../api/movies';
import Loader from '../components/Loader.vue';
import { useStarFollows } from '../composables/useStarFollows';

const router = useRouter();
const route = useRoute();
const { stars: followedStars } = useStarFollows();

const stars = ref([]);
const loading = ref(true);
const filter = computed(() => route.query.filter || '');
const showingFollowed = computed(() => filter.value === 'followed');

const displayedStars = computed(() => {
  if (showingFollowed.value) {
    return followedStars.value.map(name => ({
      star: name,
      count: null,
    }));
  }
  return stars.value;
});

onMounted(async () => {
  if (showingFollowed.value) {
    loading.value = false;
  } else {
    await loadStars();
  }
});

async function loadStars() {
  loading.value = true;
  try {
    const response = await moviesApi.getStars();
    if (response.data.success) {
      stars.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Failed to load stars:', error);
  } finally {
    loading.value = false;
  }
}

function handleThumbnailError(event) {
  event.target.style.display = 'none';
  const placeholder = event.target.nextElementSibling;
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}
</script>

<style scoped>
.stars-page {
  padding: 60px 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.stars-header {
  text-align: center;
  margin-bottom: 60px;
}

.stars-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.stars-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 16px;
}

/* Use same grid styles as Categories page */
:deep(.youtube-videos-grid) {
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
  }
}

@media (min-width: 1024px) {
  :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  :deep(.youtube-videos-grid) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.category-card {
  cursor: default;
  transition: box-shadow 0.3s ease;
  border-radius: 20px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.category-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  border-radius: 20px;
  margin-bottom: 20px;
  background: var(--dark-light);
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--dark-light) 0%, var(--dark-lighter) 100%);
  color: var(--text-secondary);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
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
  font-size: 20px;
  font-weight: 700;
}

.category-info-section {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-title-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--text-secondary);
}

.category-count-text {
  font-weight: 500;
}
</style>

