<template>
	<v-card>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne operacje</v-toolbar-title>
		</v-toolbar>

		<v-card-text>
			<div class="d-flex align-center justify-space-between ">
				<div>
				<v-text-field
					label="Szukaj"
					:items="filteredTransactions"
					item-title="name"
					v-model="mainFilter"
					variant="outlined"
					rounded
					:style="{ minWidth: '200px' }"
				/>
			</div>
			<div>
				<v-btn
					icon="mdi-filter-remove-outline"
					title="Usuń filtry"
					variant="flat"
					class="d-flex justify-center align-center"
					@click="handleClearFilters"
				/>
			</div>
			</div>
			<v-data-table
				:loading="loading"
				:items="filteredTransactions"
				:headers="headers"
				:search="mainFilter"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
				<template v-slot:header.name="{ value }">
					<v-btn variant="flat">
						Opis
						<v-icon icon="mdi-filter-outline" />
						<v-menu
							v-model="nameMenu"
							activator="parent"
							location="bottom end"
							transition="fab-transition"
							:close-on-content-click="false"
						>
							<v-list>
								<v-list-item class="d-flex align-center">
									<div class="d-flex align-center w-100">
										<v-autocomplete
											label="Szukaj"
											:items="uniqueNames"
											item-title="name"
											v-model="nameFilter"
											class="mt-4"
											variant="outlined"
											:style="{ minWidth: '200px' }"
										/>
										<v-btn
											icon="mdi-magnify"
											@click="nameMenu = false"
											variant="flat"
											class="ml-2"
										/>
									</div>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-btn>
				</template>

				<template v-slot:header.date="{ value }">
					<v-btn variant="flat">
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
									<div class="d-flex align-center w-100">
										<v-autocomplete
											label="Szukaj"
											:items="uniqueDates"
											item-title="name"
											v-model="dateFilter"
											class="mt-4"
											variant="outlined"
											:style="{ minWidth: '200px' }"
										/>
										<v-btn
											icon="mdi-magnify"
											@click="dateMenu = false"
											variant="flat"
											class="ml-2"
										/>
									</div>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-btn>
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
const nameMenu = ref(false);
const dateMenu = ref(false);
const showDialog = ref(false);
const mainFilter = ref("");
const nameFilter = ref("");
const dateFilter = ref("");
const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();
const headers = ref([
	{ title: "Data", value: "date", sortable: true },
	{ title: "Opis", value: "name", sortable: true },
	{ title: "Kategoria", value: "categoryId", sortable: true },
	{ title: "Kwota", value: "amount", sortable: true },
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
				console.log(transactions.value);
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
	if (!nameFilter.value && !dateFilter.value) return transactions.value;

	return transactions.value.filter((transaction) => {
		const formattedTransactionDate = dayjs(transaction.date).format(
			"DD.MM.YYYY"
		);

		const matchesNameFilter =
			!nameFilter.value || transaction.name === nameFilter.value;
		const matchesDateFilter =
			!dateFilter.value || formattedTransactionDate === dateFilter.value;

		return matchesNameFilter && matchesDateFilter;
	});
});

const uniqueNames = computed(() => {
	if (!transactions.value.length) return [];
	const names = transactions.value.map((transaction) => transaction.name);
	const uniqueNames = [...new Set(names)];
	return uniqueNames;
});

const uniqueDates = computed(() => {
	if (!transactions.value.length) return [];
	const dates = transactions.value.map((transaction) =>
		dayjs(transaction.date).format("DD.MM.YYYY")
	);
	const uniqueDates = [...new Set(dates)];
	return uniqueDates;
});

const categoryMap = ref({});

const loadCategories = async () => {
	await categoriesStore.loadCategories();
	categoryMap.value = categoriesStore.categories.reduce((map, category) => {
		map[category.id] = category.name;
		return map;
	}, {});
};

const handleClearFilters = () => {
	mainFilter.value = "";
	nameFilter.value = "";
	dateFilter.value = "";
};

onMounted(async () => {
	await loadCategories();
	await loadTransactions();
});
</script>
