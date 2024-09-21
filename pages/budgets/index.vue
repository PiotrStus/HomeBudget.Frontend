<template>
	<VCard>
		<v-toolbar color="transparent">
			<v-toolbar-title>Dostępne budżety</v-toolbar-title>
		</v-toolbar>

		<VCardText>
			<v-select
				label="Rok budżetowy"
				:items="yearBudgetsWithAllOption"
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
								@click="showYearDialog = true"
								>Dodaj</v-btn
							>
						</template>
					</v-list-item>
				</template>
			</v-select>

			<!-- <v-toolbar color="transparent">
				<v-toolbar-title>Planowane kwoty per kategoria</v-toolbar-title>
			</v-toolbar> -->
			<v-data-table
				:loading="yearBudgetsStore.loading"
				:items="formattedBudgets"
				:headers="headers"
				items-per-page-text="Liczba wierszy na stronę"
				:items-per-page-options="[10, 20, 50]"
				page-text="{0}-{1} z {2}"
				no-data-text="Brak dostępnych budżetów. Dodaj nowy."
				loading-text="Wczytywanie"
			>
				<template v-slot:header.action>
					<v-btn
						color="primary"
						variant="flat"
						prepend-icon="mdi-plus"
						@click="showMonthlyDialog = true"
					>
						Dodaj
					</v-btn>
				</template>
				<template v-slot:item.select="{ item }">
					<v-btn
						icon="mdi-book-search-outline"
						title="Wybierz"
						variant="flat"
						:disabled="item.deleting"
						:to="`/budgets/planned/${item.monthId}`"
					></v-btn>
				</template>
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
					<v-btn
						icon="mdi-magnify"
						title="Wybierz"
						:disabled="item.deleting"
						:to="`/budgets/planned/${item.monthId}`"
						variant="flat"
					/>

					<v-btn icon title="Więcej" variant="flat">
						<v-icon icon="mdi-dots-vertical" />
						<v-menu
							activator="parent"
							location="bottom end"
							transition="fab-transition"
						>
							<v-list rounded="lg">
								<v-list-item
									variant="flat"
									:loading="item.deleting"
									@click="deleteMonthlyBudget(item)"
									title="Usuń"
								>
									<template v-slot:prepend>
										<v-icon icon="mdi-delete" />
									</template>
								</v-list-item>
								<v-list-item
									variant="flat"
									:disabled="item.deleting"
									:to="`/budgets/${item.monthId}`"
									title="Edytuj"
								>
									<template v-slot:prepend>
										<v-icon icon="mdi-pencil" />
									</template>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-btn>
				</template>
			</v-data-table>
		</VCardText>
		<AddMonthlyBudgetDialog
			v-model:show="showMonthlyDialog"
			v-model:yearIdBudget="yearId"
			@monthlyBudgetAdded="monthlyBudgetAdded"
			@noYearBudgets="handleNoYearBudgets"
		/>
		<AddYearBudgetDialog
			v-model:show="showYearDialog"
			v-model:yearIdBudget="yearId"
			@yearBudgetAdded="updateBudgets"
		/>
		<ConfirmDialog ref="confirmDialog" />
	</VCard>
</template>

<script setup>
import _ from "lodash";
import MonthsEnum from "~/utils/months";
const showYearDialog = ref(false);
const showMonthlyDialog = ref(false);
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();
const yearId = ref(null);
const saving = ref(false);
const confirmDialog = ref(null);
const yearBudgetsStore = useYearBudgetsStore();
const viewModel = ref({ selectedYearId: null, selectedMonth: null });
const router = useRouter();
const headers = ref([
	{ title: "Rok", value: "year" },
	{ title: "Miesiąc", value: "month" },
	{ title: "Planowana kwota", value: "totalAmount" },
	{ title: "", value: "action", align: "end" },
]);

const yearBudgetsWithAllOption = computed(() => {
	return yearBudgetsStore.yearBudgets.length > 0
    ? [{ id: null, year: "Wszystkie" }, ...yearBudgetsStore.yearBudgets]
    : yearBudgetsStore.yearBudgets;
});

const formattedBudgets = computed(() => {
	let months = [];
	const getPolishMonth = (englishMonth) => {
		return (
			MonthsEnum.find((month) => month.value === englishMonth)?.name ||
			englishMonth
		);
	};
	const getMonthOrder = (value) => {
		return MonthsEnum.find((month) => month.value === value)?.id || null;
	};
	if (!viewModel.value.selectedYearId) {
		months = yearBudgetsStore.yearBudgets.flatMap((yearBudget) =>
			yearBudget.monthlyBudgets.map((monthlyBudget) => ({
				year: yearBudget.year,
				month: getPolishMonth(monthlyBudget.month),
				monthId: monthlyBudget.id,
				monthOrder: getMonthOrder(monthlyBudget.month),
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
				monthOrder: getMonthOrder(monthlyBudget.month),
				totalAmount: monthlyBudget.totalAmount,
			}));
		}
	}
	const copiedMonthlyBudgets = _.cloneDeep(months);
	const sortedMonthlyBudgets = copiedMonthlyBudgets.sort((a, b) => {
		if (a.year !== b.year) {
			return b.year - a.year;
		} else {
			return b.monthOrder - a.monthOrder;
		}
	});
	return sortedMonthlyBudgets;
});

const deleteMonthlyBudget = (item) => {
	confirmDialog.value
		.show({
			title: "Potwierdź usunięcie",
			text: "Czy na pewno chcesz usunać budżet miesięczny?",
			confirmBtnText: "Usuń",
			confirmBtnColor: "error",
		})
		.then((confirm) => {
			if (confirm) {
				item.deleting = true;
				useWebApiFetch("/MonthlyBudget/DeleteMonthlyBudget", {
					method: "POST",
					body: { id: item.monthId },
					watch: false,
					onResponseError: ({ response }) => {
						let message = getErrorMessage(response, {});
						globalMessageStore.showErrorMessage(message);
					},
				})
					.then((response) => {
						if (response.data.value) {
							globalMessageStore.showSuccessMessage(
								"Budżet miesięczny został usunięty"
							);
							updateBudgets();
						}
					})
					.finally(() => {
						item.deleting = false;
					});
			}
		});
};

const updateBudgets = () => {
	yearBudgetsStore.loadYearBudgets(true).then;
	if (yearId.value) {
		viewModel.value.selectedYearId = yearId.value;
	} else {
		viewModel.value.selectedYearId = null;
	}
};

const monthlyBudgetAdded = (monthlyBudgetId) => {
	yearBudgetsStore.loadYearBudgets(true);
	router.push({ path: `/budgets/planned/${monthlyBudgetId}` });
};

const handleNoYearBudgets = () =>
{
	showMonthlyDialog.value = false;
	showYearDialog.value = true;
}

</script>
