import MyPreset from './myPreset'
import { localeOptions } from './primevue-locale'

export const primeVueConfig = {
  ripple: true,
  locale: localeOptions,
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: false,
      cssLayer: false,
    },
  },
}

