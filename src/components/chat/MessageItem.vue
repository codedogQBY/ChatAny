<template>
    <div class="message-item relative">
        <div
            v-if="message.status === 'loading' || !message.content"
            class="message-content loading bg-secondary/20 hover:shadow-md transition-shadow duration-200"
        >
            <div class="flex flex-col space-y-2">
                <div class="skeleton-line w-2/3"></div>
                <div class="skeleton-line w-full"></div>
                <div class="skeleton-line w-1/3"></div>
            </div>
        </div>
        <div
            v-else-if="message.status === 'error'"
            class="message-content error hover:shadow-md transition-shadow duration-200 bg-destructive/10 text-wrap break-all"
        >
            {{ message.content }}
        </div>
        <div
            v-else-if="message.status === 'streaming'"
            class="message-content hover:shadow-md transition-shadow duration-200 bg-secondary/30"
        >
            <MarkdownViewer :steaming="true" :content="displayContent" />
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
import { Message } from '@/types';

const { message } = defineProps<{
    message: Message;
}>();

const emit = defineEmits(['copy', 'quote']);

// 用于打字机效果的计算属性
const displayContent = ref('');
let lastContentLength = 0; // 添加这个变量来追踪上次内容长度

// 修改 watch 逻辑
watch(
    () => [message.content, message.status],
    ([newContent, newStatus]) => {
        if (newStatus === 'streaming') {
            // 只追加新增的内容
            if (newContent && newContent.length > lastContentLength) {
                const newPart = newContent.slice(lastContentLength);
                displayContent.value += newPart;
                lastContentLength = newContent.length;
            }
        } else {
            // 非流式状态直接显示完整内容
            displayContent.value = newContent;
            lastContentLength = newContent?.length || 0;
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
    min-width: 200px;
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
