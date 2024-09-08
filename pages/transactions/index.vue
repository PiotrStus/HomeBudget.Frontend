<template>
	<v-card>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne operacje</v-toolbar-title>
		</v-toolbar>

		<v-card-text>
			<v-data-table
				:loading="loading"
				:items="filteredTransactions"
				:headers="headers"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
				<template v-slot:header.categoryId="{ value }">
					<v-btn variant="flat" style="padding: 0; margin: 0">
						Kategoria
						<v-icon icon="mdi-filter-outline" />
						<v-menu
							v-model="categoryMenu"
							activator="parent"
							location="bottom end"
							transition="fab-transition"
							:close-on-content-click="false"
						>
							<v-list>
								<v-list-item class="d-flex align-center">
									<v-autocomplete
										label="Szukaj"
										:items="uniqueCategories"
										item-title="categoryId"
										v-model="categoryFilter"
										class="mt-4"
										variant="outlined"
										:style="{ minWidth: '200px' }"
										:clearable="true"
										@click:clear="() => clearFilter('categoryFilter')"
									/>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-btn>
				</template>

				<template v-slot:header.amount="{ value }">
					<div>
						<v-btn variant="flat" style="padding: 0; margin: 0">
							Kwota
							<v-icon icon="mdi-filter-outline" />
							<v-menu
								v-model="amountMenu"
								activator="parent"
								location="bottom end"
								transition="fab-transition"
								:close-on-content-click="false"
							>
								<v-list>
									<v-list-item class="d-flex align-center">
										<div class="d-block align-center w-100">
											<v-number-input
												class="mt-4"
												v-model="amountMinFilter"
												variant="outlined"
												controlVariant="default"
												label="Od"
												:style="{ minWidth: '200px' }"
												:clearable="true"
												@click:clear="() => clearFilter('amountMinFilter')"
											/>
											<v-number-input
												v-model="amountMaxFilter"
												variant="outlined"
												controlVariant="default"
												label="Do"
												:style="{ minWidth: '200px' }"
												:clearable="true"
												@click:clear="() => clearFilter('amountMaxFilter')"
											/>
										</div>
									</v-list-item>
								</v-list>
							</v-menu>
						</v-btn>
					</div>
				</template>

				<template v-slot:header.date="{ value }">
					<div>
						<v-btn variant="flat" style="padding: 0; margin: 0">
							Data
							<v-icon icon="mdi-filter-outline" />
							<v-menu
								v-model="dateMenu"
								activator="parent"
								location="bottom end"
								transition="fab-transition"
								:close-on-content-click="false"
							>
								<v-list>
									<v-list-item class="d-flex align-center">
										<TextFieldDatePicker
											textFieldClass="mt-4"
											v-model="dateFilter"
											variant="outlined"
											label="Data operacji"
											:textFieldStyle="{ minWidth: '300px' }"
										/>
									</v-list-item>
								</v-list>
							</v-menu>
						</v-btn>
					</div>
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
			</v-data-table>
		</v-card-text>
		<ConfirmDialog ref="confirmDialog" />
		<AddTransactionDialog
			v-model:show="showDialog"
			@transactionAdded="updateTransactions"
			:categories="categoriesStore.categories"
		/>
	</v-card>
</template>

<script setup>
import { VNumberInput } from "vuetify/labs/VNumberInput";
const dateMenu = ref(false);
const amountMenu = ref(false);
const categoryMenu = ref(false);
const showDialog = ref(false);
// const dateFilter = ref(null);
// const categoryFilter = ref(null);
// const amountMinFilter = ref(null);
// const amountMaxFilter = ref(null);

const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();
const globalFiltersStore = useGlobalFiltersStore();
const listingId = "transactions";

const dateFilter = ref(
	globalFiltersStore.getFilters(listingId).dateFilter 
);
const categoryFilter = ref(
	globalFiltersStore.getFilters(listingId).categoryFilter
);
const amountMinFilter = ref(
	globalFiltersStore.getFilters(listingId).amountMinFilter
);
const amountMaxFilter = ref(
	globalFiltersStore.getFilters(listingId).amountMaxFilter
);

