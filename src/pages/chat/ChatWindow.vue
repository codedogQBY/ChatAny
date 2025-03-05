<template>
    <div class="flex flex-col h-full bg-gradient-to-br from-background to-background/80">
        <!-- 顶部标题栏 -->
        <chat-window-header :chat="chat" :is-loading="isLoading"></chat-window-header>

        <!-- 聊天内容区域 -->
        <message-list :chat="chat"></message-list>

        <chat-input
            :chat="chat"
            :is-loading="isLoading"
            @update-loading="(loading: boolean) => (isLoading = loading)"
        ></chat-input>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useChatStore } from '@/store/chat';
import type { Message, Chat, Session } from '@/types';
import ChatWindowHeader from '@/components/chat/ChatWindowHeader.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import MessageList from '@/components/chat/MessageList.vue';

const props = defineProps<{
    chat: Chat;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    quotedMessage: Message | null;
    currentSession: Session | null;
}>();

const emit = defineEmits<{
    (e: 'quote-message', message: any): void;
    (e: 'generation-status-change', status: boolean): void;
}>();

const chatStore = useChatStore();

// 添加此变量以跟踪是否正在加载
const isLoading = ref(false);

// 监听isLoading变化并发射事件
watch(isLoading, (newValue) => {
    console.log('发射生成状态变化:', newValue); // 调试日志
    emit('generation-status-change', newValue);
});
</script>

<style scoped>
/* 修改禁用状态样式，更微妙 */
button:disabled,
select:disabled,
textarea:disabled {
    opacity: 0.8;
}

button:disabled::before {
    content: none;
}
</style>
