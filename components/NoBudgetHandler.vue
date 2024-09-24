<template>
	<v-skeleton-loader v-if="loading" type="card" elevation="24" />
	<v-card v-if="budgetNotExist"class="mb-4">
		<v-card-subtitle class="text-center">
			Brak bieżącego budżetu dla obecnego miesiąca. Zaplanuj budżet
			uwzględniając w pierwszej kolejności przypisanie kategorii.
		</v-card-subtitle>
		<v-card-actions class="justify-center">
			<v-btn
				class="ml-2 my-2"
				:to="`/budgets`"
				variant="flat"
				color="primary"
				prepend-icon="mdi-plus"
			>
				Utwórz nowy
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script setup>
const props = defineProps({
	date: {
		type: Object,
		required: true,
	},
});

const loading = ref(false);
const budgetNotExist = ref(false);

const checkBudgetExists = (date) => {
	loading.value = true;
	useWebApiFetch("/HomePage/CheckBudgetExists", {
		query: { date },
	})
		.then(({ data, error }) => {
			if (data.value) {
				budgetNotExist.value = data.value.budgetExist === false;
			} else if (error.value) {
				budgetNotExist.value = true;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onMounted(() => checkBudgetExists(props.date.format()));
</script>
