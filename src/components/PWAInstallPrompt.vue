<template>
  <div v-if="shouldShow && isInstallable && !isInstalled" class="pwa-install-prompt">
    <div class="prompt-content">
      <div class="prompt-icon">
        <Download :size="24" />
      </div>
      <div class="prompt-text">
        <h4>{{ $t('pwa.installTitle') }}</h4>
        <p>{{ $t('pwa.installDescription') }}</p>
      </div>
      <div class="prompt-actions">
        <button class="install-btn" @click="handleInstall" aria-label="Install app">
          {{ $t('pwa.install') }}
        </button>
        <button class="dismiss-btn" @click="dismiss" aria-label="Dismiss">
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Download } from 'lucide-vue-next';
import { usePWA } from '../composables/usePWA';

const { t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  }
});

const { isInstallable, isInstalled, showInstallPrompt } = usePWA();
const dismissed = ref(false);

function handleInstall() {
  showInstallPrompt();
  dismissed.value = true;
}

function dismiss() {
  dismissed.value = true;
  localStorage.setItem('pwaInstallDismissed', 'true');
}

onMounted(() => {
  // Check if user previously dismissed
  const wasDismissed = localStorage.getItem('pwaInstallDismissed');
  if (wasDismissed) {
    dismissed.value = true;
  }
});

const shouldShow = computed(() => {
  return props.show && !dismissed.value;
});
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dark-lighter);
  border-radius: 12px;
  padding: 16px;
  max-width: 400px;
  width: calc(100% - 40px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 0, 110, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prompt-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: 12px;
  color: white;
}

.prompt-text {
  flex: 1;
}

.prompt-text h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.prompt-text p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.prompt-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.install-btn,
.dismiss-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.install-btn {
  background: var(--gradient-primary);
  color: white;
}

.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 110, 0.4);
}

.dismiss-btn {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dismiss-btn:hover {
  background: var(--dark);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .prompt-content {
    flex-direction: column;
    text-align: center;
  }

  .prompt-actions {
    width: 100%;
    flex-direction: row;
  }

  .install-btn,
  .dismiss-btn {
    flex: 1;
  }
}
</style>

