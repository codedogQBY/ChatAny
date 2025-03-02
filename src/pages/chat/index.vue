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
                @send-message="sendMessage"
                @toggle-network="toggleNetwork"
                @clear-history="clearHistory"
                @edit-bot="editBot"
                @view-history="viewHistory"
                @quote-message="setQuotedMessage"
                @cancel-quote="cancelQuote"
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
import { v4 as uuidv4 } from 'uuid';

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

const sendMessage = async (content: string) => {
    if (!chatStore.currentChat?.id || !chatStore.currentSession?.id) return;

    // 设置加载状态
    isGenerating.value = true;
    console.log('设置isGenerating为true'); // 调试日志

    try {
        // 先添加用户消息
        await chatStore.addMessage({
            content,
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'user',
            status: 'sent',
        });

        // 添加AI消息占位符
        const messageId = uuidv4();
        const aiMessage = {
            id: messageId,
            content: '',
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'bot',
            status: 'streaming', // 使用streaming状态
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await chatStore.addMessage(aiMessage);

        // 模拟打字效果
        const fullReply = '这是一个 AI 生成的回复，将会以打字机效果显示。';
        let currentText = '';

        // 逐字添加文本
        for (let i = 0; i < fullReply.length; i++) {
            currentText += fullReply[i];
            // 更新消息内容，但保持streaming状态
            await chatStore.replaceMessage(messageId, {
                ...aiMessage,
                content: currentText,
                updatedAt: Date.now(),
            });
            // 添加随机延迟来模拟打字速度
            await new Promise((r) => setTimeout(r, 50 + Math.random() * 50));
        }

        // 完成后更新状态
        await chatStore.replaceMessage(messageId, {
            ...aiMessage,
            content: fullReply,
            status: 'sent',
            updatedAt: Date.now(),
        });
    } catch (error) {
        console.error('消息生成出错:', error);
        toast({
            title: '错误',
            description: '生成回复时出现错误',
            variant: 'destructive',
            duration: 3000,
        });
    } finally {
        // 确保在任何情况下都重置状态
        isGenerating.value = false;
        console.log('设置isGenerating为false'); // 调试日志
    }
};

const toggleNetwork = (enabled: boolean) => {
    toast({
        description: `联网模式已${enabled ? '开启' : '关闭'}`,
        duration: 1000,
    });
};

const clearHistory = async () => {
    if (chatStore.currentChat && chatStore.currentSession) {
        chatStore.currentSession.messages = [];
        await chatStore.syncData();
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

const setQuotedMessage = (message: WindowMessage) => {
    quotedMessage.value = message;
};

const cancelQuote = () => {
    quotedMessage.value = null;
};

// 处理生成状态变化
const handleGenerationStatusChange = (status: boolean) => {
    console.log('接收生成状态变化:', status); // 调试日志
    isGenerating.value = status;
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
