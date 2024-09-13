export function useTransactionsFilters(listingId) {
	const globalFiltersStore = useGlobalFiltersStore();
	const filtersFromStore = globalFiltersStore.getFilters(listingId);
	const dateFilter = ref(filtersFromStore.dateFilter || null);
	const categoryFilter = ref(filtersFromStore.categoryFilter || null);
	const amountMinFilter = ref(filtersFromStore.amountMinFilter || null);
	const amountMaxFilter = ref(filtersFromStore.amountMaxFilter || null);
	const currentPage = ref(filtersFromStore.currentPage ?? 1);
	const pageSize = ref(filtersFromStore.pageSize ?? 10);
	const totalItems = ref(filtersFromStore.totalItems ?? 0);

	const updateTransactionsFilters = () => {
		globalFiltersStore.setFilters(listingId, {
		  dateFilter: dateFilter.value,
		  categoryFilter: categoryFilter.value,
		  amountMinFilter: amountMinFilter.value,
		  amountMaxFilter: amountMaxFilter.value,
		  currentPage: currentPage.value,
		  pageSize: pageSize.value,
		  totalItems: totalItems.value,
		});
	};

	const clearAllFilters = () => {
		dateFilter.value = null;
		categoryFilter.value = null;
		amountMinFilter.value = null;
		amountMaxFilter.value = null;
		currentPage.value = 1;
		updateTransactionsFilters();
	  };

	const loadFilters = () => {
		const savedFilters = globalFiltersStore.getFilters(listingId);
		console.log(savedFilters);
		dateFilter.value = savedFilters.dateFilter;
		categoryFilter.value = savedFilters.categoryFilter;
		amountMinFilter.value = savedFilters.amountMinFilter;
		amountMaxFilter.value = savedFilters.amountMaxFilter;
		currentPage.value = savedFilters.currentPage ?? currentPage.value;
		pageSize.value = savedFilters.pageSize ?? pageSize.value;
	};  

	const handlePageChange = (page) => {
		currentPage.value = page;
	  };
	
	  const handlePageSizeChange = (size) => {
		pageSize.value = size;
	  };


	watch([dateFilter, categoryFilter, amountMinFilter, amountMaxFilter, currentPage, pageSize], updateTransactionsFilters);

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
		loadFilters,
		handlePageChange,
		handlePageSizeChange
	  };	  
}