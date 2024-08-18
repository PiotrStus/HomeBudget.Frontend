<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<VCard class="py-4">
			<VCardTitle class="text-center">Przypisz kategorię</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-select :rules="[ruleRequired]" class="mb-4" variant="outlined" label="Kategoria" v-model="viewModel.name" :items="props.items" item-title="name" item-value="name" no-data-text="Brak kategorii do przypisania"></v-select>
					<v-select
						:rules="[ruleRequired]"
						class="mb-4"
						label="Typ kategorii"
						:items="categoryOptions"
						variant="outlined"
						item-value="value"
						item-title="title"
						no-data-text="Brak dostępnych budżetów miesięcznych"
						v-model="viewModel.categoryType"
						disabled="true"
						menu-icon=""
						/>
					<v-number-input :rules="[ruleRequired]" v-model="viewModel.totalAmount" variant="outlined" controlVariant="default" label="Planowana kwota" />
					<VAlert v-if="errorMsg" type="error" variant="tonal"> {{ errorMsg }}</VAlert>
				</VCardText>
				<VCardActions>
					<v-btn class="mx-auto" color="default" type="button" variant="elevated" @click="handleCancel">Anuluj</v-btn>
					<v-btn class="mx-auto" color="primary" type="submit" variant="elevated">Ok</v-btn>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>


<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput';
const globalMessageStore = useGlobalMessageStore();
const {ruleRequired} = useFormValidationRules();
const { getErrorMessage} = useWebApiResponseParser();
const localShow = defineModel("show")
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['update-plannedCategories']);
const route = useRoute();


const updatePlannedCategories = () => {
  emit('update-plannedCategories');
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
			name: '',
			totalAmount: 0,
			categoryType: ''
		}
	}
});


const viewModel = ref({
	name: '',
	totalAmount: 0,
	categoryType: ''
});

watch(() => viewModel.value.name, (cat) => {
  const selectedCategory = props.items.find(item => item.name === cat);
  viewModel.value.categoryType = selectedCategory ? selectedCategory.categoryType : '';
  console.log(viewModel.value)
});


const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};


const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		assignCategory();
	}
}

const props = defineProps({
    items: Array
});


const assignCategory = async () => {
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "CategoryWithThisTypeCategoryAlreadyExists": "Dana kategoria już istnieje"
    };
	useWebApiFetch('/Category/CreatePlannedCategory', {
		method: 'POST',
		body: {...viewModel.value, monthlyBudgetId: route.params.id},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd przypisywania nowej kategorii";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Kategoria została przypisana')
			updatePlannedCategories();
			localShow.value = false;
		}
	})
	.finally(() => {
		loading.value = false;
	});
};

</script>