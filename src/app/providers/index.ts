import type { App as VueApp } from 'vue'

import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

export function registerAppProviders(app: VueApp): void {
  app.use(ToastService)
  app.use(ConfirmationService)
}

