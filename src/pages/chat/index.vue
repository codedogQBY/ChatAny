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
                :user="currentUser"
                :quotedMessage="quotedMessage"
                :current-session="chatStore.currentSession"
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
import { useBotStore } from '@/store/bot';
import ChatSidebar from './ChatSidebar.vue';
import ChatWindow from './ChatWindow.vue';
import { useToast } from '@/components/ui/toast/use-toast';
import { MessageCircleMoreIcon } from 'lucide-vue-next';

const chatStore = useChatStore();
const botStore = useBotStore();
const { toast } = useToast();

const currentUser = {
    id: 'user',
    name: 'User',
    avatar: '/placeholder.svg?height=40&width=40',
};

// 修改引用消息的类型
interface WindowMessage {
    id: string | number;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar: string;
    };
    timestamp: Date;
    isNew?: boolean;
}

const quotedMessage = ref<WindowMessage | null>(null);

// 转换 chat 数据以适配 ChatWindow 组件的格式
const currentChatData = computed(() => {
    if (!chatStore.currentChat || !chatStore.currentSession) return null;

    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === chatStore.currentChat?.botId);

    return {
        id: chatStore.currentChat.id,
        name: chatStore.currentChat.name,
        avatar: bot?.avatar,
        sessions: chatStore.currentChat.sessions,
        botId: chatStore.currentChat.botId,
        messages: chatStore.currentSession.messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            sender:
                msg.sender === 'user'
                    ? currentUser
                    : {
                          id: 'bot',
                          name: chatStore?.currentChat?.name || 'Bot',
                          avatar: bot?.avatar || '',
                      },
            timestamp: new Date(msg.createdAt),
            isNew: msg.sender === 'bot' && msg.status === 'pending',
        })),
        temperature: chatStore.currentChat.temperature,
        maxTokens: chatStore.currentChat.maxTokens,
        topP: chatStore.currentChat.topP,
        contextSize: chatStore.currentChat.contextSize,
    };
});

const isGenerating = ref(false);

const selectChat = async (chatId: string) => {
    await chatStore.selectChat(chatId);
};

// 处理生成状态变化
const handleGenerationStatusChange = (status: boolean) => {
    console.log('接收生成状态变化:', status); // 调试日志
    isGenerating.value = status;
};
</script>

<style scoped></style>
