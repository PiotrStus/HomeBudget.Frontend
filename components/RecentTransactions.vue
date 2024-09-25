<template>
	<v-skeleton-loader v-if="loading" type="card" class="mt-4" />
	<v-card v-if="dataLoaded" class="card"> 
		<v-card-title class="text-center mt-2">
			Historia operacji
		</v-card-title>
		<v-card-text >
			<v-list class="transactions">
				<v-list-item v-for="transaction in recentTransactions" :key="transaction.id">
					<v-card>
						<v-card-text>
							<v-list-item-title>{{ transaction.name }}</v-list-item-title>
							<v-list-item-subtitle>{{ transaction.amount }} zł</v-list-item-subtitle>
						</v-card-text>
					</v-card>
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
				recentTransactions.value = data.value.transactions;
				dataLoaded.value = true;
				console.log(data.value);
				console.log(recentTransactions.value);
			} else if (error.value) {
				console.log(error.value);
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