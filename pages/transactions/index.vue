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
				:search="mainFilter"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
			<template v-slot:header.categoryId="{ value }">
					<v-btn variant="flat" style="padding: 0; margin: 0;">
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
									<div class="d-flex align-center w-100">
										<v-autocomplete
											label="Szukaj"
											:items="uniqueCategories"
											item-title="categoryId"
											v-model="categoryFilter"
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
					<div>
					<v-btn variant="flat" style="padding: 0; margin: 0;">
						
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
										<!-- <v-autocomplete
											label="Szukaj"
											:items="uniqueDates"
											item-title="name"
											v-model="dateFilter"
											class="mt-4"
											variant="outlined"
											:style="{ minWidth: '200px' }"
										/> -->
										<TextFieldDatePicker 
											textFieldClass="mt-4"
											v-model="dateFilter"
											variant="outlined"
											label="Data operacji"
											:textFieldStyle="{ minWidth: '300px' }"
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
					icon="mdi-filter-remove-outline"
					title="Usuń filtry"
					variant="flat"
					@click="handleClearFilters"
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
const nameMenu = ref(false);
const dateMenu = ref(false);
const categoryMenu = ref(false);
const showDialog = ref(false);
const mainFilter = ref("");
const dateFilter = ref(null);

watch(dateFilter, (newValue) =>
	console.log(newValue)
	);



const categoryFilter = ref("");
const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();
const headers = ref([
	{ title: "Data", value: "date", sortable: true, align: "start" },
	{ title: "Kategoria", value: "categoryId", sortable: true, align: "start"  },
	{ title: "OPIS", value: "name", align: "start"},
	{ title: "KWOTA", value: "amount", sortable: true, align: "start" },
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
	if (!dateFilter.value && !categoryFilter) return transactions.value;
	const formattedCurrentDate = dayjs(dateFilter.value).format(
			"DD.MM.YYYY"
		);
	return transactions.value.filter((transaction) => {
		const formattedTransactionDate = dayjs(transaction.date).format(
			"DD.MM.YYYY"
		);

		console.log(formattedTransactionDate);
		const map = categoryMap.value;

		console.log(categoryFilter.value)
		const matchesCategoryFilter =
			!categoryFilter.value || map[transaction.categoryId] === categoryFilter.value;
		
		console.log(formattedTransactionDate);
		console.log(formattedCurrentDate);
		
		const matchesDateFilter =
			!dateFilter.value || formattedTransactionDate === formattedCurrentDate;

		return  matchesDateFilter && matchesCategoryFilter;
	});
});

const uniqueDates = computed(() => {
	if (!transactions.value.length) return [];
	const dates = transactions.value.map((transaction) =>
		dayjs(transaction.date).format("DD.MM.YYYY")
	);
	const uniqueDates = [...new Set(dates)];
	return uniqueDates;
});

const uniqueCategories = computed(() => {
	if (!transactions.value.length) return [];
	console.log(transactions)
	console.log(categoryMap.value)
	
	const categories = transactions.value.map((transaction) => 
	{
		console.log(categoryMap["Transport"])
		const map = categoryMap.value;
		const categoryName = map[transaction.categoryId];
		console.log(`Transaction ID: ${transaction.categoryId}, Category Name: ${categoryName}`);
		return categoryName
	})

	console.log(categories)
	const uniqueCategories = [...new Set(categories)];
	console.log(uniqueCategories)
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

const handleClearFilters = () => {
	mainFilter.value = "";
	dateFilter.value = "";
	categoryFilter.value = "";
};

onMounted(async () => {
	await loadCategories();
	await loadTransactions();
});
</script>
