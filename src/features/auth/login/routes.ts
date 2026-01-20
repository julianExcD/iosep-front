import Empty from '@/shared/ui/layouts/Empty.vue'
import type { RouteRecordRaw } from 'vue-router'
import LoginView from './views/LoginView.vue'

const route: RouteRecordRaw = {
  path: '/auth',
  component: Empty,
  children: [
    {
      path: '/login',
      name: 'Login',
      meta: { title: 'Login', system: 'IOSEP', requiresAuth: false },
      component: LoginView,
    },
  ],
}

export default route
