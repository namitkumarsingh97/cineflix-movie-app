<template>
  <div class="playlist-detail-page">
    <Loader v-if="loading" message="Loading playlist..." />
    
    <div v-else-if="playlist" class="playlist-detail-content">
      <!-- Playlist Header -->
      <div class="playlist-header">
        <div class="playlist-info">
          <h1 class="playlist-title">{{ playlist.name }}</h1>
          <p v-if="playlist.description" class="playlist-description">{{ playlist.description }}</p>
          <div class="playlist-meta">
            <span>{{ playlist.items.length }} items</span>
            <span v-if="playlist.isPublic" class="public-badge">Public</span>
            <span class="playlist-date">Updated {{ formatDate(playlist.updatedAt) }}</span>
          </div>
        </div>
        <div class="playlist-actions">
          <button class="action-btn" @click="handleShare" v-if="playlist.shareableLink">
            <Share2 :size="18" />
            <span>Share</span>
          </button>
          <button class="action-btn danger" @click="handleDelete">
            <Trash2 :size="18" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <!-- Playlist Items -->
      <div v-if="playlist.items.length > 0" class="playlist-items">
        <VideoCard
          v-for="item in playlist.items"
          :key="item.id || item._id"
          :video="item"
          @click="navigateToVideo"
        />
        <MovieCard
          v-for="item in playlist.items.filter(i => i._id)"
          :key="item._id"
          :movie="item"
          @click="navigateToVideo"
        />
      </div>
      
      <div v-else class="empty-state">
        <ListMusic :size="64" />
        <p>This playlist is empty</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <ListMusic :size="64" />
      <h3>Playlist not found</h3>
      <p>This playlist doesn't exist or has been deleted.</p>
    </div>
  </div>
</template>

<script setup>
import { ListMusic, Share2, Trash2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Loader from "../components/Loader.vue";
import MovieCard from "../components/MovieCard.vue";
import VideoCard from "../components/VideoCard.vue";
import { usePlaylists } from "../composables/usePlaylists";

const route = useRoute();
const router = useRouter();
const playlistId = computed(() => route.params.id);

const { getPlaylist, deletePlaylist } = usePlaylists();

const playlist = ref(null);
const loading = ref(true);

const formatDate = (date) => {
	if (!date) return "";
	const d = new Date(date);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

const handleShare = () => {
	if (playlist.value.shareableLink) {
		navigator.clipboard.writeText(playlist.value.shareableLink);
		alert("Playlist link copied to clipboard!");
	}
};

const handleDelete = () => {
	if (confirm("Are you sure you want to delete this playlist?")) {
		deletePlaylist(playlistId.value);
		router.push("/playlists");
	}
};

const navigateToVideo = (item) => {
	if (item._id) {
		router.push(`/watch/${item._id}`);
	} else if (item.id) {
		router.push(`/watch/${item.id}?source=eporner`);
	}
};

onMounted(() => {
	playlist.value = getPlaylist(playlistId.value);
	loading.value = false;
});
</script>

<style scoped>
.playlist-detail-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dark-light);
  border-radius: 12px;
  gap: 20px;
}

.playlist-info {
  flex: 1;
}

.playlist-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.playlist-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.playlist-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.public-badge {
  padding: 4px 8px;
  background: var(--primary);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--dark-lighter);
}

.action-btn.danger {
  color: #ff4444;
}

.action-btn.danger:hover {
  background: rgba(255, 68, 68, 0.1);
}

.playlist-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  gap: 16px;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
  }
  
  .playlist-items {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>

