import { ref, onMounted } from 'vue';

let deferredPrompt = null;

export function usePWA() {
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const isStandalone = ref(false);

  // Check if app is installed
  function checkInstallStatus() {
    // Check if running as standalone (installed)
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');
    
    isInstalled.value = isStandalone.value;
  }

  // Show install prompt
  function showInstallPrompt() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
        isInstallable.value = false;
      });
    }
  }

  // Initialize PWA
  onMounted(() => {
    checkInstallStatus();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      isInstallable.value = true;
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      isInstalled.value = true;
      isInstallable.value = false;
      deferredPrompt = null;
    });

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  });

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    checkInstallStatus
  };
}

