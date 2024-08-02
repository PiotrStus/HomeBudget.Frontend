<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<VCard class="py-4">
			<VCardTitle class="text-center">Dodaj kategorię</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-text-field :rules="[ruleRequired, ruleMaxLen(50)]" class="mb-4" variant="outlined" v-model="viewModel.name" label="Nazwa kategorii"></v-text-field>
					<v-select :rules="[ruleRequired]" class="mb-4" variant="outlined" label="Typ kategorii" v-model="viewModel.categoryType" :items="categoryOptions" item-title="title" item-value="value"></v-select>
					<VAlert v-if="errorMsg" type="error" variant="tonal"> {{ errorMsg }}</VAlert>
				</VCardText>
				<VCardActions>
					<v-btn class="mx-auto" color="primary" type="button" variant="elevated" @click="handleCancel">Anuluj</v-btn>
					<v-btn class="mx-auto" color="primary" type="submit" variant="elevated">Ok</v-btn>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>


</template>


<style lang="scss" scoped>

</style>


<script setup>
const globalMessageStore = useGlobalMessageStore();
const {ruleRequired, ruleMaxLen} = useFormValidationRules();
const localShow = defineModel("show")
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['update-categories']);


const updateCategories = () => {
  emit('update-categories');
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
		name: '',
		categoryType: ''
		}
	}
});


const viewModel = ref({
	name: '',
	categoryType: ''
});


const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};


const submit = () => {
	addNewCategory();
};


const addNewCategory = async () => {
	loading.value = true;
	errorMsg.value = "";

	useWebApiFetch('/Category/CreateCategory', {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd dodawania nowej kategorii";
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