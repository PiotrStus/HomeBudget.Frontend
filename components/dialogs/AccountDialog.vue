<template>
	<VDialog :model-value="show" persistent width="600" scroll-strategy="none">
		<VCard class="py-4">
			<VCardTitle class="text-center">Wybierz konto</VCardTitle>
			<div v-if="userStore.$state.loading === true" class="pa-4 d-flex justify-center whitespace-nowrap">
    			<VProgressCircular indeterminate></VProgressCircular>
			</div>
			<div v-else>
				<div class="d-flex overflow-x-auto" >
					<v-card
						v-for="account in accountStore.accounts"
						:key="account.id"
						class="d-flex align-center justify-center ma-4"
						height="200"
						style="flex: 0 0 200px;"
						>
						<div class="d-flex flex-column align-center">
							<v-icon icon="mdi-home-account" size="100" class="mb-4"></v-icon>
							{{ account.name }}
						</div>
					</v-card>
					<v-card
						class="d-flex align-center justify-center ma-4"
						height="200"
						style="flex: 0 0 200px;"
						>
						<div class="d-flex flex-column align-center">
							<v-icon icon="mdi-home-plus-outline" size="100" class="mb-4"></v-icon>
							Dodaj konto
						</div>
					</v-card>
				</div>
			</div> 
		</VCard>
	</VDialog>
</template>

<style lang="scss" scoped></style>

<script setup>
const userStore = useUserStore();
const accountStore = useAccountStore();

const { getErrorMessage } = useWebApiResponseParser();
const { ruleRequired, ruleEmail } = useFormValidationRules();

const show = computed(() => {
    return (accountStore.$state.accountLoaded === false || accountStore.$state.loading === true) && userStore.$state.isLoggedIn === true;
});

const errorMsg = ref("");
const loading = ref(false);

const viewModel = ref({
	email: "",
	password: "",
});

const submit = async (ev) => {
    const { valid } = await ev;
    if (valid) {
        login();
    }
}

</script>

