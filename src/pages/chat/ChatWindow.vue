<template>
    <div class="flex flex-col h-full bg-gradient-to-br from-background to-background/80">
        <!-- 顶部标题栏 -->
        <div
            data-tauri-drag-region
            class="flex items-center justify-between px-2 py-2 bg-card/50 backdrop-blur-sm border-b border-border/50"
        >
            <div class="flex items-center space-x-3">
                <Avatar>
                    <AvatarImage :src="chat.avatar" :alt="chat.name" />
                    <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
                </Avatar>
                <h2 class="text-xl font-semibold text-foreground">{{ chat.name }}</h2>
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="ghost" size="icon" @click="toggleHistory">
                    <ClockIcon class="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" @click="$emit('edit-bot')">
                    <SettingsIcon class="h-5 w-5" />
                </Button>
            </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="flex-1 overflow-y-auto p-6" ref="chatContainer">
            <TransitionGroup name="message" tag="div" class="space-y-6">
                <div
                    v-for="message in chat.messages"
                    :key="message.id"
                    class="group flex items-end space-x-2"
                    :class="message.sender.id === user.id ? 'justify-end' : 'justify-start'"
                >
                    <template v-if="message.sender.id !== user.id">
                        <Avatar class="mb-2">
                            <AvatarImage :src="message.sender.avatar" :alt="message.sender.name" />
                            <AvatarFallback>{{ message.sender.name[0] }}</AvatarFallback>
                        </Avatar>
                        <div
                            class="relative text-sm max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl bg-card text-card-foreground rounded-bl-sm"
                        >
                            <TypewriterText
                                v-if="message.isNew"
                                :content="message.content"
                                :key="message.id"
                                :typing-speed="30"
                                :start-delay="300"
                                @typing-complete="message.isNew = false"
                            />
                            <div v-else class="w-full break-words whitespace-pre-wrap leading-6">
                                {{ message.content }}
                            </div>
                            <div class="mt-2 text-xs opacity-50">
                                {{ new Date(message.timestamp).toLocaleTimeString() }}
                            </div>
                        </div>
                        <div class="flex items-center space-x-1 invisible group-hover:visible">
                            <div
                                class="p-1 rounded-sm bg-transparent hover:bg-primary/10 transition-colors duration-200 ease-in-out cursor-pointer"
                                @click="copyMessage(message.content)"
                            >
                                <CopyIcon class="h-3 w-3" />
                            </div>
                            <div
                                class="p-1 rounded-sm bg-transparent hover:bg-primary/10 transition-colors duration-200 ease-in-out cursor-pointer"
                                @click="$emit('quote-message', message)"
                            >
                                <QuoteIcon class="h-3 w-3" />
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div class="flex items-center space-x-1 invisible group-hover:visible">
                            <div
                                class="p-1 rounded-sm bg-transparent hover:bg-primary/10 transition-colors duration-200 ease-in-out cursor-pointer"
                                @click="copyMessage(message.content)"
                            >
                                <CopyIcon class="h-3 w-3" />
                            </div>
                            <div
                                class="p-1 rounded-sm bg-transparent hover:bg-primary/10 transition-colors duration-200 ease-in-out cursor-pointer"
                                @click="$emit('quote-message', message)"
                            >
                                <QuoteIcon class="h-3 w-3" />
                            </div>
                        </div>
                        <div
                            class="relative max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl bg-primary text-primary-foreground rounded-br-sm"
                        >
                            <div class="w-full break-words whitespace-pre-wrap text-sm leading-6">
                                {{ message.content }}
                            </div>
                            <div class="mt-2 text-xs opacity-50">
                                {{ new Date(message.timestamp).toLocaleTimeString() }}
                            </div>
                        </div>
                        <Avatar class="mb-2">
                            <AvatarImage :src="user.avatar" :alt="user.name" />
                            <AvatarFallback>{{ user.name[0] }}</AvatarFallback>
                        </Avatar>
                    </template>
                </div>
            </TransitionGroup>
        </div>

        <!-- 底部输入区域 -->
        <div class="p-4 bg-card/50 backdrop-blur-sm">
            <!-- 引用消息展示 -->
            <div
                v-if="quotedMessage"
                class="mb-2 p-3 bg-muted rounded-lg text-sm flex items-center justify-between"
            >
                <div class="flex items-center space-x-2">
                    <QuoteIcon class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground line-clamp-1">{{
                        quotedMessage.content
                    }}</span>
                </div>
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="$emit('cancel-quote')">
                    <XIcon class="h-4 w-4" />
                </Button>
            </div>

            <!-- 输入框 -->
            <div
                :class="`relative rounded-xl border ${
                    isFocus ? 'border-primary' : 'border-border'
                }`"
            >
                <Textarea
                    v-model="inputMessage"
                    placeholder="输入消息..."
                    :rows="1"
                    class="resize-none overflow-auto w-full flex-1 bg-transparent p-3 pb-1.5 text-sm outline-none ring-0 placeholder:text-gray-500 border-none mb-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                    @keydown.enter.prevent="sendMessage"
                    @focus="setInputFocus(true)"
                    @blur="setInputFocus(false)"
                />
                <!-- 工具栏 -->
                <div class="flex items-center space-x-1 justify-between border-none px-2 py-1">
                    <div class="flex items-center space-x-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button variant="ghost" size="icon" @click="screenshot">
                                        <CameraIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>截图</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button variant="ghost" size="icon" @click="viewLastImage">
                                        <ImageIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>查看最后图片</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="confirmClearHistory"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>清空历史</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button variant="ghost" size="icon" @click="managePlugins">
                                        <PlugIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>管理插件</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button variant="ghost" size="icon" @click="showShortcuts">
                                        <CommandIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>快捷键</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button variant="ghost" size="icon" @click="openSettings">
                                        <SettingsIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>设置</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div class="flex items-center justify-center space-x-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div>
                                        <Switch
                                            v-model="networkEnabled"
                                            class="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>联网模式: {{ networkEnabled ? '开启' : '关闭' }}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            @click="sendMessage"
                            :disabled="!inputMessage.trim()"
                            class="rounded-full"
                            size="icon"
                        >
                            <SendIcon class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 历史记录抽屉 -->
        <Drawer v-model:open="showHistory" class="w-96" @close="showHistory = false">
            <DrawerContent class="user-select">
                <div class="flex justify-between items-center p-4 border-b border-border">
                    <h3 class="text-lg font-semibold">聊天历史</h3>
                    <Button variant="ghost" size="icon" @click="toggleHistory(false)">
                        <XIcon class="h-5 w-5" />
                    </Button>
                </div>
                <div class="p-4 overflow-y-auto" style="max-height: calc(80vh - 64px)">
                    <div v-for="(message, index) in chat.messages" :key="index" class="mb-4">
                        <div class="font-semibold">{{ message.sender.name }}</div>
                        <div>{{ message.content }}</div>
                        <div class="text-xs text-muted-foreground">
                            {{ new Date(message.timestamp).toLocaleString() }}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { useToast } from '@/components/ui/toast/use-toast';
import {
    ClockIcon,
    SettingsIcon,
    QuoteIcon,
    XIcon,
    CopyIcon,
    CameraIcon,
    ImageIcon,
    TrashIcon,
    PlugIcon,
    CommandIcon,
    SendIcon,
} from 'lucide-vue-next';
import TypewriterText from './TypewriterText.vue';

interface User {
    id: number;
    name: string;
    avatar: string;
}

interface Message {
    id: number;
    content: string;
    sender: {
        id: number;
        name: string;
        avatar: string;
    };
    timestamp: Date;
    isNew?: boolean;
}

interface Chat {
    id: number;
    name: string;
    avatar?: string;
    messages: Message[];
}

const props = defineProps<{
    chat: Chat;
    user: User;
    quotedMessage: Message | null;
}>();

const emit = defineEmits<{
    (e: 'send-message', message: string): void;
    (e: 'toggle-network', enabled: boolean): void;
    (e: 'clear-history'): void;
    (e: 'edit-bot'): void;
    (e: 'view-history'): void;
    (e: 'quote-message', message: Message): void;
    (e: 'cancel-quote'): void;
}>();

const inputMessage = ref('');
const networkEnabled = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const showHistory = ref(false);
const { toast } = useToast();
// 是否聚焦输入框
const isFocus = ref(false);

// 设置输入框是否聚焦
const setInputFocus = (value: boolean) => {
    isFocus.value = value;
};

const sendMessage = () => {
    if (inputMessage.value.trim()) {
        emit('send-message', inputMessage.value);
        inputMessage.value = '';
        scrollToBottom();
    }
};

const copyMessage = async (content: string) => {
    try {
        await navigator.clipboard.writeText(content);
        toast({
            title: '已复制',
            description: '消息内容已复制到剪贴板',
            duration: 1000,
        });
    } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({
            title: '复制失败',
            description: '无法复制消息内容',
            variant: 'destructive',
            duration: 1000,
        });
    }
};

const screenshot = () => {
    toast({
        description: '截图功能即将推出',
        duration: 1000,
    });
};

const viewLastImage = () => {
    toast({
        description: '查看最后图片功能即将推出',
        duration: 1000,
    });
};

const confirmClearHistory = () => {
    if (confirm('确定要清空聊天记录吗？')) {
        emit('clear-history');
    }
};

const managePlugins = () => {
    toast({
        description: '插件管理功能即将推出',
        duration: 1000,
    });
};

const showShortcuts = () => {
    toast({
        description: '快捷键功能即将推出',
        duration: 1000,
    });
};

const openSettings = () => {
    toast({
        description: '设置功能即将推出',
        duration: 1000,
    });
};

const toggleHistory = () => {
    showHistory.value = !showHistory.value;
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    });
};

watch(networkEnabled, (newValue) => {
    emit('toggle-network', newValue);
});

watch(
    () => props.chat.messages,
    (newMessages, oldMessages) => {
        if (newMessages.length > oldMessages.length) {
            const latestMessage = newMessages[newMessages.length - 1];
            if (latestMessage.sender.id !== props.user.id) {
                latestMessage.isNew = true;
            }
        }
        scrollToBottom();
    },
    { deep: true }
);
</script>

<style scoped>
.message-enter-active,
.message-leave-active {
    transition: all 0.5s cubic-bezier(0.05, 0.7, 0.1, 1);
}

.message-enter-from,
.message-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
}

textarea {
    transition: height 0.2s ease-out;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>
