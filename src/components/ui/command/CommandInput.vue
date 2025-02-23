<template>
    <div class="flex items-center border-b px-3" :cmdk-input-wrapper="">
        <SearchIcon class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
            ref="inputRef"
            class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            :placeholder="placeholder"
        />
    </div>
</template>

<script setup lang="ts">
import { SearchIcon } from 'lucide-vue-next';

defineProps<{
    modelValue: string;
    placeholder?: string;
}>();

defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script> 