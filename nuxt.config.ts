import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      BASE_URL: 'http://localhost:5263', //replace with ENV: NUXT_PUBLIC_BASE_URL 
      // ta zmienna srodowiskowa sie przyda, gdy bedziemy buildowac i wdrazac ta aplikacje
      // na jakis serwer, wtedy na ten adres localhost nie zadziala, natomiast w tej zmiennej
      // wpiszemy sobie publiczny adres naszego API
    },
  },
  devtools: {enabled: false},
  devServer: {
    host: '0.0.0.0',
  },
  ssr: false,
  build: {
    transpile: ['vuetify'],
  },

  components: [
    { path: '~/components/dialogs' },

    '~/components'
  ],

  imports: {
    dirs: ['stores'],
  },
  


  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@pinia/nuxt',
     '@vueuse/nuxt',
     'nuxt-lodash',
     'dayjs-nuxt'
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  lodash: {
    prefix: "_",
    prefixSkip: false,
    upperAfterPrefix: false,
  },
  dayjs: {
    locales: ['en','pl'],
    plugins: ['customParseFormat'],
    defaultLocale: 'pl'
  },
})