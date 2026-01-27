<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
    <nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
      <router-link to="/home" class="group flex items-center gap-3">
        <img
          :src="logoIosep"
          alt="IOSEP"
          class="h-12 w-12 rounded-2xl border border-slate-200 transition group-hover:-translate-y-0.5 group-hover:shadow-md dark:border-slate-700"
        />
        <div class="text-left">
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">IOSEP</p>
        </div>
      </router-link>

      <div class="flex items-center gap-2">
        <Button
          severity="secondary"
          text
          rounded
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          aria-label="Cambiar tema"
          class="text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
          @click="toggleTheme"
        />
        <Button
          severity="secondary"
          text
          rounded
          :icon="isMenuOpen ? 'pi pi-times' : 'pi pi-bars'"
          aria-label="Abrir menu"
          class="md:hidden text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
          @click="toggleMenu"
        />
      </div>
    </nav>

    <Drawer
      v-model:visible="isMenuOpen"
      position="right"
      class="w-full sm:w-80 md:hidden"
      :blockScroll="true"
      :pt="{
        mask: { class: 'backdrop-blur-sm bg-slate-900/40 dark:bg-slate-950/70' },
        root: { class: 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100' },
        header: { class: 'border-b border-slate-200 dark:border-slate-700' },
        content: { class: 'bg-red text-slate-900 dark:bg-slate-900 dark:text-slate-100' },
        footer: { class: 'border-t border-slate-200 dark:border-slate-700' },
        pcCloseButton: { class: 'text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white' }
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ user }}</span>
        </div>
      </template>
      <div class="flex h-full flex-col gap-6">
        <div class="flex flex-1 flex-col gap-2">
          <router-link
            to="/home"
            :class="navLinkClass('/home')"
            @click="closeMenu"
          >
            Inicio
          </router-link>
          <router-link
            to="/iosepsalud/ctacte"
            :class="navLinkClass('/iosepsalud/ctacte')"
            @click="closeMenu"
          >
            Cuenta Corriente
          </router-link>
        </div>

      </div>
      <template #footer>
        <Button severity="danger" label="Cerrar sesion" @click="handleLogout" class="w-full"/>
      </template>
    </Drawer>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import { useLoginStore } from '@/features/auth/login/store/login.store';
import logoIosep from '@/assets/logos-iosep/logo2.png'

const route = useRoute();
const router = useRouter();
const loginStore = useLoginStore();
const isMenuOpen = ref(false);
const isDark = ref(false);
const user = ref(localStorage.getItem('user'))

const storedTheme = computed(() => localStorage.getItem('theme'));

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const setInitialTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = storedTheme.value;
  isDark.value = saved ? saved === 'dark' : prefersDark;
  applyTheme();
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme();
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const navLinkClass = (path: string) => {
  const base = 'rounded-xl px-4 py-3 text-sm font-semibold transition';
  const isActive = route.path === path;
  if (isActive) {
    return `${base} bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200`;
  }
  return `${base} text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800`;
};

const handleLogout = () => {
  loginStore.logout();
  closeMenu();
  router.push('/login');
};

onMounted(() => {
  setInitialTheme();
});

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  }
);
</script>
