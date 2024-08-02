<template>
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
				/>
			</VCardText>
			<VAlert v-if="errorMsg" type="error" variant="tonal"> {{ errorMsg }}</VAlert>
			<VCardText class ="text-right">
				<VBtn class="mx-auto" color="primary" type="submit" variant="elevated">Dodaj</VBtn>
			</VCardText>
		</VForm>
	</v-card>
</template>
  

<script setup>

import { VNumberInput } from 'vuetify/labs/VNumberInput'
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const submit = () => {addNewBudget()};
const errorMsg = ref("");
const loading = ref(false);

const viewModel = ref(
	{
	year: 2024
	}
);
  
  const addNewBudget = async () => {
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
			globalMessageStore.showSuccessMessage('Budżet roczny został dodany')
		}
	})
	.finally(() => {
		loading.value = false;
		this.viewModel.year = '';
	});
};
  
</script>