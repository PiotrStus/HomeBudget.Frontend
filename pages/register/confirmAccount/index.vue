<template>

</template>



<script setup>
const errorMsg = ref("");
const loading = ref(false);
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const route = useRoute();
const router = useRouter();

definePageMeta({
    layout: "no-auth",
});

const confirm = (guid) => {  
	loading.value = true;
	errorMsg.value = "";
	const messageMap = {
        "ActivationNotCompletedOrAlreadyActivated": "Aktywacja nie została ukończona lub konto jest już aktywowane.",
		"WrongGuidFormat": "Niepoprawny format kodu aktywacyjnego"
    };
	useWebApiFetch('/User/ConfirmUser', {
	method: 'POST',
	body: { userGuid: guid},
	onResponseError: ({ response }) => {
		let message = getErrorMessage(response, messageMap);
		globalMessageStore.showErrorMessage(message);
	}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage("Konto użytkownika zostało aktywowane");
		}
	})
	.finally(() => {
		router.push({ path: '/' });
		loading.value = false;
	});
};



onMounted(() => {
	const guid = route.query.guid;

	// if (guid)
	// {
	confirm(guid);
	// }
});
</script>