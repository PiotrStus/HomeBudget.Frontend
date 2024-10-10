import { defineStore } from "pinia";

// defineStore -> metoda z Pinia
export const useAccountStore = defineStore({
	// id -> identyfikator naszego store'a
	// dobrze jest go nazwa tak jak plik, czyli jak plik jest account.js to store -> account-store
	id: "account-store",
	// state -> stan naszego store'a
	state: () => {
		return {
			// czy nastepuje ladowanie danych konta, bo komunikacja jest asynchroniczna
			// uzywa ajaxa, czyli loading mowi, czy aktualnie trwa request
			loading: false,
			// dane ktore przyjda z naszego api
			accountData: null,
			accountLoaded: false,
			accounts: null,
			showAccountDialog: false
		};
	},
	// mamy dwie akcje
	actions: {
		// ladowanie danych zalogowanego uzytkownika
		loadCurrentAccount() {
			// ustawiamy loading na true
			this.loading = true;
			const notificationsStore = useNotificationsStore();
			const yearBudgetsStore = useYearBudgetsStore();
			const categoriesStore = useCategoriesStore();
			// uzywamy useWebApiFetch
			// podajemy adres kontrolera z naszego API
			// wolamy z controllera akce GetCurrentAccount() z AccountController.cs
			useWebApiFetch("/Account/GetCurrentAccount")
				// co sie ma wydarzyc po requescie
				// mamy opcje dane i blad
				// tutaj response ma dwa property: data i error
				.then(({ data, error }) => {
					if (data.value) {
						if (data.value.name) 
						{
							this.accountData = data.value;
							notificationsStore.loadNotifications();
							yearBudgetsStore.loadYearBudgets(true);
							categoriesStore.loadCategories();
							this.accountLoaded = true;
							this.showAccountDialog = false;
						}
						else 
						{
							this.accountData = null;
							this.showAccountDialog = true;
						}
					} else if (error.value) {
						this.accountData = null;
					}
				})
				.finally(() => {
					this.loadUserAccounts();
					this.loading = false;
				});
		},
		loadUserAccounts() {
			this.loading = true;
			useWebApiFetch("/Account/GetUsersAccounts")
				.then(({ data, error }) => {
					if (data.value) {
						this.accounts = data.value.accounts;
					} else if (error.value) {
						this.accounts = null;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		}
	},
});