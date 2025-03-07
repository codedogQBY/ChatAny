<template>
    <div class="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3">
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
        <div :class="`relative rounded-xl border ${isFocus ? 'border-primary' : 'border-border'}`">
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
                    <ModelSelector
                        v-if="!isDefaultBot"
                        v-model:modelId="selectedModelId"
                        @change="handleModelChange"
                        :disabled="isLoading"
                    />

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
                        :disabled="!canSendMessage"
                        @click="handleSendMessage"
                        ><LoaderCircleIcon v-if="isLoading" class="h-5 w-5 animate-spin" />
                        <SendIcon v-else class="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, defineEmits, computed, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import ModelSelector from '@/components/common/ModelSelector.vue';
import {
    CameraIcon,
    CommandIcon,
    GlobeIcon,
    ImageIcon,
    LoaderCircleIcon,
    PlugIcon,
    SendIcon,
    TrashIcon,
    XIcon,
} from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Chat, Message } from '@/types';
import { useBotStore } from '@/store/bot';
import { serviceManager } from '@/core/services';
import { useChatStore } from '@/store/chat';
import { useModelStore } from '@/store/model';
import { useCommonStore } from '@/store/common';
import { toast } from '@/components/ui/toast';
import { sendMessageNoContext } from '@/core/chat';

const props = defineProps<{
    chat: Chat;
    isLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update-loading', loading: boolean): void;
}>();

// 是否聚焦输入框
const isFocus = ref(false);
// 当前选中的模型
const selectedModel = ref('');
const selectedModelId = ref('');
const inputMessage = ref('');
const networkEnabled = ref(false);

const chatStore = useChatStore();
const modelStore = useModelStore();
const botStore = useBotStore();
const commonStore = useCommonStore();

const { quotedMessage } = storeToRefs(chatStore);

// 判断是否为默认机器人
const isDefaultBot = computed(() => {
    if (!props.chat?.botId) return true;

    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);
    return bot?.isDefault;
});

// 修改计算属性以在加载时禁用发送按钮
const canSendMessage = computed(() => {
    return inputMessage.value.trim().length > 0 && !props.isLoading;
});

const cancelQuote = () => {
    chatStore.cancelQuote();
};

