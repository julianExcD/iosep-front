import Default from '@/shared/ui/layouts/Default.vue'
import HomeView from './views/Home.vue'
import { type RouteRecordRaw } from 'vue-router'

const meta = { requiresAuth: true }

const route: RouteRecordRaw = {
  path: '/',
  component: Default,
  children: [
    { path: '', redirect: 'home' },
    { path: 'home', meta: { ...meta, title: 'Inicio', system: 'IOSEP' }, component: HomeView },
  ],
}

export default route
