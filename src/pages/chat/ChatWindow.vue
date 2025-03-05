<template>
    <div class="flex flex-col h-full bg-gradient-to-br from-background to-background/80">
        <!-- 顶部标题栏 -->
        <chat-window-header
            :chat="chat"
            :user="user"
            :current-session="currentSession"
            :is-loading="isLoading"
        ></chat-window-header>

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

        <chat-input
            :chat="chat"
            :is-loading="isLoading"
            @update-loading="(loading: boolean) => (isLoading = loading)"
        ></chat-input>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast/use-toast';
import { CopyIcon, ReplyIcon } from 'lucide-vue-next';
import { useChatStore } from '@/store/chat';
import type { Message, Chat, Session } from '@/types';
import { formatMessageTime } from '@/utils/time';
import MessageItem from '../../components/chat/MessageItem.vue';
import ChatWindowHeader from '@/components/chat/ChatWindowHeader.vue';
import ChatInput from '@/components/chat/ChatInput.vue';

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
    (e: 'quote-message', message: any): void;
    (e: 'generation-status-change', status: boolean): void;
}>();

const chatContainer = ref<HTMLElement | null>(null);
const { toast } = useToast();

const chatStore = useChatStore();

// 添加此变量以跟踪是否正在加载
const isLoading = ref(false);

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
    () => chatStore.currentSession?.messages.length,
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

const setQuotedMessage = (message: Message) => {
    emit('quote-message', message);
    toast({
        description: '已添加引用',
        duration: 2000,
    });
};

// 监听isLoading变化并发射事件
watch(isLoading, (newValue) => {
    console.log('发射生成状态变化:', newValue); // 调试日志
    emit('generation-status-change', newValue);
});
</script>

<style scoped>
textarea {
    transition: height 0.2s ease-out;
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
