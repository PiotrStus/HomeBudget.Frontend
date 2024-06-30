<template>
	<!-- 
	align-center justify-center -> centrowanie poziome i pionowe
	fill-height -> 100% wysokosci diva
	d-flex flexbox 
	-->
<div class="d-flex align-center justify-center fill-height">
        <VCard width="600">
			<!-- tytul do rejestracji -->
            <VCardTitle>Zarejestruj się</VCardTitle>

			<!-- formularz -->

            <VForm @submit.prevent="submit" :disabled="loading">
                <VCardText>
					<!--
					pole tekstowe na email 
					:rules="[ruleRequired, ruleEmail] -> sprawdzanie poprawnosci maila
					v-model="viewModel.email" -> bindowanie do view modelu
					-->
                    <v-text-field class="mb-4" :rules="[ruleRequired, ruleEmail]" variant="outlined"
                        v-model="viewModel.email" label="Email"></v-text-field>
                    <v-text-field class="mb-4" :rules="[ruleRequired]" variant="outlined" v-model="viewModel.password"
                        type="password" label="Hasło"></v-text-field>
                    <v-text-field class="mb-4" :rules="[ruleRequired, rules.samePassword]" variant="outlined"
                        type="password" label="Powtórz hasło"></v-text-field>

						<!-- miejsce na blad -->
                    <VAlert v-if="errorMsg" type="error" variant="tonal">{{ errorMsg }}</VAlert>
                </VCardText>

				<!-- 
				type="submit" -> wywołuje @submit.prevent="submit"  
				:loading="loading" -> jak request leci to wyswietla kreciolek
				-->
                <VCardActions class="justify-center">
                    <v-btn color="primary" type="submit" variant="elevated" :loading="loading">Utwórz konto</v-btn>
                </VCardActions>

            </VForm>


        </VCard>
    </div>
</template>

<style lang="scss" scoped>

</style>

<script setup>

const globalMessageStore = useGlobalMessageStore();

// layout dla tej strony
// funkcja pomocnicza definePageMeta
// ona jest z Nuxta
definePageMeta({
    layout: "no-auth",
});

const viewModel = ref({
	email: "",
	password: "",
});


// funkcja pomocnicze do wyciagania bledow
const { getErrorMessage } = useWebApiResponseParser();
// reguly walidacji
const { ruleRequired, ruleEmail } = useFormValidationRules();
// nowa rzecz -> composable, pozwala nam ze skryptu przejsc na inna strone,
// uzyjemy go, aby po zalogowaniu przejsc na glowna strone aplikacji
const router = useRouter();

// bedziemy jeszcze potrzebowac wlasnej reguly walidacji, specyficznej dla tej strony

// wiadomosc z bledem
const errorMsg = ref("");
// informacja, ze trwa wlasnie wysylanie requesta do rejestracji po nasciscnieu submit
const loading = ref(false);

const rules = {
	// samePassowrd -> pole z powtozeniem hasla
	// viewModel.value.password  -> zbindowane dwukierunkowo do pola tekstowego z haslem
	// porownwjemy pole z powtozonym haslem z polem z haslem
	// robimy to tylko po stronie frontendu, po stronie API tego nie trzeba robic
	// bo my to w zasadzie robimy tylko po to, zeby uzytkownik sie nie pomylil
	// bo moglby zarejestowac konto z haslem, ktore przez przypadek podal zle
	// a jak ktos pusci request postmanem to nic strasznego, wie co robi
	samePassword: (v) => v === viewModel.value.password || 'Hasła różnią się od siebie',
}

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		register();
	}
}

const register = () => {
	loading.value = true;
	errorMsg.value = "";
	console.log(viewModel)
	// strzela pod inny adres w naszym api
	useWebApiFetch('/User/CreateUserWithAccount', {
		method: 'POST',
		body: { ...viewModel.value },

		onResponseError: ({ response}) => {
		errorMsg.value = getErrorMessage(response, {"AccountWithThisEmailAlreadyExists": "Konto z tym adresem email juz istnieje"});
		}
		})
		.then((response) => {
			if (response.data.value) {
				globalMessageStore.showSuccessMessage('Twoje konto zostało utworzone. Zalogowano do aplikacji.');
				router.push({ path: '/' });
			}
	})
	.finally(() => {
		loading.value = false;
	});
};


</script>