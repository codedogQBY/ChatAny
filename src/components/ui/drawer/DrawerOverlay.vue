<script lang="ts" setup>
import type { DialogOverlayProps } from 'radix-vue'
import { cn } from '@/lib/utils'
import { DrawerOverlay } from 'vaul-vue'
import { computed, type HtmlHTMLAttributes } from 'vue'

const props = defineProps<DialogOverlayProps & { class?: HtmlHTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <DrawerOverlay 
    v-bind="delegatedProps" 
    :class="cn(
      'fixed inset-0 z-50 bg-black/80',
      'transition-opacity duration-300',
      'data-[state=open]:opacity-100',
      'data-[state=closed]:opacity-0',
      props.class
    )" 
  />
</template>

<style>
.drawer-overlay {
  animation: drawer-overlay-show 0.3s ease-out;
}

.drawer-overlay-closing {
  animation: drawer-overlay-hide 0.3s ease-in;
}

@keyframes drawer-overlay-show {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes drawer-overlay-hide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
