import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

/**
 * Composable for network quality detection and adaptive features
 */
export function useNetworkQuality() {
  const effectiveType = ref('');
  const downlink = ref(0);
  const rtt = ref(0);
  const saveData = ref(false);
  const isOnline = ref(navigator.onLine);
  const isSlow = ref(false);
  const is2G = ref(false);
  const is3G = ref(false);
  const is4G = ref(false);
  const is5G = ref(false);

  const connection = computed(() => {
    return (
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null
    );
  });

  const updateNetworkInfo = () => {
    const conn = connection.value;
    if (!conn) {
      // Fallback: assume good connection if API not available
      effectiveType.value = '4g';
      downlink.value = 10;
      rtt.value = 50;
      saveData.value = false;
      isSlow.value = false;
      is2G.value = false;
      is3G.value = false;
      is4G.value = true;
      is5G.value = false;
      return;
    }

    effectiveType.value = conn.effectiveType || '';
    downlink.value = conn.downlink || 0;
    rtt.value = conn.rtt || 0;
    saveData.value = conn.saveData || false;

    // Determine network type
    const type = effectiveType.value.toLowerCase();
    is2G.value = type === '2g' || type === 'slow-2g';
    is3G.value = type === '3g';
    is4G.value = type === '4g';
    is5G.value = type === '5g' || downlink.value >= 10;

    // Consider slow if 2G, 3G, or high RTT/low downlink
    isSlow.value =
      is2G.value ||
      is3G.value ||
      rtt.value > 500 ||
      downlink.value < 1 ||
      saveData.value;
  };

  const handleOnline = () => {
    isOnline.value = true;
    updateNetworkInfo();
  };

  const handleOffline = () => {
    isOnline.value = false;
    isSlow.value = true;
  };

  const handleConnectionChange = () => {
    updateNetworkInfo();
  };

  // Computed properties for adaptive features
  const shouldAutoplay = computed(() => {
    // Disable autoplay on slow networks or when save data is enabled
    return !isSlow.value && !saveData.value && isOnline.value;
  });

  const thumbnailDensity = computed(() => {
    // Reduce thumbnail density on slow networks
    if (is2G.value || saveData.value) return 'low'; // Show fewer thumbnails
    if (is3G.value || isSlow.value) return 'medium'; // Moderate density
    return 'high'; // Full density on fast networks
  });

  const playerBitrate = computed(() => {
    // Auto-select bitrate based on network
    if (is2G.value || saveData.value) return 'low'; // ~240p-360p
    if (is3G.value) return 'medium'; // ~480p-720p
    if (isSlow.value) return 'medium'; // Conservative for slow connections
    return 'high'; // ~1080p+ on fast networks
  });

  const shouldDeferRecommendations = computed(() => {
    // Defer heavy recommendations on 2G/3G
    return is2G.value || is3G.value || saveData.value;
  });

  const shouldPreloadThumbnails = computed(() => {
    // Only preload thumbnails on fast networks
    return !isSlow.value && !saveData.value;
  });

  const maxThumbnailsPerPage = computed(() => {
    // Limit thumbnails based on network
    if (is2G.value || saveData.value) return 12;
    if (is3G.value || isSlow.value) return 24;
    return 48; // Full grid on fast networks
  });

  const videoQuality = computed(() => {
    // Map bitrate to quality level
    if (playerBitrate.value === 'low') return { maxHeight: 360, maxBitrate: 500 };
    if (playerBitrate.value === 'medium') return { maxHeight: 720, maxBitrate: 2000 };
    return { maxHeight: 1080, maxBitrate: 5000 };
  });

  onMounted(() => {
    updateNetworkInfo();

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const conn = connection.value;
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    const conn = connection.value;
    if (conn) {
      conn.removeEventListener('change', handleConnectionChange);
    }
  });

  return {
    // Network info
    effectiveType,
    downlink,
    rtt,
    saveData,
    isOnline,
    isSlow,
    is2G,
    is3G,
    is4G,
    is5G,
    connection,

    // Adaptive features
    shouldAutoplay,
    thumbnailDensity,
    playerBitrate,
    shouldDeferRecommendations,
    shouldPreloadThumbnails,
    maxThumbnailsPerPage,
    videoQuality,

    // Methods
    updateNetworkInfo,
  };
}

