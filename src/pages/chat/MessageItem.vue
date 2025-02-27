<template>
    <div class="message-item relative">
        <div
            v-if="message.status === 'loading'"
            class="message-content loading bg-secondary/20 hover:shadow-md transition-shadow duration-200"
        >
            <div class="flex flex-col space-y-2">
                <div class="skeleton-line w-3/4"></div>
            </div>
        </div>
        <div
            v-else-if="message.status === 'error'"
            class="message-content error hover:shadow-md transition-shadow duration-200 bg-destructive/10"
        >
            {{ message.content }}
        </div>
        <div
            v-else-if="message.status === 'streaming'"
            class="message-content hover:shadow-md transition-shadow duration-200 bg-secondary/30"
        >
            <MarkdownViewer :content="displayContent" />
        </div>
        <div
            v-else
            class="message-content hover:shadow-md transition-shadow duration-200 bg-secondary/30"
        >
            <MarkdownViewer :content="message.content" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted, watch } from 'vue';
import MarkdownViewer from '@/components/common/MarkdownViewer.vue';

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['copy', 'quote']);

// 用于打字机效果的计算属性
const displayContent = ref('');

// 同时监听消息内容和状态变化
watch(
    () => [props.message.content, props.message.status],
    ([newContent, newStatus]) => {
        console.log('消息状态更新:', newStatus, '内容长度:', newContent?.length || 0);

        if (newStatus === 'streaming') {
            displayContent.value = newContent;
        } else if (newStatus === 'error') {
            // 确保错误状态下显示错误消息
            displayContent.value = newContent;
        } else if (newStatus === 'sent') {
            // 发送完成状态
            displayContent.value = newContent;
        }
    },
    { immediate: true, deep: true }
);
</script>

<style scoped>
.message-item {
    font-size: 15px;
    line-height: 1.6;
}

.message-content {
    position: relative;
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-content.error {
    color: #e53935;
}

.message-content.loading {
    min-width: 250px;
}

.skeleton-line {
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>
