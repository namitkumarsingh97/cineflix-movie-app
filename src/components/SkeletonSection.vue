<template>
  <section class="skeleton-section">
    <div class="skeleton-section-header" v-if="showHeader">
      <div class="skeleton-title-large"></div>
      <div class="skeleton-button"></div>
    </div>
    <SkeletonGrid :count="count" :columns="columns" />
  </section>
</template>

<script setup>
import SkeletonGrid from "./SkeletonGrid.vue";

defineProps({
	count: {
		type: Number,
		default: 12,
	},
	columns: {
		type: Number,
		default: 4,
	},
	showHeader: {
		type: Boolean,
		default: true,
	},
});
</script>

<style scoped>
.skeleton-section {
  margin-bottom: 40px;
}

.skeleton-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.skeleton-title-large {
  width: 200px;
  height: 24px;
  background: var(--dark-lighter);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-button {
  width: 80px;
  height: 32px;
  background: var(--dark-lighter);
  border-radius: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .skeleton-title-large {
    width: 150px;
    height: 20px;
  }
  
  .skeleton-button {
    width: 60px;
    height: 28px;
  }
}
</style>

