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
              <h1 class="page-title">Actors</h1>
              <p class="page-subtitle">Browse all actors and performers</p>
            </div>
            <div class="header-actions">
              <div class="filter-container">
                <label for="letter-filter" class="filter-label">Filter by Letter:</label>
                <select 
                  id="letter-filter"
                  v-model="selectedLetter" 
                  @change="handleLetterFilterChange"
                  class="letter-filter-select"
                >
                  <option value="">All Letters</option>
                  <option v-for="letter in alphabetLetters" :key="letter" :value="letter">
                    {{ letter }}
                  </option>
                </select>
              </div>
              <button 
                class="refresh-actresses-btn"
                @click="refreshActresses"
                :disabled="extracting || loading"
                title="Refresh actresses list from API"
              >
                <RefreshCw :size="18" :class="{ spinning: extracting || loading }" />
                <span>{{ extracting || loading ? 'Extracting...' : 'Refresh' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="displayedActors.length > 0" class="actors-content-section">
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
              @click="navigateToActor(actor.name)"
            >
              <!-- Cards with actress picture or avatar fallback -->
              <div class="actor-card-content">
                <div class="actor-image-wrapper">
                  <img
                    v-if="actor.image"
                    :src="actor.image"
                    :alt="actor.name"
                    class="actor-image"
                    @error="handleImageError($event, actor)"
                  />
                  <div
                    v-else
                    class="actor-avatar"
                    :style="getAvatarStyle(actor.name, index)"
                  >
                    {{ getInitials(actor.name) }}
                  </div>
                </div>
                <div class="actor-name-wrapper">
                  <h3 class="actor-name">{{ actor.name }}</h3>
                </div>
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
                :disabled="currentPage === 1"
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
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              <button
                class="pagination-btn"
                :disabled="currentPage >= totalPages"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CategorySidebar from '../components/CategorySidebar.vue';
import { Star, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next';
import { useActresses } from '../composables/useActresses';

const router = useRouter();
const route = useRoute();

const sidebarOpen = ref(true);
const actorsPerPage = 24; // 4 columns x 6 rows
const extracting = ref(false);

// Initialize currentPage from URL query parameter or default to 1
function getPageFromUrl() {
  const pageParam = route.query.page;
  if (pageParam) {
    const page = parseInt(pageParam, 10);
    if (page > 0 && !isNaN(page)) {
      return page;
    }
  }
  return 1;
}

// Initialize selectedLetter from URL query parameter or default to empty (all)
function getLetterFromUrl() {
  const letterParam = route.query.letter;
  if (letterParam && /^[A-Z]$/i.test(letterParam)) {
    return letterParam.toUpperCase();
  }
  return '';
}

const currentPage = ref(getPageFromUrl());
const selectedLetter = ref(getLetterFromUrl());

// Generate alphabet letters A-Z
const alphabetLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const { actresses, loading, extractAllActresses, loadFromStorage, getActressImage, getAllKnownActresses, isValidActressName } = useActresses();

function handleFilterChange(filter) {
  console.log('Filter changed:', filter);
}

// Use only actresses from KNOWN_ACTRESSES with images from pornpics.com
const allActors = ref([]);

// No longer needed - we only use KNOWN_ACTRESSES

// Update URL with page and letter filter parameters
function updateUrlParams(page, letter = null) {
  const query = { ...route.query };
  
  // Handle page parameter
  if (page === 1) {
    delete query.page;
  } else {
    query.page = page.toString();
  }
  
  // Handle letter filter parameter
  if (letter === null) {
    letter = selectedLetter.value;
  }
  if (letter) {
    query.letter = letter;
  } else {
    delete query.letter;
  }
  
  router.push({ 
    path: '/actors',
    query: query
  });
}

// Update URL with page parameter (backward compatibility)
function updateUrlPage(page) {
  updateUrlParams(page);
}

// Watch for URL query parameter changes (e.g., browser back/forward)
watch(() => route.query.page, (newPageParam) => {
  const page = newPageParam ? parseInt(newPageParam, 10) : 1;
  if (page > 0 && !isNaN(page) && page !== currentPage.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, { immediate: false });

// Watch for letter filter changes in URL (browser back/forward)
watch(() => route.query.letter, (newLetterParam) => {
  const letter = newLetterParam && /^[A-Z]$/i.test(newLetterParam) 
    ? newLetterParam.toUpperCase() 
    : '';
  if (letter !== selectedLetter.value) {
    selectedLetter.value = letter;
    // Reset to page 1 when filter changes from URL
    currentPage.value = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, { immediate: false });

// Handle letter filter change
function handleLetterFilterChange() {
  // Reset to page 1 when filter changes
  currentPage.value = 1;
  // Update URL with new filter
  updateUrlParams(1, selectedLetter.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load actresses on mount - use only KNOWN_ACTRESSES
onMounted(async () => {
  // Load known actresses from KNOWN_ACTRESSES with images from pornpics.com
  const knownActresses = getAllKnownActresses();
  allActors.value = knownActresses;
  
  // Calculate total pages
  const totalPagesCount = Math.ceil(knownActresses.length / actorsPerPage);
  
  // Get page from URL or default to 1
  const urlPage = getPageFromUrl();
  
  // Validate and set page
  if (urlPage > totalPagesCount) {
    // If URL page is beyond total pages, go to last page and update URL
    currentPage.value = totalPagesCount;
    updateUrlPage(totalPagesCount);
  } else if (urlPage > 1) {
    // Valid page from URL
    currentPage.value = urlPage;
  } else {
    // Page 1 - ensure URL doesn't have page param
    if (route.query.page) {
      updateUrlPage(1);
    }
  }
  
  // Save to localStorage for persistence
  try {
    localStorage.setItem('extracted_actresses', JSON.stringify(knownActresses));
  } catch (e) {
    console.warn('Could not save actresses to localStorage:', e);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
});

// Function to manually refresh actresses - reload from KNOWN_ACTRESSES
async function refreshActresses() {
  extracting.value = true;
  try {
    // Reload known actresses
    const knownActresses = getAllKnownActresses();
    allActors.value = knownActresses;
    
    // Save to localStorage
    try {
      localStorage.setItem('extracted_actresses', JSON.stringify(knownActresses));
    } catch (e) {
      console.warn('Could not save actresses to localStorage:', e);
    }
  } catch (error) {
    console.error('Error refreshing actresses:', error);
  } finally {
    extracting.value = false;
  }
}

// Filter actors by selected letter
const filteredActors = computed(() => {
  if (!selectedLetter.value) {
    return allActors.value;
  }
  return allActors.value.filter(actor => {
    const firstLetter = actor.name.charAt(0).toUpperCase();
    return firstLetter === selectedLetter.value;
  });
});

// Computed for total actors count (filtered)
const totalActorsCount = computed(() => filteredActors.value.length);

// Computed for total pages (based on filtered actors)
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

// Get unique gradient style for each avatar based on name hash
function getAvatarStyle(name, index) {
  const gradients = [
    'linear-gradient(135deg, #ff4500 0%, #ff8c00 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];
  
  // Use name hash to consistently assign gradient
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradientIndex = Math.abs(hash) % gradients.length;
  
  return {
    background: gradients[gradientIndex],
  };
}

// Navigate to actor page
function navigateToActor(actorName) {
  if (!actorName) return;
  const encodedName = encodeURIComponent(actorName.toLowerCase().replace(/\s+/g, '-'));
  router.push(`/${encodedName}`);
}

// Handle image load error - fallback to avatar
function handleImageError(event, actor) {
  // Hide the image and show avatar instead
  actor.image = null;
  event.target.style.display = 'none';
}


// Go to page
function goToPage(page) {
  if (page === '...' || page < 1 || page > totalPages.value) return;
  
  // Update URL with new page
  updateUrlPage(page);
  
  // Update current page (URL watcher will also update it, but this is immediate)
  currentPage.value = page;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
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
  
  .actor-image-wrapper {
    aspect-ratio: 1;
  }
  
  .actor-avatar {
    font-size: 32px;
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
  
  .actor-image-wrapper {
    aspect-ratio: 1;
  }
  
  .actor-avatar {
    font-size: 28px;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.letter-filter-select {
  padding: 10px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  outline: none;
}

.letter-filter-select:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.letter-filter-select:focus {
  /* Focus indicators disabled */
}

.letter-filter-select option {
  background: var(--dark-lighter);
  color: var(--text-primary);
  padding: 10px;
}

.refresh-actresses-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-actresses-btn:hover:not(:disabled) {
  background: var(--dark-light);
  border-color: var(--primary);
  color: var(--primary);
}

.refresh-actresses-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-actresses-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.actor-card:nth-child(1) { animation-delay: 0.05s; }
.actor-card:nth-child(2) { animation-delay: 0.1s; }
.actor-card:nth-child(3) { animation-delay: 0.15s; }
.actor-card:nth-child(4) { animation-delay: 0.2s; }
.actor-card:nth-child(5) { animation-delay: 0.25s; }
.actor-card:nth-child(6) { animation-delay: 0.3s; }
.actor-card:nth-child(7) { animation-delay: 0.35s; }
.actor-card:nth-child(8) { animation-delay: 0.4s; }
.actor-card:nth-child(n+9) { animation-delay: 0.45s; }

.actor-card {
  background: linear-gradient(135deg, rgba(42, 42, 62, 0.8) 0%, rgba(30, 30, 50, 0.9) 100%);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.actor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 69, 0, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.actor-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.actor-card:hover {
  background: linear-gradient(135deg, rgba(58, 58, 78, 0.95) 0%, rgba(42, 42, 62, 0.95) 100%);
  border-color: var(--primary, #ff4500);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(255, 69, 0, 0.35), 0 0 30px rgba(255, 69, 0, 0.15);
}

.actor-card:hover::before {
  opacity: 1;
}

.actor-card:hover::after {
  opacity: 1;
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
  gap: 16px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.actor-image-wrapper {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: var(--dark-lighter);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.05);
}

.actor-image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  border-radius: 16px;
}

.actor-card:hover .actor-image-wrapper::after {
  opacity: 1;
}

.actor-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  background: var(--dark-lighter);
}

.actor-card:hover .actor-image {
  transform: scale(1.08);
}

.actor-card:hover .actor-image-wrapper {
  box-shadow: 0 12px 32px rgba(255, 69, 0, 0.3);
  transform: translateY(-4px);
  border-color: rgba(255, 69, 0, 0.3);
}

.actor-avatar {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 8px 24px rgba(255, 69, 0, 0.4), 
              0 0 0 4px rgba(255, 69, 0, 0.1),
              inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.actor-avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: rotate(45deg);
  transition: transform 0.6s ease;
}

.actor-card:hover .actor-avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(255, 69, 0, 0.5), 
              0 0 0 6px rgba(255, 69, 0, 0.2),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.actor-card:hover .actor-avatar::before {
  transform: rotate(45deg) translate(100%, 100%);
}

.actor-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
  text-align: center;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  position: relative;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.actor-card:hover .actor-name {
  color: var(--primary, #ff4500);
  transform: translateY(-2px);
  text-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.actor-name-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
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

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .filter-container {
    flex: 1;
    min-width: 0;
  }

  .letter-filter-select {
    width: 100%;
    min-width: 120px;
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
  
  .actor-image-wrapper {
    aspect-ratio: 1;
  }
  
  .actor-avatar {
    font-size: 24px;
  }
  
  .actor-name {
    font-size: 16px;
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

  .header-content {
    gap: 12px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .filter-container {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .filter-label {
    font-size: 12px;
  }

  .letter-filter-select {
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
    min-width: auto;
  }

  .refresh-actresses-btn {
    width: 100%;
    justify-content: center;
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
  
  .actor-image-wrapper {
    aspect-ratio: 1;
  }
  
  .actor-avatar {
    font-size: 20px;
  }
  
  .actor-name {
    font-size: 14px;
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
  
  .actor-image-wrapper {
    aspect-ratio: 1;
  }
  
  .actor-avatar {
    font-size: 18px;
  }
  
  .actor-name {
    font-size: 12px;
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

