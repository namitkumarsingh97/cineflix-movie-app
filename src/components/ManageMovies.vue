<template>
  <div class="manage-movies">
    <!-- Search and Filter Bar -->
    <div class="search-filter-bar">
      <div class="search-box">
        <Search :size="18" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search movies..."
          class="search-input"
        />
      </div>
      <div class="filter-box">
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="selectedMovies.length > 0" class="bulk-actions-bar">
      <div class="bulk-info">
        <span
          >{{ selectedMovies.length }}
          {{ selectedMovies.length === 1 ? "movie" : "movies" }} selected</span
        >
      </div>
      <div class="bulk-buttons">
        <select v-model="bulkCategory" class="bulk-select">
          <option value="">Select Category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <button
          class="bulk-btn category-btn"
          @click="bulkUpdateCategory"
          :disabled="!bulkCategory || bulkProcessing"
        >
          <Tag :size="16" />
          <span>Update Category</span>
        </button>
        <button
          class="bulk-btn delete-btn"
          @click="bulkDelete"
          :disabled="bulkProcessing"
        >
          <Trash2 :size="16" />
          <span>Delete Selected</span>
        </button>
        <button class="bulk-btn clear-btn" @click="clearSelection">
          <X :size="16" />
          <span>Clear</span>
        </button>
      </div>
    </div>

    <Loader v-if="loading" message="Loading movies..." />

    <div v-else-if="filteredMovies.length > 0" class="movies-list">
      <div class="select-all-bar">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="checkbox-input"
          />
          <span>Select All ({{ filteredMovies.length }})</span>
        </label>
      </div>
      <div
        v-for="movie in filteredMovies"
        :key="movie._id"
        class="movie-item"
        :class="{ selected: selectedMovies.includes(movie._id) }"
      >
        <div class="movie-select">
          <input
            type="checkbox"
            :value="movie._id"
            v-model="selectedMovies"
            class="movie-checkbox"
          />
        </div>
        <div class="movie-thumbnail">
          <img
            v-if="movie.thumbnail"
            :src="movie.thumbnail"
            :alt="movie.title"
          />
          <Film v-else :size="48" />
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <div class="movie-meta">
            <span class="category-badge">{{
              movie.category || "Uncategorized"
            }}</span>
            <span class="date">{{ formatDate(movie.createdAt) }}</span>
          </div>
        </div>
        <div class="movie-actions">
          <button
            class="action-btn edit-btn"
            @click="editMovie(movie)"
            title="Edit"
          >
            <Edit :size="16" />
          </button>
          <button
            class="action-btn delete-btn"
            @click="deleteMovie(movie._id)"
            title="Delete"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Film :size="48" />
      <h3>No movies found</h3>
      <p v-if="searchQuery || categoryFilter">
        Try adjusting your search or filters
      </p>
      <p v-else>Add your first movie to get started!</p>
    </div>

    <!-- Edit Movie Modal -->
    <EditMovieModal
      :show="showEditModal"
      :movie="selectedMovie"
      @close="closeEditModal"
      @saved="handleMovieUpdated"
    />
  </div>
</template>

<script setup>
import { Edit, Film, Search, Tag, Trash2, X } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import apiClient from "../plugins/axios";
import EditMovieModal from "./EditMovieModal.vue";
import Loader from "./Loader.vue";

const movies = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const categoryFilter = ref("");
const showEditModal = ref(false);
const selectedMovie = ref(null);
const selectedMovies = ref([]);
const bulkCategory = ref("");
const bulkProcessing = ref(false);

const categories = [
	"Adventure",
	"Amateur",
	"Anal",
	"Asian",
	"BDSM",
	"Big Ass",
	"Desi",
	"Blowjob",
	"Compilation",
	"Cartoon",
	"Cosplay",
	"Cuckold",
	"Ebony",
	"Fantasy",
	"Family",
	"Fetish",
	"Foot Fetish",
	"Gangbang",
	"Housewife",
	"Japanese",
	"MILF",
	"Massage",
	"Mature",
	"Romance",
	"Teen",
	"Threesome",
	"Other",
];

const filteredMovies = computed(() => {
	let filtered = movies.value;

	// Filter by search query
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase();
		filtered = filtered.filter((movie) =>
			movie.title.toLowerCase().includes(query),
		);
	}

	// Filter by category
	if (categoryFilter.value) {
		filtered = filtered.filter(
			(movie) => movie.category === categoryFilter.value,
		);
	}

	return filtered;
});

const allSelected = computed(() => {
	return (
		filteredMovies.value.length > 0 &&
		filteredMovies.value.every((movie) =>
			selectedMovies.value.includes(movie._id),
		)
	);
});

