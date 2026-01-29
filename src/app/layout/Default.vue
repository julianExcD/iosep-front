<template>
  <Toast />
  <div class='flex flex-col bg-gray-100 w-full min-h-screen min-w-screen'>
    <!-- <NavBar /> -->
    <main class='h-full w-full flex-1 p-4'>
      <router-view />
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import Toast from 'primevue/toast'
</script>

