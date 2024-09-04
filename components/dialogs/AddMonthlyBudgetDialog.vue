<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<v-card class="py-4">
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
				v-model="viewModel.yearId"
				/>
				<v-select
				label="Miesiąc"
				:items="MonthsEnum"
				variant="outlined"
				item-value="value"
				item-title="name"
				no-data-text="Brak dostępnych budżetów miesięcznych"
				v-model="viewModel.month"
				/>
				<v-number-input v-model="viewModel.totalAmount" variant="outlined" controlVariant="default" label="Planowana kwota"></v-number-input>

				
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
import MonthsEnum from "~/utils/months";
import { VNumberInput } from 'vuetify/labs/VNumberInput';
const globalMessageStore = useGlobalMessageStore();
const yearBudgetsStore = useYearBudgetsStore();
const {ruleRequired, ruleInteger} = useFormValidationRules();
const { getErrorMessage} = useWebApiResponseParser();
const localShow = defineModel("show");
const errorMsg = ref("");
const loading = ref(false);
const yearBudgetId = defineModel("yearIdBudget");
const emit = defineEmits(['monthlyBudgetAdded']);


const monthlyBudgetAdded = (monthlyBudgetId) => {
  emit('monthlyBudgetAdded', monthlyBudgetId);
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
			yearId: '',
			month: '',
			totalAmount: 0,
			monthlyBudgetId: ''
		}
	}
});

const viewModel = ref({
	yearId: '',
	month: '',
	totalAmount: 0,
	monthlyBudgetId: ''
})

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
			loading.value = true;
			const messageMap = {
			"MonthlyBudgetAlreadyExists": "Dana budżet miesięczny już istnieje"
			};
			useWebApiFetch('/MonthlyBudget/CreateMonthlyBudget', {
				method: 'POST',
                body: {yearBudgetId  : viewModel.value.yearId, month : viewModel.value.month, totalAmount: viewModel.value.totalAmount},
                watch: false,
                onResponseError: ({ response }) => {
                    let message = getErrorMessage(response, messageMap)
                    globalMessageStore.showErrorMessage(message);
                }
                }
            )				
			.then(( response ) => {
				if (response.data.value) {
					globalMessageStore.showSuccessMessage('Budżet został dodany');
					yearBudgetId.value = viewModel.value.yearId;
					viewModel.value.monthlyBudgetId = response.data.value.monthlyBudgetId;
					monthlyBudgetAdded(viewModel.value.monthlyBudgetId);
					localShow.value = false;
				}
			})
			.finally(() => {
				loading.value = false;
			})
		}		

</script>