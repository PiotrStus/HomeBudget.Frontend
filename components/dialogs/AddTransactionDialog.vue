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
						:rules="[ruleRequired]"  
						variant="outlined" 
						label="Kategoria" 
						v-model="viewModel.categoryId" 
						:items="props.categories" 
						item-title="name" 
						item-value="id" 
						no-data-text="Brak kategorii do przypisania"
						class="mb-2"
					/>
					<v-number-input
						v-model="viewModel.amount"
						variant="outlined"
						controlVariant="default"
						label="Kwota"
						:rules="[ruleRequired, ruleMaxNumberWithDecimals(6,2)]"
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
import { VNumberInput } from "vuetify/labs/VNumberInput";
const globalMessageStore = useGlobalMessageStore();
const { ruleRequired, ruleMaxLen, ruleDate, ruleMaxNumberWithDecimals } = useFormValidationRules();
const { getErrorMessage } = useWebApiResponseParser();
const localShow = defineModel("show");
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['transactionAdded']);
const dayjs = useDayjs();


const transactionAdded = () => {
  emit('transactionAdded');
};




watch(localShow, (newState) => {
	if (newState) {
		viewModel.value = {
			date: null,
			name: "",
			categoryId: "",
			amount: null,
		};
	}
});

const viewModel = ref({
	date: null,
	name: "",
	categoryId: "",
	amount: null,
});

watch(() => viewModel.value.date, (newDate) => {
	console.log(newDate);
	//formatDateWithoutTimezone2(newDate);
	console.log(dayjs('30.09.2024', 'DD.MM.YYYY', true).isValid()); 
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