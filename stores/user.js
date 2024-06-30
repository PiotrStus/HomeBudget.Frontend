import { defineStore } from "pinia";

// defineStore -> metoda z Pinia
export const useUserStore = defineStore({
	// id -> identyfikator naszego store'a
	// dobrze jest go nazwa tak jak plik, czyli jak plik jest user.js to store -> user-store
	id: "user-store",
	// state -> stan naszego store'a
	state: () => {
		return {
			// przechowujemy czy uzytkownik jest zalogowany
			isLoggedIn: false,
			// czy nastepuje ladowanie danych uzytkownika, bo komunikacja jest asynchroniczna
			// uzywa ajaxa, czyli loading mowi, czy aktualnie trwa request
			loading: false,
			// dane ktore przyjda z naszego api
			userData: null,
		};
	},
	// mamy dwie akcje
	actions: {
		// ladowanie danych zalogowanego uzytkownika
		loadLoggedInUser() {
			// dodajemy accountStore
			const accountStore = useAccountStore();

			// ustawiamy loading na true
			this.loading = true;
			// uzywamy useWebApiFetch
			// podajemy adres kontrolera z naszego API
			// wolamy z controllera akce GettLoggedInUser() z UserController.cs
			useWebApiFetch("/User/GetLoggedInUser")
				// co sie ma wydarzyc po requescie
				// mamy opcje dane i blad
				// tutaj response ma dwa property: data i error
				.then(({ data, error }) => {
					if (data.value) {
						this.isLoggedIn = true;
						// czyli userData to bedzie json, ktorego dostaniemy z requesta z API
						// w UserController.cs tam jest [HttpGet] GetLoggedInUser() i on zwraca oK(datta)
						// czyli jak sie przejdzie dalej ten rquest bedzie w LoggedInUserQuery.cs
						// i tam jest Result jako Email
						// czyli to bedzie json, ktory ma property email i w srodku mamy email
						this.userData = data.value;
						// dodajemy informacje o aktualnie zalogowanym koncie
						accountStore.loadCurrentAccount();
					} else if (error.value) {
						this.isLoggedIn = false;
						this.userData = null;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},

		// wolamy akcje UserLogout, ktora jest w API
		// w [HttpPost] Logout()
		logout() {
			useWebApiFetch("/User/Logout", {
				// jak jest metoda GET to nie trzeba podawac zadnych paramaetrow
				// jak POST to trzeba
				method: "POST",
				// tutaj wyciagamy caly response i po .data
			}).then((response) => {
				if (response.data.value) {
					this.isLoggedIn = false;
					this.userData = null;
				}
			});
		},
	},
});
