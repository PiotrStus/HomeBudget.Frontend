<template>
	<!--
	uzywamy snackabara z vuetify
	-->
    <v-snackbar v-model="visible" :color="color">
        {{ currentMessage?.text }}

		<!--
		jesli ktos kliknie ok to visible false
		-->
        <template v-slot:actions>
            <v-btn variant="text" @click="visible = false">
                OK
            </v-btn>
        </template>
    </v-snackbar>
</template>


<script setup>

const visible = ref(false);

const globalMessageStore = useGlobalMessageStore();

// subscribe
// pozwala na podpiecie sie i wykonanie jakies akcji
// jesli nasz state jest modyfikowany
// niewazne przez co

// wiadomosc ustawiamy przez store
// jesli ustawimy ta wiadomosc to ta funkcja sie odpali
globalMessageStore.$subscribe((mutation, state) => {    
    if (state.message && state.message.text) {
		// najpierw ustawiamy na false
        visible.value = false;
		// jesli ma kilka zmian w jednej akcji, ktora sie dzieje to Vue
		// sobie te zmiany buforuje i odswieza nasz interfejs w przegladarce
		// dopiero po przejsciu wszystkich zmian
		// czyli np. jesli najpierw ustawimy na true a potem na false a od niej
		// zalezy np. wyswietlanie elemntow to tylko ta ostatnia zmiana sie liczy
		// nie bedzie tych wszystkich posrednich krokow
		// mozemy ta funkcja odlozyc wykonanie jakies zmian w danych do etapu
		// jesli juz nastapi odswiezenie interfejsu i dopiero pozniej nastapi kolejne
		// odswiezenie interfejsu
		// czyli najpierw ustawiamy visible.value = false, interfejs sie odswiezy
		// i dopiero przy nastepnym odswiezeniu interfejsu ustawi sie na true
		// robimy to po to, bo przy pokazywaniu tego snackbara, przy ustawianiu
		// visible na true jest animacja, wiec my sobie najpierw ustawiamy ja na false
		// a potem na true, nawet jesli jakis komunikat jest ustawiony na ekranie
		// a potem pojawia sie kolejny, zeby ten kolejny mial taka animacje wejscia
		// to jest tylko po to
        nextTick(() => {
            visible.value = true;
        });
    }
})

// reaktywny wyliczany obiekt z tekstem wiadomosci
// wylicza na podstawie danych reaktywnych z innych miejsc
// jakas wartosc reaktywna
// czyli jesli w globalmessagestore &state sie zmieni to automatycznie
// currentMessage tez sie zmienia i wszystko co od tego zalezy tez sie zmienia
// czyli na gorze np.   {{ currentMessage?.text }} w snackbarze
const currentMessage = computed(() => {
    return globalMessageStore.$state.message;
});


// kolor wyliczany dynamicznie
const color = computed(() => {
    if (currentMessage.value?.type === 'Success') {
		// kolor success kolor z motywu naszego najczesciej zielony, mozna dostosowac
        return "success"
    } else if (currentMessage.value?.type === 'Error') {
        return "error"
    } else {
        return "primary";
    }
});

</script>