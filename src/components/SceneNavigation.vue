<template>
  <div class="scene-navigation" v-if="scenes.length > 0">
    <div class="scene-nav-header">
      <h3 class="scene-nav-title">
        <Film :size="18" />
        <span>Scenes</span>
      </h3>
      <div class="scene-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search scenes..."
          class="scene-search-input"
        />
        <Search :size="16" />
      </div>
    </div>
    
    <div class="scenes-list">
      <SceneMarker
        v-for="scene in filteredScenes"
        :key="scene.id"
        :scene="scene"
        :class="{ active: currentScene?.id === scene.id }"
        @click="handleSceneClick"
      />
    </div>
    
    <div v-if="filteredScenes.length === 0" class="no-scenes">
      <p>No scenes found matching "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Film, Search } from 'lucide-vue-next';
import SceneMarker from './SceneMarker.vue';

const props = defineProps({
  scenes: {
    type: Array,
    default: () => [],
  },
  currentScene: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['scene-click']);

const searchQuery = ref('');

const filteredScenes = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.scenes;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.scenes.filter(scene => {
    return (
      scene.label.toLowerCase().includes(query) ||
      scene.participants.some(p => p.toLowerCase().includes(query)) ||
      scene.vibe.toLowerCase().includes(query)
    );
  });
});

const handleSceneClick = (scene) => {
  emit('scene-click', scene);
};
</script>

<style scoped>
.scene-navigation {
  background: var(--dark-light);
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
}

.scene-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.scene-nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.scene-search {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.scene-search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.scene-search svg {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.scenes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.scenes-list::-webkit-scrollbar {
  width: 6px;
}

.scenes-list::-webkit-scrollbar-track {
  background: var(--dark-lighter);
  border-radius: 3px;
}

.scenes-list::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 3px;
}

.scenes-list .scene-marker.active {
  background: var(--dark-lighter);
  border-left: 3px solid var(--primary);
}

.no-scenes {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .scene-nav-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .scene-search {
    max-width: 100%;
  }
}
</style>

