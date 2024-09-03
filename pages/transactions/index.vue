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
					{{ dayjs(value).format('DD.MM.YYYY HH:mm') }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-btn
						icon="mdi-magnify"
						title="Wybierz"
						:disabled="item.deleting"
						:to="`/budgets/planned/${item.monthId}`"
						variant="flat"
					/>
				</template>
				<template v-slot:header.action>
					<v-btn
						color="primary"
						variant="flat"
						prepend-icon="mdi-plus"
						@click="showMonthlyDialog = true"
					>
						Dodaj
					</v-btn>
				</template>
			</v-data-table>
		</v-card-text>
	</v-card>
</template>



<script setup>
const dayjs = useDayjs();
const headers = ref([
	{ title: "Data", value: "date" },
	{ title: "Opis", value: "name" },
	{ title: "Kategoria", value: "categoryId" },
	{ title: "Kwota", value: "amount" },
	{ title: "", value: "action", align: "end" },
]);


const transactions = ref([]);
const loading = ref(false);

const loadTransactions = async () => {
			loading.value = true;
			useWebApiFetch('/Transaction/GetAllTransactions'
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

onMounted(loadTransactions);
</script>