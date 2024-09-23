<template>
	<v-card v-if="true" class="mb-4">
		<v-toolbar color="transparent">
			<v-toolbar-title>Podgląd miesięcznego budżetu</v-toolbar-title>
		</v-toolbar>
		<v-card-subtitle>
			Brak bieżącego budżetu dla obecnego miesiaca. Zaplanuj budżet
			uwzględniając w pierwszej kolejności przypisanie kategorii.
		</v-card-subtitle>
		<v-card-actions>
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
	<v-card v-if="!disabled">
		<v-toolbar color="transparent">
			<v-toolbar-title class="text-center mx-auto"
				>Podsumowanie miesiąca:
				{{ currentDate.format("MMMM YYYY") }}</v-toolbar-title
			>
		</v-toolbar>
		<v-btn
			@click="disableMonthlyBalanceChart = !disableMonthlyBalanceChart "class="ml-2 my-2" variant="flat">
			{{ disableMonthlyBalanceChart ? "Ukryj" : "Pokaż 1" }}
		</v-btn>
		<v-btn
			@click="disableMonthlyPlannedCategoriesChart = !disableMonthlyPlannedCategoriesChart"
			class="ml-2 my-2"
			variant="flat">
			{{ disableMonthlyPlannedCategoriesChart ? "Ukryj" : "Pokaż 2" }}
		</v-btn>
	</v-card>

	<MonthlyBalanceChart :date="currentDate.format()" :disable="disableMonthlyBalanceChart" />
	<MonthlyPlannedCategoriesChart :date="currentDate.format()" :disable="disableMonthlyPlannedCategoriesChart" />

</template>

<script setup>
const disabled = ref(false);
const dayjs = useDayjs();



const disableMonthlyPlannedCategoriesChart = ref(false);
const disableMonthlyBalanceChart = ref(false);



const currentDate = ref(dayjs());
</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>
