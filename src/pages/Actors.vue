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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CategorySidebar from '../components/CategorySidebar.vue';
import { Star, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next';
import { useActresses } from '../composables/useActresses';

const router = useRouter();

const sidebarOpen = ref(true);
const currentPage = ref(1);
const actorsPerPage = 24; // 4 columns x 6 rows
const extracting = ref(false);

const { actresses, loading, extractAllActresses, loadFromStorage, getActressImage } = useActresses();

function handleFilterChange(filter) {
  console.log('Filter changed:', filter);
}

// Start with hardcoded actresses, then merge with extracted ones
const allActors = ref([
  { name: 'Abella Danger', image: 'https://cdni.pornpics.com/models/a/abella_danger.jpg' },
  { name: 'AJ Applegate', image: 'https://cdni.pornpics.com/models/a/aj_applegate.jpg' },
  { name: 'Aaliyah Hadid', image: 'https://cdni.pornpics.com/models/a/aaliyah_hadid.jpg' },
  { name: 'Aaliyah Love', image: 'https://cdni.pornpics.com/models/a/aaliyah_love.jpg' },
  { name: 'Abigaile Johnson', image: 'https://cdni.pornpics.com/models/a/abigaile_johnson.jpg' },
  { name: 'Adira Allure', image: 'https://cdni.pornpics.com/models/a/adira_allure.jpg' },
  { name: 'Adria Rae', image: 'https://cdni.pornpics.com/models/a/adria_rae.jpg' },
  { name: 'Adriana Chechik', image: 'https://cdni.pornpics.com/models/a/adriana_chechik.jpg' },
  { name: 'Aletta Ocean', image: 'https://cdni.pornpics.com/models/a/aletta_ocean.jpg' },
  { name: 'Alex Blake', image: 'https://cdni.pornpics.com/models/a/alex_blake.jpg' },
  { name: 'Alex Chance', image: 'https://cdni.pornpics.com/models/a/alex_chance.jpg' },
  { name: 'Alex Coal', image: 'https://cdni.pornpics.com/models/a/alex_coal.jpg' },
  { name: 'Alex De La Flor', image: 'https://cdni.pornpics.com/1280/7/67/82324668/82324668_030_5342.jpg' },
  { name: 'Alex Gonz', image: 'https://cdni.pornpics.com/1280/7/434/89442331/89442331_060_ba21.jpg' },
  { name: 'Alex Grey', image: 'https://cdni.pornpics.com/1280/1/167/42274713/42274713_002_8091.jpg' },
  { name: 'Alex Harper', image: null },
  { name: 'Alex Jett', image: null },
  { name: 'Alex Jones', image: null },
  { name: 'Alex Legend', image: null },
  { name: 'Alex Lynn', image: null },
  { name: 'Alex Mack', image: null },
  { name: 'Alex Moreno', image: null },
  { name: 'Alex Tanner', image: null },
  { name: 'Alex Victor', image: null },
  { name: 'Alexa Flexy', image: null },
  { name: 'Alexa Grace', image: null },
]);

// Validate actress name (strict validation)
function isValidActressName(name) {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  
  // Must be at least 2 words (first name + last name)
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  
  // Each word should start with capital letter and be reasonable length
  if (!words.every(word => /^[A-Z][a-z]{1,20}$/.test(word))) return false;
  
  // Should not contain multiple hyphens (likely a tag like "bokep-indo-tante")
  if ((trimmed.match(/-/g) || []).length > 1) return false;
  
  // Should not contain special characters that indicate it's not a name
  if (trimmed.includes('/') || trimmed.startsWith('-') || 
      trimmed.startsWith('an ') || trimmed.startsWith('a ') ||
      trimmed.startsWith('the ')) return false;
  
  // Should not be too short or too long
  if (trimmed.length < 4 || trimmed.length > 50) return false;
  
  // Should not be all caps (likely a tag/category)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 5) return false;
  
  // Should not be all lowercase (likely a tag)
  if (trimmed === trimmed.toLowerCase() && trimmed.length > 10) return false;
  
  // Filter out common tag words
  const lowerName = trimmed.toLowerCase();
  const tagWords = ['bokep', 'indo', 'indonesia', 'tante', 'hijab', 'montok', 
                    'diewe', 'ponakan', 'jilbab', 'janda', 'mahasiswi', 'abg'];
  if (tagWords.some(tag => lowerName.includes(tag))) return false;
  
  // Each word should be a reasonable name (2-20 characters, only letters)
  if (!words.every(word => word.length >= 2 && word.length <= 20 && /^[A-Za-z]+$/.test(word))) return false;
  
  return true;
}

// Clean up invalid names from the list
function cleanupInvalidNames() {
  allActors.value = allActors.value.filter(actor => 
    isValidActressName(actor.name)
  );
  // Sort alphabetically after cleanup
  allActors.value.sort((a, b) => a.name.localeCompare(b.name));
}

// Merge extracted actresses with existing ones
function mergeActresses() {
  // First, clean up existing actors - remove invalid names
  cleanupInvalidNames();
  
  const existingNames = new Set(allActors.value.map(a => a.name.toLowerCase()));
  const merged = [...allActors.value];
  
  actresses.value.forEach(actress => {
    // Only add if it's a valid name and not already in the list
    if (isValidActressName(actress.name) && !existingNames.has(actress.name.toLowerCase())) {
      merged.push({
        name: actress.name,
        image: actress.image || getActressImage(actress.name),
      });
    }
  });
  
  // Sort alphabetically
  merged.sort((a, b) => a.name.localeCompare(b.name));
  allActors.value = merged;
}

// Load actresses on mount
onMounted(async () => {
  // Clean up any invalid names that might already be in the list
  cleanupInvalidNames();
  // First, try to load from localStorage
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    actresses.value = stored;
    mergeActresses();
  }
  
  // Then extract from API in background (non-blocking)
  extracting.value = true;
  try {
    await extractAllActresses();
    mergeActresses();
  } catch (error) {
    console.error('Error extracting actresses:', error);
  } finally {
    extracting.value = false;
  }
});

// Function to manually refresh actresses
async function refreshActresses() {
  extracting.value = true;
  try {
    await extractAllActresses();
    mergeActresses();
  } catch (error) {
    console.error('Error refreshing actresses:', error);
  } finally {
    extracting.value = false;
  }
}

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

