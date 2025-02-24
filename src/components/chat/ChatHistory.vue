<template>
    <div class="flex h-full w-full">
        <!-- 左侧会话列表 -->
        <div class="w-64 shrink-0 border-r border-border bg-background/50">
            <div class="p-4 border-b border-border">
                <h3 class="text-lg font-semibold">会话历史</h3>
            </div>
            <div class="overflow-y-auto h-[calc(100%-60px)]">
                <TransitionGroup name="history-list" tag="div" class="space-y-2 px-2">
                    <div v-for="group in sessionGroups" :key="group.label" class="mb-4">
                        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {{ group.label }}
                        </div>

                        <div
                            v-for="session in group.sessions"
                            :key="session.id"
                            class="group relative flex items-center py-1.5 cursor-pointer transition-all duration-200 ease-in-out px-2"
                            @click="selectSession(session.id)"
                        >
                            <div
                                :class="[
                                    'flex items-center px-4 py-1.5 cursor-pointer rounded-lg transition-all duration-300 w-full',
                                    currentSession?.id === session.id
                                        ? 'bg-primary/20 shadow-lg scale-105'
                                        : 'hover:bg-primary/10',
                                ]"
                            >
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <h3 class="font-medium truncate">{{ session.title }}</h3>
                                        <span class="text-sm text-muted-foreground ml-2 shrink-0">
                                            {{ formatTime(session.updatedAt) }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-muted-foreground truncate mt-1">
                                        {{
                                            session.messages[session.messages.length - 1]
                                                ?.content || '暂无消息'
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <!-- 右侧会话详情 -->
        <div class="flex-1 flex flex-col bg-background/50 min-w-0">
            <div class="p-4 border-b border-border">
                <h3 class="text-lg font-semibold">{{ currentSession?.title }}</h3>
                <p class="text-sm text-muted-foreground">
                    {{ formatDate(currentSession?.createdAt) }}
                </p>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <div v-for="message in currentSession?.messages" :key="message.id" class="mb-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span class="font-medium">
                                    {{ message.sender === 'user' ? 'You' : botName }}
                                </span>
                                <span class="text-xs text-muted-foreground">
                                    {{ formatTime(message.createdAt) }}
                                </span>
                            </div>
                            <div class="mt-1 text-sm">
                                {{ message.content }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PencilIcon, DownloadIcon, TrashIcon } from 'lucide-vue-next';
import type { Session } from '@/store/chat';
import { useToast } from '@/components/ui/toast/use-toast';

const props = defineProps<{
    sessions: Session[];
    currentSession: Session | null;
    botName: string;
    botAvatar: string;
    userAvatar: string;
}>();

const emit = defineEmits<{
    (e: 'select', sessionId: string): void;
    (e: 'rename', sessionId: string, title: string): void;
    (e: 'delete', sessionId: string): void;
}>();

const { toast } = useToast();

// 按时间分组会话
const sessionGroups = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - 86400000 * 7;
    const lastMonth = today - 86400000 * 30;

    const groups = [
        { label: '今天', sessions: [] as Session[] },
        { label: '昨天', sessions: [] as Session[] },
        { label: '最近一周', sessions: [] as Session[] },
        { label: '最近一月', sessions: [] as Session[] },
        { label: '更早', sessions: [] as Session[] },
    ];

    props.sessions.forEach((session) => {
        const time = session.updatedAt;
        if (time >= today) {
            groups[0].sessions.push(session);
        } else if (time >= yesterday) {
            groups[1].sessions.push(session);
        } else if (time >= lastWeek) {
            groups[2].sessions.push(session);
        } else if (time >= lastMonth) {
            groups[3].sessions.push(session);
        } else {
            groups[4].sessions.push(session);
        }
    });

    groups.forEach((group) => {
        group.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    });
    return groups.filter((group) => group.sessions.length > 0);
});

const selectSession = (sessionId: string) => {
    emit('select', sessionId);
};

const handleRename = () => {
    if (!props.currentSession) return;
    const newTitle = prompt('请输入新的会话名称', props.currentSession.title);
    if (newTitle && newTitle !== props.currentSession.title) {
        emit('rename', props.currentSession.id, newTitle);
    }
};

const handleDelete = () => {
    if (!props.currentSession) return;
    if (confirm('确定要删除这个会话吗？此操作不可恢复。')) {
        emit('delete', props.currentSession.id);
    }
};

const handleExport = () => {
    if (!props.currentSession) return;
    // 导出会话内容为 Markdown
    const content = props.currentSession.messages
        .map((msg) => {
            const sender = msg.sender === 'user' ? 'You' : props.botName;
            const time = formatTime(msg.createdAt);
            return `### ${sender} (${time})\n\n${msg.content}\n`;
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

const getLastMessage = (session: Session) => {
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage ? lastMessage.content : '无消息';
};

const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
</script>

<style scoped>
.group {
    transform: translate3d(0, 0, 0);
}

/* 添加过渡动画 */
.history-list-enter-active,
.history-list-leave-active {
    transition: all 0.3s ease;
}

.history-list-enter-from,
.history-list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
</style>
