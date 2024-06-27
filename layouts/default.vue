<template>
	<v-app>
		<v-app-bar color="brand">
			<v-app-bar-nav-icon
				v-if="mobile"
				@click="drawer = !drawer"
			></v-app-bar-nav-icon>

			<v-app-bar-title>Page Monitor</v-app-bar-title>

			<v-spacer></v-spacer>
			<VBtn
				icon="mdi-theme-light-dark"
				title="Przełącz motyw"
				@click="toggleTheme"
			></VBtn>
		</v-app-bar>

		<!-- MENU -->
		<v-navigation-drawer :order="mobile ? -1 : 0" v-model="drawer">
			<VList>
				<VListItem
					v-for="item in menuItems"
					:key="item.name"
					:title="item.name"
					:prepend-icon="item.icon"
					:to="item.url"
				></VListItem>
			</VList>
		</v-navigation-drawer>

		<v-main>
			<div class="pa-4">
				<NuxtPage />
			</div>
		</v-main>
	</v-app>
</template>

<script setup>
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


const menuItems = [
	{
		name: "Strona główna",
		icon: "mdi-home",
		url: "/",
	},
	{
		name: "Monitorowane strony",
		icon: "mdi-web-check",
		url: "/urls",
	},
];

function toggleTheme() {
	// zmienne lokalne deklaruje się za pomocą let
	let newTheme = theme.global.current.value.dark ? "light" : "dark";

	theme.global.name.value = newTheme;

	currentTheme.value = newTheme;
}

// w moemncie kiedy komponent jest podlaczany do drzewa i wyswietlany
onMounted( () => {
	// czyli przypisujemy wartosc czytana z local storage
	theme.global.name.value = currentTheme.value;
	userStore.loadLoggedInUser();
});

</script>
