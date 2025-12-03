<template>
  <div class="category-management">
    <div class="category-header">
      <div class="header-actions">
        <button class="btn-primary" @click="showAddModal = true">
          <Plus :size="16" />
          <span>Add Category</span>
        </button>
      </div>
    </div>

    <Loader v-if="loading" message="Loading categories..." />

    <div v-else-if="categories.length > 0" class="categories-list">
      <div
        v-for="category in categories"
        :key="category.name"
        class="category-item"
      >
        <div class="category-info">
          <FolderOpen :size="20" />
          <div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} {{ category.count === 1 ? 'movie' : 'movies' }}</p>
          </div>
        </div>
        <div class="category-actions">
          <button
            class="action-btn edit-btn"
            @click="editCategory(category)"
            title="Edit"
          >
            <Edit :size="16" />
          </button>
          <button
            class="action-btn delete-btn"
            @click="deleteCategory(category.name)"
            title="Delete"
            :disabled="category.count > 0"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <FolderOpen :size="48" />
      <h3>No categories found</h3>
      <p>Add your first category to get started!</p>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showAddModal || editingCategory" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <FolderOpen :size="20" />
            <span>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</span>
          </h3>
          <button class="modal-close" @click="closeModal">
            <X :size="24" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="categoryName">
              <Tag :size="16" />
              <span>Category Name *</span>
            </label>
            <input
              type="text"
              id="categoryName"
              v-model="categoryForm.name"
              placeholder="e.g., Action, Comedy, Drama"
              class="form-input"
              @keyup.enter="saveCategory"
              required
            />
          </div>
          <div v-if="error" class="error-message">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="button" class="btn-primary" @click="saveCategory" :disabled="saving">
              <Loader2 v-if="saving" :size="16" class="spinning" />
              <Save v-else :size="16" />
              <span>{{ saving ? 'Saving...' : editingCategory ? 'Update' : 'Add' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Tag,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import Loader from './Loader.vue';

const categories = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const editingCategory = ref(null);
const saving = ref(false);
const error = ref('');

const categoryForm = ref({
  name: '',
});

const predefinedCategories = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Adventure',
  'Animation',
  'Documentary',
  'Fantasy',
  'Crime',
  'Mystery',
  'Other',
];

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    const response = await apiClient.get('/movies');
    if (response.data.success) {
      const movies = response.data.data || [];
      
      // Count movies per category
      const categoryMap = {};
      movies.forEach(movie => {
        const category = movie.category || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      // Combine predefined and custom categories
      const allCategories = new Set([...predefinedCategories]);
      Object.keys(categoryMap).forEach(cat => {
        if (cat && cat !== 'Uncategorized') {
          allCategories.add(cat);
        }
      });

      categories.value = Array.from(allCategories)
        .map(name => ({
          name,
          count: categoryMap[name] || 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
}

function editCategory(category) {
  editingCategory.value = category;
  categoryForm.value.name = category.name;
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingCategory.value = null;
  categoryForm.value.name = '';
  error.value = '';
}

async function saveCategory() {
  error.value = '';

  if (!categoryForm.value.name.trim()) {
    error.value = 'Please enter a category name';
    return;
  }

  const categoryName = categoryForm.value.name.trim();

  // Validate category name
  if (categoryName.length < 2) {
    error.value = 'Category name must be at least 2 characters';
    return;
  }

  if (categoryName.length > 50) {
    error.value = 'Category name must be less than 50 characters';
    return;
  }

  saving.value = true;

  try {
    if (editingCategory.value) {
      // Update movies with old category to new category
      const response = await apiClient.get('/movies');
      if (response.data.success) {
        const movies = response.data.data || [];
        const moviesToUpdate = movies.filter(
          m => m.category === editingCategory.value.name
        );

        // Update each movie
        for (const movie of moviesToUpdate) {
          await apiClient.put(`/movies/${movie._id}`, {
            title: movie.title,
            category: categoryName,
            iframe: movie.iframe,
            iframeSrc: movie.iframeSrc,
            thumbnail: movie.thumbnail,
          });
        }
      }
    }

    await loadCategories();
    closeModal();
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to save category. Please try again.';
  } finally {
    saving.value = false;
  }
}

async function deleteCategory(categoryName) {
  if (!confirm(`Are you sure you want to delete "${categoryName}"? This will remove the category from all movies.`)) {
    return;
  }

  try {
    // Get all movies with this category
    const response = await apiClient.get('/movies');
    if (response.data.success) {
      const movies = response.data.data || [];
      const moviesToUpdate = movies.filter(m => m.category === categoryName);

      // Remove category from movies (set to null)
      for (const movie of moviesToUpdate) {
        await apiClient.put(`/movies/${movie._id}`, {
          title: movie.title,
          category: null,
          iframe: movie.iframe,
          iframeSrc: movie.iframeSrc,
          thumbnail: movie.thumbnail,
        });
      }
    }

    await loadCategories();
  } catch (error) {
    alert('Failed to delete category. Please try again.');
  }
}
</script>

<style scoped>
.category-management {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 0, 110, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dark);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 0, 110, 0.1);
  transition: all 0.3s ease;
}

.category-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.category-info svg {
  color: var(--primary);
  flex-shrink: 0;
}

.category-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.category-info p {
  font-size: 13px;
  color: var(--text-secondary);
}

.category-actions {
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

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.edit-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--dark-lighter);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 0, 110, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 0, 110, 0.1);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-header h3 svg {
  color: var(--primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
}

.form-input {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 0, 110, 0.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--dark);
  color: var(--text-primary);
  border: 2px solid rgba(255, 0, 110, 0.2);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--primary);
  background: rgba(255, 0, 110, 0.05);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

