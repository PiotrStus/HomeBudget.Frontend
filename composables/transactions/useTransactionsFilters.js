import { useStorage } from "@vueuse/core";

export function useTransactionsFilters(listingId) {
  const globalFiltersStore = useGlobalFiltersStore();

  const filters = ref(globalFiltersStore.getFilters(listingId));

  watch(filters, (newValue) => {
    console.log(filters)
    globalFiltersStore.setFilters(listingId, newValue);
  }, { deep: true });

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
		const page = filters.value.currentPage ?? 1;
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
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
  };

  const handlePageSizeChange = (size) => {
    pageSize.value = size;
  };
  
  onMounted(() => {
    const filters = ref(globalFiltersStore.getFilters(listingId));
    console.log(filters.value); // Loguje wartość filtrów po zamontowaniu
  });

  return {
    dateFilter,
    categoryFilter,
    amountMinFilter,
    amountMaxFilter,
    currentPage,
    pageSize,
    totalItems,
    clearAllFilters,
    handlePageChange,
    handlePageSizeChange,
  };
}