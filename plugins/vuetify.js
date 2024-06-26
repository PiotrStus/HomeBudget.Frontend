import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ... your configuration
	// tutaj będziemy dodawać naszą konfiguracje biblioteki vuetify
	// jakies globalne ustawienia dla wszystkich komponentow
  })
  app.vueApp.use(vuetify)
})