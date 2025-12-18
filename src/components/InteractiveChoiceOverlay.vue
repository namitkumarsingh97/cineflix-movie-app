<template>
  <div v-if="choices.length > 0" class="interactive-choice-overlay">
    <div class="choice-container">
      <div class="choice-header">
        <h3 class="choice-title">{{ choicePoint.title || 'Make a Choice' }}</h3>
        <p v-if="choicePoint.description" class="choice-description">
          {{ choicePoint.description }}
        </p>
      </div>
      
      <div class="choices-grid">
        <button
          v-for="choice in choices"
          :key="choice.id"
          class="choice-button"
          :class="{ 'choice-selected': selectedChoices[choicePoint.id] === choice.id }"
          @click="handleChoice(choice)"
        >
          <div class="choice-icon" v-if="choice.icon">{{ choice.icon }}</div>
          <div class="choice-content">
            <div class="choice-label">{{ choice.label }}</div>
            <div v-if="choice.description" class="choice-desc">{{ choice.description }}</div>
          </div>
          <div class="choice-arrow">→</div>
        </button>
      </div>

      <div class="choice-footer">
        <button class="choice-skip" @click="$emit('skip')" v-if="allowSkip">
          Skip Choice
        </button>
        <div class="choice-timer" v-if="timeLimit > 0">
          {{ formatTime(timeRemaining) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
	choicePoint: {
		type: Object,
		required: true,
	},
	choices: {
		type: Array,
		required: true,
	},
	selectedChoices: {
		type: Object,
		default: () => ({}),
	},
	allowSkip: {
		type: Boolean,
		default: false,
	},
	timeLimit: {
		type: Number,
		default: 0, // 0 = no time limit
	},
});

const emit = defineEmits(["choice", "skip"]);

const timeRemaining = ref(props.timeLimit);
let timerInterval = null;

function handleChoice(choice) {
	emit("choice", {
		choicePointId: props.choicePoint.id,
		choiceId: choice.id,
	});
}

function formatTime(seconds) {
	if (seconds <= 0) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

onMounted(() => {
	if (props.timeLimit > 0) {
		timeRemaining.value = props.timeLimit;
		timerInterval = setInterval(() => {
			timeRemaining.value--;
			if (timeRemaining.value <= 0) {
				clearInterval(timerInterval);
				// Auto-select first choice or skip
				if (props.choices.length > 0) {
					handleChoice(props.choices[0]);
				} else {
					emit("skip");
				}
			}
		}, 1000);
	}
});

onBeforeUnmount(() => {
	if (timerInterval) {
		clearInterval(timerInterval);
	}
});
</script>

<style scoped>
.interactive-choice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.choice-container {
  background: var(--bg-secondary, #1a1a2e);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.choice-header {
  margin-bottom: 24px;
  text-align: center;
}

.choice-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 8px 0;
}

.choice-description {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin: 0;
}

.choices-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.choice-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.choice-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary, #ff4500);
  transform: translateX(4px);
}

.choice-button.choice-selected {
  background: rgba(255, 69, 0, 0.2);
  border-color: var(--primary, #ff4500);
}

.choice-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.choice-content {
  flex: 1;
}

.choice-label {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.choice-desc {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.choice-arrow {
  font-size: 20px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  transition: all 0.2s ease;
}

.choice-button:hover .choice-arrow {
  color: var(--primary, #ff4500);
  transform: translateX(4px);
}

.choice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.choice-skip {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.choice-skip:hover {
  border-color: var(--text-primary, #ffffff);
  color: var(--text-primary, #ffffff);
}

.choice-timer {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary, #ff4500);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .choice-container {
    padding: 24px;
    width: 95%;
  }

  .choice-title {
    font-size: 20px;
  }

  .choice-button {
    padding: 12px 16px;
  }
}
</style>

