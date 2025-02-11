<template>
    <div class="flex h-screen bg-background overflow-hidden font-sans">
        <ChatList
            :chats="chats"
            :selectedChatId="selectedChat?.id"
            @select="selectChat"
            @add="showNewChatModal = true"
            class="w-[280px] flex-shrink-0 border-r lg:w-[320px] hidden md:block"
        />
        <Button
            @click="toggleSidebar"
            class="fixed left-4 top-4 md:hidden z-50"
            variant="outline"
            size="icon"
        >
            <Menu class="h-4 w-4" />
        </Button>

        <!-- Mobile Sidebar -->
        <div v-if="showMobileSidebar" class="fixed inset-0 bg-background z-40 md:hidden">
            <ChatList
                :chats="chats"
                :selectedChatId="selectedChat?.id"
                @select="handleMobileSelect"
                @add="showNewChatModal = true"
                class="w-full h-full"
            />
        </div>

        <ChatWindow
            v-if="selectedChat"
            :chat="selectedChat"
            @send="sendMessage"
            @edit="editChat"
            @clear="clearChat"
            class="flex-1 min-w-0"
        />
        <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center p-8">
                <MessageSquare class="w-16 h-16 mx-auto mb-4 text-primary" />
                <p class="text-xl font-semibold text-foreground">准备好开始新的对话了吗？</p>
                <p class="mt-2 text-muted-foreground">从左侧选择一个聊天，或创建新的对话！</p>
            </div>
        </div>
        <NewChatModal
            v-if="showNewChatModal"
            @close="showNewChatModal = false"
            @create="createNewChat"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessageSquare } from 'lucide-vue-next';
import ChatList from './ChatList.vue';
import ChatWindow from './ChatWindow.vue';
import NewChatModal from './NewChatModal.vue';
import type { Chat, Message } from './types';

const chats = ref<Chat[]>([
    {
        id: 1,
        name: 'GPT-4 Turbo',
        avatar: '4T',
        model: 'gpt-4-turbo',
        lastMessage: '让我们开始探讨这个有趣的话题吧！',
        messages: [
            {
                id: 1,
                role: 'assistant',
                content: '你好！我是 GPT-4 Turbo。有什么我可以帮助你的吗？',
                time: '10:00',
            },
            { id: 2, role: 'user', content: '你能解释一下量子计算的基本原理吗？', time: '10:01' },
            {
                id: 3,
                role: 'assistant',
                content:
                    '当然可以！量子计算是一种利用量子力学原理进行信息处理的计算方式。它的基本单位是量子比特（qubit），不同于经典计算机的比特，qubit 可以同时处于多个状态。这种特性被称为量子叠加。\n\n量子计算的几个关键概念：\n\n1. 叠加态：qubit 可以同时为 0 和 1，直到被观测。\n2. 纠缠：两个或多个 qubit 可以彼此关联，即使相距遥远。\n3. 干涉：量子态可以相互影响，增强或抵消某些结果的概率。\n\n这些特性使得量子计算机在某些特定问题上，如大数分解、数据库搜索等，可能比经典计算机快得多。\n\n不过，量子计算仍面临许多挑战，如量子退相干和错误校正等问题。目前，我们仍处于量子计算的早期阶段，但它有潜力在未来彻底改变计算领域。',
                time: '10:03',
            },
        ],
    },
    {
        id: 2,
        name: 'Claude 3',
        avatar: 'C3',
        model: 'claude-3',
        lastMessage: '我很乐意为您解答这个问题。',
        messages: [],
    },
]);

const selectedChat = ref<Chat | null>(null);
const showNewChatModal = ref(false);

const showMobileSidebar = ref(false);

const toggleSidebar = () => {
    showMobileSidebar.value = !showMobileSidebar.value;
};

const handleMobileSelect = (chat: Chat) => {
    selectChat(chat);
    showMobileSidebar.value = false;
};

const selectChat = (chat: Chat) => {
    selectedChat.value = chat;
};

const createNewChat = (name: string, model: string) => {
    const newChat: Chat = {
        id: Date.now(),
        name,
        avatar: model.charAt(0).toUpperCase(),
        model,
        lastMessage: '',
        messages: [],
    };
    chats.value.unshift(newChat);
    selectedChat.value = newChat;
    showNewChatModal.value = false;
};

const sendMessage = (content: string) => {
    if (!selectedChat.value) return;

    const newMessage: Message = {
        id: Date.now(),
        role: 'user',
        content,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    selectedChat.value.messages.push(newMessage);
    selectedChat.value.lastMessage = content;

    // 模拟AI回复
    setTimeout(() => {
        const aiResponse: Message = {
            id: Date.now(),
            role: 'assistant',
            content: '这是一个AI的模拟回复。在实际应用中，这里应该调用真实的AI服务来生成回复。',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        };
        selectedChat.value?.messages.push(aiResponse);
    }, 1000);
};

const editChat = (chatId: number, newName: string) => {
    const chat = chats.value.find((c) => c.id === chatId);
    if (chat) {
        chat.name = newName;
    }
};

const clearChat = (chatId: number) => {
    const chat = chats.value.find((c) => c.id === chatId);
    if (chat) {
        chat.messages = [];
        chat.lastMessage = '';
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', sans-serif;
}
</style>
