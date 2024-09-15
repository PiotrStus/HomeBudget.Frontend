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
				<template v-slot:header.categoryName>
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
				<template v-slot:item.action="{ item }">
					<Actions
						:item="item"
						path="transactions"
						@itemDeleted="deleteTransaction(item)"
					/>
				</template>
				<template v-slot:header.action>
					<v-btn
						icon="mdi-filter-off-outline"
						title="Usuń filtry"
						variant="flat"
						@click="clearAllFilters"
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
			@transactionAdded="loadTransactions(currentPage, pageSize, true)"
			:categories="categoriesStore.categories"
		/>
	</v-card>
</template>

<script setup>
const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();
const showDialog = ref(false);
const listingId = "transactions";
import { useTransactionsFilters } from '~/composables/transactions/useTransactionsFilters'




const {
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
} = useTransactionsFilters(listingId);


const headers = ref([
	{ title: "Data", value: "date", align: "start" },
	{ title: "Kategoria", value: "categoryName", align: "start" },
	{ title: "OPIS", value: "name", align: "start" },
	{ title: "Kwota", value: "amount", sortable: true, align: "start" },
	{ title: "", value: "action", align: "end" },
]);

const transactions = ref([]);
const loading = ref(false);
const confirmDialog = ref(null);
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();

const loadTransactions = async (page = 1, pageSize = 10, countPages = null) => {
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
			countPages
		},
	})
		.then(({ data, error }) => {
			if (data.value) {
				transactions.value = data.value.transactions;
				if (data.value.totalCount !== null) {
				totalItems.value = data.value.totalCount;
				}
			} else if (error.value) {
				transactions.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

// const handleTransactionAdded = () => {
// 	loadTransactions(currentPage.value, pageSize.value, true);
// 	// totalItems.value = totalItems.value + 1;
// }

const resetPage = () => {
  currentPage.value = 1;
};

watch(
  [
    dateFilter,
    amountMinFilter,
    amountMaxFilter,
    categoryFilter,
  ],
  () => {
	if (currentPage.value !== 1) {
		resetPage();
	} else {
		loadTransactions(currentPage.value, pageSize.value);
	}
  }
);

watch(
  [currentPage, pageSize],
  () => {
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
							loadTransactions(currentPage.value, pageSize.value, true);
							// totalItems.value = totalItems.value - 1;
						}
					})
					.finally(() => {
						item.deleting = false;
					});
			}
		});
};

onMounted(async () => {
	await categoriesStore.loadCategories();
	await loadTransactions(currentPage.value, pageSize.value);
});
</script>