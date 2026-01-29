import type { RouteRecordRaw } from 'vue-router'

import Default from '@/app/layout/Default.vue'
import DashboardView from './views/Dashboard.vue'

const meta = { requiresAuth: false }

const route: RouteRecordRaw = {
  path: '/dashboard',
  component: Default,
  children: [{ path: '', meta, component: DashboardView }],
}

export default route

