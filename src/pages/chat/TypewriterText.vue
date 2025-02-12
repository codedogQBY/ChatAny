<template>
    <span>{{ displayedText }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
    content: string;
    typingSpeed?: number;
    startDelay?: number;
}>();

const emit = defineEmits<{
    (e: 'typing-complete'): void;
}>();

const displayedText = ref('');

const typeText = async () => {
    displayedText.value = '';
    if (props.startDelay) {
        await new Promise((resolve) => setTimeout(resolve, props.startDelay));
    }
    for (let i = 0; i < props.content.length; i++) {
        displayedText.value += props.content[i];
        await new Promise((resolve) => setTimeout(resolve, props.typingSpeed || 50));
    }
    emit('typing-complete');
};

onMounted(() => {
    typeText();
});

watch(
    () => props.content,
    () => {
        typeText();
    }
);
</script>
