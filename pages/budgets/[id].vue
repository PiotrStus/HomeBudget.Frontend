<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/budgets"></v-btn>
			</template>
			<v-toolbar-title>
				Edycja budżetu miesięcznego
			</v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<v-select
				label="Rok budżetowy"
				:items="yearBudgetsStore.yearBudgets"
				variant="outlined"
				item-value="id"
				item-title="year"
				no-data-text="Brak dostępnych budżetów rocznych"
				v-model="viewModel.year.id"
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

				<!-- <v-select v-model="viewModel.categoryType" :rules="[ruleRequired]" variant="outlined" label="Typ kategorii" :items=categoryOptions item-title="title" item-value="value" ></v-select> -->
			</VCardText>
			<VCardText class ="text-right">
				<VBtn prepend-icon="mdi-content-save" variant="flat" color="primary" 
					type="submit" :loading="saving" :disabled="loading">
					Zapisz
				</VBtn>
			</VCardText>
		</VForm>
	</VCard>
</template>



<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'

import MonthsEnum from "~/utils/months";
const loading = ref(false);
const saving = ref(false);
const router = useRouter();
const yearBudgetsStore = useYearBudgetsStore();
const route = useRoute();
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();

const viewModel = ref({
	year: '',
	month: '',
	totalAmount: 0
})

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		save();
	}
}

const save = () => {
	saving.value = true;
	const messageMap = {
        "MonthlyBudgetAlreadyExists": "Budżet miesięczny już istnieje"
    };

	useWebApiFetch('/Budget/UpdateMonthlyBudget', {
		method: 'POST',
		body: { month: viewModel.value.month,
			 yearBudgetId: viewModel.value.year.id,
			 totalAmount: viewModel.value.totalAmount,
			 id: route.params.id
			},
		watch: false,
		onResponseError: ({ response }) => {
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Zapisano zmiany.');
			router.push({ path: '/budgets' });
		}
		})
	.finally(() => {
		saving.value = false;
	});
}



const loadData = () => {
	loading.value = true;

	useWebApiFetch('/Budget/GetMonthlyBudget', {
		query: { id: route.params.id },
	}).then(({ data, error }) => {
		if (data.value) {
			viewModel.value = data.value;
			console.log(viewModel.value)
			console.log(data.value)
		} else if (error.value) {
			globalMessageStore.showErrorMessage("Błąd pobierania danych");
		}
	}).finally(() => {
		loading.value = false;
	});
};

onMounted(loadData)

</script>