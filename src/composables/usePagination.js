import { ref, computed, unref } from 'vue';

export function usePagination(items, itemsPerPage = 40) {
  const currentPage = ref(1);

  const totalPages = computed(() => {
    const perPage = typeof itemsPerPage === 'function' || (itemsPerPage && typeof itemsPerPage.value !== 'undefined') 
      ? unref(itemsPerPage) 
      : itemsPerPage;
    return Math.ceil(items.value.length / perPage);
  });

  const paginatedItems = computed(() => {
    const perPage = typeof itemsPerPage === 'function' || (itemsPerPage && typeof itemsPerPage.value !== 'undefined') 
      ? unref(itemsPerPage) 
      : itemsPerPage;
    const start = (currentPage.value - 1) * perPage;
    const end = start + perPage;
    return items.value.slice(start, end);
  });

  const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    visiblePages,
    goToPage,
    nextPage,
    prevPage,
  };
}

