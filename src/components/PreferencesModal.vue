<template>
  <div v-if="show" class="preferences-modal-overlay" @click.self="close">
    <div class="preferences-modal">
      <div class="modal-header">
        <h2>{{ $t('preferences.title') }}</h2>
        <button class="close-btn" @click="close">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-content">
        <!-- Language Preference -->
        <div class="preference-section">
          <h3>{{ $t('preferences.language') }}</h3>
          <LanguageSwitcher />
        </div>

        <!-- Category Preferences -->
        <div class="preference-section">
          <h3>{{ $t('preferences.categoryPreferences') }}</h3>
          <p class="section-description">{{ $t('preferences.selectCategories') }}</p>
          
          <div class="categories-grid">
            <label
              v-for="category in availableCategories"
              :key="category"
              class="category-checkbox"
            >
              <input
                type="checkbox"
                :checked="isCategoryPreferred(category)"
                @change="toggleCategory(category)"
              />
              <span class="checkbox-label">{{ category || 'Uncategorized' }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="save-btn" @click="saveAndClose">
          {{ $t('preferences.savePreferences') }}
        </button>
        <button class="cancel-btn" @click="close">
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePreferences } from '../composables/usePreferences';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const { toggleCategory, isCategoryPreferred, savePreferences } = usePreferences();

const availableCategories = computed(() => props.categories);

function close() {
  emit('close');
}

function saveAndClose() {
  savePreferences({});
  alert(t('preferences.preferencesSaved'));
  close();
}
</script>

<style scoped>
.preferences-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.preferences-modal {
  background: var(--dark);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 0, 110, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
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
  color: var(--text-primary);
  background: var(--dark-lighter);
}

.modal-content {
  padding: 24px;
}

.preference-section {
  margin-bottom: 32px;
}

.preference-section:last-child {
  margin-bottom: 0;
}

.preference-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.section-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--dark-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-checkbox:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.category-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn,
.cancel-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: var(--gradient-primary);
  color: white;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.cancel-btn {
  background: var(--dark-lighter);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--dark-light);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .preferences-modal {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>

