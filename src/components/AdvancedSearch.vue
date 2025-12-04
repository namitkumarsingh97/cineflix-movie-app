<template>
  <div class="advanced-search" v-if="showFilters">
    <div class="filters-container">
      <div class="filter-group">
        <label>{{ $t('search.category') }}</label>
        <select v-model="filters.category" class="filter-select">
          <option value="">{{ $t('search.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('search.star') }}</label>
        <select v-model="filters.star" class="filter-select">
          <option value="">{{ $t('search.allStars') }}</option>
          <option v-for="star in stars" :key="star" :value="star">{{ star }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('search.sortBy') }}</label>
        <select v-model="filters.sortBy" class="filter-select">
          <option value="date">{{ $t('search.recent') }}</option>
          <option value="title">{{ $t('search.alphabetical') }}</option>
          <option value="popular">{{ $t('search.popular') }}</option>
          <option value="views">{{ $t('search.views') }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('search.dateRange') }}</label>
        <select v-model="filters.dateRange" class="filter-select">
          <option value="">{{ $t('search.allTime') }}</option>
          <option value="today">{{ $t('search.today') }}</option>
          <option value="week">{{ $t('search.thisWeek') }}</option>
          <option value="month">{{ $t('search.thisMonth') }}</option>
          <option value="year">{{ $t('search.thisYear') }}</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="filter-btn apply-btn" @click="applyFilters">{{ $t('common.apply') }}</button>
        <button class="filter-btn clear-btn" @click="clearFilters">{{ $t('common.clear') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

