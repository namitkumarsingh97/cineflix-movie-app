import { ref, onMounted } from 'vue';
import { userApi } from '../api/user';

const STORAGE_KEY = 'cineflix_watch_later';

// Check if online
const isOnline = () => navigator.onLine;

// Queue action for background sync
const queueBackgroundSync = async (action) => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      // Send message to service worker to queue the action
      registration.active.postMessage({
        type: 'queue-watch-later',
        action: {
          type: action.type, // 'add' or 'remove'
          data: action.data,
        },
      });
      
      // Register background sync if supported
      if ('sync' in registration) {
        try {
          await registration.sync.register('sync-watch-later');
          return true;
        } catch (err) {
          console.warn('Background sync registration failed:', err);
          // Still return true as message was sent
          return true;
        }
      } else {
        // Background sync not supported, but message was sent
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed to queue background sync:', err);
  }
  return false;
};

const isLoggedIn = () => {
  return !!(localStorage.getItem('token') || localStorage.getItem('adminToken'));
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load watch later list', err);
    return [];
  }
};

const persist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to persist watch later list', err);
  }
};

const syncToBackend = async (items) => {
  if (!isLoggedIn()) return;
  
  try {
    // Sync each item to backend
    for (const item of items) {
      try {
        await userApi.addWatchLater({
          id: item.id,
          type: item.type,
          title: item.title,
          thumbnail: item.thumbnail,
        });
      } catch (err) {
        // Item might already exist, ignore
        if (err.response?.status !== 400) {
          console.warn('Failed to sync item to backend:', err);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to sync watch later to backend:', err);
  }
};

const loadFromBackend = async () => {
  if (!isLoggedIn()) return loadFromStorage();
  
  try {
    const response = await userApi.getWatchLater();
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('Failed to load watch later from backend:', err);
  }
  
  return loadFromStorage();
};

export function useWatchLater() {
  const items = ref(loadFromStorage());
  const syncing = ref(false);

  const sync = async () => {
    if (!isLoggedIn()) return;
    
    syncing.value = true;
    try {
      const backendItems = await loadFromBackend();
      if (backendItems.length > 0) {
        // Merge with local items
        const merged = [...items.value];
        backendItems.forEach(backendItem => {
          const exists = merged.some(item => item.id === backendItem.id && item.type === backendItem.type);
          if (!exists) {
            merged.push(backendItem);
          }
        });
        items.value = merged;
        persist(items.value);
      }
    } catch (err) {
      console.warn('Failed to sync watch later:', err);
    } finally {
      syncing.value = false;
    }
  };

  const add = async (entry) => {
    if (!entry?.id) return;
    const exists = items.value.some((i) => i.id === entry.id && i.type === entry.type);
    if (exists) return;
    
    items.value = [...items.value, { ...entry, addedAt: Date.now() }];
    persist(items.value);
    
    // Sync to backend if logged in
    if (isLoggedIn()) {
      if (isOnline()) {
        try {
          await userApi.addWatchLater({
            id: entry.id,
            type: entry.type,
            title: entry.title,
            thumbnail: entry.thumbnail,
          });
        } catch (err) {
          console.warn('Failed to sync add to backend:', err);
          // Queue for background sync if network error
          if (!err.response || err.response.status >= 500) {
            await queueBackgroundSync({
              type: 'add',
              data: {
                id: entry.id,
                type: entry.type,
                title: entry.title,
                thumbnail: entry.thumbnail,
              },
            });
          }
        }
      } else {
        // Offline - queue for background sync
        await queueBackgroundSync({
          type: 'add',
          data: {
            id: entry.id,
            type: entry.type,
            title: entry.title,
            thumbnail: entry.thumbnail,
          },
        });
      }
    }
  };

  const remove = async (id, type) => {
    items.value = items.value.filter((i) => !(i.id === id && i.type === type));
    persist(items.value);
    
    // Sync to backend if logged in
    if (isLoggedIn()) {
      if (isOnline()) {
        try {
          await userApi.removeWatchLater({ id, type });
        } catch (err) {
          console.warn('Failed to sync remove to backend:', err);
          // Queue for background sync if network error
          if (!err.response || err.response.status >= 500) {
            await queueBackgroundSync({
              type: 'remove',
              data: { id, type },
            });
          }
        }
      } else {
        // Offline - queue for background sync
        await queueBackgroundSync({
          type: 'remove',
          data: { id, type },
        });
      }
    }
  };

  const clear = async () => {
    items.value = [];
    persist(items.value);
    
    // Sync to backend if logged in
    if (isLoggedIn()) {
      try {
        // Remove all items one by one
        const itemsToRemove = [...items.value];
        for (const item of itemsToRemove) {
          await userApi.removeWatchLater({ id: item.id, type: item.type });
        }
      } catch (err) {
        console.warn('Failed to sync clear to backend:', err);
      }
    }
  };

  const isSaved = (id, type) => items.value.some((i) => i.id === id && i.type === type);

  const getAll = () => items.value;

  // Sync on mount if logged in
  onMounted(() => {
    if (isLoggedIn()) {
      sync();
    }
  });

  return {
    items,
    syncing,
    add,
    remove,
    clear,
    isSaved,
    getAll,
    sync,
  };
}

