<template>
    <div :cmdk-group="" class="overflow-hidden p-1 text-foreground">
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {{ heading }}
        </div>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    heading: string;
}>();
</script> 