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
        </div>

        <!-- 聊天内容区域 -->
        <div class="flex-1 overflow-y-auto px-4 py-6" ref="chatContainer">
            <div class="max-w-4xl mx-auto">
                <TransitionGroup name="message" tag="div" class="space-y-8">
                    <div
                        v-for="message in currentSession?.messages"
                        :key="message.id"
                        class="group flex items-start space-x-3 message-item"
                        :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
                    >
                        <template v-if="message.sender !== 'user'">
                            <Avatar class="mt-0.5 flex-shrink-0">
                                <AvatarImage :src="chat.avatar" :alt="chat.name" />
                                <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
                            </Avatar>
                            <div class="flex flex-col max-w-[75%] relative group">
                                <div class="text-sm text-muted-foreground mb-1 flex items-center">
                                    <span>{{ chat.name }}</span>
                                </div>
                                <div>
                                    <MessageItem :message="message" />
                                    <div
                                        class="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                                    >
                                        <span>{{
                                            message.createdAt
                                                ? formatMessageTime(message.createdAt)
                                                : ''
                                        }}</span>
                                        <div class="message-actions flex space-x-1 ml-2">
                                            <button
                                                @click="copyMessage(message.content)"
                                                class="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                            >
                                                <CopyIcon class="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                @click="setQuotedMessage(message)"
                                                class="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                            >
                                                <ReplyIcon class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="flex flex-col items-end max-w-[75%] relative group">
                                <div
                                    class="text-sm text-muted-foreground mb-1 self-end flex items-center"
                                >
                                    <span>{{ userName }}</span>
                                </div>
                                <div>
                                    <div
                                        class="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <p class="whitespace-pre-wrap">{{ message.content }}</p>
                                    </div>
                                    <div
                                        class="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
                                    >
                                        <div class="message-actions flex space-x-1 mr-2">
                                            <button
                                                @click="copyMessage(message.content)"
                                                class="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                            >
                                                <CopyIcon class="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                @click="setQuotedMessage(message)"
                                                class="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                            >
                                                <ReplyIcon class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span>{{
                                            message.createdAt
                                                ? formatMessageTime(message.createdAt)
                                                : ''
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <Avatar class="mt-0.5 flex-shrink-0">
                                <AvatarImage
                                    v-if="userAvatar"
                                    :src="userAvatar"
                                    :alt="userName || '用户'"
                                />
                                <AvatarFallback>{{
                                    userName && userName.length > 0 ? userName[0] : '?'
                                }}</AvatarFallback>
                            </Avatar>
                        </template>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <!-- 底部输入区域 -->
        <div class="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3">
            <!-- 引用消息显示 -->
            <Transition name="slide-up">
                <div
                    v-if="quotedMessage"
                    class="mb-3 p-3 bg-muted rounded-lg flex items-start justify-between shadow-sm"
                >
                    <div class="flex-1">
                        <div class="text-xs text-muted-foreground mb-1">引用消息</div>
                        <div class="line-clamp-2 text-sm">{{ quotedMessage.content }}</div>
                    </div>
                    <button
                        @click="cancelQuote"
                        class="p-1 hover:bg-background rounded-full"
                        :disabled="isLoading"
                    >
                        <XIcon class="w-4 h-4" />
                    </button>
                </div>
            </Transition>

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
                    @keydown="handleKeyDown"
                    @focus="setInputFocus(true)"
                    @blur="setInputFocus(false)"
                    :disabled="isLoading"
                />
                <!-- 工具栏 -->
                <div class="flex items-center justify-between border-none px-2 py-1">
                    <div class="flex items-center space-x-1">
                        <!-- 只有非默认机器人才显示模型选择器 -->
                        <Select
                            v-if="!isDefaultBot"
                            v-model="selectedModel"
                            @update:modelValue="handleModelChange"
                            :disabled="isLoading"
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="screenshot"
                                        :disabled="isLoading"
                                    >
                                        <CameraIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>截图</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="viewLastImage"
                                        :disabled="isLoading"
                                    >
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
                                        :disabled="isLoading"
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="managePlugins"
                                        :disabled="isLoading"
                                    >
                                        <PlugIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>管理插件</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="showShortcuts"
                                        :disabled="isLoading"
                                    >
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
                                            :disabled="isLoading"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>联网模式: {{ networkEnabled ? '开启' : '关闭' }}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            variant="default"
                            size="icon"
                            class="rounded-full w-10 h-10 flex-shrink-0"
                            :disabled="!canSendMessage || isLoading"
                            @click="sendMessage"
                            ><LoaderCircleIcon v-if="isLoading" class="h-5 w-5 animate-spin" />
                            <SendIcon v-else class="h-5 w-5" />
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
            :context-size="chat.contextSize"
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
    XIcon,
    CopyIcon,
    CameraIcon,
    ImageIcon,
    TrashIcon,
    PlugIcon,
    CommandIcon,
    SendIcon,
    GlobeIcon,
    ReplyIcon,
    LoaderCircleIcon,
} from 'lucide-vue-next';
import SessionSelector from '@/components/chat/SessionSelector.vue';
import ChatHistory from '@/components/chat/ChatHistory.vue';
import { useChatStore } from '@/store/chat';
import ChatSettings from '@/components/chat/ChatSettings.vue';
import DeleteSessionAlert from '@/components/chat/DeleteSessionAlert.vue';
import type { Message, Chat, Session } from '@/types';
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
import { formatMessageTime } from '@/utils/time';
import { serviceManager } from '@/core/services';
import MessageItem from './MessageItem.vue';

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
    (e: 'send-message', content: string): void;
    (e: 'toggle-network', enabled: boolean): void;
    (e: 'clear-history'): void;
    (e: 'edit-bot'): void;
    (e: 'view-history'): void;
    (e: 'quote-message', message: any): void;
    (e: 'cancel-quote'): void;
    (e: 'select-session', sessionId: string): void;
    (e: 'create-session'): void;
    (e: 'rename-session', sessionId: string, title: string): void;
    (e: 'delete-session', sessionId: string): void;
    (e: 'generation-status-change', status: boolean): void;
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

const chatStore = useChatStore();
const modelStore = useModelStore();
const botStore = useBotStore();

// 添加此变量以跟踪是否正在加载
const isLoading = ref(false);

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

const handleSendMessage = () => {
    if (inputMessage.value.trim()) {
        // 保存消息内容并清空输入框
        const messageContent = inputMessage.value.trim();
        inputMessage.value = '';

        // 发送消息内容而不是事件对象
        sendMessage(messageContent);
        scrollToBottom();
    }
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
    // 检查是否按下 Enter 键且没有按下 Shift 键
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认行为
        handleSendMessage();
    }
};

