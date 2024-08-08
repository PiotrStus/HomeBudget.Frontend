<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<VCard class="py-4">
			<VCardTitle class="text-center">Dodaj kategorię</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-select :rules="[ruleRequired]" class="mb-4" variant="outlined" label="Kategoria" v-model="viewModel.categoryType" :items="categoryOptions" item-title="title" item-value="value"></v-select>
					<v-number-input v-if="isPlanned" variant="outlined" controlVariant="default" label="Planowana kwota"></v-number-input>
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


<style lang="scss" scoped>

</style>


<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
const globalMessageStore = useGlobalMessageStore();
const {ruleRequired, ruleMaxLen} = useFormValidationRules();
const { getErrorMessage} = useWebApiResponseParser();
const localShow = defineModel("show")
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['update-categories']);
const props = defineProps(['isPlanned']);
const categoriesStore = useCategoriesStore();

const updateCategories = () => {
  emit('update-categories');
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
		name: '',
		categoryType: '',
		isDraft: false
		}
	}
});


const viewModel = ref({
	name: '',
	categoryType: '',
	isDraft: false
});


const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};


const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		addNewCategory();
	}
}


const addNewCategory = async () => {
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "CategoryWithThisTypeCategoryAlreadyExists": "Dana kategoria już istnieje"
    };
	const url = props.isPlanned
		? '/Category/CreatePlannedCategory'
		: '/Category/CreateCategory';
	useWebApiFetch(url, {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd dodawania nowej kategorii";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Kategoria została dodana')
			updateCategories();
			localShow.value = false;
		}
	})
	.finally(() => {
		loading.value = false;
	});
};
</script>