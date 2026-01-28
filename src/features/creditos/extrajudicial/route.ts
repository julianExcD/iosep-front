import Default from '@/shared/ui/layouts/Default.vue'
import { type RouteRecordRaw } from 'vue-router'
import Extrajudicial from './presentation/views/Extrajudicial.vue'

const meta = { requiresAuth: true, system: 'Sistema de Creditos' }

const route: RouteRecordRaw = {
  path: '/creditos',
  name: 'Creditos',
  component: Default,
  meta,
  children: [
    { path: 'extrajudicial', meta: { ...meta, title: 'Extrajudicial' }, component: Extrajudicial },
  ],
}

export default route
