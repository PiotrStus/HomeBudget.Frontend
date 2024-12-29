<template>
	<v-skeleton-loader v-if="loading" type="card" class="mt-4" />
	<v-card v-if="dataLoaded" class="card"> 
		<v-card-title class="text-center mt-2">
			Ostatnie operacje
		</v-card-title>
		<v-card-text >
			<div v-if="!recentTransactions.length" class="text-center">
			Brak dostępnych transakcji. Dodaj nową. 
			</div>
			<v-list class="transactions">			
				<v-list-item class="mt-2" 
							variant="elevated" 
							:title="transaction.name"
							v-for="transaction in recentTransactions" 
							:key="transaction.id"
							style="min-height: 80px;"
							> 
					<template v-slot:prepend>
						<v-icon>mdi-receipt-text-outline</v-icon>
					</template>
					<template v-slot:append>
						{{ transaction.amount }} zł
					</template>
				</v-list-item>
				<v-list-item class="d-flex justify-center align-center">
					<v-btn
						color="primary"
						variant="outlined"
						class="mt-4 mx-auto"
						to="/transactions"
					>
						Zobacz wszystkie
					</v-btn>
				</v-list-item>
			</v-list>
		</v-card-text>
	</v-card>
</template>


<script setup>
const props = defineProps({
	date: {
		type: Object,
		required: true,
	},
});

const loading = ref(true);
const dataLoaded = ref(false);
const recentTransactions = ref([]);


const checkBudgetExists = (date, count) => {
	loading.value = true;
	useWebApiFetch("/HomePage/GetRecentTransactions", {
		query: { date, count },
	})
		.then(({ data, error }) => {
			if (data.value) {
				if (data.value.transactions?.length > 0) {
					dataLoaded.value = true;
				recentTransactions.value = data.value.transactions;
				}
			}
			else if (error.value) {
				dataLoaded.value = false;
				recentTransactions.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onMounted(() => checkBudgetExists(props.date.format(), 10));
</script>

<style scoped>
.transactions {
    height: 45vh;
	overflow-y: scroll;
	margin-top: 10px;
}

.card {
	height: 55vh;
	margin-top: 16px;
}
</style>