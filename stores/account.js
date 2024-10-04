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
			accountLoaded: false
		};
	},
	// mamy dwie akcje
	actions: {
		// ladowanie danych zalogowanego uzytkownika
		loadCurrentAccount() {
			// ustawiamy loading na true
			this.loading = true;
			// uzywamy useWebApiFetch
			// podajemy adres kontrolera z naszego API
			// wolamy z controllera akce GetCurrentAccount() z AccountController.cs
			useWebApiFetch("/Account/GetCurrentAccount")
				// co sie ma wydarzyc po requescie
				// mamy opcje dane i blad
				// tutaj response ma dwa property: data i error
				.then(({ data, error }) => {
					if (data.value) {
						this.accountData = data.value;
						this.accountLoaded = true;
						console.log(this.accountLoaded)
						console.log("sdfsf");
						// czyli accountData to bedzie json, ktorego dostaniemy z requesta z API
						// w UserController.cs tam jest [HttpGet] GetCurrentAccount() i on zwraca oK(data)
						// czyli jak sie przejdzie dalej ten request bedzie w CurrentAccountQuery.cs
						// i tam jest Result jako Name
						// czyli to bedzie json, ktory ma property Name i w srodku mamy Name
					} else if (error.value) {
						this.accountData = null;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
});
