<template>
  <div class="star-detail-page">
    <button class="back-btn" @click="goBack">
      <ArrowLeft :size="20" />
      <span>Back to Stars</span>
    </button>

    <!-- Star Profile Section -->
    <div v-if="starProfile" class="star-profile-section">
      <div class="star-profile-content">
        <div class="star-photo-container">
          <img 
            v-if="starProfile.photo" 
            :src="starProfile.photo" 
            :alt="starName"
            class="star-photo"
          />
          <div v-else class="star-photo-placeholder">
            <Star :size="80" />
          </div>
          <button 
            v-if="isAdmin" 
            class="edit-photo-btn"
            @click="showEditModal = true"
            title="Edit Star Profile"
          >
            <Edit :size="18" />
          </button>
        </div>
        
        <div class="star-info">
          <h1 class="star-name">{{ starName }}</h1>
          
          <div class="star-stats">
            <div class="stat-item">
              <span class="stat-label">Number of Videos:</span>
              <span class="stat-value">{{ starProfile.movieCount || movies.length }}</span>
            </div>
            <div class="stat-item" v-if="starProfile.createdAt">
              <span class="stat-label">Joined:</span>
              <span class="stat-value">{{ formatDate(starProfile.createdAt) }}</span>
            </div>
            <div class="stat-item" v-if="starProfile.views">
              <Diamond :size="16" />
              <span class="stat-value">{{ formatViews(starProfile.views) }}</span>
            </div>
            <div class="stat-item" v-if="starProfile.lastUpdate">
              <span class="stat-label">Last update in:</span>
              <a 
                v-if="starProfile.latestMovie" 
                href="#" 
                @click.prevent="navigateToMovie(starProfile.latestMovie._id)"
                class="last-update-link"
              >
                {{ starProfile.latestMovie.title }}
              </a>
            </div>
          </div>

          <div v-if="starProfile.bio" class="star-bio">
            <p>{{ starProfile.bio }}</p>
          </div>

          <div class="star-actions">
            <button class="action-btn like-btn" @click="handleLike">
              <ThumbsUp :size="18" />
              <span>{{ formatViews(starProfile.likes || 0) }}</span>
            </button>
            <button class="action-btn" @click="handleDislike">
              <ThumbsDown :size="18" />
              <span>{{ formatViews(starProfile.dislikes || 0) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <Loader v-if="loading" message="Loading star profile..." />

    <!-- Latest Videos Section -->
    <div v-if="!loading && movies.length > 0" class="videos-section">
      <div class="section-header">
        <h2 class="section-title">Latest Videos with {{ starName }}</h2>
        <button class="view-all-btn" @click="scrollToTop">View All</button>
      </div>
      
      <div class="movies-grid">
        <MovieCard
          v-for="movie in movies"
          :key="movie._id"
          :movie="movie"
          @click="navigateToMovie(movie._id)"
        />
      </div>
    </div>

    <div v-else-if="!loading && movies.length === 0" class="empty-state">
      <Film :size="64" />
      <h3>No movies found</h3>
      <p>There are no movies with this star yet.</p>
      <button class="btn-primary" @click="goBack">Back to Stars</button>
    </div>

    <!-- Edit Star Modal (Admin Only) -->
    <EditStarModal
      v-if="isAdmin"
      :show="showEditModal"
      :star-name="starName"
      :star-profile="starProfile"
      @close="showEditModal = false"
      @saved="handleProfileSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Star, Film, Edit, Diamond, ThumbsUp, ThumbsDown } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import { starsApi } from '../api/stars';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';
import EditStarModal from '../components/EditStarModal.vue';

const route = useRoute();
const router = useRouter();

const starName = computed(() => decodeURIComponent(route.params.star || ''));
const movies = ref([]);
const starProfile = ref(null);
const loading = ref(true);
const showEditModal = ref(false);
const isAdmin = computed(() => !!localStorage.getItem('adminToken'));

onMounted(async () => {
  await Promise.all([loadStarProfile(), loadMovies()]);
  // Increment view count
  if (starProfile.value) {
    try {
      await starsApi.incrementView(starName.value);
    } catch (e) {
      console.log('Failed to increment view');
    }
  }
});

async function loadStarProfile() {
  try {
    const response = await starsApi.getProfile(starName.value);
    if (response.data.success) {
      starProfile.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to load star profile:', error);
  }
}

async function loadMovies() {
  loading.value = true;
  try {
    const response = await apiClient.get('/movies', {
      params: {
        star: starName.value
      }
    });
    if (response.data.success) {
      movies.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Failed to load movies:', error);
  } finally {
    loading.value = false;
  }
}

function navigateToMovie(movieId) {
  router.push(`/watch/${movieId}`);
}

function goBack() {
  router.push('/stars');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatViews(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function handleLike() {
  // TODO: Implement like functionality
  console.log('Like star');
}

async function handleDislike() {
  // TODO: Implement dislike functionality
  console.log('Dislike star');
}

async function handleProfileSaved() {
  await loadStarProfile();
  showEditModal.value = false;
}
</script>

<style scoped>
.star-detail-page {
  padding: 60px 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  margin-bottom: 40px;
  background: var(--dark-light);
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: var(--dark-lighter);
}

/* Star Profile Section */
.star-profile-section {
  background: var(--dark-lighter);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 60px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.star-profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  align-items: start;
}

.star-photo-container {
  position: relative;
}

.star-photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid rgba(255, 69, 0, 0.2);
}

.star-photo-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: var(--dark);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  border: 2px solid rgba(255, 69, 0, 0.2);
}

.edit-photo-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-photo-btn:hover {
  background: var(--primary);
  transform: scale(1.1);
}

.star-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.star-name {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.star-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 16px;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.last-update-link {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.last-update-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.star-bio {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
}

.star-bio p {
  margin: 0;
}

.star-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--dark-lighter);
  border-color: var(--primary);
}

.like-btn.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

/* Videos Section */
.videos-section {
  margin-top: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.view-all-btn {
  padding: 10px 20px;
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 69, 0, 0.2);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.movies-grid {
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 48px;
  }
  
  .star-profile-content {
    grid-template-columns: 250px 1fr;
  }
}

@media (min-width: 1200px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .star-profile-content {
    grid-template-columns: 300px 1fr;
  }
}

@media (max-width: 767px) {
  .star-profile-content {
    grid-template-columns: 1fr;
  }
  
  .star-photo-container {
    max-width: 300px;
    margin: 0 auto;
  }
  
  .star-stats {
    flex-direction: column;
    gap: 12px;
  }
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
  margin-bottom: 24px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* MovieCard styling */
:deep(.movies-grid .movie-card) {
  border-radius: 20px;
}

:deep(.movies-grid .movie-card .movie-title) {
  font-size: 22px;
  font-weight: 700;
}

:deep(.movies-grid .movie-card .movie-meta) {
  font-size: 17px;
}

:deep(.movies-grid .movie-card .movie-avatar) {
  width: 48px;
  height: 48px;
}

:deep(.movies-grid .movie-card:hover) {
  transform: translateY(-8px);
}
</style>

