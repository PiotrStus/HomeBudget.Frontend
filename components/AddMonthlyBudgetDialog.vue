<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<v-card>
		<VCardTitle class="text-center">Dodaj nowy budżet miesięczny</VCardTitle>
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
				<v-number-input v-model="viewModel.selectAmount" variant="outlined" controlVariant="default" label="Planowana kwota"></v-number-input>

				
			</VCardText>
			<VAlert v-if="errorMsg" type="error" variant="tonal"> {{ errorMsg }}</VAlert>
			<VCardActions>
				<v-btn class="mx-auto" color="default" type="button" variant="elevated" @click="handleCancel">Anuluj</v-btn>
				<v-btn class="mx-auto" color="primary" type="submit" variant="elevated">Dodaj</v-btn>
			</VCardActions>
		</VForm>
	</v-card>
	</VDialog>


</template>

<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
const globalMessageStore = useGlobalMessageStore();
const yearBudgetsStore = useYearBudgetsStore();
const {ruleRequired, ruleInteger} = useFormValidationRules();
const { getErrorMessage} = useWebApiResponseParser();
const localShow = defineModel("show")
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['update-yearBudgets']);


const updateYearBudgets = () => {
  emit('update-yearBudgets');
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
			year: '',
		}
	}
});

const viewModel = ref(
	{selectedYearId: null,
	 selectedMonth: null,
	 selectAmount: null
	}
)

const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		createNewMonthlyBudget();
	}
}

const createNewMonthlyBudget = async () => {
			saving.value = true;
			loading.value = true;
			useWebApiFetch('/Budget/CreateMonthlyBudget', {
				method: 'POST',
                body: {yearBudgetId  : viewModel.value.selectedYearId, month : viewModel.value.selectedMonth, totalAmount: viewModel.value.selectAmount},
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

</script>