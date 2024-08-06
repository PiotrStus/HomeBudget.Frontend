<template>
	<v-app>
		<v-app-bar color="brand">
			<v-app-bar-nav-icon
				v-if="mobile"
				@click="drawer = !drawer"
			></v-app-bar-nav-icon>

			<v-app-bar-title>Budżet domowy</v-app-bar-title>

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
			v-if="userStore.$state.isLoggedIn === true"
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
				<!-- w analogiczny sposob mamy tutaj subkomponenty listItem 
				title i subtitle, one sa w odpowiedni sposob przestylowane w vuetify-->
				<VListItemTitle v-if="accountStore.$state.accountData?.name">{{
					accountStore.$state.accountData.name
				}}</VListItemTitle>
				<VListItemSubtitle v-if="userStore.$state.userData?.email">{{
					userStore.$state.userData.email
				}}</VListItemSubtitle>
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
				<NuxtPage v-if="userStore.$state.isLoggedIn === true" />
			</div>
		</v-main>
		<LoginDialog></LoginDialog>
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
		name: "Kategorie",
		icon: "mdi-view-grid-plus-outline",
		url: "/categories",
	},
	{
		name: "Planowany budżet",
		icon: "mdi-receipt-clock-outline",
		url: "/categories/planned",
	},
	{
		name: "Operacje",
		icon: "mdi-receipt-text-plus",
		url: "/transactions",
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
    confirmDialog.value.show({
        title: 'Potwierdź wylogowanie',
        text: 'Czy na pewno chcesz się wylogować?',
        confirmBtnText: 'Wyloguj',
        confirmBtnColor: 'error'
		// podpinamy w funkcji then to co sie ma wydarzyc jak ktos sie wyloguje
		// jak wcisnie przycisk w tym okienku
		// ten kod bedzie wykonany pozniej, dopiero po tym jak cos sie zadzieje w okienku
		// dlatego uzylismy promise
		// cofirm -> parametr promise, czyli funcji resolve
		// on jest albo true albo false
    }).then((confirm) => {
        if (confirm) {
            userStore.logout();
        }
    })
}

// wywolanie requesta do API, ktore nam zaciagnie antifogry token i zapisze w storze


// odpalenie komponentu bedzie czekac az ta akcja sie wykona poprzez await
await antiForgeryStore.loadAntiForgeryToken();


// w moemncie kiedy komponent jest podlaczany do drzewa i wyswietlany
onMounted(() => {
	// czyli przypisujemy wartosc czytana z local storage
	theme.global.name.value = currentTheme.value;
	userStore.loadLoggedInUser();
});
</script>
