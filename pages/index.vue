<template>
	<v-card class="mb-4">
			<v-card-title class="text-center mx-auto">
				Podsumowanie miesiąca
			</v-card-title>
			<v-card-subtitle class="text-center mx-auto mb-2">
				{{ currentDate.format("MMMM YYYY") }}
			</v-card-subtitle>
	</v-card>
	<NoBudgetsHandler :date="currentDate" />
	<MonthlyBalanceChart :date="currentDate" />
	<MonthlyPlannedCategoriesChart :date="currentDate" />
</template>

<script setup>

const dayjs = useDayjs();
const currentDate = ref(dayjs());

</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>