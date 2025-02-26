<template>
    <div class="message-item relative">
        <div
            v-if="message.status === 'loading'"
            class="message-content loading bg-secondary/20 hover:shadow-md transition-shadow duration-200"
        >
            <div class="flex flex-col space-y-2">
                <div class="skeleton-line w-3/4"></div>
                <div class="skeleton-line w-1/2"></div>
                <div class="skeleton-line w-5/6"></div>
            </div>
        </div>
        <div
            v-else-if="message.status === 'error'"
            class="message-content error hover:shadow-md transition-shadow duration-200 bg-destructive/10"
        >
            <MarkdownViewer :content="message.content" />
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
import { defineProps, defineEmits } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';
import MarkdownViewer from '@/components/common/MarkdownViewer.vue';

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['copy', 'quote']);
const { toast } = useToast();

// 复制消息内容
const copyContent = async () => {
    try {
        // 获取纯文本内容
        const plainText = props.message.content;
        await navigator.clipboard.writeText(plainText);
        toast({
            title: '已复制',
            description: '消息内容已复制到剪贴板',
            duration: 2000,
        });
        emit('copy', plainText);
    } catch (error) {
        console.error('复制失败:', error);
        toast({
            title: '复制失败',
            description: '无法复制消息内容',
            variant: 'destructive',
            duration: 2000,
        });
    }
};

// 引用消息
const quoteMessage = () => {
    emit('quote', props.message);
    toast({
        description: '已添加引用',
        duration: 2000,
    });
};
</script>

<style scoped>
.message-item {
    font-size: 15px;
    line-height: 1.6;
}

.message-content {
    white-space: pre-wrap;
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
    min-height: 80px;
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
