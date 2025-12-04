<template>
  <div class="home-layout-customizer" v-if="show">
    <div class="customizer-header">
      <h3>
        <Layout :size="20" />
        <span>{{ $t('homeLayout.customize') }}</span>
      </h3>
      <button class="close-btn" @click="$emit('close')" aria-label="Close customizer">
        <X :size="20" />
      </button>
    </div>

    <div class="customizer-content">
      <p class="customizer-hint">{{ $t('homeLayout.hint') }}</p>

      <div class="sections-list">
        <div
          v-for="section in availableSections"
          :key="section.id"
          class="section-item"
          :class="{ disabled: !isSectionEnabled(section.id) }"
        >
          <div class="section-controls">
            <button
              class="toggle-btn"
              @click="toggleSection(section.id)"
              :aria-label="`${isSectionEnabled(section.id) ? 'Hide' : 'Show'} ${section.label}`"
              :aria-pressed="isSectionEnabled(section.id)"
            >
              <Eye v-if="isSectionEnabled(section.id)" :size="16" />
              <EyeOff v-else :size="16" />
            </button>

            <div class="section-info">
              <component :is="getIcon(section.icon)" :size="18" />
              <span>{{ section.label }}</span>
            </div>

            <div class="section-order-controls">
              <button
                class="order-btn"
                @click="moveSectionUp(section.id)"
                :disabled="!isSectionEnabled(section.id) || getSectionOrder(section.id) === 0"
                aria-label="Move up"
              >
                <ChevronUp :size="16" />
              </button>
              <button
                class="order-btn"
                @click="moveSectionDown(section.id)"
                :disabled="!isSectionEnabled(section.id) || getSectionOrder(section.id) === maxOrder"
                aria-label="Move down"
              >
                <ChevronDown :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="customizer-actions">
        <button class="reset-btn" @click="resetToDefaults">
          <RotateCcw :size="16" />
          <span>{{ $t('homeLayout.reset') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Layout,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Film,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-vue-next';
import { useHomeLayout } from '../composables/useHomeLayout';

const { t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const {
  preferences,
  availableSections,
  toggleSection,
  moveSectionUp,
  moveSectionDown,
  resetToDefaults,
  isSectionEnabled
} = useHomeLayout();

const maxOrder = computed(() => {
  return Math.max(...preferences.value.map(p => p.order));
});

function getSectionOrder(sectionId) {
  const pref = preferences.value.find(p => p.id === sectionId);
  return pref ? pref.order : 0;
}

function getIcon(iconName) {
  const icons = {
    Film,
    Clock,
    TrendingUp,
    Calendar
  };
  return icons[iconName] || Film;
}
</script>

<style scoped>
.home-layout-customizer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 0, 110, 0.2);
}

.customizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.customizer-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.customizer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.customizer-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-item {
  background: var(--dark);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.section-item.disabled {
  opacity: 0.5;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-btn {
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.section-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.section-order-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-btn {
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-btn:hover:not(:disabled) {
  background: var(--dark-light);
  color: var(--primary);
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.customizer-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark);
  border: 1px solid rgba(255, 0, 110, 0.3);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  border-color: var(--primary);
}

@media (max-width: 768px) {
  .home-layout-customizer {
    width: 95%;
    padding: 20px;
  }

  .section-controls {
    flex-wrap: wrap;
  }

  .section-order-controls {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

