import { defineStore } from 'pinia'

export const useAntiForgeryStore = defineStore({
    id: 'antiforgery-store',
    state: () => {
        return {
            token: null,
        }
    },
    actions: {
		// tylko jedna akcja
		// ktora bedzie ladowac z API
		// nasz token ustawiony przez frameworka i zapisywal
		// w naszym state
		// w kontrolerze User juz jest taka akcja
		// ktora uzywa wbudowanego interfejsu w frameworka i metody GetAndStoreTokens
		// ta metoda powoduje zapisanie tego tokena w ciastku i zwrocenie
		// go w responsie oraz zwrocenie go jako wartosc, ktora zwracamy w requescie
		// no i my ta wartosc bedziemy przesylac z frontu do naszego API
		// a API aplikacji przez ten mechanizm wbudowany we framework porowna ten token
		// zapisany w ciastku z tym wysylanym
		// jesli on sie zgadza to request bedzie przechodzil
        // koniec
        async loadAntiForgeryToken() {
            await useWebApiFetch('/User/AntiforgeryToken')
                .then(({ data, error }) => {
                    if (data.value) {
                        this.token = data.value;
                    } else if (error.value) {
                        this.token = null;
                    } 
                });
        },
    }
})