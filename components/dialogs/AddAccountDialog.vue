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
						:rules="[ruleRequired, ruleMaxLen(50)]" 
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
const { ruleRequired, ruleMaxLen, ruleDate, ruleMaxNumberWithDecimals } = useFormValidationRules();
const { getErrorMessage } = useWebApiResponseParser();
const localShow = defineModel("show");
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['transactionAdded']);
const transactionAdded = () => {
  emit('transactionAdded');
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
		createNewTransaction();
	}
};

const createNewTransaction = async () => {
	loading.value = true;
	useWebApiFetch("/Transaction/CreateTransaction", {
		method: "POST",
		body: {
			name: viewModel.value.name,
			categoryId: viewModel.value.categoryId,
			date: viewModel.value.date,
			amount: viewModel.value.amount,
		},
		watch: false,
		onResponseError: ({ response }) => {
			let message = getErrorMessage(response);
			globalMessageStore.showErrorMessage(message);
		},
	})
		.then((response) => {
			if (response.data.value) {
				globalMessageStore.showSuccessMessage("Operacja została dodana");
				transactionAdded();
				localShow.value = false;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};
</script>