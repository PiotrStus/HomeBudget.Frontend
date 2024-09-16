<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" :to="`/budgets/planned/${route.query.plannedId}`"></v-btn>
			</template>
			<v-toolbar-title>
				Edycja planowanej kategorii
			</v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<v-number-input  :rules="[ruleRequired]" v-model="viewModel.amount" variant="outlined" controlVariant="default" label="Planowana kwota"></v-number-input>
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
const {ruleRequired} = useFormValidationRules();
const route = useRoute();
const router = useRouter();
const globalMessageStore = useGlobalMessageStore();
const notificationsStore = useNotificationsStore();
const { getErrorMessage} = useWebApiResponseParser();

const loading = ref(false);
const saving = ref(false);

const viewModel = ref({
	amount: 0
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
        "PlannedCategoryDidNotChange": "Nie zmieniono planowanej kwoty"
    };

	useWebApiFetch('/PlannedCategory/UpdatePlannedCategory', {
		method: 'POST',
		body: {
			 amount: viewModel.value.amount,
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
			router.push({ path: `/budgets/planned/${route.query.plannedId}` });
			notificationsStore.loadNotifications();
		}
		})
	.finally(() => {
		saving.value = false;
	});
}

const loadData = () => {
	loading.value = true;

	useWebApiFetch('/PlannedCategory/GetPlannedCategory', {
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

onMounted(() => {
	loadData();
});

</script>