import { ref, computed } from 'vue';
import { moviesApi } from '../api/movies';
import { useFetch } from './useFetch';

export function useMovies(initialSearchQuery = ref('')) {
  const movies = ref([]);
  const searchQuery = initialSearchQuery || ref('');
  const sortBy = ref('date');
  const { loading, error, execute } = useFetch(moviesApi.getAll);

  // Load movies
  const loadMovies = async () => {
    try {
      const result = await execute();
      movies.value = result || [];
    } catch (err) {
      console.error('Error loading movies:', err);
      movies.value = [];
    }
  };

  // Filtered and sorted movies
  const filteredMovies = computed(() => {
    let filtered = movies.value;

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    }

    // Category filter (can be extended)
    // This would be passed from parent component

    // Sort
    if (sortBy.value === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy.value === 'date') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy.value === 'popular') {
      filtered = [...filtered].sort((a, b) => {
        const aScore = (a.views || 0) + (a.likes || 0) * 2;
        const bScore = (b.views || 0) + (b.likes || 0) * 2;
        return bScore - aScore;
      });
    } else if (sortBy.value === 'views') {
      filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return filtered;
  });

  // Featured movie (first one)
  const featuredMovie = computed(() => {
    return filteredMovies.value.length > 0 ? filteredMovies.value[0] : null;
  });

  return {
    movies,
    searchQuery,
    sortBy,
    loading,
    error,
    filteredMovies,
    featuredMovie,
    loadMovies,
  };
}

