import { ref, onMounted, onUnmounted } from 'vue';

const STORAGE_KEY = 'accessibilityPreferences';

// Load preferences from localStorage
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading accessibility preferences:', error);
  }
  
  return {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true
  };
}

// Save preferences to localStorage
function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving accessibility preferences:', error);
  }
}

export function useAccessibility() {
  const preferences = ref(loadPreferences());

  // Apply preferences to document
  function applyPreferences() {
    const root = document.documentElement;
    
    if (preferences.value.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01s');
      root.classList.add('reduced-motion');
    } else {
      root.style.removeProperty('--animation-duration');
      root.classList.remove('reduced-motion');
    }

    if (preferences.value.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (preferences.value.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (preferences.value.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }

  // Toggle reduced motion
  function toggleReducedMotion() {
    preferences.value.reducedMotion = !preferences.value.reducedMotion;
    savePreferences(preferences.value);
    applyPreferences();
  }

  // Toggle high contrast
  function toggleHighContrast() {
    preferences.value.highContrast = !preferences.value.highContrast;
    savePreferences(preferences.value);
    applyPreferences();
  }

  // Toggle large text
  function toggleLargeText() {
    preferences.value.largeText = !preferences.value.largeText;
    savePreferences(preferences.value);
    applyPreferences();
  }

  // Toggle focus visible
  function toggleFocusVisible() {
    preferences.value.focusVisible = !preferences.value.focusVisible;
    savePreferences(preferences.value);
    applyPreferences();
  }

  // Skip to main content (for screen readers)
  function skipToMain() {
    const main = document.querySelector('main, [role="main"]');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Skip to main content (for screen readers)
  function skipToMain() {
    const main = document.querySelector('main, [role="main"], #main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        main.removeAttribute('tabindex');
      }, 1000);
    }
  }

  // Initialize on mount
  onMounted(() => {
    applyPreferences();
    
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      // Alt + S: Skip to main content
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        skipToMain();
      }
      
      // Escape: Close modals/dropdowns
      if (e.key === 'Escape') {
        // This can be extended to close any open modals
        const modals = document.querySelectorAll('.modal-overlay, [role="dialog"]');
        modals.forEach(modal => {
          const closeBtn = modal.querySelector('[aria-label*="close" i], [aria-label*="Close" i]');
          if (closeBtn) closeBtn.click();
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  return {
    preferences,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleFocusVisible,
    skipToMain,
    applyPreferences
  };
}

