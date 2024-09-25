<template>
	<v-card class="mb-4">
		<v-card-title class="text-center mx-auto">
			Podsumowanie miesiąca
		</v-card-title>
		<v-card-subtitle class="text-center mx-auto mb-2">
			{{ currentDate.format("MMMM YYYY") }}
		</v-card-subtitle>
	</v-card>
	<NoBudgetHandler :date="currentDate" />
	<MonthlyBalanceChart :date="currentDate" />
	<div>
		<v-row >
			<v-col cols="12" md="8">
				<MonthlyPlannedCategoriesChart :date="currentDate" />
			</v-col>
			<v-col cols="12" md="4" class="pl-sm-0 pl-md-2 pl-lg-1">
				<RecentTransactions :date="currentDate" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup>
const dayjs = useDayjs();
const currentDate = ref(dayjs());
</script>