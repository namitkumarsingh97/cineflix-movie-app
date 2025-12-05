<template>
  <div class="skeleton-card">
    <div class="skeleton-thumbnail"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton card component for loading states
</script>

<style scoped>
.skeleton-card {
  width: 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-thumbnail {
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 8px;
  margin-bottom: 8px;
}

.skeleton-content {
  display: flex;
  gap: 8px;
}

.skeleton-title {
  flex: 1;
  height: 16px;
  background: var(--dark-lighter);
  border-radius: 4px;
  margin-bottom: 6px;
}

.skeleton-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-line {
  height: 12px;
  background: var(--dark-lighter);
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60%;
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
  .skeleton-title {
    height: 14px;
  }
  
  .skeleton-line {
    height: 10px;
  }
}
</style>

