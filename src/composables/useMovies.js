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

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    }

    if (sortBy.value === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy.value === 'date') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
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

