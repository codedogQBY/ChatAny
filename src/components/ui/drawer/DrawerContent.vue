<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from 'radix-vue'
import type { HtmlHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useForwardPropsEmits } from 'radix-vue'
import { DrawerContent, DrawerPortal } from 'vaul-vue'
import DrawerOverlay from './DrawerOverlay.vue'

const props = withDefaults(defineProps<
  DialogContentProps & { 
    class?: HtmlHTMLAttributes['class'];
    position?: 'bottom' | 'right';
  }
>(), {
  position: 'bottom'
});

const emits = defineEmits<DialogContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      v-bind="forwarded" 
      :class="cn(
        'fixed z-50 border bg-background',
        position === 'bottom' ? [
          'inset-x-0 bottom-0 mt-24 rounded-t-[10px]',
          'flex h-auto flex-col',
          'transition-transform duration-300',
          'data-[state=open]:translate-y-0',
          'data-[state=closed]:translate-y-full',
        ] : [
          'right-0 top-0 h-full w-3/4',
          'flex flex-row',
          'transition-transform duration-300',
          'data-[state=open]:translate-x-0',
          'data-[state=closed]:translate-x-full',
        ],
        props.class,
      )"
    >
      <div v-if="position === 'bottom'" class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>

<style>
.drawer-from-right {
  animation: drawer-slide-in-right 0.3s ease-out;
}

.drawer-from-bottom {
  animation: drawer-slide-in-bottom 0.3s ease-out;
}

@keyframes drawer-slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes drawer-slide-in-bottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes drawer-slide-out-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes drawer-slide-out-bottom {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

.drawer-content-closing.drawer-from-right {
  animation: drawer-slide-out-right 0.3s ease-in;
}

.drawer-content-closing.drawer-from-bottom {
  animation: drawer-slide-out-bottom 0.3s ease-in;
}
</style>
