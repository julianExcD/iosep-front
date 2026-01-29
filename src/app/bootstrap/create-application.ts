import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'

import AppShell from '@/app/layout/AppShell.vue'
import router from '@/app/router'
import { registerAppProviders } from '@/app/providers'

import { primeVueConfig } from './primevue/primevue-config'

export function createApplication(): VueApp {
  const app = createApp(AppShell)

  app.use(createPinia())
  app.use(router)
  app.use(PrimeVue, primeVueConfig)
  registerAppProviders(app)

  return app
}

