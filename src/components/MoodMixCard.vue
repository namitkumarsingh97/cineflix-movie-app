<template>
  <div class="mood-mix-card" @click="handleClick">
    <div class="mood-mix-thumbnail" :style="{ background: moodGradient }">
      <div class="mood-icon">{{ moodEmoji }}</div>
      <div class="mood-title">{{ moodName }}</div>
    </div>
    <div class="mood-mix-info">
      <p class="mood-mix-count">{{ items.length }} videos</p>
      <p class="mood-mix-description">{{ moodDescription }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	mood: {
		type: String,
		required: true,
	},
	items: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(["click"]);

const moodConfig = {
	energetic: {
		name: "Energetic",
		emoji: "⚡",
		description: "Fast-paced, intense content",
		gradient: "linear-gradient(135deg, #ff4500 0%, #ff8c00 100%)",
	},
	relaxed: {
		name: "Relaxed",
		emoji: "🌙",
		description: "Slow, sensual, romantic",
		gradient: "linear-gradient(135deg, #ff6347 0%, #ff4500 100%)",
	},
	adventurous: {
		name: "Adventurous",
		emoji: "🏔️",
		description: "Outdoor, wild, exciting",
		gradient: "linear-gradient(135deg, #ff8c00 0%, #ffd700 100%)",
	},
	intimate: {
		name: "Intimate",
		emoji: "💕",
		description: "Romantic, private, close",
		gradient: "linear-gradient(135deg, #ff6347 0%, #ff4500 100%)",
	},
	quick: {
		name: "Quick Mix",
		emoji: "⚡",
		description: "Short, quick sessions",
		gradient: "linear-gradient(135deg, #ff4500 0%, #ff8c00 100%)",
	},
	marathon: {
		name: "Marathon",
		emoji: "🎬",
		description: "Long-form extended content",
		gradient: "linear-gradient(135deg, #ff8c00 0%, #ffd700 100%)",
	},
};

const moodData = computed(() => {
	return (
		moodConfig[props.mood] || {
			name: props.mood,
			emoji: "🎵",
			description: "Curated mix",
			gradient: "linear-gradient(135deg, #ff4500 0%, #ff8c00 100%)",
		}
	);
});

const moodName = computed(() => moodData.value.name);
const moodEmoji = computed(() => moodData.value.emoji);
const moodDescription = computed(() => moodData.value.description);
const moodGradient = computed(() => moodData.value.gradient);

const handleClick = () => {
	emit("click", props.mood);
};
</script>

<style scoped>
.mood-mix-card {
  cursor: pointer;
  width: 100%;
  background: var(--dark-light);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mood-mix-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 69, 0, 0.3);
}

.mood-mix-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mood-icon {
  font-size: 48px;
}

.mood-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mood-mix-info {
  padding: 12px;
}

.mood-mix-count {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.mood-mix-description {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .mood-icon {
    font-size: 36px;
  }
  
  .mood-title {
    font-size: 16px;
  }
}
</style>

