<template>
    <div class="flex h-screen bg-background overflow-hidden">
        <!-- 左侧聊天列表 -->
        <div class="w-64 flex-shrink-0">
            <ChatSidebar
                :chats="chatStore.chats"
                :selectedChatId="chatStore.currentChat?.id"
                @select-chat="selectChat"
                :disabled="isGenerating"
            />
        </div>

        <!-- 右侧聊天区域 -->
        <div class="flex-1 flex flex-col relative overflow-hidden">
            <ChatWindow
                v-if="chatStore.currentChat && chatStore.currentSession"
                :key="chatStore.currentChat.id"
                :chat="currentChatData"
                @generation-status-change="handleGenerationStatusChange"
            />
            <div
                v-else
                key="empty-state"
                class="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-background/80 select-none"
            >
                <div class="text-center p-8 bg-card rounded-xl shadow-lg max-w-md mx-auto">
                    <div
                        class="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
                    >
                        <MessageCircleMoreIcon class="w-12 h-12 text-primary" />
                    </div>
                    <h2
                        class="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
                    >
                        开启你的 AI 之旅
                    </h2>
                    <p class="text-muted-foreground mb-8">从左侧选择机器人对话，探索无限可能</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from '@/store/chat';
import ChatSidebar from './ChatSidebar.vue';
import ChatWindow from './ChatWindow.vue';
import { MessageCircleMoreIcon } from 'lucide-vue-next';

const chatStore = useChatStore();

// 修改 currentChatData 的计算属性定义
const currentChatData = computed(() => {
    return (
        chatStore.currentChat || {
            id: '',
            name: '',
            botId: '',
            sessions: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            temperature: 0.7,
            maxTokens: 1280,
            topP: 0.9,
            contextSize: 6,
        }
    );
});

const isGenerating = ref(false);

const selectChat = async (chatId: string) => {
    await chatStore.selectChat(chatId);
    chatStore.cancelQuote();
};

// 处理生成状态变化
const handleGenerationStatusChange = (status: boolean) => {
    console.log('接收生成状态变化:', status); // 调试日志
    isGenerating.value = status;
};
</script>

<style scoped></style>
