export function useTransactionsFilters(listingId) {
	const globalFiltersStore = useGlobalFiltersStore();
	const dateFilter = ref(globalFiltersStore.getFilters(listingId).dateFilter);
	const categoryFilter = ref(globalFiltersStore.getFilters(listingId).categoryFilter);
	const amountMinFilter = ref(globalFiltersStore.getFilters(listingId).amountMinFilter);
	const amountMaxFilter = ref(globalFiltersStore.getFilters(listingId).amountMaxFilter);
	const currentPage = ref(globalFiltersStore.getFilters(listingId).currentPage ?? 1);
	const pageSize = ref(globalFiltersStore.getFilters(listingId).pageSize ?? 10);
	const totalItems = ref(globalFiltersStore.getFilters(listingId).totalItems ?? 0);

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

	return {
		dateFilter,
		categoryFilter,
		amountMinFilter,
		amountMaxFilter,
		currentPage,
		pageSize,
		totalItems,
		updateTransactionsFilters,
	  };	  
}