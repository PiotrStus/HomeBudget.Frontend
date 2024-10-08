<template>
	<VDialog :model-value="show" persistent width="600" scroll-strategy="none">
		<VCard class="py-4">
			<VCardTitle class="text-center">Wybierz konto</VCardTitle>
			<div v-if="userStore.$state.loading === true" class="pa-4 d-flex justify-center whitespace-nowrap">
    			<VProgressCircular indeterminate></VProgressCircular>
			</div>
			<div v-else>
				<div class="d-flex align-center justify-space-evenly overflow-x-auto pa-4" >
					<v-card
						v-for="account in accountStore.accounts"
						:key="account.id"
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
				</div>
			</div> 
		</VCard>
	</VDialog>
	<AddAccountDialog 
		v-model:show="showAddAccountDialog" 
		@accountAdded="handleAccountAdded"
	/>
</template>

<style lang="scss" scoped></style>

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
				accountStore.accountData = response.data.value;
				globalMessageStore.showSuccessMessage("Konto zostało wybrane");
				notificationsStore.loadNotifications();
				yearBudgetsStore.loadYearBudgets();
				categoriesStore.loadCategories();
				accountStore.accountLoaded = true;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

</script>

