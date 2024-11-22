<template>
	<v-skeleton-loader class="mt-4" v-if="loading" type="card" />
	<v-card class="card" v-if="loaded">
		<v-card-text>
			<VChart class="chart" :option="option" autoresize />
	</v-card-text>
</v-card>
</template>

<script setup>
import { useTheme } from "vuetify";
const theme = useTheme();
import VChart, { THEME_KEY } from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
} from "echarts/components";

const echartsTheme = computed(() =>
	theme.global.current.value.dark ? "dark" : "light"
);

provide(THEME_KEY, echartsTheme);

use([
	CanvasRenderer,
	PieChart,
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
]);

//a - nazwa kategorii
//b - nazwa elementu
//c - wartość
//d - procent

const backgroundColor = ref(theme.global.current.value.colors.surface);

watch(
	() => theme.global.current.value,
	(newVal) => {
		backgroundColor.value = newVal.colors.surface;
		option.value.backgroundColor = newVal.colors.surface;
	}
);

const option = ref({
	title: {
		text: "Planowane wydatki",
		left: "center",
		subtext: "",
	},
	backgroundColor: backgroundColor.value,
	tooltip: {
		trigger: "item",
		formatter: "{a} <br/>{b} : {c} zł ({d}%)",
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

const plannedExpenseCategories = ref([]);
const plannedIncomeCategories = ref([]);
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


watch(plannedExpenseCategories, (newValues) => {
	const filteredCategories = newValues.filter(
		(category) => category.amount >= 0
	);
	option.value.series[0].data = filteredCategories.map((category) => ({
		value: category.amount,
		name: category.name,
	}));
	option.value.legend.data = filteredCategories.map(
		(category) => category.name
	);
});


const props = defineProps({
	date: {
		type: Object,
		required: true,
	},
	disable: {
		type: Boolean,
		default: false,
	},
});

watch(
	() => props.date, 
	(newDate) => {
		if (newDate) {
			loaded.value = false;
			loadPlannedCategories(newDate.format());
		}
	}
);

onMounted(() => {
	loadPlannedCategories(props.date.format());
});
</script>

<style scoped>
.chart {
	height: 50vh;
}

.card {
	height: 55vh;
	margin-top: 16px;
}
</style>