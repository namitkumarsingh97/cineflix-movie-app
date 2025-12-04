<template>
  <div class="language-switcher">
    <button class="lang-btn" @click="showDropdown = !showDropdown" :title="$t('preferences.language')">
      <Globe :size="18" />
      <span class="lang-code">{{ currentLocale.toUpperCase() }}</span>
      <ChevronDown :size="14" :class="{ rotated: showDropdown }" />
    </button>
    
    <div v-if="showDropdown" class="lang-dropdown">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="lang-option"
        :class="{ active: currentLocale === lang.code }"
        @click="changeLanguage(lang.code)"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-name">{{ lang.name }}</span>
        <Check v-if="currentLocale === lang.code" :size="16" class="check-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Globe, ChevronDown, Check } from 'lucide-vue-next';

const { locale } = useI18n();
const showDropdown = ref(false);

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const currentLocale = computed(() => locale.value);

function changeLanguage(langCode) {
  locale.value = langCode;
  localStorage.setItem('preferredLanguage', langCode);
  showDropdown.value = false;
  
  // Update HTML lang attribute
  document.documentElement.lang = langCode;
}

function handleClickOutside(event) {
  if (!event.target.closest('.language-switcher')) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Set initial HTML lang attribute
  document.documentElement.lang = currentLocale.value;
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--dark-lighter);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.lang-code {
  font-weight: 600;
  min-width: 30px;
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.lang-option:hover {
  background: var(--dark-lighter);
}

.lang-option.active {
  background: var(--dark-lighter);
  color: var(--primary);
}

.lang-flag {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.lang-name {
  flex: 1;
}

.check-icon {
  color: var(--primary);
  margin-left: auto;
}

.rotated {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .lang-dropdown {
    right: auto;
    left: 0;
  }
}
</style>

