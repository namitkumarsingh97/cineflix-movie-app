<template>
  <div :class="['card', { 'card-hover': hover }]" @click="$emit('click')">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hover: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['click']);
</script>

<style scoped>
.card {
  background: var(--dark-light);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}
</style>

