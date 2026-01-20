import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalizedGeneric,
  type RouteRecordRaw,
} from 'vue-router'

import HomeRoute from '@/features/home/routes'
import LoginRoute from '@/features/auth/login/routes'
import CtaCteRoute from '@/features/iosepsalud/ctacte/route'

const routes: RouteRecordRaw[] = [
  { ...LoginRoute },
  { ...HomeRoute },
  { ...CtaCteRoute },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'router-link-active',
  routes,
})

const inferSystem = (path: string): string => {
  if (path.startsWith('/siscred')) {
    return 'Sistema de Creditos'
  }
  if (path.startsWith('/iosepsalud')) {
    return 'Iosep Salud'
  }
  return 'IOSEP'
}

const updateFavicon = (system: string) => {
  const link = document.getElementById('app-favicon') as HTMLLinkElement | null
  if (!link) {
    return
  }
  link.href = system === 'Sistema de Creditos' ? '/iosep/favicon-siscred.ico' : '/iosep/favicon-iosep.ico'
  link.type = 'image/png'
}

router.beforeEach(
  async (
    to: RouteLocationNormalizedGeneric,
    __: RouteLocationNormalizedGeneric,
    next: NavigationGuardNext
  ): Promise<void> => {
    const isAuthenticated = !!localStorage.getItem('token')

    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
    const requiresGuest = to.matched.some((r) => r.meta.requiresGuest)

    if (requiresAuth && !isAuthenticated) {
      const redirectQuery = to.path !== '/login' ? { query: { redirect: to.fullPath } } : {}
      next({ path: '/login', ...redirectQuery })
      return
    }

    if (requiresGuest && isAuthenticated) {
      next({ path: '/home' })
      return
    }

    next()
  }
)

router.afterEach((to) => {
  const routeTitle =
    (to.meta?.title as string | undefined) ||
    (typeof to.name === 'string' ? to.name : undefined) ||
    'Inicio'
  const system = (to.meta?.system as string | undefined) || inferSystem(to.path)
  document.title = `${routeTitle} - ${system}`
  updateFavicon(system)
})

export default router