watch([dateFilter, categoryFilter, amountMinFilter, amountMaxFilter], () => {
	globalFiltersStore.setFilters(listingId, {
		dateFilter: dateFilter.value,
		categoryFilter: categoryFilter.value,
		amountMinFilter: amountMinFilter.value,
		amountMaxFilter: amountMaxFilter.value,
	});
});

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


const loadTransactions = async () => {
	loading.value = true;
	return useWebApiFetch("/Transaction/GetAllTransactions")
		.then(({ data, error }) => {
			if (data.value) {
				transactions.value = data.value.transactions;
			} else if (error.value) {
				transactions.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};


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
							updateTransactions();
						}
					})
					.finally(() => {
						item.deleting = false;
					});
			}
		});
};

const updateTransactions = () => {
	loadTransactions();
};

const filteredTransactions = computed(() => {
	if (
		!dateFilter.value &&
		!categoryFilter.value &&
		!amountMinFilter.value &&
		!amountMaxFilter.value
	)
		return transactions.value;

	const formattedCurrentDate = dayjs(dateFilter.value).format("DD.MM.YYYY");

	return transactions.value.filter((transaction) => {
		const formattedTransactionDate = dayjs(transaction.date).format(
			"DD.MM.YYYY"
		);

		const map = categoryMap.value;
		const matchesCategoryFilter =
			!categoryFilter.value ||
			map[transaction.categoryId] === categoryFilter.value;

		const matchesDateFilter =
			!dateFilter.value || formattedTransactionDate === formattedCurrentDate;

		const matchesAmountFilter =
			(!amountMinFilter.value && !amountMaxFilter.value) ||
			(amountMinFilter.value &&
				!amountMaxFilter.value &&
				transaction.amount >= amountMinFilter.value) ||
			(!amountMinFilter.value &&
				amountMaxFilter.value &&
				transaction.amount <= amountMaxFilter.value) ||
			(amountMinFilter.value &&
				amountMaxFilter.value &&
				transaction.amount >= amountMinFilter.value &&
				transaction.amount <= amountMaxFilter.value);

		return matchesDateFilter && matchesCategoryFilter && matchesAmountFilter;
	});
});

const uniqueCategories = computed(() => {
	if (!transactions.value.length) return [];

	const categories = transactions.value.map((transaction) => {
		const map = categoryMap.value;
		const categoryName = map[transaction.categoryId];
		return categoryName;
	});
	const uniqueCategories = [...new Set(categories)];
	return uniqueCategories;
});

const categoryMap = ref({});

const loadCategories = async () => {
	await categoriesStore.loadCategories();
	categoryMap.value = categoriesStore.categories.reduce((map, category) => {
		map[category.id] = category.name;
		return map;
	}, {});
};

function clearFilter(refName) {
	if (refName === "categoryFilter") {
		categoryFilter.value = null;
	} else if (refName === "amountMinFilter") {
		amountMinFilter.value = null;
	} else if (refName === "amountMaxFilter") {
		amountMaxFilter.value = null;
	}
}

const handleClearAllFilters = () => {
	dateFilter.value = null;
	categoryFilter.value = null;
	amountMinFilter.value = null;
	amountMaxFilter.value = null;
	globalFiltersStore.setFilters(listingId, {});
};

const loadFilters = () =>
{
	const savedFilters = globalFiltersStore.getFilters(listingId);
	console.log(savedFilters);
	dateFilter.value = savedFilters.dateFilter;
	categoryFilter.value = savedFilters.categoryFilter;
	amountMinFilter.value = savedFilters.amountMinFilter;
	amountMaxFilter.value = savedFilters.amountMaxFilter;
};

onMounted(async () => {
	await loadCategories();
	await loadTransactions();
	loadFilters();
});

</script>