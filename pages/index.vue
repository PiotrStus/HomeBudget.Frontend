<template>
	<v-card v-if="disabled">
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
			<v-toolbar-title class="text-center mx-auto">Podsumowanie miesiąca: {{ currentDate.format("MMMM YYYY") }}</v-toolbar-title>
		</v-toolbar>
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<MonthlyBalanceChart :date="currentDate.format()" />
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<v-card-text>
			<VChart class="chart" :option="option1" autoresize />
		</v-card-text>
	</v-card>
</template>

<script setup>
////////////////////////////////////////////////////////////////////////////
// 1st chart
////////////////////////////////////////////////////////////////////////////

import MonthsEnum from "~/utils/months";
import VChart, { THEME_KEY } from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, BarChart } from "echarts/charts";
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
} from "echarts/components";

provide(THEME_KEY, "light");

use([
	CanvasRenderer,
	PieChart,
	BarChart,
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	BarChart,
]);

//a - nazwa kategorii
//b - nazwa elementu
//c - wartość
//d - procent


const option1 = ref({
	title: {
		text: "Planowane wydatki",
		left: "center",
		subtext: "",
	},
	tooltip: {
		trigger: "item",
		formatter: "{a} <br/>{b} : {c} ({d}%)",
	},
	legend: {
		type: "scroll",
		orient: "horizontal",
		left: "center",
		top: "bottom",
		data: [],
	},
	series: [
		{
			name: "Planowane wydatki",
			type: "pie",
			radius: ["40%", "70%"],
			center: ["50%", "50%"],
			data: [],
			itemStyle: {
				borderRadius: 7,
				borderColor: "#fff",
				borderWidth: 1,
			},
			label: {
				show: false,
				position: "center",
			},
			labelLine: {
				show: false,
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 20,
					fontWeight: "bold",
				},
			},
		},
	],
});


////////////////////////////////////////////////////////////////////////////
const yearBudgetsStore = useYearBudgetsStore();
const plannedExpenseCategories = ref([]);
const plannedIncomeCategories = ref([]);
const dayjs = useDayjs();
const loaded = ref(false);

const loading = ref(false);

const loadPlannedCategories = async (date) => {
	loading.value = true;
	useWebApiFetch("/HomePage/GetPlannedMonthlyCategories", {
		query: { date },
	})
		.then(({ data, error }) => {
			if (data.value) {
				if (data.value.plannedCategories?.length > 0) {
					loaded.value = true;
				}
				plannedExpenseCategories.value = data.value.plannedCategories.filter(
					(category) => category.categoryType === "Expense"
				);
				plannedIncomeCategories.value = data.value.plannedCategories.filter(
					(category) => category.categoryType === "Income"
				);
			} else if (error.value) {
				loaded.value = false;
				plannedExpenseCategories.value = [];
				plannedIncomeCategories.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const monthItems = computed(() => {
	if (yearBudgetsStore.loaded) {
		return yearBudgetsStore.yearBudgets.flatMap((budget) =>
			budget.monthlyBudgets.map((month) => ({
				title: `${getMonthName(month.month)} ${budget.year}`,
				value: month.id,
			}))
		);
	}
	return [];
});

const chartSubtitle = ref("Planowane wydatki");

// 		chartSubtitle.value = `${monthItems.value.find(month => month.value === newMonthId).title ?? ''}`
//		option1.value.title.subtext = chartSubtitle.value;

const getMonthName = (monthValue) => {
	const month = MonthsEnum.find((m) => m.value === monthValue);
	return month ? month.name : monthValue;
};

watch(plannedExpenseCategories, (newValues) => {
	const filteredCategories = newValues.filter(
		(category) => category.amount > 0
	);
	option1.value.series[0].data = filteredCategories.map((category) => ({
		value: category.amount,
		name: category.name,
	}));
	option1.value.legend.data = filteredCategories.map(
		(category) => category.name
	);
});

const disabled = computed(() => loaded.value === false);

const currentDate = ref(dayjs());

onMounted(() => {
	loadPlannedCategories(currentDate.value.format());
});
</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>
