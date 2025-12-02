<template>
  <div class="loading-container">
    <Loader2 :size="size" class="spinner-icon" />
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next';

defineProps({
  size: {
    type: Number,
    default: 50,
  },
  message: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 20px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  color: var(--primary);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>

