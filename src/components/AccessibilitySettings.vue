<template>
  <div class="accessibility-settings" v-if="show">
    <div class="settings-header">
      <h3>
        <Accessibility :size="20" />
        <span>Accessibility Settings</span>
      </h3>
      <button class="close-btn" @click="$emit('close')" aria-label="Close accessibility settings">
        <X :size="20" />
      </button>
    </div>

    <div class="settings-content">
      <div class="setting-item">
        <div class="setting-info">
          <label>Reduce Motion</label>
          <p class="setting-description">Minimize animations and transitions</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: preferences.reducedMotion }"
          @click="toggleReducedMotion"
          :aria-label="`${preferences.reducedMotion ? 'Disable' : 'Enable'} reduced motion`"
          :aria-pressed="preferences.reducedMotion"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <label>High Contrast</label>
          <p class="setting-description">Increase contrast for better visibility</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: preferences.highContrast }"
          @click="toggleHighContrast"
          :aria-label="`${preferences.highContrast ? 'Disable' : 'Enable'} high contrast`"
          :aria-pressed="preferences.highContrast"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <label>Large Text</label>
          <p class="setting-description">Increase text size for better readability</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: preferences.largeText }"
          @click="toggleLargeText"
          :aria-label="`${preferences.largeText ? 'Disable' : 'Enable'} large text`"
          :aria-pressed="preferences.largeText"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <label>Focus Indicators</label>
          <p class="setting-description">Show visible focus indicators for keyboard navigation</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: preferences.focusVisible }"
          @click="toggleFocusVisible"
          :aria-label="`${preferences.focusVisible ? 'Disable' : 'Enable'} focus visible`"
          :aria-pressed="preferences.focusVisible"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>

      <div class="keyboard-shortcuts">
        <h4>Keyboard Shortcuts</h4>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>S</kbd>
            <span>Skip to main content</span>
          </div>
          <div class="shortcut-item">
            <kbd>Esc</kbd>
            <span>Close modal or dialog</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Accessibility, X } from "lucide-vue-next";
import { useAccessibility } from "../composables/useAccessibility";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close"]);

const {
	preferences,
	toggleReducedMotion,
	toggleHighContrast,
	toggleLargeText,
	toggleFocusVisible,
} = useAccessibility();
</script>

<style scoped>
.accessibility-settings {
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
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-header h3 {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 2px;
}

.toggle-switch.active {
  background: var(--primary);
  border-color: var(--primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--dark-lighter);
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

.keyboard-shortcuts {
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.keyboard-shortcuts h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.shortcut-item span {
  flex: 1;
}

kbd {
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .accessibility-settings {
    width: 95%;
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle-switch {
    align-self: flex-end;
  }
}
</style>

