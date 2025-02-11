<template>
    <div class="h-full bg-background p-4 overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-foreground">聊天</h1>
            <Button @click="$emit('add')" variant="outline" size="icon" class="rounded-full">
                <Plus class="h-4 w-4" />
            </Button>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 space-y-2">
            <TransitionGroup name="chat-list">
                <div
                    v-for="chat in chats"
                    :key="chat.id"
                    class="group relative bg-background rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-accent"
                    :class="{ 'bg-accent': chat.id === selectedChatId }"
                    @click="$emit('select', chat)"
                >
                    <div class="flex items-center space-x-3">
                        <div
                            class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg"
                        >
                            {{ chat.avatar }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-foreground truncate">{{ chat.name }}</p>
                            <p class="text-sm text-muted-foreground truncate">
                                {{ chat.lastMessage || '开始新的对话' }}
                            </p>
                        </div>
                    </div>
                    <div
                        class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Button variant="ghost" size="icon">
                            <MoreVertical class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </TransitionGroup>
        </div>
        <div v-if="chats.length === 0" class="flex-1 flex items-center justify-center">
            <p class="text-muted-foreground text-center">
                还没有聊天记录<br />
                点击右上角的 "+" 开始新的对话
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-vue-next';
import type { Chat } from '../types';

defineProps<{
    chats: Chat[];
    selectedChatId: number | undefined;
}>();

defineEmits<{
    (e: 'select', chat: Chat): void;
    (e: 'add'): void;
}>();
</script>

<style scoped>
.chat-list-enter-active,
.chat-list-leave-active {
    transition: all 0.5s ease;
}
.chat-list-enter-from,
.chat-list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>
