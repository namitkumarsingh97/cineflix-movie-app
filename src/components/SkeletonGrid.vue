<template>
  <div class="skeleton-grid" :class="`grid-cols-${columns}`">
    <SkeletonCard v-for="n in count" :key="n" />
  </div>
</template>

<script setup>
import SkeletonCard from './SkeletonCard.vue';

defineProps({
  count: {
    type: Number,
    default: 12,
  },
  columns: {
    type: Number,
    default: 4,
  },
});
</script>

<style scoped>
.skeleton-grid {
  display: grid;
  gap: 20px;
  width: 100%;
}

.skeleton-grid.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}

.skeleton-grid.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.skeleton-grid.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.skeleton-grid.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.skeleton-grid.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.skeleton-grid.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

@media (max-width: 1400px) {
  .skeleton-grid.grid-cols-6 {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .skeleton-grid.grid-cols-5 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .skeleton-grid.grid-cols-6,
  .skeleton-grid.grid-cols-5,
  .skeleton-grid.grid-cols-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .skeleton-grid.grid-cols-6,
  .skeleton-grid.grid-cols-5,
  .skeleton-grid.grid-cols-4,
  .skeleton-grid.grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .skeleton-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>

