<template>
	<v-card class="mb-4">
		<v-card-title class="text-center mx-auto">
			Podsumowanie miesiąca
		</v-card-title>
		<v-card-text >
			<v-select
				:items="monthItems"
				item-title="title" 
				item-value="month"
				label="Wybierz budżet"
				v-model="selectedMonthId"
				hide-details="auto"
				variant="outlined"
			/>
		</v-card-text>
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<MonthlyBalanceChart :date="currentDate" /> 
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<MonthlyPlannedCategoriesChart :date="currentDate" /> 
	</v-card>
</template>

<script setup>
import MonthsEnum from "~/utils/months";
const dayjs = useDayjs();
const yearBudgetsStore = useYearBudgetsStore();
const selectedMonthId = ref(null);



const monthItems = computed(() => {
	if (yearBudgetsStore.loaded) {
		console.log(yearBudgetsStore.yearBudgets);
		return yearBudgetsStore.yearBudgets.flatMap(budget =>
			budget.monthlyBudgets.map(month => ({
				title: `${getMonthName(month.month)} ${budget.year}`,
				id: month.id,
				year: budget.year,
				month: getMonthId(month.month)
			}))
		);
	}
	return [];
 });

 watch(selectedMonthId, () => {
	const selectedMonth = monthItems.value.find(month => {
		return month.month === selectedMonthId.value;
	});
	if (selectedMonthId)
 	{
		currentDate.value = dayjs().year(selectedMonth.year).month(selectedMonth.month).date(3);
	}
});

const getMonthName = (monthValue) => {
    const month = MonthsEnum.find(m => m.value === monthValue);
    return month ? month.name : monthValue;
};

const getMonthId = (monthValue) => {
    const month = MonthsEnum.find(m => m.value === monthValue);
    return month ? month.dayjsId: null;
};

const disabled = computed(() => selectedMonthId.value === null);

const currentDate = ref(dayjs());

onMounted(() => {
	currentDate.value = currentDate.value.set('year', 2025).set('month', 0);
})

</script>