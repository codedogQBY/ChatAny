<template>
    <div
        data-tauri-drag-region
        class="flex items-center justify-between px-2 py-2 bg-card/50 backdrop-blur-sm border-b border-border/50"
    >
        <div class="flex items-center space-x-3">
            <Avatar>
                <AvatarImage :src="chat.avatar" :alt="chat.name" />
                <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
            </Avatar>
            <h2 class="text-base font-semibold text-foreground truncate max-w-60">
                {{ chat.name }}
            </h2>
            <SessionSelector
                :sessions="chat.sessions"
                :current-session="currentSession"
                @select="chatStore.selectSession($event)"
                :disabled="isLoading"
            />
        </div>
        <div class="flex items-center space-x-2">
            <Button
                variant="ghost"
                size="icon"
                @click="handleHistoryClick"
                :class="{ 'opacity-50': isLoading }"
            >
                <ClockIcon class="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                @click="handleSettingsClick"
                :class="{ 'opacity-50': isLoading }"
            >
                <SettingsIcon class="h-5 w-5" />
            </Button>
        </div>
        <ChatSettings
            v-model:open="showSettings"
            :chat-id="chat.id"
            :temperature="chat.temperature"
            :max-tokens="chat.maxTokens"
            :top-p="chat.topP"
            :context-size="chat.contextSize"
        />
        <!-- 历史记录抽屉 -->
        <Drawer v-model:open="showHistory" @close="showHistory = false">
            <DrawerContent class="!w-[calc(100%-16rem)]" position="right">
                <div class="flex h-full">
                    <!-- 顶部关闭按钮 -->
                    <Button
                        variant="ghost"
                        size="icon"
                        class="absolute right-4 top-4 z-50"
                        @click="toggleHistory"
                    >
                        <XIcon class="h-5 w-5" />
                    </Button>

                    <ChatHistory
                        :sessions="chat.sessions"
                        :current-session="currentSession"
                        :bot-name="chat.name"
                        :bot-avatar="chat.avatar || ''"
                        :user-avatar="''"
                        @select="chatStore.selectSession($event)"
                    />
                </div>
            </DrawerContent>
        </Drawer>
        <!-- 添加删除确认对话框 -->
        <DeleteSessionAlert
            v-model:open="showClearConfirm"
            title="删除当前会话"
            description="确定要删除当前会话吗？此操作将删除所有聊天记录且不可恢复。"
            @confirm="handleClearConfirm"
        />
    </div>
</template>
<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SessionSelector from '@/components/chat/SessionSelector.vue';
import { ClockIcon, SettingsIcon, XIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import ChatSettings from '@/components/chat/ChatSettings.vue';
import DeleteSessionAlert from '@/components/chat/DeleteSessionAlert.vue';
import ChatHistory from '@/components/chat/ChatHistory.vue';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import type { Chat, Message, Session } from '@/types';
import { useChatStore } from '@/store/chat';
import { useToast } from '@/components/ui/toast';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    chat: Chat;
    isLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'select-session', sessionId: string): void;
    (e: 'create-session'): void;
}>();

const chatStore = useChatStore();
const { currentSession } = storeToRefs(chatStore);
const { toast } = useToast();
const showSettings = ref(false);
const showClearConfirm = ref(false);
const showHistory = ref(false);

const toggleHistory = () => {
    showHistory.value = !showHistory.value;
};

const handleClearConfirm = async () => {
    if (!currentSession) return;

    try {
        // 删除当前会话
        await chatStore.deleteSession(currentSession.id);
        showClearConfirm.value = false;

        toast({
            description: '会话已删除',
            duration: 2000,
        });
    } catch (error) {
        toast({
            description: '会话删除失败，请稍后重试',
            variant: 'destructive',
            duration: 2000,
        });
    }
};

// 修改历史记录点击事件
const handleHistoryClick = () => {
    if (props.isLoading) {
        toast({
            title: '无法打开历史记录',
            description: '请等待当前消息生成完成',
            variant: 'destructive',
            duration: 2000,
        });
        return; // 阻止打开操作
    }
    toggleHistory();
};

// 修改设置点击事件
const handleSettingsClick = () => {
    if (props.isLoading) {
        toast({
            title: '无法打开设置',
            description: '请等待当前消息生成完成',
            variant: 'destructive',
            duration: 800,
        });
        return; // 阻止打开操作
    }
    showSettings.value = true;
};
</script>
