import Default from '@/shared/ui/layouts/Default.vue'
import { type RouteRecordRaw } from 'vue-router'
import CtaCteView from './CtaCteView.vue'

const meta = { requiresAuth: true, system: 'Iosep Salud' }

const route: RouteRecordRaw = {
  path: '/iosepsalud',
  name: 'CtaCte',
  component: Default,
  meta,
  children: [
    { path: 'ctacte', meta: { ...meta, title: 'Cuenta Corriente' }, component: CtaCteView },
  ],
}

export default route
