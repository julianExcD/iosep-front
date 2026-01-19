import Default from '@/shared/ui/layouts/Default.vue'
import HomeView from './views/Home.vue'
import { type RouteRecordRaw } from 'vue-router'

const meta = { requiresAuth: false }

const route: RouteRecordRaw = {
  path: '/',
  component: Default,
  children: [
    { path: '', redirect: 'home' },
    { path: 'home', meta, component: HomeView },
  ],
}

export default route
