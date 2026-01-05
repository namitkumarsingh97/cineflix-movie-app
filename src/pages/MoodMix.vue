<template>
  <div class="mood-mix-page">
    <div class="mood-mix-header">
      <div class="mood-mix-title-section">
        <div class="mood-icon-large">{{ moodEmoji }}</div>
        <div>
          <h1 class="mood-mix-title">{{ moodName }} Mix</h1>
          <p class="mood-mix-description">{{ moodDescription }}</p>
        </div>
      </div>
      <button class="play-all-btn" @click="playAll">
        <Play :size="18" />
        <span>Play All</span>
      </button>
    </div>

    <div v-if="items.length > 0" class="mood-mix-items">
      <VideoCard
        v-for="item in items"
        :key="item.id || item._id"
        :video="item"
        @click="navigateToVideo"
      />
      <MovieCard
        v-for="item in items.filter(i => i._id)"
        :key="item._id"
        :movie="item"
        @click="navigateToVideo"
      />
    </div>
    
    <div v-else class="empty-state">
      <Music :size="64" />
      <p>No videos found for this mood mix</p>
    </div>
  </div>
</template>

<script setup>
import { Music, Play } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import VideoCard from "../components/VideoCard.vue";
import { useEporner } from "../composables/useEporner";
import { useMovies } from "../composables/useMovies";
import { usePlaylists } from "../composables/usePlaylists";
import { useVideos } from "../composables/useVideos";

const route = useRoute();
const router = useRouter();
const mood = computed(() => route.params.mood);

const { getMoodMix } = usePlaylists();
const { movies } = useMovies();
const { videos: epornerVideos } = useEporner();
const { videos } = useVideos();

const items = ref([]);

const moodConfig = {
	energetic: {
		name: "Energetic",
		emoji: "⚡",
		description: "Fast-paced, intense content",
	},
	relaxed: {
		name: "Relaxed",
		emoji: "🌙",
		description: "Slow, sensual, romantic",
	},
	adventurous: {
		name: "Adventurous",
		emoji: "🏔️",
		description: "Outdoor, wild, exciting",
	},
	intimate: {
		name: "Intimate",
		emoji: "💕",
		description: "Romantic, private, close",
	},
	quick: {
		name: "Quick Mix",
		emoji: "⚡",
		description: "Short, quick sessions",
	},
	marathon: {
		name: "Marathon",
		emoji: "🎬",
		description: "Long-form extended content",
	},
};

const moodData = computed(() => {
	return (
		moodConfig[mood.value] || {
			name: mood.value,
			emoji: "🎵",
			description: "Curated mix",
		}
	);
});

const moodName = computed(() => moodData.value.name);
const moodEmoji = computed(() => moodData.value.emoji);
const moodDescription = computed(() => moodData.value.description);

const navigateToVideo = (item) => {
	if (item._id) {
		router.push(`/watch/${item._id}`);
	} else if (item.id) {
		router.push(`/watch/${item.id}?source=eporner`);
	}
};

const playAll = () => {
	if (items.value.length > 0) {
		navigateToVideo(items.value[0]);
	}
};

onMounted(() => {
	const allItems = [
		...movies.value,
		...epornerVideos.value,
		...(videos.value || []),
	];

	items.value = getMoodMix(mood.value) || [];
});
</script>

<style scoped>
.mood-mix-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.mood-mix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dark-light);
  border-radius: 12px;
}

.mood-mix-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mood-icon-large {
  font-size: 64px;
}

.mood-mix-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.mood-mix-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.play-all-btn {
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
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.mood-mix-items {
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
  .mood-mix-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .mood-mix-items {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>

