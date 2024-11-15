<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/categories"></v-btn>
			</template>
			<v-toolbar-title>
				Edycja kategorii
			</v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<VTextField :rules="[ruleRequired, ruleMaxLen(50)]" v-model="viewModel.name" variant="outlined" label="Nazwa kategorii">
				</VTextField>
				<!-- <v-select v-model="viewModel.categoryType" :rules="[ruleRequired]" variant="outlined" label="Typ kategorii" :items=categoryOptions item-title="title" item-value="value" ></v-select> -->
				<v-radio-group v-model="viewModel.categoryType">
					<v-radio
						v-for="option in categoryOptions"
						:key="option.value"
						:label="option.title"
						:value="option.value"
					/>
				</v-radio-group>
				<v-switch color="primary" label="Użyj do szablonu" v-model="viewModel.isDraft"></v-switch>
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
import { VSkeletonLoader } from 'vuetify/components';
const loading = ref(false);
const route = useRoute();
const globalMessageStore = useGlobalMessageStore();
const categoriesStore = useCategoriesStore();
const { getErrorMessage} = useWebApiResponseParser();
const {ruleRequired, ruleMaxLen} = useFormValidationRules();
const saving = ref(false);
const router = useRouter();



const viewModel = ref({
	name: '',
	categoryType: '',
	isDraft: false
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
        "CategoryDidNotChange": "Dana kategoria już istnieje"
    };

	useWebApiFetch('/Category/UpdateCategory', {
		method: 'POST',
		body: { ...viewModel.value, id: route.params.id},
		watch: false,
		onResponseError: ({ response }) => {
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Zapisano zmiany.');
			categoriesStore.loadCategories(true);
			router.push({ path: '/categories' });
		}
		})
	.finally(() => {
		saving.value = false;
	});
}


const loadData = () => {
	loading.value = true;

	useWebApiFetch('/Category/GetCategory', {
		query: { id: route.params.id },
	}).then(({ data, error }) => {
		if (data.value) {
			viewModel.value = data.value;
		} else if (error.value) {
			globalMessageStore.showErrorMessage("Błąd pobierania danych");
		}
	}).finally(() => {
		loading.value = false;
	});
};

onMounted(() => {
	loadData();
});
</script>