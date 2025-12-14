<template>
  <div class="actors-page-container">
    <!-- Category Sidebar -->
    <CategorySidebar 
      :is-open="sidebarOpen" 
      @filter-change="handleFilterChange"
    />
    
    <!-- Main Content (with sidebar offset) -->
    <div class="actors-content">
      <div class="actors-page">
        <div class="page-header">
          <h1 class="page-title">Actors</h1>
          <p class="page-subtitle">Browse all actors and performers</p>
        </div>

        <SkeletonSection
          v-if="loading"
          :count="maxActorsPerPage"
          :columns="4"
        />

        <div v-else-if="displayedActors.length > 0" class="actors-content-section">
          <div class="actors-info">
            <p class="actors-count">
              Showing {{ displayedActors.length }} of {{ totalActorsCount }} actors
            </p>
          </div>

          <div class="actors-grid">
            <div
              v-for="(actor, index) in displayedActors"
              :key="actor.name"
              class="actor-card"
              :class="{ 'actor-card-with-thumbnail': actor.thumbnail }"
              @click="navigateToActor(actor.name)"
            >
              <!-- Cards with thumbnail -->
              <div v-if="actor.thumbnail" class="actor-card-thumbnail-wrapper">
                <img
                  :src="actor.thumbnail"
                  :alt="actor.name"
                  class="actor-thumbnail"
                  @error="handleThumbnailError"
                />
                <div class="actor-thumbnail-overlay">
                  <div class="actor-card-content">
                    <h3 class="actor-name">{{ actor.name }}</h3>
                    <p class="actor-video-count" v-if="actor.videoCount">
                      {{ actor.videoCount }} {{ actor.videoCount === 1 ? 'video' : 'videos' }}
                    </p>
                  </div>
                </div>
              </div>
              <!-- Cards with avatar (when no thumbnail) -->
              <div v-else class="actor-card-content">
                <div class="actor-avatar">
                  {{ getInitials(actor.name) }}
                </div>
                <h3 class="actor-name">{{ actor.name }}</h3>
                <p class="actor-video-count" v-if="actor.videoCount">
                  {{ actor.videoCount }} {{ actor.videoCount === 1 ? 'video' : 'videos' }}
                </p>
              </div>
            </div>
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
                :disabled="currentPage >= totalPages || loading"
                @click="goToPage(currentPage + 1)"
              >
                <span>Next</span>
                <ChevronRight :size="18" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <Star :size="80" class="empty-icon" />
          <h3>No actors found</h3>
          <p>Try again later</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEporner } from '../composables/useEporner';
