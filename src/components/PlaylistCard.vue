<template>
  <div class="playlist-card" @click="handleClick">
    <div class="playlist-thumbnail-wrapper">
      <div class="playlist-thumbnails-grid" v-if="playlist.items.length > 0">
        <img
          v-for="(item, index) in displayThumbnails"
          :key="index"
          :src="getThumbnail(item)"
          :alt="item.title"
          class="playlist-thumbnail"
        />
      </div>
      <div v-else class="playlist-empty">
        <Music :size="32" />
        <span>Empty Playlist</span>
      </div>
      <div class="playlist-overlay">
        <div class="playlist-info-overlay">
          <span class="playlist-count">{{ playlist.items.length }} items</span>
          <span v-if="playlist.isPublic" class="playlist-public-badge">Public</span>
        </div>
      </div>
    </div>
    <div class="playlist-details">
      <h3 class="playlist-title">{{ playlist.name }}</h3>
      <p v-if="playlist.description" class="playlist-description">{{ playlist.description }}</p>
      <div class="playlist-meta">
        <span class="playlist-date">{{ formatDate(playlist.updatedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Music } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps({
	playlist: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["click"]);

const displayThumbnails = computed(() => {
	return props.playlist.items.slice(0, 4);
});

const getThumbnail = (item) => {
	return (
		item.thumbnail ||
		"https://via.placeholder.com/160x90/1a1a2e/ffffff?text=Video"
	);
};

const formatDate = (date) => {
	if (!date) return "";
	const d = new Date(date);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const handleClick = () => {
	emit("click", props.playlist);
};
</script>

<style scoped>
.playlist-card {
  cursor: pointer;
  width: 100%;
  background: var(--dark-light);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 69, 0, 0.3);
}

.playlist-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: var(--dark-lighter);
  overflow: hidden;
}

.playlist-thumbnails-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
}

.playlist-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.playlist-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 8px;
}

.playlist-info-overlay {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.playlist-count {
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.playlist-public-badge {
  font-size: 10px;
  color: var(--primary);
  background: rgba(255, 69, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.playlist-details {
  padding: 12px;
}

.playlist-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.playlist-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-meta {
  font-size: 11px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .playlist-title {
    font-size: 13px;
  }
  
  .playlist-description {
    font-size: 11px;
  }
}
</style>