const sendMessage = async (content: string) => {
    if (!chatStore.currentChat?.id || !chatStore.currentSession?.id) return;

    try {
        // 设置加载状态
        isLoading.value = true;

        // 自动选择默认模型
        if (!selectedModel.value && modelStore.getAllModels.length > 0) {
            selectedModel.value = modelStore.getAllModels[0].id;
            console.log('已自动选择默认模型:', selectedModel.value);
        }

        // 检查是否选择了模型
        if (!selectedModel.value) {
            throw new Error('请先选择一个模型');
        }

        console.log('当前选择的模型ID:', selectedModel.value);

        // 获取当前供应商信息
        let supplierName = '';

        // 从模型信息中获取供应商
        const modelInfo = modelStore.getAllModels.find((m) => m.id === selectedModel.value);
        if (modelInfo) {
            supplierName = modelInfo.supplierId;
        } else if (selectedModel.value.includes('/')) {
            // 从ID格式中提取
            supplierName = selectedModel.value.split('/')[0];
        } else {
            supplierName = selectedModel.value;
        }

        const supplier = modelStore.suppliers.find((s) => s.name === supplierName);
        if (!supplier) {
            throw new Error(`找不到供应商: ${supplierName}`);
        }

        // 添加用户消息
        await chatStore.addMessage({
            content,
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'user',
            status: 'sent',
        });

        // 确保视图更新
        await nextTick();

        // 获取服务
        const service = await serviceManager.getService(chatStore.currentChat, supplier);

        // 添加机器人消息（状态为加载中）
        const pendingMessage = await chatStore.addMessage({
            content: '',
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'assistant',
            status: 'loading',
        });

        // 确保视图更新并滚动到底部
        await nextTick();
        scrollToBottom();

        // 获取历史消息
        const history = chatStore.currentSession.messages.slice(-20);

        // 使用流式响应
        const usesStream = true;

        if (usesStream) {
            try {
                // 创建一个强引用
                const pendingMessageRef = pendingMessage;
                console.log('启动流式响应, 消息ID:', pendingMessageRef.id);

                // 延迟一小段时间再切换到streaming状态，确保loading动画显示
                setTimeout(async () => {
                    // 确保消息还存在
                    if (pendingMessageRef) {
                        const updatedMessage = JSON.parse(JSON.stringify(pendingMessageRef));
                        updatedMessage.status = 'streaming';
                        updatedMessage.content = ''; // 确保内容为空，避免显示垃圾字符
                        await chatStore.replaceMessage(pendingMessageRef.id, updatedMessage);
                        await nextTick();
                    }
                }, 800); // 给骨架屏800ms的显示时间

                // 流式处理
                const finalContent = await service.sendMessageStream(
                    content,
                    history,
                    async (updatedContent) => {
                        if (pendingMessageRef) {
                            console.log('收到流式更新，长度:', updatedContent.length);
                            const streamingMessage = JSON.parse(JSON.stringify(pendingMessageRef));
                            streamingMessage.content = updatedContent;
                            streamingMessage.status = 'streaming';

                            await chatStore.replaceMessage(pendingMessageRef.id, streamingMessage);
                            await nextTick();
                            scrollToBottom();
                        }
                    }
                );

                // 响应完成后，更新状态为sent
                if (pendingMessageRef) {
                    console.log('流式响应完成，总长度:', finalContent.length);
                    const completedMessage = JSON.parse(JSON.stringify(pendingMessageRef));
                    completedMessage.content = finalContent;
                    completedMessage.status = 'sent';

                    await chatStore.replaceMessage(pendingMessageRef.id, completedMessage);
                    await chatStore.syncData(); // 最后一次保存
                    await nextTick();
                }
            } catch (error) {
                console.error('流式响应失败:', error);

                if (pendingMessage) {
                    const errorMessage = JSON.parse(JSON.stringify(pendingMessage));
                    errorMessage.content = `响应生成失败: ${error || '未知错误'}`;
                    errorMessage.status = 'error';

                    await chatStore.replaceMessage(pendingMessage.id, errorMessage);
                    await chatStore.syncData();
                    await nextTick();
                }
            } finally {
                // 完成后重置加载状态
                isLoading.value = false;
            }
        } else {
            // 非流式响应
            try {
                const response = await service.sendMessage(content, history);
                if (pendingMessage) {
                    pendingMessage.content = response;
                    pendingMessage.status = 'sent';
                    await chatStore.syncData();
                }
            } catch (error) {
                console.error('非流式响应失败:', error);
                if (pendingMessage) {
                    pendingMessage.content = '响应生成失败，请稍后再试。';
                    pendingMessage.status = 'error';
                    await chatStore.syncData();
                }
            } finally {
                // 完成后重置加载状态
                isLoading.value = false;
            }
        }

        // 最后确保滚动到底部
        await nextTick();
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        // 显示错误提示
        toast({
            title: '发送失败',
            description: error instanceof Error ? error.message : '未知错误',
            variant: 'destructive',
        });
        // 异常时也要重置加载状态
        isLoading.value = false;
    }
};