import SkeletonSection from '../components/SkeletonSection.vue';
import CategorySidebar from '../components/CategorySidebar.vue';
import { Star, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const { searchVideos, videos: epornerVideos, totalCount: epornerTotalCount } = useEporner();

const sidebarOpen = ref(true);
const loading = ref(true); // Start with loading to show skeleton while fetching thumbnail
const currentPage = ref(1);
const actorsPerPage = 24; // 4 columns x 6 rows
const maxActorsPerPage = actorsPerPage;

function handleFilterChange(filter) {
  console.log('Filter changed:', filter);
}

const allActors = ref([
  { name: 'Abella Danger', videoCount: null, thumbnail: null },
  { name: 'AJ Applegate', videoCount: null, thumbnail: null },
  { name: 'Aaliyah Hadid', videoCount: null, thumbnail: null },
  { name: 'Aaliyah Love', videoCount: null, thumbnail: null },
  { name: 'Abigaile Johnson', videoCount: null, thumbnail: null },
  /* { name: 'Adira Allure', videoCount: null, thumbnail: null },
  { name: 'Adria Rae', videoCount: null, thumbnail: null },
  { name: 'Adriana Chechik', videoCount: null, thumbnail: null },
  { name: 'Aletta Ocean', videoCount: null, thumbnail: null },
  { name: 'Alex Blake', videoCount: null, thumbnail: null },
  { name: 'Alex Chance', videoCount: null, thumbnail: null },
  { name: 'Alex Coal', videoCount: null, thumbnail: null },
  { name: 'Alex De La Flor', videoCount: null, thumbnail: null },
  { name: 'Alex Gonz', videoCount: null, thumbnail: null },
  { name: 'Alex Grey', videoCount: null, thumbnail: null },
  { name: 'Alex Harper', videoCount: null, thumbnail: null },
  { name: 'Alex Jett', videoCount: null, thumbnail: null },
  { name: 'Alex Jones', videoCount: null, thumbnail: null },
  { name: 'Alex Legend', videoCount: null, thumbnail: null },
  { name: 'Alex Lynn', videoCount: null, thumbnail: null },
  { name: 'Alex Mack', videoCount: null, thumbnail: null },
  { name: 'Alex Moreno', videoCount: null, thumbnail: null },
  { name: 'Alex Tanner', videoCount: null, thumbnail: null },
  { name: 'Alex Victor', videoCount: null, thumbnail: null },
  { name: 'Alexa Flexy', videoCount: null, thumbnail: null },
  { name: 'Alexa Grace', videoCount: null, thumbnail: null },*/
]);

// Computed for total actors count
const totalActorsCount = computed(() => allActors.value.length);

// Computed for total pages
const totalPages = computed(() => {
  return Math.ceil(totalActorsCount.value / actorsPerPage);
});

// Computed for display total pages
const displayTotalPages = computed(() => {
  const total = totalPages.value;
  if (total > 100) {
    return '100+';
  }
  return total.toString();
});

// Computed for displayed actors (paginated)
const displayedActors = computed(() => {
  const start = (currentPage.value - 1) * actorsPerPage;
  const end = start + actorsPerPage;
  return allActors.value.slice(start, end);
});

// Calculate visible pages for pagination
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
  }

  return pages;
});

// Get initials for avatar
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Navigate to actor page
function navigateToActor(actorName) {
  if (!actorName) return;
  const encodedName = encodeURIComponent(actorName.toLowerCase().replace(/\s+/g, '-'));
  router.push(`/${encodedName}`);
}

// Handle thumbnail error
function handleThumbnailError(event) {
  // Fallback to avatar if thumbnail fails to load
  const actorCard = event.target.closest('.actor-card');
  if (actorCard) {
    const actorName = actorCard.querySelector('.actor-name')?.textContent;
    if (actorName) {
      // Remove thumbnail and show avatar instead
      const thumbnailWrapper = actorCard.querySelector('.actor-card-thumbnail-wrapper');
      if (thumbnailWrapper) {
        thumbnailWrapper.innerHTML = `
          <div class="actor-card-content">
            <div class="actor-avatar">${getInitials(actorName)}</div>
            <h3 class="actor-name">${actorName}</h3>
          </div>
        `;
      }
    }
  }
}

