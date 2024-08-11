<template>
	<VCard>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne budżety</v-toolbar-title>
		</v-toolbar>

		<VCardText>
			<v-select
				label="Rok budżetowy"
				:items="yearBudgetsStore.yearBudgets"
				variant="outlined"
				item-value="id"
				item-title="year"
				no-data-text="Brak dostępnych budżetów rocznych"
				v-model="viewModel.selectedYearId"
			>
				<template v-slot:append-item>
					<v-divider class="mb-2"></v-divider>
					<v-list-item>
						<template v-slot:prepend>
							<v-btn
								variant="flat"
								prepend-icon="mdi-plus"
								@click="showDialog = true"
								>Dodaj nowy</v-btn
							>
						</template>
					</v-list-item>
				</template>
			</v-select>

			<v-toolbar color="transparent">
				<v-toolbar-title>Planowane kwoty per kategoria</v-toolbar-title>
			</v-toolbar>
			<v-data-table
				:loading="loading"
				:items="formattedBudgets"
				:headers="headers"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
				<template v-slot:item.month="{ value }">
					{{ value }}
				</template>
				<template v-slot:item.totalAmount="{ value }">
					{{ value }}
				</template>
				<template v-slot:item.year="{ value }">
					{{ value }}
				</template>
				<template v-slot:item.action="{ item }">
					<div class="text-right">
						<v-btn
							icon="mdi-delete"
							title="Usuń"
							variant="flat"
							:loading="item.deleting"
							@click="deleteCategory(item)"
						></v-btn>
						<v-btn
							icon="mdi-pencil"
							title="Edytuj"
							variant="flat"
							:to="`/categories/planned/${item.id}`"
						></v-btn>
					</div>
				</template>
			</v-data-table>
		</VCardText>
		<AddYearBudgetDialog
			v-model:show="showDialog"
			v-model:yearIdBudget="yearId"
			@update-yearBudgets="updateBudgets"
		/>
	</VCard>
</template>

<script setup>
import MonthsEnum from "~/utils/months";
const showDialog = ref(false);
const yearId = ref(null);
const loading = ref(false);
const saving = ref(false);
const yearBudgetsStore = useYearBudgetsStore();
const viewModel = ref({ selectedYearId: null, selectedMonth: null });
const headers = ref([
	{ title: "Rok", value: "year" },
	{ title: "Miesiąc", value: "month" },
	{ title: "Planowana kwota", value: "totalAmount" },
	{ title: "", value: "action", align: "end" },
]);

const formattedBudgets = computed(() => {
	let months = [];
	const getPolishMonth = (englishMonth) => {
		return (
			MonthsEnum.find((month) => month.value === englishMonth)?.id ||
			englishMonth
		);
	};
	if (!viewModel.value.selectedYearId) {
		months = yearBudgetsStore.yearBudgets.flatMap((yearBudget) =>
			yearBudget.monthlyBudgets.map((monthlyBudget) => ({
				year: yearBudget.year,
				month: getPolishMonth(monthlyBudget.month),
				monthId: monthlyBudget.id,
				totalAmount: monthlyBudget.totalAmount,
			}))
		);
	} else {
		const selectedYear = yearBudgetsStore.yearBudgets.find(
			(yearBudget) => yearBudget.id === viewModel.value.selectedYearId
		);
		if (selectedYear) {
			months = selectedYear.monthlyBudgets.map((monthlyBudget) => ({
				year: selectedYear.year,
				month: getPolishMonth(monthlyBudget.month),
				monthId: monthlyBudget.id,
				totalAmount: monthlyBudget.totalAmount,
			}));
		}
	}
	return months;
});

const updateBudgets = async () => {
	await yearBudgetsStore.loadYearBudgets();
	if (yearId.value) {
		viewModel.value.selectedYearId = yearId.value.yearBudgetId;
	} else {
		viewModel.value.selectedYearId = "";
	}
};

onMounted(updateBudgets);
</script>
