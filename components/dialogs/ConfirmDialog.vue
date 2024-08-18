<template>

<!-- 
absolute -> pojawia sie wzgledem ekranu a nie wzgledem elementu, w ktorym
ten komponent jest umieszczony
scroll-strateg -> pod spodem strona nie bedzie mogla byc scrollowana
-->
<v-dialog v-model="visible" width="500" absolute scroll-strategy="none">

    <v-card class="py-4">
        <v-card-title class="px-6 text-h5">
            <span>{{ viewModel.title }}</span>
        </v-card-title>

        <v-card-text>
            {{ viewModel.text }}
        </v-card-text>

        <v-card-actions class="pb-2 px-6">
            <v-spacer></v-spacer>
			<!-- 
			mamy dwie akcje,
			jedna jest anuluj
			po kliknieciu wywolywana funkcja cancel
			jak trwa akcja zapisywania to wylaczamy sobie ten przycisk
			-->
            <VBtn class="px-4" @click="cancel" :disabled="saving">
                Anuluj
            </VBtn>
			<!--
			kolor bierzemy z viewmodelu
			variant -> plaski przycisk
			po kliknieciu przycisk funkcja ok
			po kliknieciu jak trwa akcja ladowania to pokazemy takiego kreciolka
			tekst na przycisku z viewmodelu
			-->
            <VBtn :color="viewModel.confirmBtnColor" variant="flat" class="px-4" @click="ok" :loading="saving">
                {{ viewModel.confirmBtnText }}
            </VBtn>
        </v-card-actions>
    </v-card>
</v-dialog>

</template>

<script setup>
// tytul okienka
// tekst okienka
// napis na przycisku do potwierdzenia
// ustawianie koloru dla przycisku
const viewModel = ref({
    title: "",
    text: "",
    confirmBtnText: "",
    confirmBtnColor: "",
});


const defaultOptions = () => {
    return {
        title: "Potwierdź",
        text: "Czy na pewno?",
        confirmBtnText: "OK",
        confirmBtnColor: "primary",
      };
}


// aktualnie trwa akcja po nacisnieciu przycisku potwierdzenia 
const saving = ref(false);

// visible steruje widocznoscia
const visible = ref(false);


let promiseCallbacks = {};

// ona  w parametrze dostaje te opcje, ktore pozwalaja dostosowac wyglad tego okienka
const show = (options) => {
	// nastepnie ustala widocznosc tego okienka
    visible.value = true
	// do viewmodelu przypisuje na poczatku domyslnie opcje, nastepnie nadpisuje tymi, ktore przyjda jako argument
    // ... bierze je tak jakby one tu byly wypisane pojedynczo
	// czyli najpierw defaultOptions(), potem jak sa kolejne to ...options nadpisuje te poprzednie
	viewModel.value = {...defaultOptions(), ...options}

	// zwracamy Promise, cos takiego jak opoznione wywolanie pewnej funkcji
	// on rejestruje dwa callbackie, ktore potem mozna wywolac
	// i na tym Promise mozna wywolac metody than, finally i chyba catch
	// sa wykorzystywane przy requestach, asynchronicznych wywolaniach
	// chodzi o to, ze mozna sobie podpiac taka metode then, ktora wykona sie asynchronicznie pozniej
	// nie w momencie wykonywania kodu
	// wykona sie kiedy uruchomimy metode resolve w tym komponencie

	// w skrocie metoda show zwroci nam Promise
	// ktory mozemy podpiac sie funkcja then i funkcja then zostanie wykonanana, kiedy wywolamy funkcje resolve
    // jesli wykonana metoda reject to bedzie wykonac catch i tak mozemy odrzucac promisa
	return new Promise((resolve, reject) => {
        promiseCallbacks = { resolve, reject };
    });
}


// po klikniecu ok ustawiamy saving na true
const ok = () => {
    saving.value = true;
	// jesli resolve jest ustawione to wolamy funkcje resolve
    if (promiseCallbacks?.resolve) {
		// tutaj mozemy przekazac parametr, ktory pozniej funkcji then, ktora pozniej podepniemy
		// pod naszego promise mozemy sobie odczytac

		// klikamy ok, robimy resolve i zwracamy true
        promiseCallbacks.resolve(true);
    }
	// ustawiamy saving na false
    saving.value = false;
	// zamykamy okienko
    close();
}

const cancel = () => {
	// czyli tak samo zadziala funkcja then podpieta pod naszego promise
    if (promiseCallbacks?.resolve) {
		// natomiast w parametrze zwracamy false
		// to znaczy, ze nie potwierdzono danej operacji
        promiseCallbacks.resolve(false);
    }
    close();
}

const close = () => {
	// zamykamy okienko poprzez ustawienie visible na false
    visible.value = false;
}

defineExpose({
    show
});

</script>