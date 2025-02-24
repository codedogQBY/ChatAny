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
                <SessionSelector
                    :sessions="chat.sessions"
                    :current-session="currentSession"
                    @select="chatStore.selectSession($event)"
                    @create="handleCreateSession"
                />
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="ghost" size="icon" @click="toggleHistory">
                    <ClockIcon class="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" @click="showSettings = true">
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
                    class="group flex items-end space-x-2 message-item"
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
                                v-if="message.sender.id !== user.id && message.status === 'pending'"
                                :content="message.content"
                                :key="message.id"
                                :typing-speed="30"
                                :start-delay="300"
                                @typing-complete="updateMessageStatus(message.id, 'sent')"
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
                <div class="flex items-center justify-between border-none px-2 py-1">
                    <div class="flex items-center space-x-1">
                        <!-- 只有非默认机器人才显示模型选择器 -->
                        <Select
                            v-if="!isDefaultBot"
                            v-model="selectedModel"
                            @update:modelValue="handleModelChange"
                        >
                            <SelectTrigger class="w-[140px] h-8 hover:bg-accent">
                                <SelectValue placeholder="选择模型" />
                            </SelectTrigger>
                            <SelectContent side="top" class="max-h-[200px]">
                                <SelectGroup v-for="group in availableModels" :key="group.name">
                                    <SelectLabel
                                        class="font-semibold text-primary px-2 py-1.5 text-sm border-b"
                                    >
                                        {{ group.name }}
                                    </SelectLabel>
                                    <div class="py-1">
                                        <SelectItem
                                            v-for="model in group.models"
                                            :key="model.id"
                                            :value="model.id"
                                            class="text-sm hover:bg-accent cursor-pointer ml-2"
                                        >
                                            {{ model.name }}
                                        </SelectItem>
                                    </div>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

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
                                <TooltipContent>上传图片</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="confirmDeleteSession"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>删除当前会话</TooltipContent>
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
                    </div>
                    <div class="flex items-center justify-center space-x-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div class="flex items-center space-x-1">
                                        <GlobeIcon
                                            :class="`h-4 w-4 ${
                                                networkEnabled
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground'
                                            }`"
                                        >
                                        </GlobeIcon>
                                        <Switch
                                            v-model:checked="networkEnabled"
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
                        :user-avatar="user.avatar"
                        @select="chatStore.selectSession($event)"
                    />
                </div>
            </DrawerContent>
        </Drawer>

        <ChatSettings
            v-model:open="showSettings"
            :chat-id="chat.id"
            :temperature="chat.temperature"
            :max-tokens="chat.maxTokens"
            :top-p="chat.topP"
        />

        <!-- 添加删除确认对话框 -->
        <DeleteSessionAlert
            v-model:open="showClearConfirm"
            title="删除当前会话"
            description="确定要删除当前会话吗？此操作将删除所有聊天记录且不可恢复。"
            @confirm="handleClearConfirm"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
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
    GlobeIcon,
} from 'lucide-vue-next';
import TypewriterText from './TypewriterText.vue';
import SessionSelector from '@/components/chat/SessionSelector.vue';
import ChatHistory from '@/components/chat/ChatHistory.vue';
import { Session, useChatStore } from '@/store/chat';
import ChatSettings from '@/components/chat/ChatSettings.vue';
import DeleteSessionAlert from '@/components/chat/DeleteSessionAlert.vue';
import type { Message, Chat } from '@/types';
import { useModelStore } from '@/store/model';
import { useBotStore } from '@/store/bot';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const props = defineProps<{
    chat: Chat;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    quotedMessage: Message | null;
    currentSession: Session | null;
}>();

const emit = defineEmits<{
    (e: 'send-message', message: string): void;
    (e: 'toggle-network', enabled: boolean): void;
    (e: 'clear-history'): void;
    (e: 'edit-bot'): void;
    (e: 'view-history'): void;
    (e: 'quote-message', message: Message): void;
    (e: 'cancel-quote'): void;
    (e: 'select-session', sessionId: string): void;
    (e: 'create-session'): void;
    (e: 'rename-session', sessionId: string, title: string): void;
    (e: 'delete-session', sessionId: string): void;
    (
        e: 'update-settings',
        settings: {
            name: string;
            temperature: number;
            maxTokens: number;
            topP: number;
        }
    ): void;
}>();

const inputMessage = ref('');
const networkEnabled = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const showHistory = ref(false);
const { toast } = useToast();
// 是否聚焦输入框
const isFocus = ref(false);
const showSettings = ref(false);
const showClearConfirm = ref(false);

// 初始化设置值
const defaultSettings = {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
};

const settings = ref({
    name: props.chat.name,
    temperature: props.chat.temperature,
    maxTokens: props.chat.maxTokens,
    topP: props.chat.topP,
});

const chatStore = useChatStore();
const modelStore = useModelStore();
const botStore = useBotStore();

// 判断是否为默认机器人
const isDefaultBot = computed(() => {
    if (!props.chat?.botId) return true;

    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);

    return bot?.isDefault ?? true;
});

// 获取所有可用的模型
const availableModels = computed(() => {
    const models = modelStore.getAllModels;
    if (!models) return [];

    // 直接返回所有模型，按组分类
    const groupedModels = models.reduce((acc, model) => {
        if (!acc[model.groupName]) {
            acc[model.groupName] = [];
        }
        acc[model.groupName].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    return Object.entries(groupedModels).map(([groupName, models]) => ({
        name: groupName,
        models: models,
    }));
});

// 当前选中的模型
const selectedModel = ref('');

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

const confirmDeleteSession = () => {
    showClearConfirm.value = true;
};

const handleClearConfirm = async () => {
    if (!props.currentSession) return;

    try {
        // 删除当前会话
        await chatStore.deleteSession(props.currentSession.id);
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
    if (chatContainer.value) {
        // 直接设置 scrollTop 为最大值
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const handleCreateSession = async () => {
    if (!chatStore.currentChat) return;

    const newSession = await chatStore.createSession(
        chatStore.currentChat.botId,
        chatStore.currentChat.id,
        `新的会话 ${chatStore.currentChat.sessions.length + 1}`
    );

    chatStore.currentChat.sessions.push(newSession);
    await chatStore.selectSession(newSession.id);
    await chatStore.syncData();

    toast({
        description: '新会话已创建',
        duration: 1000,
    });
};

// 重命名会话
const handleRenameSession = (sessionId: string) => {
    if (!props.currentSession) return;
    const newTitle = prompt('请输入新的会话名称', props.currentSession.title);
    if (newTitle && newTitle !== props.currentSession.title) {
        emit('rename-session', sessionId, newTitle);
    }
};

// 删除会话
const handleDeleteSession = (sessionId: string) => {
    if (confirm('确定要删除这个会话吗？此操作不可恢复。')) {
        emit('delete-session', sessionId);
        toast({
            description: '会话已删除',
            duration: 1000,
        });
    }
};

// 导出会话
const handleExportSession = () => {
    if (!props.currentSession) return;
    const content = props.chat.messages
        .map((msg) => {
            const time = new Date(msg.timestamp).toLocaleString();
            return `### ${msg.sender.name} (${time})\n\n${msg.content}\n`;
        })
        .join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.currentSession.title}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
        description: '会话已导出',
        duration: 1000,
    });
};

