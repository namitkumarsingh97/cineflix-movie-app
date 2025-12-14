<template>
  <div class="mood-playlist-section">
    <div class="mood-header">
      <h2 class="mood-title">
        <span class="mood-icon">{{ currentMoodIcon }}</span>
        <span>{{ currentMoodName }} Mix</span>
      </h2>
      <div class="mood-controls">
        <select v-model="selectedMood" @change="handleMoodChange" class="mood-select">
          <option v-for="(mood, key) in moodTypes" :key="key" :value="key">
            {{ mood.icon }} {{ mood.name }}
          </option>
        </select>
        <button @click="refreshPlaylist" class="refresh-btn" title="Refresh playlist">
          <RefreshCw :size="18" />
        </button>
      </div>
    </div>

    <div v-if="playlist.length === 0" class="mood-loading">
      <Loader />
      <p>Creating your {{ currentMoodName }} playlist...</p>
    </div>

    <div v-else class="mood-playlist-grid">
      <VideoCard
        v-for="(video, index) in playlist"
        :key="video.id || video._id || index"
        :video="video"
        @click="navigateToVideo(video)"
      />
    </div>

    <div v-if="playlist.length > 0" class="mood-stats">
      <span>{{ playlist.length }} videos</span>
      <span>•</span>
      <span>{{ formatDuration(totalDuration) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { RefreshCw } from 'lucide-vue-next';
import { useMoodSequencing } from '../composables/useMoodSequencing';
import { useEporner } from '../composables/useEporner';
import { useVideos } from '../composables/useVideos';
import { useMovies } from '../composables/useMovies';
import VideoCard from './VideoCard.vue';
import Loader from './Loader.vue';

const router = useRouter();
const { 
  currentMood, 
  moodPlaylist, 
  moodTypes, 
  detectMood, 
  generateMoodPlaylist 
} = useMoodSequencing();

const { videos: epornerVideos } = useEporner();
const { videos } = useVideos();
const { movies } = useMovies();

const selectedMood = ref(null);
const playlist = ref([]);

const currentMoodName = computed(() => {
  const mood = selectedMood.value || currentMood.value;
  return moodTypes[mood]?.name || 'Personalized';
});

const currentMoodIcon = computed(() => {
  const mood = selectedMood.value || currentMood.value;
  return moodTypes[mood]?.icon || '🎵';
});

const totalDuration = computed(() => {
  return playlist.value.reduce((sum, video) => sum + (video.duration || 0), 0);
});

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function handleMoodChange() {
  generatePlaylist();
}

async function generatePlaylist() {
  const mood = selectedMood.value || currentMood.value;
  
  // Get all available videos
  const allVideos = [
    ...epornerVideos.value,
    ...videos.value,
    ...movies.value
  ];

  if (allVideos.length === 0) {
    playlist.value = [];
    return;
  }

  // Generate mood-based playlist
  const generated = generateMoodPlaylist(allVideos, {
    mood,
    maxVideos: 30,
  });

  playlist.value = generated;
}

async function refreshPlaylist() {
  // Re-detect mood and regenerate
  detectMood();
  await generatePlaylist();
}

import { generateWatchUrl } from '../utils/slug';

function navigateToVideo(video) {
  const videoId = video.id || video._id;
  const source = video._source || (epornerVideos.value.some(v => v.id === videoId) ? 'eporner' : null);
  
  const url = generateWatchUrl(video, { source: source || undefined });
  router.push(url);
  
  // Legacy code below (kept for reference but not used)
  if (false) {
    router.push(`/watch/${videoId}`);
  }
}

onMounted(async () => {
  // Detect initial mood
  detectMood();
  selectedMood.value = currentMood.value;
  
  // Generate initial playlist
  await generatePlaylist();
});
</script>

<style scoped>
.mood-playlist-section {
  padding: 24px;
  background: var(--bg-secondary, #1a1a2e);
  border-radius: 12px;
  margin-bottom: 32px;
}

.mood-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.mood-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.mood-icon {
  font-size: 28px;
}

.mood-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mood-select {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-select:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mood-select:focus {
  outline: none;
  border-color: var(--primary, #ff4500);
}

.refresh-btn {
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(180deg);
}

.mood-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.mood-playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

.mood-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .mood-playlist-section {
    padding: 16px;
  }

  .mood-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mood-playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>

