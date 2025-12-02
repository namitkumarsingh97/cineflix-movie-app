import { ref } from 'vue';

export function useFetch(apiFunction) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiFunction(...args);
      data.value = response.data?.data || response.data;
      return data.value;
    } catch (err) {
      error.value = err.response?.data || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    error,
    execute,
  };
}

