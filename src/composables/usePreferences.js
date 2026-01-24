import { ref, computed } from 'vue';

const PREFERENCES_KEY = 'userPreferences';

/**
 * User Preferences Management
 * Uses sessionStorage for session-specific preferences (cleared when browser tab closes)
 */
export function usePreferences() {
  const preferences = ref(getPreferences());

  function getPreferences() {
    try {
      // Use sessionStorage instead of localStorage for session-specific preferences
      const stored = sessionStorage.getItem(PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {
        language: 'en',
        preferredCategories: [],
        autoPlay: true,
        defaultPlaybackSpeed: 1,
        theme: 'dark'
      };
    } catch (error) {
      console.error('Error reading preferences:', error);
      return {
        language: 'en',
        preferredCategories: [],
        autoPlay: true,
        defaultPlaybackSpeed: 1,
        theme: 'dark'
      };
    }
  }

  function savePreferences(newPreferences) {
    try {
      preferences.value = { ...preferences.value, ...newPreferences };
      // Use sessionStorage instead of localStorage for session-specific preferences
      sessionStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences.value));
      return preferences.value;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return preferences.value;
    }
  }

  function updateCategoryPreferences(categories) {
    return savePreferences({ preferredCategories: categories });
  }

  function toggleCategory(category) {
    const current = preferences.value.preferredCategories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    return updateCategoryPreferences(updated);
  }

  function isCategoryPreferred(category) {
    return (preferences.value.preferredCategories || []).includes(category);
  }

  function getPreferredCategories() {
    return preferences.value.preferredCategories || [];
  }

  return {
    preferences: computed(() => preferences.value),
    savePreferences,
    updateCategoryPreferences,
    toggleCategory,
    isCategoryPreferred,
    getPreferredCategories
  };
}

