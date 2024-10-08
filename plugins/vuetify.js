import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import colors from "vuetify/util/colors";
import { pl } from 'vuetify/locale'



export default defineNuxtPlugin((app) => {
	const vuetify = createVuetify({
		locale: {
			locale: 'pl',
			messages: { pl },
		},
		defaults: {
			global: {},
			VList: {},
		},
		theme: {
			defaultTheme: "light",
			themes: {
				light: {
					colors: {
						brand: colors.lightBlue.lighten4,
						//surface: colors.red.base,
					},
				},
				dark: {
					colors: {
						brand: colors.purple.darken4,
					},
				},
			},
		},
	});
	app.vueApp.use(vuetify);
});
