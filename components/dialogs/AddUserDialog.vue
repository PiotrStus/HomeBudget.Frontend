<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<VCard class="py-4">
			<VCardTitle class="text-center">Dodaj użytkownika</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-text-field :rules="[ruleRequired, ruleMaxLen(100), ruleEmail]" class="mb-4" variant="outlined" v-model="viewModel.email" label="Email"></v-text-field>
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
const globalMessageStore = useGlobalMessageStore();
const {ruleRequired, ruleMaxLen, ruleEmail} = useFormValidationRules();
const { getErrorMessage} = useWebApiResponseParser();
const localShow = defineModel("show")
const errorMsg = ref("");
const loading = ref(false);
const emit = defineEmits(['userAdded']);


const userAdded = () => {
  emit('userAdded');
  console.log('test')
};

watch(localShow, (newState) => {
	if (newState)
	{
		viewModel.value = {
		email: '',
		}
	}
});


const viewModel = ref({
	email: '',
});


const handleCancel = () => {
	localShow.value = false;
	errorMsg.value = "";
};


const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		addNewUser();
	}
}


const addNewUser = async () => {
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "UserWithThisEmailAlreadyAssigned": "Użytkownik już jest przypisany do tego konta",
		"UserWithThisEmailNotExist": "Dany użytkownik nie istnieje"
    };
	useWebApiFetch('/Account/AssignUser', {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd dodawania nowego użytkwonika";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Użytkownik został dodany')
			userAdded();
			localShow.value = false;
		}
	})
	.finally(() => {
		loading.value = false;
	});
};
</script>