// Fetch actor's most viewed video thumbnail with retry logic
async function loadActorThumbnail(actorName, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Search for actor videos, sorted by most popular (most views)
      // Get just 1 video to get the most viewed one for thumbnail
      await searchVideos(actorName.toLowerCase(), 1, { 
        perPage: 1, 
        order: 'most-popular' 
      });
      
      // Get the first (most viewed) video
      if (epornerVideos.value && epornerVideos.value.length > 0) {
        const mostViewedVideo = epornerVideos.value[0];
        const actor = allActors.value.find(a => a.name === actorName);
        if (actor) {
          // Get total count if available
          if (epornerTotalCount.value) {
            actor.videoCount = epornerTotalCount.value;
            // If video count is less than 100, remove the actor
            if (epornerTotalCount.value < 100) {
              const index = allActors.value.findIndex(a => a.name === actorName);
              if (index > -1) {
                allActors.value.splice(index, 1);
              }
              return; // Don't set thumbnail for removed actor
            }
          }
          // Only set thumbnail if actor still exists (wasn't removed)
          if (mostViewedVideo.thumbnail && allActors.value.find(a => a.name === actorName)) {
            actor.thumbnail = mostViewedVideo.thumbnail;
          }
        }
      }
      return; // Success, exit retry loop
    } catch (error) {
      // Suppress console errors for expected failures (CORS, rate limiting, network issues)
      const isExpectedError = error?.message?.includes('Failed to fetch') || 
                              error?.message?.includes('CORS') ||
                              error?.message?.includes('503') ||
                              error?.message?.includes('NetworkError');
      
      if (!isExpectedError && attempt === retries - 1) {
        // Only log unexpected errors on final attempt
        console.warn(`Failed to load thumbnail for ${actorName} after ${retries} attempts`);
      }
      
      // If not the last attempt, wait before retrying with exponential backoff
      if (attempt < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Fetch Abella Danger's most viewed video thumbnail (kept for backward compatibility)
async function loadAbellaDangerThumbnail() {
  await loadActorThumbnail('Abella Danger');
}

// Go to page
function goToPage(page) {
  if (page === '...' || page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load actors on mount
onMounted(async () => {
  // Actors list is already initialized
  // Load thumbnails in the background
  loading.value = true;
  try {
    // Load thumbnails for all actors (in smaller batches with delays to avoid rate limiting)
    const allActorNames = allActors.value.map(a => a.name);
    
    // Process actors sequentially in small batches to avoid overwhelming the API
    const BATCH_SIZE = 3; // Reduced from 10 to 3
    const DELAY_BETWEEN_REQUESTS = 800; // Delay between individual requests (ms)
    const DELAY_BETWEEN_BATCHES = 2000; // Delay between batches (ms)
    
    for (let i = 0; i < allActorNames.length; i += BATCH_SIZE) {
      const batch = allActorNames.slice(i, i + BATCH_SIZE);
      
      // Process batch sequentially (not in parallel) to reduce concurrent requests
      for (let j = 0; j < batch.length; j++) {
        const name = batch[j];
        await loadActorThumbnail(name).catch(() => {
          // Errors are already handled in loadActorThumbnail with retry logic
          return null; // Continue even if one fails
        });
        
        // Delay between individual requests within a batch (except for the last one)
        if (j < batch.length - 1 || i + BATCH_SIZE < allActorNames.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
      }
      
      // Delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < allActorNames.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Filter out actors with less than 100 videos
    allActors.value = allActors.value.filter(actor => {
      // If videoCount is null/undefined, keep the actor (count not loaded yet)
      // If videoCount exists and is < 100, remove the actor
      if (actor.videoCount !== null && actor.videoCount !== undefined && actor.videoCount < 100) {
        return false;
      }
      return true;
    });
  } catch (error) {
    // Suppress expected errors - they're already handled in loadActorThumbnail
    // Only log unexpected errors
    if (!error?.message?.includes('Failed to fetch') && 
        !error?.message?.includes('CORS') &&
        !error?.message?.includes('503')) {
      console.warn('Error loading actor thumbnails:', error);
    }
    // Continue even if thumbnail fails - actor cards will show with avatars
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.actors-page-container {
  display: flex;
  position: relative;
  align-items: flex-start;
  gap: 0;
}

.actors-content {
  flex: 1;
  min-width: 0;
}

.actors-page {
  width: 100%;
  padding: 40px;
  margin: 0 auto;
  max-width: 1600px;
}

/* Large screens (1024px - 1399px) */
@media (max-width: 1399px) {
  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }
}

/* Tablet and smaller (1024px and below) */
@media (max-width: 1024px) {
  .actors-content {
    margin-left: 0;
  }

  .actors-page {
    padding: 30px;
  }

  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .actor-card-with-thumbnail {
    min-height: 240px;
  }

  .actor-card-thumbnail-wrapper {
    min-height: 240px;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.actors-content-section {
  margin-top: 2rem;
}

.actors-info {
  margin-bottom: 1.5rem;
}

.actors-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.actors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.actor-card {
  background: var(--dark-lighter, #2a2a3e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.actor-card:hover {
  background: var(--dark-light, #3a3a4e);
  border-color: var(--primary, #ff4500);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 69, 0, 0.2);
}

.actor-card-with-thumbnail {
  padding: 0;
  min-height: 280px;
}

.actor-card-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  overflow: hidden;
  border-radius: 12px;
}

.actor-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.actor-card:hover .actor-thumbnail {
  transform: scale(1.1);
}

.actor-thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%);
  padding: 20px;
  padding-top: 40px;
}

.actor-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.actor-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.actor-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
  text-align: center;
}

.actor-card-with-thumbnail .actor-name {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.actor-card-with-thumbnail .actor-video-count {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.actor-video-count {
  font-size: 13px;
  color: var(--text-secondary, #b0b0b0);
  margin: 0;
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
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 1rem;
}

/* Tablet (768px - 1023px) */
@media (max-width: 768px) {
  .actors-page {
    padding: 20px;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .actors-content-section {
    margin-top: 1.5rem;
  }

  .actors-info {
    margin-bottom: 1rem;
  }

  .actors-count {
    font-size: 13px;
  }

  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .actor-card {
    padding: 20px;
  }

  .actor-card-with-thumbnail {
    min-height: 220px;
  }

  .actor-card-thumbnail-wrapper {
    min-height: 220px;
  }

  .actor-thumbnail-overlay {
    padding: 16px;
    padding-top: 32px;
  }

  .actor-avatar {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .actor-name {
    font-size: 14px;
  }

  .actor-video-count {
    font-size: 12px;
  }

  .pagination-wrapper {
    margin-top: 2rem;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 6px;
  }

  .pagination-btn {
    padding: 8px 14px;
    font-size: 13px;
  }

  .page-number {
    min-width: 36px;
    padding: 8px;
    font-size: 13px;
  }
}

/* Small mobile (480px - 767px) */
@media (max-width: 480px) {
  .actors-page {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 1.25rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .actors-content-section {
    margin-top: 1.25rem;
  }

  .actors-info {
    margin-bottom: 0.75rem;
  }

  .actors-count {
    font-size: 12px;
  }

  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .actor-card {
    padding: 16px;
  }

  .actor-card-with-thumbnail {
    min-height: 200px;
  }

  .actor-card-thumbnail-wrapper {
    min-height: 200px;
  }

  .actor-thumbnail-overlay {
    padding: 12px;
    padding-top: 28px;
  }

  .actor-card-content {
    gap: 8px;
  }

  .actor-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .actor-name {
    font-size: 13px;
  }

  .actor-video-count {
    font-size: 11px;
  }

  .pagination-wrapper {
    margin-top: 1.5rem;
    gap: 0.75rem;
  }

  .pagination-info {
    font-size: 12px;
  }

  .pagination {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 13px;
  }

  .pagination-btn span {
    display: inline;
  }

  .page-numbers {
    width: 100%;
    justify-content: center;
    gap: 4px;
  }

  .page-number {
    min-width: 32px;
    padding: 8px;
    font-size: 12px;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .empty-icon {
    margin-bottom: 0.75rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.9rem;
  }
}

/* Extra small mobile (< 480px) */
@media (max-width: 360px) {
  .actors-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .actor-card {
    padding: 12px;
  }

  .actor-card-with-thumbnail {
    min-height: 180px;
  }

  .actor-card-thumbnail-wrapper {
    min-height: 180px;
  }

  .actor-thumbnail-overlay {
    padding: 10px;
    padding-top: 24px;
  }

  .actor-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .actor-name {
    font-size: 12px;
  }

  .actor-video-count {
    font-size: 10px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .pagination-btn span {
    display: none;
  }

  .page-number {
    min-width: 28px;
    padding: 6px;
    font-size: 11px;
  }
}
</style>

