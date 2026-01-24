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
          <div class="header-content">
            <div>
              <h1 class="page-title">Pornstars</h1>
              <p class="page-subtitle">Browse thousands of adult performers</p>
            </div>
          </div>
          
          <!-- Search and Filter Bar -->
          <div class="filters-bar">
            <div class="search-box">
              <Search :size="20" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search pornstars..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
            
            <!-- Alphabet Filter -->
            <div class="alphabet-filter">
              <button
                :class="['alphabet-btn', { active: selectedLetter === 'all' }]"
                @click="filterByLetter('all')"
              >
                All
              </button>
              <button
                v-for="letter in alphabet"
                :key="letter"
                :class="['alphabet-btn', { active: selectedLetter === letter }]"
                @click="filterByLetter(letter)"
              >
                {{ letter }}
              </button>
            </div>
          </div>
        </div>

        <SkeletonSection
          v-if="loading"
          :count="maxActorsPerPage"
          :columns="6"
        />

        <div v-else-if="filteredActors.length > 0" class="actors-content-section">
          <div class="actors-info">
            <p class="actors-count">
              Showing {{ displayedActors.length }} of {{ filteredActors.length }} performers
              <span v-if="currentPage > 1">(Page {{ currentPage }})</span>
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
          <h3>No performers found</h3>
          <p v-if="searchQuery || selectedLetter !== 'all'">
            Try adjusting your search or filter
          </p>
          <p v-else>Try again later</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEporner } from '../composables/useEporner';
import SkeletonSection from '../components/SkeletonSection.vue';
import CategorySidebar from '../components/CategorySidebar.vue';
import { Star, ChevronLeft, ChevronRight, Search } from 'lucide-vue-next';

const router = useRouter();
const { searchVideos, videos: epornerVideos, totalCount: epornerTotalCount } = useEporner();

const sidebarOpen = ref(true);
const loading = ref(true); // Start with loading to show skeleton while fetching thumbnail
const currentPage = ref(1);
const actorsPerPage = 30; // 6 columns x 5 rows for better desktop layout
const maxActorsPerPage = actorsPerPage;
const searchQuery = ref('');
const selectedLetter = ref('all');
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function handleFilterChange(filter) {
  console.log('Filter changed:', filter);
}

// Define actors list - expanded list for pagination
const allActors = ref([
  { name: 'Abella Danger', videoCount: null, thumbnail: null },
  { name: 'AJ Applegate', videoCount: null, thumbnail: null },
  { name: 'Aaliyah Hadid', videoCount: null, thumbnail: null },
  { name: 'Aaliyah Love', videoCount: null, thumbnail: null },
  { name: 'Abigaile Johnson', videoCount: null, thumbnail: null },
  { name: 'Adira Allure', videoCount: null, thumbnail: null },
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
  { name: 'Alexa Grace', videoCount: null, thumbnail: null },
  { name: 'Angela White', videoCount: null, thumbnail: null },
  { name: 'Anissa Kate', videoCount: null, thumbnail: null },
  { name: 'Anna Bell Peaks', videoCount: null, thumbnail: null },
  { name: 'Ariana Marie', videoCount: null, thumbnail: null },
  { name: 'Asa Akira', videoCount: null, thumbnail: null },
  { name: 'Ava Addams', videoCount: null, thumbnail: null },
  { name: 'Brandi Love', videoCount: null, thumbnail: null },
  { name: 'Brianna Beach', videoCount: null, thumbnail: null },
  { name: 'Carter Cruise', videoCount: null, thumbnail: null },
  { name: 'Chloe Amour', videoCount: null, thumbnail: null },
  { name: 'Dani Daniels', videoCount: null, thumbnail: null },
  { name: 'Diamond Jackson', videoCount: null, thumbnail: null },
  { name: 'Eva Lovia', videoCount: null, thumbnail: null },
  { name: 'Gianna Michaels', videoCount: null, thumbnail: null },
  { name: 'Jada Stevens', videoCount: null, thumbnail: null },
  { name: 'Jenna Jameson', videoCount: null, thumbnail: null },
  { name: 'Kendra Lust', videoCount: null, thumbnail: null },
  { name: 'Lisa Ann', videoCount: null, thumbnail: null },
  { name: 'Mia Khalifa', videoCount: null, thumbnail: null },
  { name: 'Nicole Aniston', videoCount: null, thumbnail: null },
  { name: 'Riley Reid', videoCount: null, thumbnail: null },
  { name: 'Sasha Grey', videoCount: null, thumbnail: null },
  { name: 'Tori Black', videoCount: null, thumbnail: null },
  { name: 'Valentina Nappi', videoCount: null, thumbnail: null },
]);

// Filter actors by search query and letter
const filteredActors = computed(() => {
  let filtered = [...allActors.value];
  
  // Filter by letter
  if (selectedLetter.value !== 'all') {
    filtered = filtered.filter(actor => 
      actor.name.charAt(0).toUpperCase() === selectedLetter.value
    );
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(actor =>
      actor.name.toLowerCase().includes(query)
    );
  }
  
  // Sort alphabetically
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

// Computed for total actors count (filtered)
const totalActorsCount = computed(() => filteredActors.value.length);

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
  return filteredActors.value.slice(start, end);
});

// Handle search
function handleSearch() {
  currentPage.value = 1; // Reset to first page on search
}

// Filter by letter
function filterByLetter(letter) {
  selectedLetter.value = letter;
  currentPage.value = 1; // Reset to first page
}

