<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/transactions"></v-btn>
			</template>
			<v-toolbar-title>
				Edycja operacji
			</v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<TextFieldDatePicker 
						class="mb-2"
						v-model="viewModel.date"
						variant="outlined"
						label="Data operacji"
						:rules="[ruleRequired, ruleDate]" 
					/>
				<v-text-field 
						:rules="[ruleRequired, ruleMaxLen(50)]" 
						variant="outlined" 
						v-model="viewModel.name" 
						label="Nazwa operacji"
						class="mb-2"
					/>
				<v-select
				label="Kategoria"
				:items="categoriesStore.categories"
				variant="outlined"
				item-value="id"
				item-title="name"
				no-data-text="Brak dostępnych kategorii"
				v-model="viewModel.categoryId"
				/>
				<v-number-input v-model="viewModel.amount" variant="outlined" controlVariant="default" label="Kwota transakcji" />
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
import { VNumberInput } from 'vuetify/labs/VNumberInput';
const { ruleRequired, ruleMaxLen, ruleDate } = useFormValidationRules();
const categoriesStore = useCategoriesStore();
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const viewModel = ref({
	date: "",
	previousDate: null,
	previousCategoryId: "",
	name: "",
	categoryId: "",
	amount: "",
});

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		save();
	}
}

const save = () => {
	saving.value = true;
	const messageMap = {
        "TranscationDidNotChange": "Transakcja już istnieje"
    };

	const idAsNumber = Number(route.params.id);

	if (isNaN(idAsNumber)) {
		globalMessageStore.showErrorMessage('Wprowadzono niewłaściwy ID transakcji.');
		saving.value = false;
		return;
	}

	useWebApiFetch('/Transaction/UpdateTransaction', {
		method: 'POST',
		body: { 
			id: idAsNumber,
			name: viewModel.value.name,
			categoryId: viewModel.value.categoryId,
			previousCategoryId: viewModel.value.previousCategoryId,
			date: viewModel.value.date,
			previousDate: viewModel.value.previousDate,
			amount: viewModel.value.amount
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
			router.push({ path: '/transactions' });
		}
		})
	.finally(() => {
		saving.value = false;
	});
}

const loadData = () => {
	loading.value = true;

	useWebApiFetch('/Transaction/GetTransaction', {
		query: { id: route.params.id },
	}).then(({ data, error }) => {
		if (data.value) {
			viewModel.value = data.value;
			viewModel.value.date = new Date(data.value.date);
			viewModel.value.previousCategoryId = data.value.categoryId;
			viewModel.value.previousDate = new Date(data.value.date);
			console.log(viewModel.value)
			console.log(data.value)
		} else if (error.value) {
			globalMessageStore.showErrorMessage("Błąd pobierania danych");
		}
	}).finally(() => {
		loading.value = false;
	});
};



onMounted(async () => {
	await categoriesStore.loadCategories();
	await loadData();
	});

</script>