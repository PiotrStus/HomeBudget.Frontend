<template>
	<v-card-text>
		<VChart class="chart" :option="option2" autoresize />
	</v-card-text>
</template>

<script setup>
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


import { useTheme } from "vuetify";
const theme = useTheme();
import { useDisplay } from "vuetify";
const { mobile } = useDisplay();

const backgroundColor = ref(theme.global.current.value.colors.surface);

watch(
	() => theme.global.current.value,
	(newVal) => {
		backgroundColor.value = newVal.colors.surface;
	}
);

const option2 = computed(() => ({
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
		left: mobile.value ? '15%' : '10%',
	},
	xAxis: {
		type: "category",
		data: exampleBarData.categories,
	},
	yAxis: {
		type: "value",
		max: Math.max(...exampleBarData.planned, ...exampleBarData.actual),
		axisLabel: {
		formatter: '{value} zł',
		}
	},
	series: [
		{
			name: "Planowane",
			type: "bar",
			data: exampleBarData.planned,
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
			data: exampleBarData.actual.map((actual, index) => ({
				value: actual,
				itemStyle: {
					color: actual > exampleBarData.planned[index] ? "#ee6666" : "#5470c6",
				},
			})),
			label: {
				show: true,
				position: "inside",
				formatter: (params) => {
					const actual = exampleBarData.actual[params.dataIndex];
					const planned = exampleBarData.planned[params.dataIndex];
					const percent = ((actual / planned) * 100).toFixed(2);
					return `${percent} %`;
				},
			},
			barGap: "-100%",
			z: 2,
		},
	],
}));

const exampleBarData = {
	categories: ["Jedzenie", "Transport", "Mieszkanie", "Rozrywka", "Edukacja", "Inne"],
	planned: [2000, 1000, 1500, 300, 150, 100],
	actual: [450, 320, 1200, 120, 500, 100],
};
</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>
