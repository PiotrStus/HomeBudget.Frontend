<!-- template to html komponentu -->
<template>
	<VDialog :model-value="show" persistent width="400" scroll-strategy="none">
		<VCard class="py-4">
			<!-- VCardTitle -> tytul karty -->
			<VCardTitle class="text-center">Logowanie</VCardTitle>
			<!-- VForm -> formularz, ktory ma metode submit -->
			<!-- aktualnie jest zablokowana, po wyslaniu formularza domyslne zachowanie przegladarki
			zostanie zablokowane, czyli strona nie zostanie przeladowana
			to odpala taka metode z javascriptu na eventcie prevent default 
			blokuje domyslne zachowanie przegladarki na tym evencie -->

			<div v-if="userStore.$state.loading === true" class="pa-4 d-flex justify-center">
    			<VProgressCircular indeterminate></VProgressCircular>
			</div>

			<VForm v-else @submit.prevent="submit" :disabled="loading">
				<!-- VCardText -> dodaje odpowiednie odstepy przestrzen w karcie -->
				<VCardText>
					<!-- v-text-field -> dwa pola tekstowe -->
					<!-- class="mb-4" -> margines na dole 4-->
					<!-- v-model -> dziala automatycznie w dwie strony
					czyli jesli zmienimy cokolwiek z kodu to w textboxie sie zmieni i na odwrot  -->
					<v-text-field
						class="mb-4"
						variant="outlined"
						v-model="viewModel.email"
						label="Email"
						:rules="[ruleEmail, ruleRequired]"
					></v-text-field>
					<!-- :rules -> mozna podac tablice regul, ktore beda przypisane i beda odpalane przy walidacji tego pola -->
					<v-text-field
						class="mb-4"
						variant="outlined"
						v-model="viewModel.password"
						type="password"
						label="Hasło"
						:rules="[ruleRequired]"
					></v-text-field>
					<VAlert v-if="errorMsg" type="error" variant="tonal">{{ errorMsg }}</VAlert>
				</VCardText>
				<VCardActions>
					<!-- "mx-auto" -> marginesy pionowe na auto, czyli bedzie wycentrowany -->
					<!-- eleveted" wyglad przycisku podniesniony -->

					<v-btn
						class="mx-auto"
						color="primary"
						type="submit"
						variant="elevated"
						:loading="loading"
						>Zaloguj</v-btn
					>
				</VCardActions>

				<VCardText class="text-caption text-center">Nie masz konta? <NuxtLink to="/register">Zarejestruj się</NuxtLink></VCardText>
			</VForm>
		</VCard>
	</VDialog>
</template>

<!-- aktualne style w sasie, css -->
<style lang="scss" scoped></style>

<!-- script logika działania komponentu -->
<script setup>
const userStore = useUserStore();

// wciagamy ta funkcje
// ona zwraca obiekt, ktory ma rozne funkcje i my bierzemy ta
const { getErrorMessage } = useWebApiResponseParser();
const { ruleRequired, ruleEmail } = useFormValidationRules();

const show = computed(() => {
    return userStore.$state.isLoggedIn === false || userStore.$state.loading === true;
});

// wiadomosc z bledem
const errorMsg = ref("");
// informacja, ze trwa wlasnie wysylanie requesta do logowania po nasciscnieu submit
const loading = ref(false);

const viewModel = ref({
	email: "",
	password: "",
});


// const submit = () => {
// 	console.log(viewModel.value);
// }

// ona jest asynchroniczna 
// ev -> event
// ten event zwraca obiekt, i jeden z jego properties jest valid
const submit = async (ev) => {
    const { valid } = await ev;
    if (valid) {
        login();
    }
	// a jesli nie to walidacja autoamtycznie wyswietli te komuinikaty bledow
}

const login = () => {  

    loading.value = true;
    errorMsg.value = "";
	const messageMap = {
        "InvalidLoginOrPassword": "Błędny login lub hasło",
		"UserNotConfirmed": "Konto nieaktywne. Sprawdź swoją skrzynkę e-mail"
    };
    useWebApiFetch('/User/Login', {
      method: 'POST',
	  // jesli dodamy ... obiekt traci swoja reaktynwosc i sa czyste properties w tym obiekcie
      body: { ...viewModel.value },
	  // nadpisujemy funkcje do bledow
      onResponseError: ({ response }) => {
		// zamiast tego
        //errorMsg.value = "Błąd logowania";
		// robimy to
		// czyli z kodu serwera -> ErrorException("InvalidLoginOrPassword")
		// to jest zlapane w Exception Viewerze i potem w JSONie
		errorMsg.value = getErrorMessage(response, messageMap);
      }
    })
	// jesli request sie uda i nie ma bledow
	// sprwadzamy czy w odpowieidzy mamy dane i ze stora wywolujemy akcje 
	// pobierz dane o zalogowanym uzytkowniku
	// po zalogowaniu dostajemy token 
    .then((response) => {
        if (response.data.value) {
			// tutaj udalo nam sie zalogowac
			// my sobie to haslo wyczyscimy
			viewModel.value.password = '';

            userStore.loadLoggedInUser();
        }
    })
    .finally(() => {
        loading.value = false;
    });
};

</script>
