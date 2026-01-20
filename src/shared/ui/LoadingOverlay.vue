<template>
  <div
    v-if="visible"
    :class="overlayClass"
    aria-live="polite"
    aria-busy="true"
  >
    <ProgressSpinner
      class="loading-spinner"
      :style="{ width: '56px', height: '56px', color: resolvedColor }"
      strokeWidth="5"
      animationDuration="1s"
    />
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'

const props = withDefaults(
  defineProps<{
    visible: boolean
    color?: string
    fullScreen?: boolean
  }>(),
  {
    color: '',
    fullScreen: false,
  }
)

const resolvedColor = props.color || 'var(--primary-blue, #0C599E)'
const overlayClass = [
  'inset-0',
  'z-50',
  'flex',
  'items-center',
  'justify-center',
  'bg-slate-900/10',
  'backdrop-blur-sm',
  props.fullScreen ? 'fixed' : 'absolute',
]
</script>
