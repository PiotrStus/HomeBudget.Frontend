<template>
	<VDialog :model-value="show" persistent width="500" height="400" scroll-strategy="none">
		<VCard class="py-4">
			<VCardTitle class="text-center">Wybierz konto</VCardTitle>
			<div v-if="accountStore.$state.loading === true" class="pa-4 d-flex justify-center whitespace-nowrap">
    			<VProgressCircular indeterminate></VProgressCircular>
			</div>
			<div v-else>
				<v-row class="pa-4" justify="center" align="center">
					<v-col 
						v-for="account in accountStore.accounts"
						:key="account.id"
						cols="12" md="6"
						class="d-flex justify-center"
					>
					<v-card
						class="d-flex align-center justify-center ma-4"
						height="200"
						style="flex: 0 0 200px;"
						>
						<v-btn class="d-flex flex-column align-center" variant="flat" size="200" @click="handleChooseAccount(account.id)">
							<div class="d-flex flex-column align-center">
								<v-icon icon="mdi-home-account" size="100" class="mb-4"></v-icon>
								<span style="text-transform: lowercase;">{{ account.name }}</span>
							</div>
						</v-btn>
					</v-card>
					</v-col>
					<v-col cols="12" md="6" class="d-flex justify-center">

					<v-card
						class="d-flex ma-4"
						height="200"
						style="flex: 0 0 200px;"
						>
						<v-btn class="d-flex flex-column align-center" variant="flat" size="200" @click="showAddAccountDialog = true">
							<div class="d-flex flex-column align-center">
								<v-icon icon="mdi-home-plus-outline" size="100" class="mb-4"></v-icon>
								<span style="text-transform: capitalize;">Dodaj konto</span>
							</div>
						</v-btn>
					</v-card>
					</v-col>
				</v-row>
			</div> 
		</VCard>
	</VDialog>
	<AddAccountDialog 
		v-model:show="showAddAccountDialog" 
		@accountAdded="handleAccountAdded"
	/>
</template>


<script setup>
const userStore = useUserStore();
const accountStore = useAccountStore();
const showAddAccountDialog = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const show = computed(() => {
    return (accountStore.$state.accountLoaded === false || accountStore.$state.loading === true) && userStore.$state.isLoggedIn === true;
});
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();

const handleAccountAdded = () => (
	accountStore.loadUserAccounts()
);

const handleChooseAccount = (accountId) => {
	loading.value = true;
	errorMsg.value = "";
	const notificationsStore = useNotificationsStore();
	const yearBudgetsStore = useYearBudgetsStore();
	const categoriesStore = useCategoriesStore();
	const messageMap = {
        "Unauthorized": "Brak dostępu"
    };
	useWebApiFetch("/Account/SwitchAccount", {
		method: "POST",
		body: {
			accountId: accountId,
		},
		watch: false,
		onResponseError: ({ response }) => {
			errorMsg.value = "Błąd podczas wybierania konta";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		},
	})
		.then((response) => {
			if (response.data.value) {
				//accountStore.accountData = response.data.value;
				globalMessageStore.showSuccessMessage("Konto zostało wybrane");
				// notificationsStore.loadNotifications();
				// yearBudgetsStore.loadYearBudgets();
				// categoriesStore.loadCategories();
				// accountStore.accountLoaded = true;
				accountStore.loadCurrentAccount();
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

</script>