// Watch for filter changes to reset page
watch([selectedLetter, searchQuery], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
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
  const actor = allActors.value.find(a => a.name === actorName);
  if (!actor) return;
  
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
        
        // Get total count if available
        if (epornerTotalCount.value) {
          actor.videoCount = epornerTotalCount.value;
          // If video count is less than 100, mark for removal (but don't remove immediately to avoid UI flicker)
          if (epornerTotalCount.value < 100) {
            // We'll filter these out later, but for now just don't set thumbnail
            return;
          }
        }
        
        // Set thumbnail if available
        if (mostViewedVideo.thumbnail) {
          actor.thumbnail = mostViewedVideo.thumbnail;
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
async function goToPage(page) {
  if (page === '...' || page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  // Load thumbnails for actors on the new page
  await loadPageActors(page);
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load thumbnails for actors on a specific page
async function loadPageActors(page) {
  const start = (page - 1) * actorsPerPage;
  const end = start + actorsPerPage;
  const pageActors = allActors.value.slice(start, end);
  
  // Only load thumbnails for actors that don't have them yet
  const actorsToLoad = pageActors.filter(actor => !actor.thumbnail && !actor.loading);
  
  if (actorsToLoad.length === 0) return;
  
  // Mark actors as loading
  actorsToLoad.forEach(actor => actor.loading = true);
  
  // Load thumbnails in small batches
  const BATCH_SIZE = 3;
  const DELAY_BETWEEN_REQUESTS = 800;
  
  for (let i = 0; i < actorsToLoad.length; i += BATCH_SIZE) {
    const batch = actorsToLoad.slice(i, i + BATCH_SIZE);
    
    // Process batch sequentially
    for (let j = 0; j < batch.length; j++) {
      const actor = batch[j];
      await loadActorThumbnail(actor.name).catch(() => {
        return null; // Continue even if one fails
      });
      
      // Delay between requests
      if (j < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }
    
    // Small delay between batches
    if (i + BATCH_SIZE < actorsToLoad.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Remove loading flag
  actorsToLoad.forEach(actor => actor.loading = false);
}

// Load actors on mount - only load first page
onMounted(async () => {
  loading.value = true;
  try {
    // Load thumbnails only for the first page
    await loadPageActors(1);
    
    // Filter out actors with less than 100 videos (only for loaded actors)
    // We'll filter dynamically as we load more pages
    allActors.value = allActors.value.filter(actor => {
      // If videoCount is null/undefined, keep the actor (count not loaded yet)
      // If videoCount exists and is < 100, remove the actor
      if (actor.videoCount !== null && actor.videoCount !== undefined && actor.videoCount < 100) {
        return false;
      }
      return true;
    });
  } catch (error) {
    // Suppress expected errors
    if (!error?.message?.includes('Failed to fetch') && 
        !error?.message?.includes('CORS') &&
        !error?.message?.includes('503')) {
      console.warn('Error loading actor thumbnails:', error);
    }
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

/* Large screens (1200px - 1399px) */
@media (max-width: 1399px) and (min-width: 1200px) {
  .actors-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.25rem;
  }
}

/* Medium screens (1024px - 1199px) */
@media (max-width: 1199px) and (min-width: 1024px) {
  .actors-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

/* Tablet and smaller (1024px and below) */
@media (max-width: 1024px) {
  .actors-content {
    margin-left: 0;
  }

  .actors-page {
    padding: 30px 24px;
  }

  .page-title {
    font-size: 2rem;
  }

  .filters-bar {
    gap: 1.25rem;
  }

  .search-box {
    max-width: 100%;
  }

  .alphabet-filter {
    gap: 6px;
  }

  .alphabet-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
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
}

.page-header {
  margin-bottom: 2.5rem;
}

.header-content {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Search and Filter Bar */
.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: var(--dark-lighter);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--dark-light);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Alphabet Filter */
.alphabet-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.alphabet-btn {
  min-width: 44px;
  height: 44px;
  padding: 0 16px;
  background: var(--dark-lighter);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alphabet-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.alphabet-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

/* Desktop: 6 columns */
@media (min-width: 1400px) {
  .actors-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
  }
}

.actor-card {
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  overflow: hidden;
  position: relative;
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.actor-card:hover {
  background: var(--dark-light);
  border-color: var(--primary);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(255, 69, 0, 0.25);
}

.actor-card-with-thumbnail {
  padding: 0;
  min-height: 320px;
  aspect-ratio: 3/4;
}

.actor-card-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  overflow: hidden;
  border-radius: 12px;
}

.actor-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.actor-card:hover .actor-thumbnail {
  transform: scale(1.15);
}

.actor-thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.4) 70%, transparent 100%);
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.actor-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 0;
}

.actor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
  transition: transform 0.3s ease;
}

.actor-card:hover .actor-avatar {
  transform: scale(1.1);
}

.actor-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

.actor-card-with-thumbnail .actor-name {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  font-size: 17px;
  margin-bottom: 4px;
}

.actor-card-with-thumbnail .actor-video-count {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  font-weight: 500;
}

.actor-video-count {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
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
    padding: 24px 20px;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.95rem;
  }

  .filters-bar {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .alphabet-filter {
    gap: 5px;
  }

  .alphabet-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    font-size: 12px;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 0.875rem;
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
    grid-template-columns: repeat(2, 1fr);
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

