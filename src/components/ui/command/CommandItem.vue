<template>
    <div
        class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        :cmdk-item=""
        :class="className"
        @click="$emit('select')"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    className?: string;
}>();

defineEmits<{
    (e: 'select'): void;
}>();
</script> 