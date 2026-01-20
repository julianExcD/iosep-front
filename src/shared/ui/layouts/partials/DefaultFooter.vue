<template>
  <footer class="mt-auto w-full border-t border-slate-200 bg-white/80 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center md:flex-row md:px-6 md:text-left">
      <span>{{ username }}</span>
      <span>@{{ year }} - Excelencia Digital Software</span>
    </div>
  </footer>
</template>

<script setup>
  import { ref } from 'vue';

  const username = ref(localStorage.getItem('user'))
  const year = ref(new Date().getFullYear())
</script>
