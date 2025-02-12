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
            <Button
                variant="outline"
                size="sm"
                class="rounded-full animate-pulse hover:animate-none"
                @click="$emit('add-chat')"
            >
                <PlusIcon class="h-4 w-4 mr-2" />
                新对话
            </Button>
        </div>

        <!-- 聊天列表 -->
        <div class="flex-1 overflow-y-auto py-4 px-2">
            <TransitionGroup name="chat-list" tag="div" class="space-y-2">
                <div
                    v-for="chat in chats"
                    :key="chat.id"
                    @click="$emit('select-chat', chat)"
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
                        <Avatar class="h-10 w-10">
                            <AvatarImage :src="chat.avatar" :alt="chat.name" />
                            <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
                        </Avatar>
                        <div class="ml-3 flex-1 min-w-0">
                            <h3 class="text-sm font-medium truncate">{{ chat.name }}</h3>
                            <p class="text-xs truncate text-muted-foreground">
                                {{ chat.description }}
                            </p>
                        </div>
                        <Badge
                            v-if="chat.unreadCount"
                            variant="destructive"
                            class="ml-2 animate-bounce"
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
                    <MessageSquareIcon class="h-10 w-10 text-primary" />
                </div>
                <p class="text-lg font-semibold text-center mb-2">开始你的 AI 之旅</p>
                <p class="text-sm text-muted-foreground text-center">点击顶部按钮创建新对话</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, MessageSquareIcon } from 'lucide-vue-next';

interface Chat {
    id: number;
    name: string;
    avatar?: string;
    description?: string;
    unreadCount?: number;
}

defineProps<{
    chats: Chat[];
    selectedChatId?: number;
}>();

defineEmits<{
    (e: 'add-chat'): void;
    (e: 'select-chat', chat: Chat): void;
}>();
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