function toggleSelectAll() {
	if (allSelected.value) {
		// Deselect all filtered movies
		selectedMovies.value = selectedMovies.value.filter(
			(id) => !filteredMovies.value.some((movie) => movie._id === id),
		);
	} else {
		// Select all filtered movies
		filteredMovies.value.forEach((movie) => {
			if (!selectedMovies.value.includes(movie._id)) {
				selectedMovies.value.push(movie._id);
			}
		});
	}
}

function clearSelection() {
	selectedMovies.value = [];
	bulkCategory.value = "";
}

async function bulkDelete() {
	if (
		!confirm(
			`Are you sure you want to delete ${selectedMovies.value.length} movie(s)?`,
		)
	) {
		return;
	}

	bulkProcessing.value = true;
	try {
		for (const id of selectedMovies.value) {
			await apiClient.delete(`/movies/${id}`);
		}
		await loadMovies();
		clearSelection();
	} catch (error) {
		alert("Failed to delete some movies. Please try again.");
	} finally {
		bulkProcessing.value = false;
	}
}

async function bulkUpdateCategory() {
	if (!bulkCategory.value) {
		alert("Please select a category");
		return;
	}

	bulkProcessing.value = true;
	try {
		for (const id of selectedMovies.value) {
			const movie = movies.value.find((m) => m._id === id);
			if (movie) {
				await apiClient.put(`/movies/${id}`, {
					title: movie.title,
					category: bulkCategory.value,
					iframe: movie.iframe,
					iframeSrc: movie.iframeSrc,
					thumbnail: movie.thumbnail,
				});
			}
		}
		await loadMovies();
		clearSelection();
	} catch (error) {
		alert("Failed to update some movies. Please try again.");
	} finally {
		bulkProcessing.value = false;
	}
}

onMounted(async () => {
	await loadMovies();
});

async function loadMovies() {
	loading.value = true;
	try {
		const response = await apiClient.get("/movies");
		if (response.data.success) {
			movies.value = response.data.data || [];
		}
	} catch (error) {
		console.error("Failed to load movies:", error);
	} finally {
		loading.value = false;
	}
}

function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function editMovie(movie) {
	selectedMovie.value = movie;
	showEditModal.value = true;
}

function closeEditModal() {
	showEditModal.value = false;
	selectedMovie.value = null;
}

function handleMovieUpdated() {
	loadMovies();
	closeEditModal();
	clearSelection();
}

async function deleteMovie(id) {
	if (!confirm("Are you sure you want to delete this movie?")) {
		return;
	}

	try {
		await apiClient.delete(`/movies/${id}`);
		await loadMovies();
		// Remove from selection if selected
		selectedMovies.value = selectedMovies.value.filter(
			(selectedId) => selectedId !== id,
		);
	} catch (error) {
		alert("Failed to delete movie. Please try again.");
	}
}
</script>

<style scoped>
.manage-movies {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.movies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.movie-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--dark);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 69, 0, 0.1);
  transition: all 0.3s ease;
}

.movie-item.selected {
  background: rgba(255, 69, 0, 0.1);
  border-color: var(--primary);
}

.movie-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.movie-thumbnail {
  width: 80px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--dark-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.movie-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-thumbnail svg {
  color: var(--text-secondary);
}

.movie-info {
  flex: 1;
}

.movie-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.category-badge {
  background: var(--gradient-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.date {
  color: var(--text-secondary);
  font-size: 14px;
}

.movie-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
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

.empty-state p {
  font-size: 14px;
}

.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--dark);
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.search-box svg {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.filter-box {
  min-width: 180px;
}

.filter-select {
  width: 100%;
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.select-all-bar {
  padding: 12px 16px;
  background: var(--dark);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.movie-item {
  position: relative;
}

.movie-item.selected {
  background: rgba(255, 69, 0, 0.1);
  border-color: var(--primary);
}

.movie-select {
  display: flex;
  align-items: center;
  padding-right: 12px;
}

.movie-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.bulk-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--gradient-primary);
  border-radius: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.bulk-info {
  color: white;
  font-weight: 600;
  font-size: 15px;
}

.bulk-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.bulk-select {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
}

.bulk-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.bulk-select option {
  background: var(--dark-lighter);
  color: var(--text-primary);
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.bulk-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.category-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.bulk-btn.delete-btn {
  background: rgba(239, 68, 68, 0.8);
}

.bulk-btn.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 1);
  transform: translateY(-2px);
}

.clear-btn {
  background: rgba(255, 255, 255, 0.15);
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .bulk-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .bulk-buttons {
    flex-direction: column;
    width: 100%;
  }

  .bulk-select,
  .bulk-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
