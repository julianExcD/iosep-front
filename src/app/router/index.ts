import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalizedGeneric,
  type RouteRecordRaw,
} from 'vue-router'

import HomeRoute from '@/features/home/routes'

const routes: RouteRecordRaw[] = [
  { ...HomeRoute },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'router-link-active',
  routes,
})

router.beforeEach(
  async (
    __: RouteLocationNormalizedGeneric,
    _: RouteLocationNormalizedGeneric,
    next: NavigationGuardNext
  ): Promise<void> => {
    // const isAuthenticated = !!localStorage.getItem('token')
    //
    // // Guarda la ruta original para redirección post-login
    // const redirectQuery = to.path !== '/auth/login' ? { query: { redirect: to.path } } : {}
    //
    // // Ruta requiere autenticación
    // if (to.matched.some((r) => r.meta.requiresAuth)) {
    //   if (!isAuthenticated) {
    //     // Usuario no autenticado intentando acceder a ruta protegida
    //     next({
    //       path: '/auth/login',
    //       ...redirectQuery,
    //     })
    //     return
    //   }
    // }

    // Ruta requiere guest (usuario no autenticado)
    // if (to.matched.some((r) => r.meta.requiresGuest)) {
    //   if (isAuthenticated) {
    //     next({ path: '/home' })
    //     return
    //   }
    // }

    // En cualquier otro caso, permite la navegación
    next()
  }
)

export default router
