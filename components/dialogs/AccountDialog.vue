<template>
	<VDialog :model-value="show" :persistent="!accountStore.$state.accountLoaded" @click:outside="handleOutsideClick" @keydown.esc="handleOutsideClick" width="500" height="400" scroll-strategy="none">
		<VCard >
			<VCardTitle 
				class="py-4 text-center sticky-header"
				:style="{
					backgroundColor: theme.global.current.value.dark ? '#212121' : '#FFFFFF',
					color: theme.global.current.value.dark ? 'white' : 'black'
				}"
				>
				Wybierz konto</VCardTitle>
			<v-btn v-if="accountStore.$state.accountLoaded === true" icon @click="handleCancel" title="Zamknij" variant="flat" class="position-absolute" style="top: 0px; right: 0px; z-index: 10; ">
				<v-icon>mdi-close</v-icon>
			</v-btn>
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
import { useTheme } from 'vuetify';
const theme = useTheme();
const accountStore = useAccountStore();
const showAddAccountDialog = ref(false);
const errorMsg = ref("");
const show = computed(() => {
	return accountStore.$state.showAccountDialog === true;
});
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage } = useWebApiResponseParser();

const handleAccountAdded = () => {
	accountStore.loadUserAccounts();
};

const handleOutsideClick = () => {
    if (accountStore.$state.accountLoaded) {
        handleCancel();
    }
};

const handleCancel = () => {
	accountStore.showAccountDialog = false;
};

const handleChooseAccount = (accountId) => {
	accountStore.loading = true;
	errorMsg.value = "";
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
				globalMessageStore.showSuccessMessage("Konto zostało wybrane");
				if (accountStore.accountLoaded)
				{
					location.reload()
				}
				else
				{
					accountStore.loadCurrentAccount();
					accountStore.showAccountDialog = false;
				}
			}
		})
		.finally(() => {
			accountStore.loading = false;
		});
};

</script>

<style scoped>
.sticky-header {
    position: sticky;
    top: -10px;
    z-index: 10; 
	background-color: #212121
}
</style>