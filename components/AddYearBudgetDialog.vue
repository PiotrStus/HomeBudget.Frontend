<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<v-card>
		<VCardTitle class="text-center">Dodaj nowy budżet roczny</VCardTitle>
		<VForm @submit.prevent="submit" :disabled="loading">
			<VCardText class="d-flex justify-space-between">
				<v-number-input
					controlVariant="split"
					label="Rok"
					:hideInput="false"
					:inset="false"
					variant="outlined"
					:max="2050"
					:min="2020"
					v-model="viewModel.year"
					type="number"
					:rules="[ruleRequired, ruleInteger]"
				/>
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

const viewModel = ref({
	year: '',
});

const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		addNewBudget();
	}
}

const addNewBudget = () => {
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "AccountWithThisYearBudgetAlreadyExists": "Budżet na dany rok już istnieje"
    };
	useWebApiFetch('/Budget/CreateYearBudget', {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({ response }) => {
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Budżet roczny został dodany');
			updateYearBudgets();
			localShow.value = false;
		}
	})
	.finally(() => {
		loading.value = false;
		viewModel.value.year = '';
	});
};
</script>