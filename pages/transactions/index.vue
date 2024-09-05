<template>
	<v-card>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne operacje</v-toolbar-title>
		</v-toolbar>
		
		<v-card-text>
		<v-data-table
				:loading="loading"
				:items="transactions"
				:headers="headers"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
				<template v-slot:item.date="{ value }">
					{{ dayjs(value).format('DD.MM.YYYY') }}
				</template>
				<template v-slot:item.amount="{ value }">
					{{ value }} zł
				</template>
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
									variant="flat"
									:loading="item.deleting"
									@click="deleteTransaction(item)"
									title="Usuń"
								>
									<template v-slot:prepend>
										<v-icon icon="mdi-delete" />
									</template>
								</v-list-item>
								<v-list-item
									variant="flat"
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
const showDialog = ref(false);
const dayjs = useDayjs();
const categoriesStore = useCategoriesStore();
const headers = ref([
	{ title: "Data", value: "date" },
	{ title: "Opis", value: "name" },
	{ title: "Kategoria", value: "categoryId" },
	{ title: "Kwota", value: "amount" },
	{ title: "", value: "action", align: "end" },
]);


const transactions = ref([]);
const loading = ref(false);
const confirmDialog = ref(null);
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();

const loadTransactions = async () => {
			loading.value = true;
			return useWebApiFetch('/Transaction/GetAllTransactions'
            )				
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
			})
		}

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

const categoryMap = ref({});
const loadCategories = async () => {
    await categoriesStore.loadCategories();
    categoryMap.value = categoriesStore.categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
    }, {});
};
onMounted(async () => {
	await loadCategories();
	await loadTransactions();
	});
	
</script>