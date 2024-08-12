<template>
	    <VCard>
        <v-toolbar color="transparent">
            <v-toolbar-title>
                Stwórz budżet miesięczny
            </v-toolbar-title>
        </v-toolbar>
		<VForm @submit.prevent="submitCreate" :disabled="saving">
		<VCardText>
			<v-select
				label="Rok budżetowy"
				:items="yearBudgetsStore.yearBudgets"
				variant="outlined"
				item-value="id"
				item-title="year"
				no-data-text="Brak dostępnych budżetów rocznych"
				v-model="viewModelCreate.selectedYearId"
				/>
				<v-select
				label="Miesiąc"
				:items="MonthsEnum"
				variant="outlined"
				item-value="value"
				item-title="name"
				no-data-text="Brak dostępnych budżetów miesięcznych"
				v-model="viewModelCreate.selectedMonth"
				/>
				<v-number-input v-model="viewModelCreate.selectAmount" variant="outlined" controlVariant="default" label="Planowana kwota"></v-number-input>

		</VCardText>
		<VCardText class ="text-right">
				<VBtn prepend-icon="mdi-content-save" variant="flat" color="primary" 
					type="submit" :loading="saving" :disabled="saving">
					Wybierz
				</VBtn>
			</VCardText>
	</VForm>
    </VCard>
    <VCard class="pa-2 mt-4">
        <v-toolbar color="transparent">
            <v-toolbar-title>
                Wybierz budżet
            </v-toolbar-title>
        </v-toolbar>
		<VForm @submit.prevent="submit" :disabled="loading">
		<VCardText>
			<v-select
				label="Rok budżetowy"
				:items="yearBudgetsStore.yearBudgets"
				variant="outlined"
				item-value="id"
				item-title="year"
				no-data-text="Brak dostępnych budżetów rocznych"
				v-model="viewModel.selectedYearId"
				/>
				<v-select
				label="Miesiąc"
				:items="MonthsEnum"
				variant="outlined"
				item-value="value"
				item-title="name"
				no-data-text="Brak dostępnych budżetów miesięcznych"
				v-model="viewModel.selectedMonth"
				/>
		</VCardText>
		<VCardText class ="text-right">
				<VBtn prepend-icon="mdi-content-save" variant="flat" color="primary" 
					type="submit" :loading="loading" :disabled="loading">
					Wybierz
				</VBtn>
			</VCardText>
	</VForm>
    </VCard>
	<!-- <VCard v-if="hasPlannedCategories" class="pa-2 mt-4"> -->
	<VCard class="pa-2 mt-4">
		<v-toolbar color="transparent">
			<v-toolbar-title>Planowane kwoty per kategoria</v-toolbar-title>

			<v-btn class="ml-2" color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialogPlannedCategory = true">
			Dodaj
			</v-btn>
		</v-toolbar>
		<AddPlannedDialog v-model:show="showDialogCategory" @update-categories="updateItems"/>
		<AddPlannedDialog v-model:show="showDialogPlannedCategory" @update-categories="updateItems" :isPlanned="true" />
		<v-data-table 
        :loading="loading" 
        :items="plannedCategories" 
        :headers="headers" 
        items-per-page-text="Liczba wierszy na stronę"
        :items-per-page-options="[10, 20, 50]" 
        page-text="{0}-{1} z {2}" 
        no-data-text="Brak planowanych kategorii. Dodaj nową." 
        loading-text="Wczytywanie">
		<!--<tr :class="getRowClass(item)">
			<td>
        <template v-slot:item.category="{ value }">
            {{value}}
        </template>
					</td>
		</tr>
		-->
        <template v-slot:item="{ item }">
            <tr :class="getRowClass(item)">
				<td style="width: 50px">{{ getCategoryTitle(item.categoryType).charAt(0) }}</td>
                <td>{{ item.category }}</td>
                <td>{{ item.amount }}</td>
                <td>
					<div class="text-right">
                    	<v-btn  icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deleteCategory(item)"></v-btn>
                    	<v-btn  icon="mdi-pencil" title="Edytuj" variant="flat" :to="`/categories/planned/${item.id}`"></v-btn>
					</div>
				</td>
            </tr>
        </template>
    </v-data-table>
	</VCard>
</template>


<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import MonthsEnum from '~/utils/months';
const showDialogCategory = ref(false);
const showDialogPlannedCategory = ref(false);
const yearBudgetsStore = useYearBudgetsStore();

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		loadPlannedCategories();
		yearBudgetsStore.currentYearBudgetId = viewModel.value.selectedYearId;
		currentMonth.value = viewModel.value.selectedMonth;
	}
}

const submitCreate = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		createNewMonthlyBudget();
	}
}

const getCategoryTitle = (categoryType) => {
  const category = categoryOptions.find(option => option.value === categoryType);
  return category ? category.title : 'Unknown';
};

const getRowClass = (item) => {
	console.log(item)
    return {
        'income-row': item.categoryType === 'Income',
        'expense-row': item.categoryType === 'Expense'
    };
};

const currentMonth = ref('')


const viewModel = ref(
	{selectedYearId: null,
	 selectedMonth: null
	}
)

const viewModelCreate = ref(
	{selectedYearId: null,
	 selectedMonth: null,
	 selectAmount: null
	}
)

const headers = ref([
	{title: 'Typ', value: 'categoryType'},
    {title: 'Nazwa kategorii', value: 'category'},
	{title: 'Planowana kwota', value: 'amount'},
    {title: '', value: 'action', align: 'end'}

]);

const plannedCategories = ref([]);
const hasPlannedCategories = computed(() => plannedCategories.value.length > 0);

const loading = ref(false);
const saving = ref(false);
const globalMessageStore = useGlobalMessageStore();

const loadPlannedCategories = async () => {
			loading.value = true;
			useWebApiFetch('/Category/GetPlannedCategories', {
                query: {YearId  : viewModel.value.selectedYearId, Month : viewModel.value.selectedMonth}
                }
            )				
			.then(({ data, error }) => {
				if (data.value) {
					plannedCategories.value = data.value.plannedCategories;
					globalMessageStore.showSuccessMessage('Budżet został wybrany');
				} else if (error.value) {
					plannedCategories.value = [];
				}
			})
			.finally(() => {
				loading.value = false;
			})
		}
const { getErrorMessage} = useWebApiResponseParser();
const createNewMonthlyBudget = async () => {
			saving.value = true;
			loading.value = true;
			useWebApiFetch('/Budget/CreateMonthlyBudget', {
				method: 'POST',
                body: {yearBudgetId  : viewModelCreate.value.selectedYearId, month : viewModelCreate.value.selectedMonth, totalAmount: viewModelCreate.value.selectAmount},
                watch: false,
                onResponseError: ({ response }) => {
                    let message = getErrorMessage(response, {})
                    globalMessageStore.showErrorMessage(message);
                }
                }
            )				
			.then(({ data, error }) => {
				if (data.value) {
					plannedCategories.value = data.value.plannedCategories;
					globalMessageStore.showSuccessMessage('Budżet został dodany');
				} else if (error.value) {
					plannedCategories.value = [];
				}
			})
			.finally(() => {
				saving.value = false;
				loading.value = false;
			})
		}		



onMounted(
    () => {yearBudgetsStore.loadYearBudgets()},
);

</script>

<style scoped>
.income-row {
    background-color:  #e7ffde;
}

.income-row .v-btn {
    background-color: #e7ffde; 
}

.expense-row {
    background-color: primary; 
}


</style>