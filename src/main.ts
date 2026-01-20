import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './app/styles/main.css'
import App from './App.vue'
import router from './app/router/index'

// PrimeVue Configuration
import PrimeVue from 'primevue/config'
import MyPreset from './app/config/myPreset.ts'
import { localeOptions } from './app/config/primevue-locale.ts'
import 'primeicons/primeicons.css'

// PrimeVue Services
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Create Vue application instance
const app = createApp(App)
const pinia = createPinia()

// Configure PrimeVue
const primeVueConfig = {
  ripple: true,
  locale: localeOptions,
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: false,
    },
  },
}

// Register plugins
app.use(pinia)
app.use(router)
app.use(PrimeVue, primeVueConfig)

// Register PrimeVue services
app.use(ToastService)
app.use(ConfirmationService)

// Mount application
app.mount('#app')
