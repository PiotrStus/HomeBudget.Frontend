<template>
	<v-app>
		<v-app-bar color="brand" class="d-flex align-center justify-between">
			<v-app-bar-nav-icon
				v-if="mobile"
				@click="drawer = !drawer"
			></v-app-bar-nav-icon>

			<div v-if="accountStore.$state.accountData?.name"  style="max-width: 200px;">
				<p class="ml-4 text-truncate" style="font-size: 20px;">{{ accountStore.$state.accountData.name }}</p>
			</div>
			<v-btn v-if="accountStore.$state.accounts?.length > 1 && accountStore.$state.accountLoaded === true" icon variant="flat" color="brand" @Click="openAccountDialog">
					<v-icon>mdi-menu-down</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<VBtn
				icon="mdi-theme-light-dark"
				title="Przełącz motyw"
				@click="toggleTheme"
			></VBtn>
		</v-app-bar>

		<!-- MENU -->
		<v-navigation-drawer
			:order="mobile ? -1 : 0"
			v-model="drawer"
			v-if="userStore.$state.isLoggedIn === true && accountStore.$state.accountLoaded === true"
		>
			<!-- ona jest dwulinijkowa wiec bedzie droszeczke wyzsza -->
			<v-list-item lines="two">
				<!-- slot -> czyli miejsce w komponencie, ktore zostanie podmienione
				na to co tutaj wstawimy 
				list-item ma kilka slotow, jednym z nich jest prepened
				to jest wstawienie elementu z lewej strony przed napisem
				-->
				<template v-slot:prepend>
					<!-- my chcemy miec wstawiony z lewej strony komponent avatar
					ktory bedzie wystwietal pierwsza literke maila aktualnie zalogowanego
					uzytkownika, wyciagamy to z userStore, -->
					<v-avatar color="brand" v-if="userStore.$state.userData?.email">
						{{ userStore.$state.userData.email[0].toUpperCase() }}
					</v-avatar>
				</template>

				<template v-slot:append>
					<Notifications />
				</template>

				<!-- w analogiczny sposob mamy tutaj subkomponenty listItem 
				title i subtitle, one sa w odpowiedni sposob przestylowane w vuetify-->
				<VListItemTitle v-if="userStore.$state.userData?.email">{{
					userStore.$state.userData.email
				}}</VListItemTitle>
			</v-list-item>
			<VDivider></VDivider>

			<VList>
				<VListItem
					v-for="item in menuItems"
					:key="item.name"
					:title="item.name"
					:prepend-icon="item.icon"
					:to="item.url"
				></VListItem>
			</VList>

			<!-- -slot append powoduje, ze te elemnty pojawia sie na samym dole komponentyu
			block -> oznacza, ze ten przycisk bedzie miec cala szerokosc elementu, w ktorym
			sie znajduje

			-->
			<template v-slot:append>
				<div class="pa-2">
					<v-btn block variant="text" @click="logout" prepend-icon="mdi-logout">
						Wyloguj się
					</v-btn>
				</div>
			</template>
		</v-navigation-drawer>

		<v-main>
			<div class="pa-4">
				<NuxtPage v-if="userStore.$state.isLoggedIn === true && accountStore.$state.accountLoaded === true" />
			</div>
		</v-main>
		<LoginDialog></LoginDialog>
		<AccountDialog></AccountDialog>
		
	
		<!-- 
		to ref -> property, powoduje, ze mozna odwolac sie do konkretnej instancji tego komponentu
		w kodzie naszym
		// zeby to zrobic trzeba zdefiniowac sobie jeszcze ten reaktywny obiekt
		-->
		<ConfirmDialog ref="confirmDialog"></ConfirmDialog>
	</v-app>
</template>

<script setup>
// nazwa musi byc identyczna
const confirmDialog = ref(null);


const show = ref(false);

function openDialog() {
  show.value = true;
}

// to jest wlasnie composables
import { useDisplay } from "vuetify";
import { useTheme } from "vuetify";
import { useStorage } from "@vueuse/core";

// tworzymy obiekt, ktory uzywa tego composable
const theme = useTheme();
const { mobile } = useDisplay();
const currentTheme = useStorage("currentTheme", "light");
const drawer = ref(null);
// stala reaktywna, ktora
const userStore = useUserStore();
const accountStore = useAccountStore();
const antiForgeryStore = useAntiForgeryStore();


const menuItems = [
	{
		name: "Strona główna",
		icon: "mdi-home",
		url: "/",
	},
	{
		name: "Operacje",
		icon: "mdi-receipt-text-plus",
		url: "/transactions",
	},	
	{
		name: "Budżety",
		icon: "mdi-book-outline",
		url: "/budgets",
	},
	{
		name: "Kategorie",
		icon: "mdi-view-grid-plus-outline",
		url: "/categories",
	},
	{
		name: "Raporty",
		icon: "mdi-chart-line",
		url: "/reports",
	},
	{
		name: "Zarządzanie kontem",
		icon: "mdi-account-group",
		url: "/users",
	},
];

function toggleTheme() {
	// zmienne lokalne deklaruje się za pomocą let
	let newTheme = theme.global.current.value.dark ? "light" : "dark";

	theme.global.name.value = newTheme;

	currentTheme.value = newTheme;
}

// zmiana logout, zeby pokazywalo to okienko
const logout = () => {
	// mamy odwolanie do reaktywnej zmiennej confirmDialog, ktora jest powiazana
	// z naszym komponentem
	// dostajemy sie tutaj poprzez value ze skryptu
	// no i wolamy nasza funkcje show, ktora udostepnilismy przez defineExpose
	confirmDialog.value
		.show({
			title: "Potwierdź wylogowanie",
			text: "Czy na pewno chcesz się wylogować?",
			confirmBtnText: "Wyloguj",
			confirmBtnColor: "error",
			// podpinamy w funkcji then to co sie ma wydarzyc jak ktos sie wyloguje
			// jak wcisnie przycisk w tym okienku
			// ten kod bedzie wykonany pozniej, dopiero po tym jak cos sie zadzieje w okienku
			// dlatego uzylismy promise
			// cofirm -> parametr promise, czyli funcji resolve
			// on jest albo true albo false
		})
		.then((confirm) => {
			if (confirm) {
				userStore.logout();
			}
		});
};

// wywolanie requesta do API, ktore nam zaciagnie antifogry token i zapisze w storze

// odpalenie komponentu bedzie czekac az ta akcja sie wykona poprzez await
await antiForgeryStore.loadAntiForgeryToken();

const openAccountDialog = () => {
	accountStore.showAccountDialog = true;
}


onMounted(() => {
	theme.global.name.value = currentTheme.value;

	userStore.loadLoggedInUser();
});
</script>