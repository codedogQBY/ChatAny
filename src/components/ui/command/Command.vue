<template>
    <div
        ref="ref"
        class="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
        :class="className"
        :cmdk-root=""
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    className?: string;
}>();
</script> 