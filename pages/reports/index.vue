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
	<MonthlyBalanceChart :date="currentDate" v-if="!disabled"/> 
	<MonthlyPlannedCategoriesChart :date="currentDate" v-if="!disabled"/> 
	<MonthlyTransactions :date="currentDate" v-if="!disabled"/> 
</template>

<script setup>
import MonthsEnum from "~/utils/months";
const dayjs = useDayjs();
const yearBudgetsStore = useYearBudgetsStore();
const selectedMonthId = ref(null);

const monthItems = computed(() => {
	if (yearBudgetsStore.loaded) {
		return yearBudgetsStore.yearBudgets.flatMap(budget =>
			budget.monthlyBudgets.map(month => ({
				title: `${getMonthName(month.month)} ${budget.year}`,
				id: month.id,
				year: budget.year,
				month: getMonthId(month.month)
			}))
		).sort((a, b) => {
			if (a.year !== b.year) {
				return b.year - a.year;
			}
			return b.month - a.month;
		});
	}
	return [];
 });

const selectedMonth = ref(null);

watch(selectedMonthId, () => {
	selectedMonth.value = monthItems.value.find(month => {
		return month.month === selectedMonthId.value;
	});
	if (selectedMonthId)
 	{
		currentDate.value = dayjs().year(selectedMonth.value.year).month(selectedMonth.value.month).date(3);
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