<template>
  <div class="scene-marker" @click="handleClick">
    <div class="scene-thumbnail-wrapper">
      <img
        v-if="scene.thumbnail"
        :src="scene.thumbnail"
        :alt="scene.label"
        class="scene-thumbnail"
        @error="handleThumbnailError"
      />
      <div v-else class="scene-thumbnail-placeholder">
        <Play :size="16" />
      </div>
      <div class="scene-time-badge">{{ formatTime(scene.startTime) }}</div>
    </div>
    <div class="scene-info">
      <h4 class="scene-label">{{ scene.label }}</h4>
      <div class="scene-meta">
        <span v-if="scene.participants.length > 0" class="scene-participants">
          {{ scene.participants.slice(0, 2).join(', ') }}
        </span>
        <span class="scene-vibe">{{ scene.vibe }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play } from "lucide-vue-next";

const props = defineProps({
	scene: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["click"]);

const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const handleClick = () => {
	emit("click", props.scene);
};

const handleThumbnailError = (event) => {
	event.target.style.display = "none";
};
</script>

<style scoped>
.scene-marker {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.scene-marker:hover {
  background: var(--dark-lighter);
}

.scene-thumbnail-wrapper {
  position: relative;
  width: 120px;
  height: 68px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: var(--dark-lighter);
}

.scene-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.scene-time-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.scene-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.scene-participants::after {
  content: '•';
  margin-left: 6px;
}

@media (max-width: 768px) {
  .scene-thumbnail-wrapper {
    width: 100px;
    height: 56px;
  }
  
  .scene-label {
    font-size: 12px;
  }
}
</style>

