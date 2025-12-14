import { ref, computed } from 'vue';

const STORAGE_KEY = 'homeLayoutPreferences';

// Available sections - updated to match current homepage
export const availableSections = [
  { id: 'continueWatching', label: 'Continue Watching', icon: 'Clock', defaultEnabled: true, order: 0 },
  { id: 'watchLater', label: 'Watch Later', icon: 'Clock', defaultEnabled: true, order: 1 },
  { id: 'recentlyAdded', label: 'Recently Added', icon: 'Sparkles', defaultEnabled: true, order: 2 },
  { id: 'mostWatchedToday', label: 'Most Watched Today', icon: 'Eye', defaultEnabled: true, order: 3 },
  { id: 'quickWatch', label: 'Quick Watch', icon: 'Zap', defaultEnabled: true, order: 4 },
  { id: 'topRated', label: 'Top Rated This Week', icon: 'Award', defaultEnabled: true, order: 5 },
  { id: 'newReleases', label: 'New Releases', icon: 'Sparkles', defaultEnabled: true, order: 5.5 },
  { id: 'longestVideos', label: 'Longest Videos', icon: 'Timer', defaultEnabled: true, order: 6 },
  { id: 'hd4k', label: 'HD/4K Quality', icon: 'Monitor', defaultEnabled: true, order: 7 },
  { id: 'mostLiked', label: 'Most Liked', icon: 'Heart', defaultEnabled: true, order: 8 },
  { id: 'staffPicks', label: 'Staff Picks', icon: 'BookMarked', defaultEnabled: true, order: 9 },
  { id: 'trendingByCategory', label: 'Trending by Category', icon: 'TrendingUp', defaultEnabled: true, order: 10 },
  { id: 'trending', label: 'Trending Now', icon: 'TrendingUp', defaultEnabled: true, order: 11 },
  { id: 'yourStars', label: 'Your Stars', icon: 'Star', defaultEnabled: true, order: 7 },
  { id: 'indian', label: 'Indian', icon: 'Film', defaultEnabled: true, order: 8 },
  { id: 'pov', label: 'Recent POV Videos', icon: 'Film', defaultEnabled: true, order: 9 },
  { id: 'family', label: 'Recent Family Videos', icon: 'Film', defaultEnabled: true, order: 10 },
  { id: 'premium', label: 'Premium Content', icon: 'Crown', defaultEnabled: true, order: 11 },
];

// Load preferences from localStorage
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const savedPrefs = JSON.parse(stored);
      // Merge with available sections to include any new sections
      const merged = availableSections.map(section => {
        const saved = savedPrefs.find(p => p.id === section.id);
        if (saved) {
          return saved; // Use saved preference
        }
        // Add new section with default values
        return {
          id: section.id,
          enabled: section.defaultEnabled,
          order: section.order
        };
      });
      // Save merged preferences back
      savePreferences(merged);
      return merged;
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
    if (pref) {
      return pref.enabled;
    }
    // If section not in preferences yet, check if it exists in availableSections and return its default
    const section = availableSections.find(s => s.id === sectionId);
    if (section) {
      // Add it to preferences with default value
      preferences.value.push({
        id: section.id,
        enabled: section.defaultEnabled,
        order: section.order
      });
      savePreferences(preferences.value);
      return section.defaultEnabled;
    }
    return false;
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

