<template>
  <div class="analytics-page">
    <WatchAnalytics />
  </div>
</template>

<script setup>
import WatchAnalytics from "../components/WatchAnalytics.vue";
</script>

<style scoped>
.analytics-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .analytics-page {
    padding: 16px;
  }
}
</style>

