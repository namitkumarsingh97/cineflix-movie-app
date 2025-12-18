<template>
  <div class="analytics-chart">
    <div class="chart-header">
      <h3>
        <component :is="icon" :size="20" />
        <span>{{ title }}</span>
      </h3>
      <select v-model="selectedPeriod" class="period-select" @change="$emit('period-change', selectedPeriod)">
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="year">Last 12 Months</option>
      </select>
    </div>
    <div class="chart-container">
      <div class="chart-bars">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="chart-bar-item"
        >
          <div class="bar-wrapper">
            <div
              class="bar"
              :style="{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: getBarColor(index),
              }"
              :title="`${item.label}: ${item.value}`"
            ></div>
          </div>
          <div class="bar-label">{{ item.label }}</div>
          <div class="bar-value">{{ item.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	icon: {
		type: Object,
		required: true,
	},
	data: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(["period-change"]);

const selectedPeriod = ref("month");

const chartData = computed(() => {
	return props.data || [];
});

const maxValue = computed(() => {
	if (chartData.value.length === 0) return 1;
	return Math.max(...chartData.value.map((item) => item.value), 1);
});

function getBarColor(index) {
	const colors = [
		"linear-gradient(135deg, #ff4500 0%, #ff6347 100%)",
		"linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
		"linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
		"linear-gradient(135deg, #32cd32 0%, #7cfc00 100%)",
		"linear-gradient(135deg, #ff6347 0%, #ff4500 100%)",
	];
	return colors[index % colors.length];
}
</script>

<style scoped>
.analytics-chart {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-header h3 svg {
  color: var(--primary);
}

.period-select {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-select:focus {
  outline: none;
  border-color: var(--primary);
}

.chart-container {
  min-height: 200px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 12px;
  height: 200px;
  padding: 0 8px;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 60px;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 50px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 4px;
}

.bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

.bar-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

@media (max-width: 768px) {
  .chart-bars {
    gap: 8px;
  }

  .bar {
    max-width: 40px;
  }

  .bar-label {
    font-size: 11px;
  }

  .bar-value {
    font-size: 12px;
  }
}
</style>

