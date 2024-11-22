<template>
	<v-skeleton-loader class="mt-4" v-if="loading" type="card" />
	<v-card class="mt-4" v-if="loaded">
	<v-card-text>
		<VChart class="chart" :option="option" autoresize />
	</v-card-text>
	</v-card>
</template>

<script setup>
import { useTheme } from "vuetify";
const theme = useTheme();
import { useDisplay } from "vuetify";
const { mobile } = useDisplay();
import VChart, { THEME_KEY } from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, BarChart } from "echarts/charts";
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent
} from "echarts/components";


const echartsTheme = computed(() =>
	theme.global.current.value.dark ? "dark" : "light"
);
provide(THEME_KEY, echartsTheme);

use([
	CanvasRenderer,
	PieChart,
	BarChart,
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent
]);

const props = defineProps({ 
	date: {
		type: Object,
		required: true,
	},
	disable: {
		type: Boolean,
		default: false,
	},
})


const backgroundColor = ref(theme.global.current.value.colors.surface);

watch(
	() => theme.global.current.value,
	(newVal) => {
		backgroundColor.value = newVal.colors.surface;
	}
);

const option = computed(() => ({
	title: {
		text: "Porównanie wydatków",
		subtext: "Planowane vs rzeczywiste",
		left: "center",
		align: "right",
	},
	backgroundColor: backgroundColor.value,
	tooltip: {
		trigger: "axis",
		axisPointer: {
			type: "shadow",
		},
		valueFormatter: (value) => `${value} zł`
	},
	legend: {
		data: ["Planowane", "Rzeczywiste"],
		type: "scroll",
		orient: "horizontal",
		left: "center",
		top: "bottom",
	},
	grid: {
		left: mobile.value ? "20%" : "10%",
	},
	xAxis: {
		type: "category",
		data: barExpenseData.value.categories,
		axisLabel: {
			show: !mobile.value,
			interval: 0, 
		},
	},
	yAxis: {
		type: "value",
		max: Math.max(
			...(barExpenseData.value.planned.length ? barExpenseData.value.planned : [0]),
			...(barExpenseData.value.actual.length ? barExpenseData.value.actual : [0])
		),
		axisLabel: {
			formatter: "{value} zł",
		},
	},
	series: [
		{
			name: "Planowane",
			type: "bar",
			data: barExpenseData.value.planned,
			itemStyle: {
				color: "#91cc75",
				opacity: 0.5,
			},
			barGap: "-100%",
			z: 1,
		},
		{
			name: "Rzeczywiste",
			type: "bar",
			data: barExpenseData.value.actual.map((actual, index) => ({
				value: actual,
				itemStyle: {
					color:
						actual > barExpenseData.value.planned[index]
							? "#ee6666"
							: "#5470c6",
				},
			})),
			label: {
				show: mobile.value ? (params) => params.dataIndex % 2 === 0 : true,
				position: "inside",
				fontSize: mobile.value ? 7 : 13,
				offset: [0, -3],
				formatter: (params) => {
					const actual = barExpenseData.value.actual[params.dataIndex];
					const planned = barExpenseData.value.planned[params.dataIndex];
					const percent = planned === 0 ? 0 : ((actual / planned) * 100).toFixed(0);
					return `${percent}%`;
				},
			},
			barGap: "-100%",
			z: 2,
		},
	],
}));

const barExpenseData = ref({
	categories: [],
	planned: [],
	actual: [],
});

const barIncomeData = ref({
	categories: [],
	planned: [],
	actual: [],
});

const loading = ref(false);
const loaded = ref(false);

const expanseBalanceCategories = ref([]);
const incomeBalanceCategories = ref([]);

const loadMonthlyBalance = async (date) => {
	loading.value = true;
	useWebApiFetch("/HomePage/GetMonthlyBalance", {
		query: { date },
	})
		.then(({ data, error }) => {
			if (data.value) {
				if (data.value.monthlyBalanceCategories?.length > 0) {
					loaded.value = true;
				}
				expanseBalanceCategories.value =
					data.value.monthlyBalanceCategories.filter(
						(category) => category.categoryType === "Expense"
					);
				incomeBalanceCategories.value =
					data.value.monthlyBalanceCategories.filter(
						(category) => category.categoryType === "Income"
					);
				barExpenseData.value.categories = expanseBalanceCategories.value.map(
					(item) => item.categoryName
				);
				barIncomeData.value.categories = incomeBalanceCategories.value.map(
					(item) => item.categoryName
				);
				barExpenseData.value.planned = expanseBalanceCategories.value.map(
					(item) => item.plannedAmount
				);
				barIncomeData.value.planned = incomeBalanceCategories.value.map(
					(item) => item.plannedAmount
				);
				barExpenseData.value.actual = expanseBalanceCategories.value.map(
					(item) => item.actualAmount
				);
				barIncomeData.value.actual = incomeBalanceCategories.value.map(
					(item) => item.actualAmount
				);
				console.log('barExpenseData:', barExpenseData.value);

			} else if (error.value) {
				loaded.value = false;
				barExpenseData.value = [];
				barIncomeData.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

watch(
	() => props.date, 
	(newDate) => {
		if (newDate) {
			loaded.value = false;
			loadMonthlyBalance(newDate.format());
		}
	}
);

onMounted(() => {
	loadMonthlyBalance(props.date.format());
});
</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>