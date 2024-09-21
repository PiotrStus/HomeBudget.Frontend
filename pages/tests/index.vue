<template>
		<v-card>
			<v-toolbar color="transparent">
			<v-toolbar-title>Podgląd miesięcznego budżetu</v-toolbar-title>
		</v-toolbar>
		<v-card-text >
			<v-select
				:items="monthItems"
				item-title="title" 
				item-value="value"
				label="Wybierz miesiąc"
				v-model="selectedMonthId"
				hide-details="auto"
				variant="outlined"
			/>
		</v-card-text>
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<v-card-text>
			<VChart class="chart" :option="option1" autoresize />
		</v-card-text>
	</v-card>
	<v-card class="mt-5" v-if="!disabled">
		<v-card-text>
			<VChart class="chart" :option="option2" autoresize />
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
	GridComponent
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
// 2nd chart
////////////////////////////////////////////////////////////////////////////
const option2 = ref({
    title: {
        text: "Porównanie planowanych i rzeczywistych wydatków",
        left: "center",
    },
    tooltip: {
        trigger: "axis"
    },
    legend: {
        data: ["Planowane", "Rzeczywiste"],
        left: "center",
        top: "bottom",
    },
    xAxis: {
        type: "category",
        data: ['Jedzenie', 'Transport', 'Zakupy', 'Rozrywka', 'Inne'], 
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
            data: [450, 320, 180, 120, 140] , 
        }
    ]
});


const exampleBarData = {
    categories: ['Jedzenie', 'Transport', 'Zakupy', 'Rozrywka', 'Inne'],
    planned: [500, 300, 200, 100, 150],  
    actual: [450, 320, 180, 120, 140]   
};








////////////////////////////////////////////////////////////////////////////
const yearBudgetsStore = useYearBudgetsStore();
const plannedExpenseCategories = ref([]);
const plannedIncomeCategories = ref([]);
const selectedMonthId = ref(null);

const loading = ref(false);



const loadPlannedCategories = async (monthId) => {
	loading.value = true;
	useWebApiFetch("/PlannedCategory/GetAllPlannedCategories", {
		query: { monthId },
	})
		.then(({ data, error }) => {
			if (data.value) {
                plannedExpenseCategories.value = data.value.plannedCategories.filter(
                    (category) => category.categoryType === "Expense"
                );
				plannedIncomeCategories.value = data.value.plannedCategories.filter(
					(category) => category.categoryType === "Income"
				);
			} else if (error.value) {
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
		return yearBudgetsStore.yearBudgets.flatMap(budget =>
			budget.monthlyBudgets.map(month => ({
				title: `${getMonthName(month.month)} ${budget.year}`,
				value: month.id
			}))
		);
	}
	return [];
 });




const chartSubtitle = ref("Planowane wydatki");
watch(selectedMonthId, (newMonthId) => {
	console.log('dziala!')
	if (newMonthId) {
		loadPlannedCategories(newMonthId);
		chartSubtitle.value = `${monthItems.value.find(month => month.value === newMonthId).title ?? ''}`
		option1.value.title.subtext = chartSubtitle.value;
	}
});

const getMonthName = (monthValue) => {
    const month = MonthsEnum.find(m => m.value === monthValue);
    return month ? month.name : monthValue;
};

watch(plannedExpenseCategories, (newValues) => {
	const filteredCategories = newValues.filter(category => category.amount > 0);
	option1.value.series[0].data = filteredCategories.map((category) => ({
		value: category.amount,
		name: category.name,
	}));
	option1.value.legend.data = filteredCategories.map((category) => category.name);
});


const disabled = computed(() => selectedMonthId.value === null);







onMounted(() => {
	const date = new Date();
	console.log(date);
})



</script>












<style scoped>
.chart {
	height: 50vh;
}
</style>
