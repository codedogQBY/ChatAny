<template>
    <div class="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border/50">
        <!-- 顶部标题栏 -->
        <div
            data-tauri-drag-region
            class="flex items-center justify-between px-3 py-3 border-border/50"
        >
            <h1
                class="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
            >
                AI Chat
            </h1>
        </div>

        <!-- 聊天列表 -->
        <div class="flex-1 overflow-y-auto py-4 px-2">
            <TransitionGroup name="chat-list" tag="div" class="space-y-2">
                <div
                    v-for="chat in chatsWithAvatar"
                    :key="chat.id"
                    @click="$emit('select-chat', chat.id)"
                    class="group relative px-3"
                >
                    <div
                        :class="[
                            'flex items-center p-3 cursor-pointer rounded-lg transition-all duration-300',
                            chat.id === selectedChatId
                                ? 'bg-primary/20 shadow-lg scale-105'
                                : 'hover:bg-primary/10',
                        ]"
                    >
                        <Avatar class="h-10 w-10 shrink-0">
                            <AvatarImage :src="chat.avatar" :alt="chat.name" />
                            <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
                        </Avatar>
                        <div class="ml-3 flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium truncate">{{ chat.name }}</h3>
                                <span v-if="chat.lastMessage" class="text-xs text-muted-foreground ml-2">
                                    {{ chat.lastMessage.time }}
                                </span>
                            </div>
                            <p v-if="chat.lastMessage" class="text-xs truncate text-muted-foreground">
                                <span v-if="chat.lastMessage.isUser" class="text-primary">你：</span>
                                <span v-else class="text-foreground/70">{{ chat.name }}：</span>
                                {{ chat.lastMessage.content }}
                            </p>
                            <p v-else class="text-xs truncate text-muted-foreground">
                                {{ chat.description }}
                            </p>
                        </div>
                        <Badge
                            v-if="chat.unreadCount"
                            variant="destructive"
                            class="ml-2 shrink-0"
                        >
                            {{ chat.unreadCount }}
                        </Badge>
                    </div>
                </div>
            </TransitionGroup>

            <div
                v-if="chats.length === 0"
                class="flex flex-col items-center justify-center h-full p-4 select-none"
            >
                <div
                    class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-pulse"
                >
                    <MessageCircleMoreIcon class="h-10 w-10 text-primary" />
                </div>
                <p class="text-lg font-semibold text-center mb-2">开始你的 AI 之旅</p>
                <p class="text-sm text-muted-foreground text-center">点击顶部按钮创建新对话</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCirclePlusIcon, MessageCircleMoreIcon } from 'lucide-vue-next';
import { useBotStore } from '@/store/bot';
import type { Chat } from '@/store/chat';

const botStore = useBotStore();

const props = defineProps<{
    chats: Chat[];
    selectedChatId?: string;
}>();

defineEmits<{
    (e: 'add-chat'): void;
    (e: 'select-chat', chatId: string): void;
}>();

// 获取带有头像和最后消息的聊天列表，并按最后更新时间排序
const chatsWithAvatar = computed(() => {
    return props.chats
        .map(chat => {
            const bot = botStore.sections
                .flatMap(section => section.bots)
                .find(bot => bot.id === chat.botId);
            
            // 获取最后一条消息
            const lastSession = chat.sessions[chat.sessions.length - 1];
            const lastMessage = lastSession?.messages[lastSession.messages.length - 1];
            
            const lastMessagePreview = lastMessage ? {
                content: lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : ''),
                isUser: lastMessage.sender === 'user',
                time: new Date(lastMessage.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
            } : null;

            return {
                ...chat,
                avatar: bot?.avatar,
                description: bot?.description || '',
                lastMessage: lastMessagePreview,
                lastUpdateTime: chat.updatedAt || chat.createdAt, // 使用更新时间或创建时间
            };
        })
        .sort((a, b) => b.lastUpdateTime - a.lastUpdateTime); // 按时间降序排序
});
</script>

<style scoped>
.chat-list-enter-active,
.chat-list-leave-active {
    transition: all 0.5s cubic-bezier(0.05, 0.7, 0.1, 1);
}

.chat-list-enter-from,
.chat-list-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}
</style>
