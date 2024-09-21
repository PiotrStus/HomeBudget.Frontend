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
	GridComponent,
} from "echarts/components";

const echartsTheme = computed(() => theme.global.current.value.dark ? 'dark' : 'light');
provide(THEME_KEY, echartsTheme);



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


import { useTheme } from "vuetify";
const theme = useTheme();

const backgroundColor = ref(theme.global.current.value.colors.surface);

watch(() => theme.global.current.value, (newVal) => {
  backgroundColor.value = newVal.colors.surface;
});

const option2 = computed(() => ({
	backgroundColor: backgroundColor.value,
	title: {
		text: "Porównanie wydatków",
		subtext: "Planowane vs rzeczywiste",
		left: "center",
		align: "right"
	},
	tooltip: {
		trigger: "axis",
	},
	legend: {
		data: ["Planowane", "Rzeczywiste"],
		left: "center",
		top: "bottom",
	},
	xAxis: {
		type: "category",
		data: ["Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"],
	},
	yAxis: {
		type: "value",
	},
	series: [
		{
			name: "Planowane",
			type: "bar",
			data: [500, 300, 200, 100, 150],
		},
		{
			name: "Rzeczywiste",
			type: "bar",
			data: [450, 320, 180, 120, 140],
		},
	],
}));

const exampleBarData = {
	categories: ["Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"],
	planned: [500, 300, 200, 100, 150],
	actual: [450, 320, 180, 120, 140],
};



</script>

<style scoped>
.chart {
	height: 50vh;
}
</style>