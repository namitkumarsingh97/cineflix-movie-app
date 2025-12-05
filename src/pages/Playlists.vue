<template>
  <div class="playlists-page">
    <div class="playlists-header">
      <h1 class="page-title">
        <ListMusic :size="32" />
        <span>Playlists & Mood Mixes</span>
      </h1>
      <button class="create-playlist-btn" @click="showCreateModal = true">
        <Plus :size="18" />
        <span>Create Playlist</span>
      </button>
    </div>

    <!-- Mood Mixes Section -->
    <section class="mood-mixes-section">
      <h2 class="section-title">Mood Mixes</h2>
      <p class="section-subtitle">Auto-generated playlists based on mood, tempo, and length</p>
      <div v-if="Object.keys(moodMixes).length === 0" class="empty-state">
        <ListMusic :size="64" />
        <p>Loading mood mixes...</p>
      </div>
      <div v-else class="mood-mixes-grid">
        <MoodMixCard
          v-for="(items, mood) in moodMixes"
          :key="mood"
          :mood="mood"
          :items="items"
          @click="viewMoodMix"
        />
      </div>
    </section>

    <!-- My Playlists Section -->
    <section class="playlists-section">
      <h2 class="section-title">My Playlists</h2>
      <div v-if="playlists.length === 0" class="empty-state">
        <ListMusic :size="64" />
        <p>No playlists yet. Create one to get started!</p>
      </div>
      <div v-else class="playlists-grid">
        <PlaylistCard
          v-for="playlist in playlists"
          :key="playlist.id"
          :playlist="playlist"
          @click="viewPlaylist"
        />
      </div>
    </section>

    <!-- Create Playlist Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>Create New Playlist</h3>
        <div class="form-group">
          <label>Playlist Name</label>
          <input
            v-model="newPlaylistName"
            type="text"
            placeholder="Enter playlist name"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Description (optional)</label>
          <textarea
            v-model="newPlaylistDescription"
            placeholder="Describe your playlist"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="newPlaylistIsPublic"
              type="checkbox"
            />
            <span>Make playlist public (shareable)</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button class="btn-primary" @click="createNewPlaylist" :disabled="!newPlaylistName.trim()">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlaylists } from '../composables/usePlaylists';
import { useMovies } from '../composables/useMovies';
import { useEporner } from '../composables/useEporner';
import { useVideos } from '../composables/useVideos';
import PlaylistCard from '../components/PlaylistCard.vue';
import MoodMixCard from '../components/MoodMixCard.vue';
import { ListMusic, Plus } from 'lucide-vue-next';

const router = useRouter();
const {
  playlists,
  moodMixes,
  createPlaylist,
  generateAllMoodMixes,
} = usePlaylists();

const { movies } = useMovies();
const { videos: epornerVideos } = useEporner();
const { videos } = useVideos();

const showCreateModal = ref(false);
const newPlaylistName = ref('');
const newPlaylistDescription = ref('');
const newPlaylistIsPublic = ref(false);

const viewPlaylist = (playlist) => {
  router.push(`/playlist/${playlist.id}`);
};

const viewMoodMix = (mood) => {
  router.push(`/mood-mix/${mood}`);
};

const createNewPlaylist = () => {
  if (!newPlaylistName.value.trim()) return;
  
  createPlaylist(
    newPlaylistName.value.trim(),
    newPlaylistDescription.value.trim(),
    newPlaylistIsPublic.value
  );
  
  // Reset form
  newPlaylistName.value = '';
  newPlaylistDescription.value = '';
  newPlaylistIsPublic.value = false;
  showCreateModal.value = false;
};

onMounted(async () => {
  // Generate mood mixes from all available content
  const allItems = [
    ...movies.value,
    ...epornerVideos.value,
    ...(videos.value || []),
  ];
  
  // Only generate if we have items
  if (allItems.length > 0) {
    generateAllMoodMixes(allItems);
  }
});
</script>

<style scoped>
.playlists-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.playlists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.create-playlist-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.create-playlist-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.mood-mixes-section,
.playlists-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

.mood-mixes-grid,
.playlists-grid {
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
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.modal-content {
  background: var(--dark-light);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: 1;
  min-width: 100px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--dark-lighter);
  color: var(--text-primary);
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover {
  opacity: 0.8;
}

/* Large screens (L and 4K) */
@media (min-width: 1920px) {
  .playlists-page {
    max-width: 95%;
    padding: 32px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

@media (min-width: 2560px) {
  .playlists-page {
    max-width: 95%;
    padding: 40px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 32px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .section-title {
    font-size: 26px;
  }
}

/* Tablet and medium screens */
@media (max-width: 1200px) {
  .playlists-page {
    padding: 20px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 18px;
  }
}

@media (max-width: 1024px) {
  .playlists-page {
    padding: 18px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
}

/* Mobile screens */
@media (max-width: 768px) {
  .playlists-page {
    padding: 16px;
  }
  
  .playlists-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .create-playlist-btn {
    width: 100%;
    justify-content: center;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .section-subtitle {
    font-size: 13px;
  }
  
  .modal-content {
    padding: 20px;
    max-height: 85vh;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .playlists-page {
    padding: 12px;
  }
  
  .page-title {
    font-size: 20px;
    gap: 8px;
  }
  
  .playlists-header {
    margin-bottom: 24px;
  }
  
  .mood-mixes-section,
  .playlists-section {
    margin-bottom: 32px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .section-subtitle {
    font-size: 12px;
  }
  
  .modal-content {
    padding: 16px;
    border-radius: 8px;
  }
  
  .modal-content h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .form-group {
    margin-bottom: 12px;
  }
  
  .form-group label {
    font-size: 13px;
  }
  
  .form-input,
  .form-textarea {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
}

/* Extra small screens */
@media (max-width: 360px) {
  .playlists-page {
    padding: 8px;
  }
  
  .mood-mixes-grid,
  .playlists-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
}
</style>

