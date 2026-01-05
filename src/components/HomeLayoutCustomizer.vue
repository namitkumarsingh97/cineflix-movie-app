<template>
  <Teleport to="body">
    <div v-if="show" class="customizer-overlay" @click.self="$emit('close')">
      <div class="home-layout-customizer" @click.stop>
        <div class="customizer-header">
          <h3>
            <Layout :size="20" />
            <span>Customize Homepage Layout</span>
          </h3>
          <button class="close-btn" @click="$emit('close')" aria-label="Close customizer">
            <X :size="20" />
          </button>
        </div>

        <div class="customizer-content">
          <p class="customizer-hint">
            Toggle sections on/off and reorder them to personalize your homepage experience
          </p>

          <!-- Category Sidebar Settings -->
          <div class="settings-section">
            <h4 class="settings-title">
              <Sidebar :size="18" />
              <span>Category Sidebar</span>
            </h4>
            <div class="settings-item">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="sidebarEnabled"
                  @change="saveSidebarPreference"
                />
                <span class="slider"></span>
                <span class="toggle-label">Show Category Sidebar</span>
              </label>
            </div>
          </div>

          <!-- Navbar Settings -->
          <div class="settings-section">
            <h4 class="settings-title">
              <Menu :size="18" />
              <span>Navigation Bar</span>
            </h4>
            <div class="settings-item">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="navbarEnabled"
                  @change="saveNavbarPreference"
                />
                <span class="slider"></span>
                <span class="toggle-label">Show Navigation Bar</span>
              </label>
            </div>
          </div>

          <!-- Homepage Sections -->
          <div class="settings-section">
            <h4 class="settings-title">
              <Grid3x3 :size="18" />
              <span>Homepage Sections</span>
            </h4>
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
          </div>

          <!-- Featured Categories -->
          <div class="settings-section">
            <h4 class="settings-title">
              <FolderOpen :size="18" />
              <span>Featured Categories</span>
            </h4>
            <p class="section-description">
              Manage which categories appear in the sidebar and mobile menu
            </p>
            <div class="categories-list">
              <div
                v-for="category in featuredCategories"
                :key="category.id"
                class="category-item"
              >
                <label class="category-checkbox">
                  <input
                    type="checkbox"
                    v-model="category.enabled"
                    @change="saveCategoryPreferences"
                  />
                  <span class="checkmark"></span>
                  <span class="category-label">{{ category.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="customizer-actions">
            <button class="reset-btn" @click="resetToDefaults">
              <RotateCcw :size="16" />
              <span>Reset to Defaults</span>
            </button>
            <button class="save-btn" @click="saveAndClose">
              <Check :size="16" />
              <span>Save & Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {
	Calendar,
	Check,
	ChevronDown,
	ChevronUp,
	Clock,
	Crown,
	Eye,
	EyeOff,
	Film,
	FolderOpen,
	Grid3x3,
	Layout,
	Menu,
	RotateCcw,
	Sidebar,
	Star,
	TrendingUp,
	X,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useHomeLayout } from "../composables/useHomeLayout";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close"]);

const {
	preferences,
	availableSections,
	toggleSection,
	moveSectionUp,
	moveSectionDown,
	resetToDefaults: resetSectionsToDefaults,
	isSectionEnabled,
} = useHomeLayout();

// Sidebar and Navbar preferences
const sidebarEnabled = ref(true);
const navbarEnabled = ref(true);

// Featured categories
const featuredCategories = ref([
	{ id: "double-penetration", label: "Double Penetration", enabled: true },
	{ id: "amateur", label: "Amateur", enabled: true },
	{ id: "anal", label: "Anal", enabled: true },
	{ id: "asian", label: "Asian", enabled: true },
	{ id: "bdsm", label: "BDSM", enabled: true },
	{ id: "big-ass", label: "Big Ass", enabled: true },
	{ id: "big-dick", label: "Big Dick", enabled: true },
	{ id: "big-tits", label: "Big Tits", enabled: true },
	{ id: "bisexual", label: "Bisexual", enabled: true },
	{ id: "blonde", label: "Blonde", enabled: true },
	{ id: "blowjob", label: "Blowjob", enabled: true },
	{ id: "brunette", label: "Brunette", enabled: true },
	{ id: "bukkake", label: "Bukkake", enabled: true },
	{ id: "creampie", label: "Creampie", enabled: true },
	{ id: "cumshot", label: "Cumshot", enabled: true },
	{ id: "ebony", label: "Ebony", enabled: true },
	{ id: "for-women", label: "For Women", enabled: true },
	{ id: "group-sex", label: "Group Sex", enabled: true },
	{ id: "handjob", label: "Handjob", enabled: true },
	{ id: "hardcore", label: "Hardcore", enabled: true },
	{ id: "hentai", label: "Hentai", enabled: true },
	{ id: "homemade", label: "Homemade", enabled: true },
	{ id: "hotel", label: "Hotel", enabled: true },
	{ id: "housewives", label: "Housewives", enabled: true },
	{ id: "interracial", label: "Interracial", enabled: true },
	{ id: "latina", label: "Latina", enabled: true },
	{ id: "lesbian", label: "Lesbian", enabled: true },
	{ id: "massage", label: "Massage", enabled: true },
	{ id: "masturbation", label: "Masturbation", enabled: true },
	{ id: "mature", label: "Mature", enabled: true },
	{ id: "milf", label: "MILF", enabled: true },
	{ id: "nurse", label: "Nurse", enabled: true },
	{ id: "office", label: "Office", enabled: true },
	{ id: "outdoor", label: "Outdoor", enabled: true },
	{ id: "pov", label: "POV", enabled: true },
	{ id: "public", label: "Public", enabled: true },
	{ id: "shemale", label: "Shemale", enabled: true },
	{ id: "sleep", label: "Sleep", enabled: true },
	{ id: "small-tits", label: "Small Tits", enabled: true },
	{ id: "squirt", label: "Squirt", enabled: true },
]);

const maxOrder = computed(() => {
	return Math.max(...preferences.value.map((p) => p.order));
});

function getSectionOrder(sectionId) {
	const pref = preferences.value.find((p) => p.id === sectionId);
	return pref ? pref.order : 0;
}

function getIcon(iconName) {
	const icons = {
		Film,
		Clock,
		TrendingUp,
		Calendar,
		Crown,
		Star,
	};
	return icons[iconName] || Film;
}

function loadPreferences() {
	// Load sidebar preference
	const sidebarPref = localStorage.getItem("categorySidebarEnabled");
	sidebarEnabled.value = sidebarPref !== null ? sidebarPref === "true" : true;

	// Load navbar preference
	const navbarPref = localStorage.getItem("navbarEnabled");
	navbarEnabled.value = navbarPref !== null ? navbarPref === "true" : true;

	// Load category preferences
	const categoryPrefs = localStorage.getItem("featuredCategoriesEnabled");
	if (categoryPrefs) {
		try {
			const saved = JSON.parse(categoryPrefs);
			featuredCategories.value.forEach((cat) => {
				const savedCat = saved.find((s) => s.id === cat.id);
				if (savedCat) {
					cat.enabled = savedCat.enabled;
				}
			});
		} catch (e) {
			console.error("Error loading category preferences:", e);
		}
	}
}

function saveSidebarPreference() {
	localStorage.setItem(
		"categorySidebarEnabled",
		sidebarEnabled.value.toString(),
	);
	// Emit event to update sidebar visibility
	window.dispatchEvent(
		new CustomEvent("sidebarPreferenceChanged", {
			detail: { enabled: sidebarEnabled.value },
		}),
	);
}

function saveNavbarPreference() {
	localStorage.setItem("navbarEnabled", navbarEnabled.value.toString());
	// Emit event to update navbar visibility
	window.dispatchEvent(
		new CustomEvent("navbarPreferenceChanged", {
			detail: { enabled: navbarEnabled.value },
		}),
	);
}

function saveCategoryPreferences() {
	localStorage.setItem(
		"featuredCategoriesEnabled",
		JSON.stringify(featuredCategories.value),
	);
	// Emit event to update categories
	window.dispatchEvent(
		new CustomEvent("categoryPreferencesChanged", {
			detail: { categories: featuredCategories.value },
		}),
	);
}

function saveAndClose() {
	saveSidebarPreference();
	saveNavbarPreference();
	saveCategoryPreferences();
	emit("close");
}

function resetToDefaults() {
	if (
		confirm(
			"Are you sure you want to reset all layout preferences to defaults?",
		)
	) {
		// Reset sections
		resetSectionsToDefaults();

		// Reset sidebar and navbar
		sidebarEnabled.value = true;
		navbarEnabled.value = true;

		// Reset categories
		featuredCategories.value.forEach((cat) => {
			cat.enabled = true;
		});

		// Save all
		saveAndClose();
	}
}

onMounted(() => {
	loadPreferences();
});
</script>

<style scoped>
.customizer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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

.home-layout-customizer {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 24px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 69, 0, 0.2);
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

.customizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.customizer-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customizer-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.settings-section {
  background: var(--dark);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.settings-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.section-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.settings-item {
  margin-bottom: 12px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.toggle-switch input {
  width: 44px;
  height: 24px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
  position: relative;
  flex-shrink: 0;
}

.toggle-switch input:checked {
  background: var(--primary);
}

.toggle-switch .slider {
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.toggle-switch input:checked ~ .slider {
  left: 22px;
}

.toggle-label {
  font-size: 14px;
  color: var(--text-primary);
  user-select: none;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
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

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.category-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.category-label {
  font-size: 13px;
  color: var(--text-primary);
  user-select: none;
}

.customizer-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.reset-btn {
  background: var(--dark);
  border: 1px solid rgba(255, 69, 0, 0.3);
  color: var(--text-primary);
}

.reset-btn:hover {
  background: rgba(255, 69, 0, 0.1);
  border-color: var(--primary);
}

.save-btn {
  background: var(--gradient-primary);
  color: white;
  flex: 1;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

@media (max-width: 768px) {
  .home-layout-customizer {
    width: 95%;
    padding: 20px;
    max-height: 85vh;
  }

  .section-controls {
    flex-wrap: wrap;
  }

  .section-order-controls {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }

  .categories-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .customizer-actions {
    flex-direction: column;
  }

  .reset-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
