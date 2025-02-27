<template>
    <span
        id="input-text"
        class="inline-block relative group"
        @mouseenter="showEditHint = true"
        @mouseleave="showEditHint = false"
    >
        <span
            v-if="!isEditing"
            @click="startEditing"
            class="cursor-pointer border-b border-dashed border-transparent group-hover:border-primary transition-colors duration-200"
        >
            {{ displayText }}
        </span>
        <Input
            v-else
            v-model="editedText"
            @keyup.enter="saveChanges"
            @blur="saveChanges"
            class="inline-block w-auto max-w-48 h-auto p-0 text-sm bg-transparent border-none focus:ring-0 focus:border-primary font-[inherit] leading-none"
        />
    </span>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, type ComponentPublicInstance } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-vue-next';

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const editedText = ref(props.modelValue);
const isEditing = ref(false);
const showEditHint = ref(false);
const inputElement = ref<ComponentPublicInstance | null>(null);

const displayText = computed(() => props.modelValue);

const startEditing = () => {
    if (!isEditing.value) {
        isEditing.value = true;
        editedText.value = props.modelValue;
        nextTick(() => {
            // 处理组件引用获取原生DOM元素
            const nativeInput = document.querySelector('#input-text input') as HTMLInputElement;
            nativeInput?.focus();
        });
    }
};

const saveChanges = () => {
    isEditing.value = false;
    if (editedText.value !== props.modelValue) {
        emit('update:modelValue', editedText.value);
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
