<template>
  <Toast />
  <div class="flex flex-col bg-gray-100 w-full min-h-screen min-w-screen">
    <!-- <NavBar /> -->
    <main class="h-full w-full flex-1 p-4">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import { watch } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// watch(
//   alertStore.alerts,
//   (newAlerts) => {
//     for (const alert of newAlerts) {
//       if (!alert.read) {
//         // const { severity, summary, msg, id } = alert
//         toast.add({ severity: alert.severity, summary: alert.summary, detail: alert.msg, life: alert.life })
//         alertStore.markAsRead(alert.id)
//       }
//     }
//   },
//   { deep: true }
// )
</script>