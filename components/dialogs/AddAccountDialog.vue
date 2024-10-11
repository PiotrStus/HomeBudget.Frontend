<template>
	<VDialog
		v-model="localShow"
		width="400"
		scroll-strategy="none"
		@click:outside="handleCancel"
	>
		<v-card class="py-4">
			<VCardTitle class="text-center">Dodaj nowe konto</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-text-field 
						:rules="[ruleMaxLen(50)]" 
						variant="outlined" 
						v-model="viewModel.name" 
						label="Nazwa konta"
						class="mb-2"
					/>
				</VCardText>
				<VAlert v-if="errorMsg" type="error" variant="tonal">
					{{ errorMsg }}</VAlert
				>
				<VCardActions>
					<v-btn
						class="mx-auto"
						color="default"
						type="button"
						variant="elevated"
						@click="handleCancel"
					>
						Anuluj
					</v-btn>
					<v-btn
						class="mx-auto"
						color="primary"
						type="submit"
						variant="elevated"
						:loading="loading"
					>
						Dodaj
					</v-btn>
				</VCardActions>
			</VForm>
		</v-card>
	</VDialog>
</template>

<script setup>
const globalMessageStore = useGlobalMessageStore();
const { ruleMaxLen} = useFormValidationRules();
const { getErrorMessage } = useWebApiResponseParser();
const localShow = defineModel("show");
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['accountAdded']);
const accountAdded = () => {
  emit('accountAdded');
};

watch(localShow, (newState) => {
	if (newState) {
		viewModel.value = {
			name: ""
		};
	}
});

const viewModel = ref({
	name: ""
});

const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};

const submit = async (ev) => {
	const { valid } = await ev;
	if (valid) {
		createNewAccount();
	}
};

const createNewAccount = async () => {
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "AccountAlreadyExist": "Dane konto już istnieje"
    };
	useWebApiFetch("/Account/CreateAccount", {
		method: "POST",
		body: {
			name: viewModel.value.name,
		},
		watch: false,
		onResponseError: ({ response }) => {
			errorMsg.value = "Błąd dodawania nowego konta";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		},
	})
		.then((response) => {
			if (response.data.value) {
				globalMessageStore.showSuccessMessage("Konto zostało dodane");
				accountAdded();
				localShow.value = false;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};
</script>