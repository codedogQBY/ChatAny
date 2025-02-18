<template>
    <div class="flex h-screen bg-background overflow-hidden">
        <!-- 左侧聊天列表 -->
        <div class="w-64 flex-shrink-0">
            <ChatSidebar
                :chats="chats"
                :selectedChatId="selectedChat?.id"
                @add-chat="openModelSelection"
                @select-chat="selectChat"
            />
        </div>

        <!-- 右侧聊天区域 -->
        <div class="flex-1 flex flex-col relative overflow-hidden">
            <ChatWindow
                v-if="selectedChat"
                :key="selectedChat.id"
                :chat="selectedChat"
                :user="currentUser"
                :quotedMessage="quotedMessage"
                @send-message="sendMessage"
                @toggle-network="toggleNetwork"
                @clear-history="clearHistory"
                @edit-bot="editBot"
                @view-history="viewHistory"
                @quote-message="setQuotedMessage"
                @cancel-quote="cancelQuote"
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
                        <MessageCircleIcon class="w-12 h-12 text-primary" />
                    </div>
                    <h2
                        class="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
                    >
                        开启你的 AI 之旅
                    </h2>
                    <p class="text-muted-foreground mb-8">从左侧选择或创建新的对话，探索无限可能</p>
                    <Button size="lg" class="rounded-full px-8" @click="openModelSelection">
                        <MessageCirclePlusIcon class="mr-2 h-5 w-5" />
                        创建新对话
                    </Button>
                </div>
            </div>
        </div>

        <!-- 模型选择模态框 -->
        <ModelSelectionModal v-model:isOpen="isModelSelectionOpen" @confirm="addChat" />

        <!-- 全局通知 -->
        <div class="fixed top-4 right-4 z-50">
            <Toaster />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ChatSidebar from './ChatSidebar.vue';
import ChatWindow from './ChatWindow.vue';
import ModelSelectionModal from './ModelSelectionModal.vue';
import { Button } from '@/components/ui/button';
import Toaster from '@/components/ui/toast/Toaster.vue';
import { useToast } from '@/components/ui/toast/use-toast';
import { MessageCircleIcon, MessageCirclePlusIcon } from 'lucide-vue-next';

interface User {
    id: number;
    name: string;
    avatar: string;
}

interface Message {
    id: number;
    content: string;
    sender: User;
    timestamp: Date;
    isNew?: boolean;
}

interface Chat {
    id: number;
    name: string;
    avatar?: string;
    messages: Message[];
    model: string;
    temperature: number;
    maxTokens: number;
}

const currentUser: User = {
    id: 1,
    name: '当前用户',
    avatar: '/placeholder.svg?height=40&width=40',
};

const chats = ref<Chat[]>([]);
const selectedChat = ref<Chat | null>(null);
const quotedMessage = ref<Message | null>(null);
const isModelSelectionOpen = ref(false);
const { toast } = useToast();

const selectChat = (chat: Chat) => {
    selectedChat.value = chat;
};

const openModelSelection = () => {
    isModelSelectionOpen.value = true;
};

const addChat = (modelInfo: { model: string; temperature: number; maxTokens: number }) => {
    const newChat: Chat = {
        id: Date.now(),
        name: `${modelInfo.model} 对话`,
        avatar: '/placeholder.svg?height=40&width=40',
        messages: [],
        model: modelInfo.model,
        temperature: modelInfo.temperature,
        maxTokens: modelInfo.maxTokens,
    };
    chats.value.push(newChat);
    selectChat(newChat);
    toast({
        description: `已创建使用 ${modelInfo.model} 模型的新对话`,
        duration: 1000,
    });
};

const sendMessage = async (content: string) => {
    if (selectedChat.value) {
        const newMessage: Message = {
            id: Date.now(),
            content,
            sender: currentUser,
            timestamp: new Date(),
        };
        selectedChat.value.messages.push(newMessage);
        await simulateAIResponse();
    }
};

const simulateAIResponse = async () => {
    if (selectedChat.value) {
        // 模拟 AI 思考时间
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const aiMessage: Message = {
            id: Date.now(),
            content: '这是一个 AI 生成的回复，将会以打字机效果显示。',
            sender: {
                id: 0,
                name: 'AI助手',
                avatar: '/placeholder.svg?height=40&width=40',
            },
            timestamp: new Date(),
            isNew: true,
        };
        selectedChat.value.messages.push(aiMessage);
    }
};

const toggleNetwork = (enabled: boolean) => {
    toast({
        description: `联网模式已${enabled ? '开启' : '关闭'}`,
        duration: 1000,
    });
};

const clearHistory = () => {
    if (selectedChat.value) {
        selectedChat.value.messages = [];
        toast({
            description: '当前对话的所有消息已被删除',
            variant: 'destructive',
            duration: 1000,
        });
    }
};

const editBot = () => {
    toast({
        description: '机器人设置功能即将推出',
        duration: 1000,
    });
};

const viewHistory = () => {
    toast({
        description: '历史记录查看功能即将推出',
        duration: 1000,
    });
};

const setQuotedMessage = (message: Message) => {
    quotedMessage.value = message;
};

const cancelQuote = () => {
    quotedMessage.value = null;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