const sendMessage = async (content: string) => {
    if (!chatStore.currentChat?.id || !chatStore.currentSession?.id) return;

    try {
        // 设置加载状态
        emit('update-loading', true);

        // 自动选择默认模型
        if (!selectedModel.value && modelStore.getAllModels.length > 0) {
            selectedModel.value = modelStore.getAllModels[0].modelId;
            console.log('已自动选择默认模型:', selectedModel.value);
        }

        // 检查是否选择了模型
        if (!selectedModel.value) {
            throw new Error('请先选择一个模型');
        }

        // 获取当前供应商信息
        let supplierName = '';

        // 从模型信息中获取供应商
        const modelInfo = modelStore.getAllModels.find((m) => m.id === selectedModelId.value);
        if (modelInfo) {
            supplierName = modelInfo.supplierId;
        } else if (selectedModelId.value.includes('/')) {
            // 从ID格式中提取
            supplierName = selectedModelId.value.split('/')[0];
        } else {
            supplierName = selectedModelId.value;
        }

        const supplier = modelStore.suppliers.find((s) => s.name === supplierName);
        if (!supplier) {
            throw new Error(`找不到供应商: ${supplierName}`);
        }

        // 获取历史消息
        const history = chatStore.currentSession.messages.slice(-chatStore.currentChat.contextSize);
        // 添加用户消息
        await chatStore.addMessage({
            content,
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'user',
            status: 'sent',
            quoteContent: quotedMessage.value?.content || '',
        });

        // 会话命名
        const currentMessages = chatStore.currentSession.messages || [];
        // 如果只有一个用户消息，尝试重命名会话
        const isSessionRenamed = currentMessages.filter((m) => m.sender === 'user').length === 1;
        if (isSessionRenamed) {
            const sessionModelId = commonStore.getSessionModelId;
            if (sessionModelId) {
                const modelInfo = modelStore.getAllModels.find((m) => m.id === sessionModelId);
                // 获取供应商
                const supplier = modelStore.getSuppliers.find(
                    (s) => s.name === modelInfo?.supplierId
                );
                sendMessageNoContext(content, {
                    url: supplier?.apiUrl!,
                    model: modelInfo?.modelId!,
                    apiKey: supplier?.apiKey!,
                    maxTokens: 4000,
                    systemPrompt:
                        '你是一名擅长会话的助理，你需要将用户的会话总结为 20 个字或者（单词）以内的标题，标题语言与用户的首要语言一致，不要使用标点符号和其他特殊符号。请注意直接返回标题即可，不需要其他内容。',
                }).then((res) => {
                    chatStore.renameSession(
                        chatStore.currentSession?.id!,
                        res.choices[0].message.content || '新的会话'
                    );
                });
            }
        }

        // 获取服务
        const service = await serviceManager.getService(chatStore.currentChat, supplier);

        // 添加机器人消息（状态为加载中）
        const pendingMessage = await chatStore.addMessage({
            content: '',
            chatId: chatStore.currentChat.id,
            sessionId: chatStore.currentSession.id,
            sender: 'assistant',
            status: 'loading',
            thinkContent: '',
        });

        // 确保视图更新并滚动到底部
        await nextTick();

        // 使用流式响应
        const usesStream = true;

        if (usesStream) {
            // 在try块之前声明变量
            let streamingTimeout;
            let hasError = false;

            try {
                // 创建一个强引用
                const pendingMessageRef = pendingMessage;
                console.log('启动流式响应, 消息ID:', pendingMessageRef?.id);

                // 延迟一小段时间再切换到streaming状态，确保loading动画显示
                streamingTimeout = setTimeout(async () => {
                    // 确保消息还存在且没有发生错误
                    if (pendingMessageRef && !hasError) {
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

                // 标记发生了错误
                hasError = true;

                if (pendingMessage) {
                    const errorMessage = JSON.parse(JSON.stringify(pendingMessage));
                    errorMessage.content = `响应生成失败: ${error || '未知错误'}`;
                    errorMessage.status = 'error';

                    await chatStore.replaceMessage(pendingMessage.id, errorMessage);
                    await chatStore.syncData();
                    await nextTick();
                }
            } finally {
                // 取消延时任务 (清除timeout)
                if (streamingTimeout) {
                    clearTimeout(streamingTimeout);
                }

                // 完成后重置加载状态
                emit('update-loading', false);
            }
        }

        // 最后确保滚动到底部
        await nextTick();
    } catch (error) {
        console.error('发送消息失败:', error);
        // 显示错误提示
        toast({
            title: '发送失败',
            description: error instanceof Error ? error.message : '未知错误',
            variant: 'destructive',
        });
        // 异常时也要重置加载状态
        emit('update-loading', false);
    }
};

const handleSendMessage = () => {
    if (inputMessage.value.trim()) {
        // 保存消息内容并清空输入框
        const messageContent = inputMessage.value.trim();
        inputMessage.value = '';

        // 发送消息内容而不是事件对象
        sendMessage(messageContent);
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

const setInputFocus = (value: boolean) => {
    isFocus.value = value;
};

// 处理模型变更
const handleModelChange = async (modelValue: string, modelId: string) => {
    if (!modelId) return;

    // 获取当前机器人
    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);

    if (!bot) return;

    // 保存模型 ID
    selectedModel.value = modelValue;
    selectedModelId.value = modelId;

    // 找到对应的供应商和模型
    const model = modelStore.getAllModels.find((m) => m.id === modelId);

    if (!model) {
        console.warn('找不到模型信息:', modelId);
        return;
    }

    // 更新机器人的模型信息（如果不是默认机器人）
    if (!bot.isDefault) {
        await botStore.updateBotModel(bot.id, model.supplierId, model.modelId);
        await chatStore.updateChatModel(props.chat.id, selectedModel.value);
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
    toast({
        description: '删除会话功能即将推出',
        duration: 1000,
    });
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

onMounted(() => {
    // 如果没有选择模型，则选择第一个可用模型
    const bot = botStore.sections
        .flatMap((section) => section.bots)
        .find((bot) => bot.id === props.chat.botId);
    if (!bot?.model) {
        selectedModel.value = modelStore.getAllModels[0].modelId;
        selectedModelId.value = modelStore.getAllModels[0].id;
    } else {
        selectedModel.value = bot?.model?.modelId!;
        selectedModelId.value = bot?.model?.supplierId + '/' + bot?.model?.modelId;
    }
});
</script>

<style scoped>
textarea {
    transition: height 0.2s ease-out;
}
</style>
