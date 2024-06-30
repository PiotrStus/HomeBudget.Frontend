import { defineStore } from 'pinia'

export const useGlobalMessageStore = defineStore({
  id: 'global-message-store',
  // w state trzymamy wiadomosc, ktora chcemy wyswietlic
  state: () => {
    return {
      message : null
    }
  },
  // w akcji mamy akcje:
  // showMessage -> wiadomosc, ktora chcemy zeby byla wyswietlona
  // w tym message bedzie obiekt z tekstem i typem wiadomosci
  actions: {
    showMessage(data) {
      this.message = data;
    },

	// pomocnicze akcje
    showErrorMessage(text) {
      this.showMessage({
        text : text,
        type : 'Error',
      })
    },

    showSuccessMessage(text) {
      this.showMessage({
        text : text,
        type : 'Success',
      })
    },
  }
})