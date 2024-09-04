<template>
	<VDialog
		v-model="localShow"
		width="400"
		scroll-strategy="none"
		@click:outside="handleCancel"
	>
		<v-card class="py-4">
			<VCardTitle class="text-center">Dodaj nową operację</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-date-input 
						label="Data operacji"
						v-model="viewModel.date"
						:rules="[ruleRequired]"
						prepend-icon="" 
						variant="outlined"/>
					<v-text-field :rules="[ruleRequired, ruleMaxLen(50)]" variant="outlined" v-model="viewModel.name" label="Nazwa operacji"></v-text-field>
					<v-select
						:rules="[ruleRequired]"  
						variant="outlined" 
						label="Kategoria" 
						v-model="viewModel.categoryId" 
						:items="props.categories" 
						item-title="name" 
						item-value="id" 
						no-data-text="Brak kategorii do przypisania"
					/>
					<v-number-input
						v-model="viewModel.amount"
						variant="outlined"
						controlVariant="default"
						label="Kwota"
						:rules="[ruleRequired]"
					></v-number-input>
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
					>
						Dodaj
					</v-btn>
				</VCardActions>
			</VForm>
		</v-card>
	</VDialog>
</template>

<script setup>
import { VNumberInput } from "vuetify/labs/VNumberInput";
import { VDateInput } from 'vuetify/labs/VDateInput';
const globalMessageStore = useGlobalMessageStore();
const { ruleRequired, ruleMaxLen } = useFormValidationRules();
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
			date: null,
			name: "",
			categoryId: "",
			amount: "",
		};
	}
});

const viewModel = ref({
	date: null,
	name: "",
	categoryId: "",
	amount: "",
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

const props = defineProps({
	categories: {
		type: Array,
		required: true
	}
})

const createNewTransaction = async () => {
	loading.value = true;
	console.log(viewModel.value);
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
