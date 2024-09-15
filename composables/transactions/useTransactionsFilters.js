import { useStorage } from "@vueuse/core";

export function useTransactionsFilters(listingId) {
  const globalFiltersStore = useGlobalFiltersStore();

  const filters = useStorage(
    `${listingId}-filters`,
    globalFiltersStore.getFilters(listingId)
  );

  const dateFilter = computed({
    get: () => filters.value.dateFilter || null,
    set: (value) => (filters.value.dateFilter = value),
  });

  const categoryFilter = computed({
    get: () => filters.value.categoryFilter || null,
    set: (value) => (filters.value.categoryFilter = value),
  });

  const amountMinFilter = computed({
    get: () => filters.value.amountMinFilter || null,
    set: (value) => (filters.value.amountMinFilter = value),
  });

  const amountMaxFilter = computed({
    get: () => filters.value.amountMaxFilter || null,
    set: (value) => (filters.value.amountMaxFilter = value),
  });

  const currentPage = computed({
    get: () => {
		console.log('filters.value.currentPage:', filters.value.currentPage);
		const page = filters.value.currentPage ?? 1;
		console.log('page:', page);
		return page;
	  },
    set: (value) => (filters.value.currentPage = value),
  });

  const pageSize = computed({
    get: () => filters.value.pageSize ?? 10,
    set: (value) => (filters.value.pageSize = value),
  });

  const totalItems = computed({
    get: () => filters.value.totalItems !== null ? filters.value.totalItems : null,
    set: (value) => (filters.value.totalItems = value !== null ? value : null),
  });

  const updateTransactionsFilters = () => {
    globalFiltersStore.setFilters(listingId, { ...filters.value });
  };

  const clearAllFilters = () => {
    filters.value = {
      dateFilter: null,
      categoryFilter: null,
      amountMinFilter: null,
      amountMaxFilter: null,
      currentPage: 1,
	  totalItems: totalItems.value,
	  pageSize: pageSize.value
    };
    updateTransactionsFilters();
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
  };

  const handlePageSizeChange = (size) => {
    pageSize.value = size;
  };

  watch(filters, updateTransactionsFilters);

  return {
    dateFilter,
    categoryFilter,
    amountMinFilter,
    amountMaxFilter,
    currentPage,
    pageSize,
    totalItems,
    updateTransactionsFilters,
    clearAllFilters,
    handlePageChange,
    handlePageSizeChange,
  };
}