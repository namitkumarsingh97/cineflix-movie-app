<template>
  <span v-if="count > 0" class="badge-count" :class="{ pulse: pulse }">
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 0,
  },
  pulse: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.badge-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--gradient-primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.5);
  z-index: 10;
  line-height: 1;
}

.badge-count.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(255, 69, 0, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 2px 12px rgba(255, 69, 0, 0.8);
  }
}
</style>