const copyMessage = async (content: string) => {
    try {
        await navigator.clipboard.writeText(content);
        toast({
            description: '消息已复制到剪贴板',
            duration: 2000,
        });
    } catch (error) {
        console.error('复制失败:', error);
        toast({
            title: '复制失败',
            description: '无法复制消息内容',
            variant: 'destructive',
            duration: 2000,
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

// 安全的滚动到底部函数
const scrollToBottom = async () => {
    await nextTick();
    try {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    } catch (error) {
        console.error('滚动到底部失败:', error);
    }
};

// 在组件挂载和更新时使用
onMounted(() => {
    setTimeout(scrollToBottom, 100); // 稍微延迟确保 DOM 已更新
});

// 监听消息变化
watch(
    () => chatStore.currentSession?.messages,
    () => {
        setTimeout(scrollToBottom, 50);
    },
    { deep: true }
);

// 添加用户名和头像的默认值
const userName = ref('用户'); // 添加默认用户名
const userAvatar = ref('/src/assets/placeholder.svg'); // 修正占位图像路径

// 确保模型选择初始化
onMounted(async () => {
    // 获取用户名和头像
    const storedUserName = localStorage.getItem('userName') || '用户';
    userName.value = storedUserName;

    // 获取用户头像
    const storedUserAvatar = localStorage.getItem('userAvatar') || '/src/assets/placeholder.svg';
    userAvatar.value = storedUserAvatar;

    // 默认选择第一个可用模型
    if (!selectedModel.value && modelStore.getAllModels.length > 0) {
        selectedModel.value = modelStore.getAllModels[0].id;
        console.log('已自动选择默认模型:', selectedModel.value);
    }
});

// 处理模型变更
const handleModelChange = async (modelId: string) => {
    if (!modelId) return;

    console.log('模型变更为:', modelId);

    // 更新选中的模型
    selectedModel.value = modelId;

    // 获取当前机器人
    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);

    if (!bot) return;

    // 找到对应的供应商和模型
    const model = modelStore.getAllModels.find((m) => m.id === modelId);

    if (!model) {
        console.warn('找不到模型信息:', modelId);
        return;
    }

    console.log('更新聊天模型为:', modelId, '供应商:', model.supplierId, '模型ID:', model.modelId);

    // 更新机器人的模型信息（如果不是默认机器人）
    if (!bot.isDefault) {
        await botStore.updateBotModel(bot.id, model.supplierId, model.modelId);
    }

    // 更新聊天的模型设置 - 这个必须更新，即使是默认机器人
    await chatStore.updateChatModel(props.chat.id, modelId);

    // 在页面刚加载时，如果是默认机器人，确保模型ID被正确设置到聊天对象中
    if (bot.isDefault && bot.model?.modelId && selectedModel.value) {
        // 默认机器人需要手动更新聊天的模型ID
        console.log('更新默认机器人的聊天模型ID:', selectedModel.value);
        await chatStore.updateChatModel(props.chat.id, selectedModel.value);
    }
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
    () => chatStore.currentSession?.messages,
    () => {
        nextTick(() => scrollToBottom());
    },
    { deep: true }
);

const onCopyMessage = (content: string) => {
    copyMessage(content);
};

const setQuotedMessage = (message: Message) => {
    emit('quote-message', message);
    toast({
        description: '已添加引用',
        duration: 2000,
    });
};

const cancelQuote = () => {
    emit('cancel-quote');
};

// 修改计算属性以在加载时禁用发送按钮
const canSendMessage = computed(() => {
    return inputMessage.value.trim().length > 0 && !isLoading.value;
});

// 修改历史记录点击事件
const handleHistoryClick = () => {
    if (isLoading.value) {
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
    if (isLoading.value) {
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

const alertGenerating = () => {
    toast({
        title: '请稍候',
        description: '正在生成消息，请等待完成',
        duration: 800,
    });
};

// 监听isLoading变化并发射事件
watch(isLoading, (newValue) => {
    console.log('发射生成状态变化:', newValue); // 调试日志
    emit('generation-status-change', newValue);
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

/* 修改禁用状态样式，更微妙 */
button:disabled,
select:disabled,
textarea:disabled {
    opacity: 0.8;
}

button:disabled::before,
button.disabled::before {
    content: none;
}
</style>
