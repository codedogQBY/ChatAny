<template>
    <div class="flex-1 overflow-y-auto px-4 py-6" ref="chatContainer">
        <div class="max-w-4xl mx-auto">
            <TransitionGroup name="message" tag="div" class="space-y-2">
                <div
                    v-for="message in currentSession?.messages"
                    :key="message.id"
                    class="group flex items-start space-x-3 message-item"
                    :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
                >
                    <template v-if="message.sender !== 'user'">
                        <Avatar class="mt-0.5 flex-shrink-0">
                            <AvatarImage :src="chat?.avatar || ''" :alt="chat.name" />
                            <AvatarFallback>{{ chat.name[0] }}</AvatarFallback>
                        </Avatar>
                        <div class="flex flex-col max-w-[90%] relative group">
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
                        <div class="flex flex-col items-end max-w-[95%] relative group">
                            <div
                                class="text-sm text-muted-foreground mb-1 self-end flex items-center"
                            >
                                <span>{{ userName }}</span>
                            </div>
                            <div>
                                <div
                                    class="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 hover:shadow-md transition-shadow duration-200 w-auto"
                                >
                                    <p class="whitespace-pre-wrap">{{ message.content }}</p>
                                </div>
                            </div>
                            <div
                                v-if="message.quoteContent"
                                class="mt-2 max-w-[60%] rounded-xl bg-gray-200 text-xs p-2 text-gray-400"
                            >
                                <HoverCard>
                                    <HoverCardTrigger>
                                        <div class="line-clamp-2">{{ message.quoteContent }}</div>
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <div class="max-h-60 overflow-y-auto w-full text-sm">
                                            {{ message.quoteContent }}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>
                            <div
                                class="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
                            >
                                <div class="message-actions flex space-x-1 mr-2 mt-2">
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
                                    message.createdAt ? formatMessageTime(message.createdAt) : ''
                                }}</span>
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
</template>

<script lang="ts" setup>
import { ref, defineProps, nextTick, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { formatMessageTime } from '@/utils/time.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar/index.js';
import { CopyIcon, ReplyIcon } from 'lucide-vue-next';
import MessageItem from '@/components/chat/MessageItem.vue';
import { useChatStore } from '@/store/chat.js';
import type { Chat, Message } from '@/types/index.js';
import { toast } from '@/components/ui/toast';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const props = defineProps<{
    chat: Chat;
}>();

// 添加用户名和头像的默认值
const userName = ref('用户'); // 添加默认用户名
const userAvatar = ref('/src/assets/placeholder.svg'); // 修正占位图像路径

const chatStore = useChatStore();
const { currentSession } = storeToRefs(chatStore);

const setQuotedMessage = (message: Message) => {
    chatStore.setQuotedMessage(message);
    toast({
        description: '已添加引用',
        duration: 2000,
    });
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

const chatContainer = ref<HTMLElement | null>(null);

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

watch(
    () => chatStore.currentSession?.id,
    async () => {
        scrollToBottom();
    },
    { immediate: true }
);
</script>

<style scoped></style>
