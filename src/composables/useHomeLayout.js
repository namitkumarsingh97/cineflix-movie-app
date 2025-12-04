import { ref, computed } from 'vue';

const STORAGE_KEY = 'homeLayoutPreferences';

// Available sections
export const availableSections = [
  { id: 'hero', label: 'Hero Section', icon: 'Film', defaultEnabled: true, order: 0 },
  { id: 'continueWatching', label: 'Continue Watching', icon: 'Clock', defaultEnabled: true, order: 1 },
  { id: 'trending', label: 'Trending', icon: 'TrendingUp', defaultEnabled: true, order: 2 },
  { id: 'recentlyAdded', label: 'Recently Added', icon: 'Calendar', defaultEnabled: true, order: 3 },
  { id: 'allMovies', label: 'All Movies', icon: 'Film', defaultEnabled: true, order: 4 },
];

// Load preferences from localStorage
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading layout preferences:', error);
  }
  
  // Return defaults
  return availableSections.map(section => ({
    id: section.id,
    enabled: section.defaultEnabled,
    order: section.order
  }));
}

// Save preferences to localStorage
function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving layout preferences:', error);
  }
}

export function useHomeLayout() {
  const preferences = ref(loadPreferences());

  // Get enabled sections in order
  const enabledSections = computed(() => {
    return preferences.value
      .filter(pref => pref.enabled)
      .sort((a, b) => a.order - b.order)
      .map(pref => {
        const section = availableSections.find(s => s.id === pref.id);
        return { ...section, ...pref };
      });
  });

  // Toggle section visibility
  function toggleSection(sectionId) {
    const pref = preferences.value.find(p => p.id === sectionId);
    if (pref) {
      pref.enabled = !pref.enabled;
      savePreferences(preferences.value);
    }
  }

  // Update section order
  function updateSectionOrder(sectionId, newOrder) {
    const pref = preferences.value.find(p => p.id === sectionId);
    if (pref) {
      pref.order = newOrder;
      // Adjust other sections
      preferences.value.forEach(p => {
        if (p.id !== sectionId && p.order >= newOrder) {
          p.order++;
        }
      });
      savePreferences(preferences.value);
    }
  }

  // Move section up
  function moveSectionUp(sectionId) {
    const pref = preferences.value.find(p => p.id === sectionId);
    if (pref && pref.order > 0) {
      const targetOrder = pref.order - 1;
      const targetPref = preferences.value.find(p => p.order === targetOrder);
      if (targetPref) {
        targetPref.order = pref.order;
        pref.order = targetOrder;
        savePreferences(preferences.value);
      }
    }
  }

  // Move section down
  function moveSectionDown(sectionId) {
    const pref = preferences.value.find(p => p.id === sectionId);
    const maxOrder = Math.max(...preferences.value.map(p => p.order));
    if (pref && pref.order < maxOrder) {
      const targetOrder = pref.order + 1;
      const targetPref = preferences.value.find(p => p.order === targetOrder);
      if (targetPref) {
        targetPref.order = pref.order;
        pref.order = targetOrder;
        savePreferences(preferences.value);
      }
    }
  }

  // Reset to defaults
  function resetToDefaults() {
    preferences.value = availableSections.map(section => ({
      id: section.id,
      enabled: section.defaultEnabled,
      order: section.order
    }));
    savePreferences(preferences.value);
  }

  // Check if section is enabled
  function isSectionEnabled(sectionId) {
    const pref = preferences.value.find(p => p.id === sectionId);
    return pref ? pref.enabled : false;
  }

  return {
    preferences,
    enabledSections,
    availableSections,
    toggleSection,
    updateSectionOrder,
    moveSectionUp,
    moveSectionDown,
    resetToDefaults,
    isSectionEnabled
  };
}

