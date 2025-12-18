<template>
  <section v-if="recommendations.length > 0" class="because-you-watched-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-icon">🎬</span>
        <span>Because you watched <em>{{ sourceTitle }}</em></span>
      </h2>
      <router-link v-if="showViewAll" :to="viewAllLink" class="view-all-link">
        View All
        <ChevronRight :size="16" />
      </router-link>
    </div>
    <div class="recommendations-grid">
      <VideoCard
        v-for="item in recommendations"
        :key="item.id || item._id"
        :video="item"
        @click="handleItemClick"
      />
      <MovieCard
        v-for="item in movieRecommendations"
        :key="item._id"
        :movie="item"
        @click="handleItemClick"
      />
    </div>
  </section>
</template>

<script setup>
import { ChevronRight } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";
import MovieCard from "./MovieCard.vue";
import VideoCard from "./VideoCard.vue";

const props = defineProps({
	recommendations: {
		type: Array,
		default: () => [],
	},
	sourceTitle: {
		type: String,
		default: "this",
	},
	showViewAll: {
		type: Boolean,
		default: true,
	},
	viewAllLink: {
		type: String,
		default: "/videos",
	},
});

const emit = defineEmits(["item-click"]);

const router = useRouter();

// Separate videos and movies
const videoRecommendations = computed(() => {
	return props.recommendations.filter(
		(item) => item._source === "eporner" || item.type === "video" || !item._id,
	);
});

const movieRecommendations = computed(() => {
	return props.recommendations.filter(
		(item) => item._id && (item.type === "movie" || !item._source),
	);
});

const handleItemClick = (item) => {
	emit("item-click", item);

	// Navigate to watch page
	if (item._source === "eporner" || item.type === "video") {
		router.push(`/watch/${item.id}?source=eporner`);
	} else {
		router.push(`/watch/${item._id}`);
	}
};
</script>

<style scoped>
.because-you-watched-section {
  margin: 40px auto;
  max-width: 1600px;
  padding: 0 24px;
  width: 100%;
}

/* Large screens (L screens and above) */
@media (min-width: 1920px) {
  .because-you-watched-section {
    max-width: 95%;
  }
}

/* 4K screens */
@media (min-width: 2560px) {
  .because-you-watched-section {
    max-width: 95%;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-title em {
  font-style: italic;
  color: var(--primary);
}

.title-icon {
  font-size: 24px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--primary-dark);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 1200px) {
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .section-title {
    font-size: 18px;
  }
}
</style>

