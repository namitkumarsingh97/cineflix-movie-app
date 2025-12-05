<template>
  <div class="manage-stories">
    <div class="stories-header-actions">
      <button class="btn-primary" @click="showAddModal = true">
        <Plus :size="16" />
        <span>Add Story</span>
      </button>
      <div class="stories-filters">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search stories..."
          class="search-input"
        />
        <select v-model="selectedCategory" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>

    <Loader v-if="loading" message="Loading stories..." />

    <div v-else-if="stories.length > 0" class="stories-list">
      <div
        v-for="story in stories"
        :key="story._id"
        class="story-item"
      >
        <div class="story-item-info">
          <FileText :size="20" class="story-icon" />
          <div class="story-details">
            <h3>{{ story.title }}</h3>
            <div class="story-meta-info">
              <span class="story-category-badge">{{ story.category || 'General' }}</span>
              <span class="story-status-badge" :class="story.status">
                {{ story.status }}
              </span>
              <span class="story-author-info">by {{ story.author }}</span>
              <span class="story-date-info">{{ formatDate(story.createdAt) }}</span>
            </div>
            <div class="story-stats-info">
              <span>{{ formatNumber(story.views || 0) }} views</span>
              <span>{{ formatNumber(story.likes || 0) }} likes</span>
            </div>
          </div>
        </div>
        <div class="story-item-actions">
          <button
            class="action-btn edit-btn"
            @click="editStory(story)"
            title="Edit"
          >
            <Edit :size="16" />
          </button>
          <button
            class="action-btn delete-btn"
            @click="deleteStory(story._id)"
            title="Delete"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button
          class="pagination-btn"
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
        >
          <ChevronLeft :size="18" />
          <span>Previous</span>
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-number', { active: page === pagination.page, disabled: page === '...' }]"
            @click="page !== '...' && changePage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="pagination-btn"
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
        >
          <span>Next</span>
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <FileText :size="48" />
      <h3>No stories found</h3>
      <p>Create your first story to get started!</p>
    </div>

    <!-- Add/Edit Story Modal -->
    <StoryFormModal
      :show="showAddModal || editingStory"
      :story="editingStory"
      @close="closeModal"
      @saved="handleStorySaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { FileText, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import Loader from './Loader.vue';
import StoryFormModal from './StoryFormModal.vue';

const stories = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const showAddModal = ref(false);
const editingStory = ref(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

onMounted(async () => {
  await Promise.all([loadCategories(), loadStories()]);
});

watch([searchQuery, selectedCategory, selectedStatus], () => {
  pagination.value.page = 1;
  loadStories();
});

async function loadCategories() {
  try {
    const response = await apiClient.get('/stories/categories');
    if (response.data.success) {
      categories.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function loadStories() {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (selectedCategory.value) {
      params.category = selectedCategory.value;
    }
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const response = await apiClient.get('/stories', { params });
    if (response.data.success) {
      stories.value = response.data.data || [];
      pagination.value = response.data.pagination || pagination.value;
    }
  } catch (error) {
    console.error('Failed to load stories:', error);
  } finally {
    loading.value = false;
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page;
    loadStories();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.pages;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages;
});

function editStory(story) {
  editingStory.value = { ...story };
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingStory.value = null;
}

function handleStorySaved() {
  closeModal();
  loadStories();
  loadCategories();
}

async function deleteStory(id) {
  if (!confirm('Are you sure you want to delete this story?')) {
    return;
  }

  try {
    await apiClient.delete(`/stories/${id}`);
    await loadStories();
  } catch (error) {
    alert('Failed to delete story. Please try again.');
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
</script>

<style scoped>
.manage-stories {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.stories-header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.stories-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 14px;
  min-width: 200px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.filter-select {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.stories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dark);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 69, 0, 0.1);
  transition: all 0.3s ease;
}

.story-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.story-item-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.story-icon {
  color: var(--primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.story-details {
  flex: 1;
  min-width: 0;
}

.story-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.story-meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.story-category-badge {
  padding: 4px 10px;
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.2);
  border-radius: 6px;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.story-status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.story-status-badge.published {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.story-status-badge.draft {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.story-author-info,
.story-date-info {
  font-size: 12px;
  color: var(--text-secondary);
}

.story-stats-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.story-item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 69, 0, 0.1);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark);
  border: 2px solid rgba(255, 69, 0, 0.2);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  min-width: 40px;
  height: 40px;
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(.active):not(.disabled) {
  background: var(--dark-lighter);
  border-color: rgba(255, 69, 0, 0.2);
}

.page-number.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  box-shadow: var(--shadow);
}

.page-number.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}
</style>

