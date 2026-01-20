// myPreset.ts
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      0: '#ffffff',
      50: '#EEF5FF',
      100: '#DCEAFF',
      200: '#B9D6FF',
      300: '#87B7F0',
      400: '#4D8FD6',
      500: '#0C599E',
      600: '#0F4196',
      700: '#13248D',
      800: '#0B1E63',
      900: '#06133D',
      950: '#030A20',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
        },
        text: {
          color: '#1F2933',
          secondaryColor: '#6B7280',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E5E7EB',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1F2933',
          900: '#111827',
          950: '#0B1220',
        },
        formField: {
          hoverBorderColor: '{primary.color}',
        },
      },
      dark: {
        primary: {
          color: '{primary.300}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.200}',
        },
        text: {
          color: '#F8FAFC',
          secondaryColor: '#94A3B8',
        },
        surface: {
          0: '#0B1220',
          50: '#0F172A',
          100: '#111827',
          200: '#1F2933',
          300: '#27303B',
          400: '#334155',
          500: '#475569',
          600: '#64748B',
          700: '#94A3B8',
          800: '#CBD5E1',
          900: '#E5E7EB',
          950: '#F8FAFC',
        },
        formField: {
          hoverBorderColor: '{primary.color}',
        },
      },
    },
  },
})

export default MyPreset
