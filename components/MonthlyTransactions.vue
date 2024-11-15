<template>
<v-skeleton-loader v-if="loading" type="card" class="mt-4" />
<v-card class="mt-4" v-if="loaded">
	<v-toolbar color="transparent text-center">
			<v-toolbar-title>Zrealizowane operacje</v-toolbar-title>
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
				dateFilter || amountMinFilter || amountMaxFilter
					? 'Brak transakcji spełniających kryteria wyszukiwania.'
					: 'Brak dostępnych transakcji. Dodaj nową.'
			"
			loading-text="Wczytywanie"
		>
			<template v-slot:item.date="{ value }">
				{{ dayjs(value).format("DD.MM.YYYY") }}
			</template>
			<template v-slot:item.amount="{ value }"> {{ value }} zł </template>
			</v-data-table-server>
		</v-card-text>
</v-card>
</template>

<script setup>
const dayjs = useDayjs();
import { useTransactionsFilters } from '~/composables/transactions/useTransactionsFilters'
const loaded = ref(false);
const loading = ref(false);
const listingId = "monthlyTransactions";
const errorMsg = ref("");
const transactions = ref([]);

const headers = ref([
	{ title: "Data", value: "date", align: "start" },
	{ title: "Kategoria", value: "categoryName", align: "start" },
	{ title: "OPIS", value: "name", align: "start" },
	{ title: "Kwota", value: "amount", sortable: true, align: "end" }
]);

const {
	dateFilter,
	amountMinFilter,
	amountMaxFilter,
	currentPage,
	pageSize,
	totalItems,
	clearAllFilters,
	handlePageChange,
	handlePageSizeChange
} = useTransactionsFilters(listingId);

const props = defineProps({
	date: {
		type: Object,
		required: true,
	},
});

watch(() => props.date, () =>
{
	loaded.value = false;
	clearAllFilters();
	loadMonthlyTransactions(1, pageSize.value);
})

const resetPage = () => {
	currentPage.value = 1;
};

watch(
  [
    dateFilter,
    amountMinFilter,
    amountMaxFilter
  ],
  () => {
	if (currentPage.value !== 1) {
		resetPage();
	} else {
		loadMonthlyTransactions(currentPage.value, pageSize.value);
	}
  }
);

watch(
  [currentPage, pageSize],
  () => {
    loadMonthlyTransactions(currentPage.value, pageSize.value);
  }
);


const loadMonthlyTransactions = async (page = 1, pageSize = 10, countPages = null) => {
	loading.value = true;
	const formattedDate = dateFilter.value
		? dayjs(dateFilter.value).format("YYYY-MM-DD")
		: null;
	const year = props.date ? props.date.year() : null;
	const month = props.date ? props.date.month() + 1 : null;
	errorMsg.value = "";
	const fieldMap = {
        "AmountMin": "Od",
		"AmountMax": "Do"
    };
	const messageMap = {
        "ScalePrecisionValidator": "Przekroczono dozwolony zakres kwoty. Kwota musi zawierać się w przedziale od -999999,99 zł do 999999,99 zł."
    };
	return useWebApiFetch("/Report/GetTransactions", {
		query: {
			page,
			pageSize,
			year: year,
			month: month,
			date: formattedDate,
			amountMin: amountMinFilter.value,
			amountMax: amountMaxFilter.value,
			countPages
		},
		onResponseError: ({ response }) => {
						let message = getErrorMessage(response, messageMap, fieldMap);
						globalMessageStore.showErrorMessage(message);
					},
	})
		.then(({ data, error }) => {
			if (data.value) {
				transactions.value = data.value.transactions;
				if (data.value.totalCount !== null) {
				totalItems.value = data.value.totalCount;
				}
				loaded.value = true;
			} else if (error.value) {
				transactions.value = [];
				loaded.value = false;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onMounted(async () => {
	await loadMonthlyTransactions(currentPage.value, pageSize.value);
});

</script>