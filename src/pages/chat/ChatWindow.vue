<template>
    <div class="flex flex-col h-full bg-background">
        <!-- Chat Header -->
        <header class="p-4 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div
                        class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg"
                    >
                        {{ chat.avatar }}
                    </div>
                    <h2 class="text-xl font-semibold text-foreground">{{ chat.name }}</h2>
                </div>
                <div class="flex space-x-2">
                    <Button variant="ghost" size="icon" @click="showHistory">
                        <History class="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="editChat">
                        <Edit class="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>

        <!-- Message List -->
        <div class="flex-1 overflow-y-auto space-y-4 min-h-0" ref="messageList">
            <div class="p-4 space-y-6">
                <TransitionGroup name="chat-message">
                    <div
                        v-for="message in chat.messages"
                        :key="message.id"
                        :class="[
                            'flex gap-4 items-end',
                            message.role === 'user' ? 'flex-row-reverse' : '',
                        ]"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                            :class="[
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground',
                            ]"
                        >
                            {{ message.role === 'user' ? '你' : 'AI' }}
                        </div>

                        <div
                            class="max-w-[75%] rounded-lg p-4 shadow-sm group relative"
                            :class="[
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground',
                            ]"
                        >
                            <div class="prose max-w-none" v-html="formatMessage(message.content)" />
                            <div class="mt-2 text-xs opacity-70">{{ message.time }}</div>
                            <div
                                class="message-actions absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-lg px-1"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8"
                                    @click.stop="copyMessage(message.content)"
                                >
                                    <Copy class="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8"
                                    @click.stop="quoteMessage(message)"
                                >
                                    <Quote class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <!-- Bottom Action Area -->
        <div class="border-t bg-background/80 backdrop-blur-sm">
            <!-- Quoted Message -->
            <div
                v-if="quotedMessage"
                class="mx-4 mt-4 p-3 bg-muted/50 border rounded-lg flex items-start gap-3"
            >
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground mb-1">引用消息</p>
                    <p class="text-sm text-muted-foreground truncate">
                        {{ quotedMessage.content }}
                    </p>
                </div>
                <Button variant="ghost" size="icon" @click="quotedMessage = null">
                    <X class="h-4 w-4" />
                </Button>
            </div>

            <!-- Toolbar -->
            <div class="px-4 py-3 flex items-center space-x-2 overflow-x-auto border-t">
                <Button variant="ghost" size="sm" @click="takeScreenshot" class="flex-shrink-0">
                    <Camera class="h-4 w-4 mr-2" />
                    截图
                </Button>
                <Button variant="ghost" size="sm" @click="showLastImage" class="flex-shrink-0">
                    <Image class="h-4 w-4 mr-2" />
                    图片
                </Button>
                <Button variant="ghost" size="sm" @click="confirmClearChat" class="flex-shrink-0">
                    <Trash class="h-4 w-4 mr-2" />
                    清空
                </Button>
                <Button variant="ghost" size="sm" @click="showPlugins" class="flex-shrink-0">
                    <Puzzle class="h-4 w-4 mr-2" />
                    插件
                </Button>
                <Button variant="ghost" size="sm" @click="showSettings" class="flex-shrink-0">
                    <Settings class="h-4 w-4 mr-2" />
                    设置
                </Button>
            </div>

            <!-- Input Area -->
            <div class="p-4">
                <div class="relative flex items-end gap-2">
                    <Textarea
                        v-model="inputMessage"
                        rows="1"
                        class="flex-1 resize-none rounded-2xl pr-12 min-h-[56px] py-4 px-6"
                        placeholder="输入消息..."
                        @keydown.enter.prevent="sendMessage"
                        ref="textarea"
                    />
                    <Button
                        variant="default"
                        size="icon"
                        class="absolute right-2 bottom-2 rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
                        @click="sendMessage"
                    >
                        <Send class="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    History,
    Edit,
    Camera,
    Image,
    Trash,
    Puzzle,
    Command,
    Settings,
    Copy,
    Quote,
    X,
    Send,
} from 'lucide-vue-next';
import type { Chat, Message } from '../types';
import { marked } from 'marked';

const props = defineProps<{
    chat: Chat;
}>();

const emit = defineEmits<{
    (e: 'send', message: string): void;
    (e: 'edit'): void;
    (e: 'clear'): void;
}>();

const inputMessage = ref('');
const networkEnabled = ref(true);
const textarea = ref<HTMLTextAreaElement>();
const messageList = ref<HTMLElement>();
const quotedMessage = ref<Message | null>(null);

const sendMessage = () => {
    if (!inputMessage.value.trim()) return;
    emit('send', inputMessage.value);
    inputMessage.value = '';
    quotedMessage.value = null;
};

const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
};

const quoteMessage = (message: Message) => {
    quotedMessage.value = message;
    textarea.value?.focus();
};

const formatMessage = (content: string) => {
    return marked(content);
};

const showHistory = () => {
    // Implement history functionality
};

const editChat = () => {
    emit('edit');
};

const takeScreenshot = () => {
    // Implement screenshot functionality
};

const showLastImage = () => {
    // Implement last image functionality
};

const confirmClearChat = () => {
    if (confirm('Are you sure you want to clear all chat messages?')) {
        emit('clear');
    }
};

const showPlugins = () => {
    // Implement plugins functionality
};

const showShortcuts = () => {
    // Implement shortcuts functionality
};

const showSettings = () => {
    // Implement settings functionality
};

// Auto-resize textarea
watch(inputMessage, () => {
    if (!textarea.value) return;
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
});

// Auto-scroll to bottom when new messages arrive
watch(
    () => props.chat.messages,
    () => {
        if (!messageList.value) return;
        messageList.value.scrollTop = messageList.value.scrollHeight;
    },
    { deep: true }
);
</script>

<style scoped>
.chat-message-enter-active,
.chat-message-leave-active {
    transition: all 0.5s ease;
}
.chat-message-enter-from,
.chat-message-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>
