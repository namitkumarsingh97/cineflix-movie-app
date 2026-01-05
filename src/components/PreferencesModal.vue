<template>
  <div v-if="show" class="preferences-modal-overlay" @click.self="close">
    <div class="preferences-modal">
      <div class="modal-header">
        <h2>Preferences</h2>
        <button class="close-btn" @click="close">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-content">
        <!-- Popular Categories -->
        <div class="preference-section">
          <h3>Popular Categories</h3>
          <div class="section-header-row">
            <p class="section-description">Tap a category to include it in your preferences</p>
            <button class="clear-btn" type="button" @click="clearCategories">Clear all</button>
          </div>
          <div class="popular-tags">
            <button
              v-for="tag in popularTags"
              :key="tag"
              class="popular-tag"
              :class="{ active: isCategoryPreferred(tag) }"
              @click="toggleCategory(tag)"
              type="button"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="save-btn" @click="saveAndClose">
          Save Preferences
        </button>
        <button class="cancel-btn" @click="close">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { usePreferences } from "../composables/usePreferences";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
	categories: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(["close"]);
const router = useRouter();
const {
	toggleCategory,
	isCategoryPreferred,
	savePreferences,
	updateCategoryPreferences,
	getPreferredCategories,
} = usePreferences();
const popularTags = [
	"pov",
	"interracial",
	"rough",
	"ebony",
	"stepmom",
	"stepsis",
	"indian",
	"massage",
	"fetish",
	"bondage",
	"petite",
	"redhead",
	"double penetration",
	"solo",
	"toys",
	"outdoor",
	"schoolgirl",
	"russian",
	"cowgirl",
	"cumshot",
];

function close() {
	emit("close");
}

function saveAndClose() {
	savePreferences({});
	const prefs = getPreferredCategories();
	if (prefs && prefs.length > 0) {
		router.push(`/videos?q=${encodeURIComponent(prefs[0])}`);
	} else {
		router.push("/videos");
	}
	close();
}

function clearCategories() {
	updateCategoryPreferences([]);
}
</script>

<style scoped>
.preferences-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 24px;
}

.preferences-modal {
  background: var(--dark);
  border-radius: 16px;
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 69, 0, 0.3);
}

.modal-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--dark);
  z-index: 1;
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

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.clear-btn {
  padding: 8px 12px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--dark-light);
  color: var(--text-primary);
  border-color: var(--primary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tag {
  padding: 8px 14px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.popular-tag.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
}

.popular-tag:hover {
  background: var(--dark-light);
  border-color: var(--primary);
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
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(10, 14, 39, 0.9) 0%, rgba(10, 14, 39, 0.98) 100%);
  backdrop-filter: blur(6px);
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

@media (max-width: 1024px) {
  .preferences-modal-overlay {
    padding: 16px;
  }

  .preferences-modal {
    max-width: 100%;
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .preferences-modal-overlay {
    padding: 0;
  }

  .preferences-modal {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-checkbox {
    padding: 10px;
    gap: 8px;
  }
}
</style>

