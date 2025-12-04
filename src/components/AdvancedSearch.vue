<template>
  <div class="advanced-search" v-if="showFilters">
    <div class="filters-container">
      <div class="filter-group">
        <label>Category</label>
        <select v-model="filters.category" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Star/Actor</label>
        <select v-model="filters.star" class="filter-select">
          <option value="">All Stars</option>
          <option v-for="star in stars" :key="star" :value="star">{{ star }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Sort By</label>
        <select v-model="filters.sortBy" class="filter-select">
          <option value="date">Recently Added</option>
          <option value="title">Title (A-Z)</option>
          <option value="popular">Most Popular</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Date Range</label>
        <select v-model="filters.dateRange" class="filter-select">
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="filter-btn apply-btn" @click="applyFilters">Apply</button>
        <button class="filter-btn clear-btn" @click="clearFilters">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  showFilters: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  stars: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['filter']);

const filters = ref({
  category: '',
  star: '',
  sortBy: 'date',
  dateRange: ''
});

function applyFilters() {
  emit('filter', { ...filters.value });
}

function clearFilters() {
  filters.value = {
    category: '',
    star: '',
    sortBy: 'date',
    dateRange: ''
  };
  emit('filter', { ...filters.value });
}
</script>

<style scoped>
.advanced-search {
  background: var(--dark-lighter);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-select {
  padding: 10px 14px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filter-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-btn {
  background: var(--gradient-primary);
  color: white;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.clear-btn {
  background: var(--dark-light);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.clear-btn:hover {
  background: var(--dark-lighter);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }
}
</style>

