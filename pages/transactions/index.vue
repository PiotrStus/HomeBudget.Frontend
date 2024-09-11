<template>
	<v-card>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne operacje</v-toolbar-title>
		</v-toolbar>

		<v-card-text>
			<v-data-table-server
				:loading="loading"
				:items="transactions"
				:headers="headers"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				@update:page="handlePageChange"
				@update:itemsPerPage="handlePageSizeChange"
				:page="currentPage"
				:itemsPerPage="pageSize"
				:items-length="totalItems"
				page-text="{0}-{1} z {2}"
				:no-data-text="
					dateFilter || amountMinFilter || amountMaxFilter || categoryFilter
						? 'Brak transakcji spełniających kryteria wyszukiwania.'
						: 'Brak dostępnych transakcji. Dodaj nową.'
				"
				loading-text="Wczytywanie"
			>
				<template v-slot:header.categoryId>
					<CategoryFilter
						v-model:categoryFilter="categoryFilter"
						:categories="categoriesStore.categories"
					/>
				</template>

				<template v-slot:header.amount>
					<AmountFilter
						v-model:amountMinFilter="amountMinFilter"
						v-model:amountMaxFilter="amountMaxFilter"
					/>
				</template>

				<template v-slot:header.date>
					<DateFilter v-model:dateFilter="dateFilter" />
				</template>

				<template v-slot:item.date="{ value }">
					{{ dayjs(value).format("DD.MM.YYYY") }}
				</template>
				<template v-slot:item.amount="{ value }"> {{ value }} zł </template>
				<template v-slot:item.categoryId="{ value }">
					{{ categoryMap[value] ?? value }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-btn icon title="Więcej" variant="flat">
						<v-icon icon="mdi-dots-vertical" />
						<v-menu
							activator="parent"
							location="bottom end"
							transition="fab-transition"
						>
							<v-list rounded="lg">
								<v-list-item
									:loading="item.deleting"
									@click="deleteTransaction(item)"
									title="Usuń"
								>
									<template v-slot:prepend>
										<v-icon icon="mdi-delete" />
									</template>
								</v-list-item>
								<v-list-item
									:disabled="item.deleting"
									:to="`/transactions/${item.id}`"
									title="Edytuj"
								>
									<template v-slot:prepend>
										<v-icon icon="mdi-pencil" />
									</template>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-btn>
				</template>
				<template v-slot:header.action>
					<v-btn
						icon="mdi-filter-off-outline"
						title="Usuń filtry"
						variant="flat"
						@click="handleClearAllFilters"
						class="mr-2"
					/>
					<v-btn
						color="primary"
						variant="flat"
						prepend-icon="mdi-plus"
						@click="showDialog = true"
					>
						Dodaj
					</v-btn>
				</template>
			</v-data-table-server>
		</v-card-text>
		<ConfirmDialog ref="confirmDialog" />
		<AddTransactionDialog
			v-model:show="showDialog"
			@transactionAdded="updateTransactionsFilters"
			:categories="categoriesStore.categories"
		/>
	</v-card>
</template>

<script setup>
const globalFiltersStore = useGlobalFiltersStore();
const showDialog = ref(false);

const handlePageChange = (page) => {
	currentPage.value = page;
};

const handlePageSizeChange = (size) => {
	pageSize.value = size;
};

const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();

const listingId = "transactions";

const {
  dateFilter,
  categoryFilter,
  amountMinFilter,
  amountMaxFilter,
  currentPage,
  pageSize,
  totalItems,
  updateTransactionsFilters,
} = useTransactionsFilters(listingId);

const headers = ref([
	{ title: "Data", value: "date", align: "start" },
	{ title: "Kategoria", value: "categoryId", align: "start" },
	{ title: "OPIS", value: "name", align: "start" },
	{ title: "Kwota", value: "amount", sortable: true, align: "start" },
	{ title: "", value: "action", align: "end" },
]);

const transactions = ref([]);
const loading = ref(false);
const confirmDialog = ref(null);
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();

const loadTransactions = async (page = 1, pageSize = 10) => {
	loading.value = true;
	const formattedDate = dateFilter.value
		? dayjs(dateFilter.value).format("YYYY-MM-DD")
		: null;
	return useWebApiFetch("/Transaction/GetTransactions", {
		query: {
			page,
			pageSize,
			date: formattedDate,
			amountMin: amountMinFilter.value,
			amountMax: amountMaxFilter.value,
			categoryId: categoryFilter.value,
		},
	})
		.then(({ data, error }) => {
			if (data.value) {
				transactions.value = data.value.transactions;
				totalItems.value = data.value.totalCount;
			} else if (error.value) {
				transactions.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

watch(
	[
		dateFilter,
		amountMinFilter,
		amountMaxFilter,
		categoryFilter,
		currentPage,
		pageSize,
	],
	() => {
		updateTransactionsFilters();
		loadTransactions(currentPage.value, pageSize.value);
	}
);

const deleteTransaction = (item) => {
	confirmDialog.value
		.show({
			title: "Potwierdź usunięcie",
			text: "Czy na pewno chcesz usunać daną transakcję?",
			confirmBtnText: "Usuń",
			confirmBtnColor: "error",
		})
		.then((confirm) => {
			if (confirm) {
				item.deleting = true;
				useWebApiFetch("/Transaction/DeleteTransaction", {
					method: "POST",
					body: { id: item.id },
					watch: false,
					onResponseError: ({ response }) => {
						let message = getErrorMessage(response, {});
						globalMessageStore.showErrorMessage(message);
					},
				})
					.then((response) => {
						if (response.data.value) {
							globalMessageStore.showSuccessMessage(
								"Budżet miesięczny został usunięty"
							);
							updateTransactionsFilters();
							loadTransactions(currentPage.value, pageSize.value);
						}
					})
					.finally(() => {
						item.deleting = false;
					});
			}
		});
};


const categoryMap = ref({});

const loadCategories = async () => {
	await categoriesStore.loadCategories();
	categoryMap.value = categoriesStore.categories.reduce((map, category) => {
		map[category.id] = category.name;
		return map;
	}, {});
};

const handleClearAllFilters = () => {
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

onMounted(async () => {
	await loadCategories();
	await loadTransactions(currentPage.value, pageSize.value);
	loadFilters();
});
</script>