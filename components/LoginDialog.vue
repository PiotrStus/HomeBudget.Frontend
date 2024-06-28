<!-- template to html komponentu -->
<template>
	<VDialog v-model="show" persistent width="400" scroll-strategy="none">
		<VCard class="py-4">
			<!-- VCardTitle -> tytul karty -->
			<VCardTitle class="text-center">Logowanie</VCardTitle>
			<!-- VForm -> formularz, ktory ma metode submit -->
			<!-- aktualnie jest zablokowana, po wyslaniu formularza domyslne zachowanie przegladarki
			zostanie zablokowane, czyli strona nie zostanie przeladowana
			to odpala taka metode z javascriptu na eventcie prevent default 
			blokuje domyslne zachowanie przegladarki na tym evencie -->
			<VForm @submit.prevent="submit">
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
					></v-text-field>
					<v-text-field
						class="mb-4"
						variant="outlined"
						v-model="viewModel.password"
						type="password"
						label="Hasło"
					></v-text-field>
				</VCardText>
				<VCardActions>
					<!-- "mx-auto" -> marginesy pionowe na auto, czyli bedzie wycentrowany -->
					<!-- eleveted" wyglad przycisku podniesniony -->

					<v-btn
						class="mx-auto"
						color="primary"
						type="submit"
						variant="elevated"
						>Zaloguj</v-btn
					>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>

<!-- aktualne style w sasie, css -->
<style lang="scss" scoped></style>

<!-- script logika działania komponentu -->
<script setup>
const show = ref(true);
// reaktywny obiekt o nazwie show
// czy okienko jest aktualnie wyswietlane czy nie

const viewModel = ref({
	email: "",
	password: "",
});

const submit = () => {
	console.log(viewModel.value);
}

</script>
