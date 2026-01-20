<template>
  <Toast />
  <div class="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <DefaultNavBar />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 text-left md:px-6">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    <DefaultFooter />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import DefaultNavBar from '@/shared/ui/layouts/partials/DefaultNavBar.vue'
import DefaultFooter from '@/shared/ui/layouts/partials/DefaultFooter.vue'

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
