import { ref } from 'vue';
import { videosApi } from '../api/videos';
import { useFetch } from './useFetch';

export function useVideos() {
  const videos = ref([]);
  const { loading, error, execute } = useFetch(videosApi.getAll);

  // Load videos
  const loadVideos = async () => {
    try {
      const result = await execute();
      videos.value = result || [];
    } catch (err) {
      console.error('Error loading videos:', err);
      videos.value = [];
    }
  };

  return {
    videos,
    loading,
    error,
    loadVideos,
  };
}

