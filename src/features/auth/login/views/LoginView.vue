<template>
  <section class="login-shell flex min-h-full w-full justify-center items-center">
    <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/90 md:p-10">
      <div class="flex items-center gap-4">
        <img :src="logoIosep" alt="IOSEP" class="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700" />
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">IOSEP</h1>
          <p class="text-sm text-slate-500 dark:text-slate-300">Instituto de Obra Social del Empleado Provincial</p>
        </div>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Usuario</label>
          <InputText v-model="store.username" class="mt-2 w-full" placeholder="usuario@iosepsalud" />
        </div>

        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Contraseña</label>
          <Password
            v-model="store.password"
            class="mt-2 w-full"
            :feedback="false"
            toggleMask
            inputClass="w-full"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div class="flex items-center gap-2">
            <Checkbox v-model="store.rememberMe" binary inputId="remember" />
            <label for="remember">Recordarme</label>
          </div>
          <Button label="Olvide mi clave" link class="p-0 text-sm font-semibold text-sky-600 dark:text-sky-300" />
        </div>

        <div v-if="store.error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-200">
          {{ store.error }}
        </div>

        <Button
          type="submit"
          label="Ingresar"
          class="w-full"
          :loading="store.loading"
        />
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useLoginStore } from '../store/login.store'
import logoIosep from '@/assets/logos-iosep/logo2.png'
import { useRouter } from 'vue-router'

const store = useLoginStore()
const router = useRouter()

onMounted(() => {
  store.hydrate()
})

const handleLogin = async () => {
  await store.login()

  router.push({ path: '/home' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

.login-shell {
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
}
</style>
