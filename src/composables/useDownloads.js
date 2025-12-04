import { ref, computed } from 'vue';

const DOWNLOADS_KEY = 'downloads';
const MAX_DOWNLOADS = 50;

export function useDownloads() {
  const downloads = ref(getDownloads());

  function getDownloads() {
    try {
      const stored = localStorage.getItem(DOWNLOADS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading downloads:', error);
      return [];
    }
  }

  function addDownload(item) {
    try {
      const { id, title, url, thumbnail, type } = item;
      
      // Check if already downloaded
      if (downloads.value.find(d => d.id === id)) {
        return downloads.value;
      }

      const downloadItem = {
        id,
        title,
        url,
        thumbnail,
        type, // 'movie' or 'video'
        downloadedAt: new Date().toISOString(),
        status: 'completed',
        progress: 100
      };

      downloads.value.unshift(downloadItem);
      
      // Keep only last MAX_DOWNLOADS
      if (downloads.value.length > MAX_DOWNLOADS) {
        downloads.value = downloads.value.slice(0, MAX_DOWNLOADS);
      }

      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads.value));
      return downloads.value;
    } catch (error) {
      console.error('Error adding download:', error);
      return downloads.value;
    }
  }

  function removeDownload(id) {
    try {
      downloads.value = downloads.value.filter(d => d.id !== id);
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads.value));
      return downloads.value;
    } catch (error) {
      console.error('Error removing download:', error);
      return downloads.value;
    }
  }

  function clearDownloads() {
    try {
      downloads.value = [];
      localStorage.removeItem(DOWNLOADS_KEY);
      return [];
    } catch (error) {
      console.error('Error clearing downloads:', error);
      return [];
    }
  }

  function downloadFile(item) {
    return new Promise((resolve, reject) => {
      try {
        const { id, title, url } = item;
        
        if (!url) {
          reject(new Error('No download URL available'));
          return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = title || 'download';
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add to downloads list
        addDownload(item);
        resolve();
      } catch (error) {
        console.error('Error downloading file:', error);
        reject(error);
      }
    });
  }

  function downloadForOffline(item) {
    // For videos/movies, we'll use the browser's download functionality
    // In a real app, you might want to use IndexedDB or Cache API for offline storage
    return downloadFile(item);
  }

  return {
    downloads: computed(() => downloads.value),
    addDownload,
    removeDownload,
    clearDownloads,
    downloadFile,
    downloadForOffline
  };
}