// 机器人设置
const handleBotSettings = () => {
    emit('edit-bot');
};

// 清空会话
const handleClearSession = () => {
    if (confirm('确定要清空当前会话的所有消息吗？此操作不可恢复。')) {
        emit('clear-history');
        toast({
            description: '会话已清空',
            duration: 1000,
        });
    }
};

const updateMessageStatus = (messageId: string | number, status: string) => {
    const message = props.chat.messages.find((m) => m.id === messageId);
    if (message) {
        message.status = status;
    }
};

// 处理模型变更
const handleModelChange = async (modelId: string) => {
    if (!modelId) return;

    // 更新选中的模型
    selectedModel.value = modelId;

    // 获取当前机器人
    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);

    if (!bot || bot.isDefault) return; // 默认机器人不允许更改模型

    // 找到对应的供应商和模型
    const model = modelStore.getAllModels.find((m) => m.id === modelId);

    if (!model) return;

    // 更新机器人的模型信息
    await botStore.updateBotModel(bot.id, model.supplierId, model.id);

    // 更新聊天的模型设置
    await chatStore.updateChatModel(props.chat.id, modelId);
};

watch(networkEnabled, (newValue) => {
    emit('toggle-network', newValue);
});

// 监听 currentSession 的变化
watch(
    () => props.currentSession?.id,
    async () => {
        await nextTick();
        scrollToBottom();
    },
    { immediate: true }
);

// 监听消息变化
watch(
    () => props.chat.messages,
    (newMessages, oldMessages) => {
        if (newMessages.length > oldMessages.length) {
            const latestMessage = newMessages[newMessages.length - 1];
            nextTick(() => {
                scrollToBottom();
            });
        }
    },
    { deep: true }
);

// 初始化时设置选中的模型
onMounted(async () => {
    try {
        await Promise.all([modelStore.initializeStore(), botStore.initializeStore()]);

        const bot = botStore.sections
            .flatMap((section) => section.bots)
            .find((bot) => bot.id === props.chat.botId);

        if (!bot) return;

        if (bot.isDefault) {
            // 默认机器人使用自己的固定模型
            selectedModel.value = bot?.model?.supplierId + bot?.model?.modelId;
        } else {
            // 非默认机器人
            if (bot.model) {
                // 如果机器人已有选择的模型，使用该模型
                selectedModel.value = bot.model.modelId;
            } else if (availableModels.value?.length > 0) {
                // 只有在没有选择模型时，才设置第一个可用模型
                const firstGroup = availableModels.value[0];
                if (firstGroup.models.length > 0) {
                    const firstModel = firstGroup.models[0];
                    selectedModel.value = firstModel.id;
                    await handleModelChange(firstModel.id);
                }
            }
        }
    } catch (error) {
        console.error('Failed to initialize stores:', error);
    }
});
</script>

<style scoped>
.message-enter-active,
.message-leave-active {
    transition: all 0.2s ease-out;
}

.message-enter-from,
.message-leave-to {
    opacity: 0;
    transform: translateY(20px);
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
