<template>
    <div class="flex items-center space-x-1">
        <Popover v-model:open="isOpen">
            <PopoverTrigger class="flex items-center justify-center space-x-1">
                <span class="text-gray-500 text-sm max-w-40 truncate">
                    {{ currentSession?.title }}
                </span>
                <Button variant="ghost" class="h-7 w-7">
                    <component :is="isOpen ? ChevronUpIcon : ChevronDownIcon" class="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-56 p-1">
                <div class="max-h-[300px] overflow-y-auto space-y-2">
                    <!-- 今天的会话 -->
                    <div v-if="todaySessions.length > 0">
                        <div class="px-2 py-1 text-xs text-muted-foreground font-medium">今天</div>
                        <SessionGroup
                            :sessions="todaySessions"
                            @select="handleSessionSelect"
                            @close="isOpen = false"
                        />
                    </div>

                    <!-- 昨天的会话 -->
                    <div v-if="yesterdaySessions.length > 0">
                        <div class="px-2 py-1 text-xs text-muted-foreground font-medium">昨天</div>
                        <SessionGroup
                            :sessions="yesterdaySessions"
                            @select="handleSessionSelect"
                            @close="isOpen = false"
                        />
                    </div>

                    <!-- 更早的会话 -->
                    <div v-if="earlierSessions.length > 0">
                        <div class="px-2 py-1 text-xs text-muted-foreground font-medium">更早</div>
                        <SessionGroup
                            :sessions="earlierSessions"
                            @select="handleSessionSelect"
                            @close="isOpen = false"
                        />
                    </div>
                </div>
                <Separator class="my-1" />
                <div
                    class="flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                    @click="handleCreateSession"
                >
                    <PlusIcon class="mr-2 h-4 w-4" />
                    新建会话
                </div>
            </PopoverContent>
        </Popover>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';
import type { Session } from '@/types';
import SessionGroup from './SessionGroup.vue';
import { useChatStore } from '@/store/chat';

const props = defineProps<{
    sessions: Session[];
    currentSession: Session | null;
}>();

const chatStore = useChatStore();
const isOpen = ref(false);

// 按时间分组的会话
const todaySessions = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return props.sessions.filter((s) => new Date(s.updatedAt).setHours(0, 0, 0, 0) === today);
});

const yesterdaySessions = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 24 * 60 * 60 * 1000;
    return props.sessions.filter((s) => new Date(s.updatedAt).setHours(0, 0, 0, 0) === yesterday);
});

const earlierSessions = computed(() => {
    const yesterday = new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000;
    return props.sessions.filter((s) => new Date(s.updatedAt).setHours(0, 0, 0, 0) < yesterday);
});

const emit = defineEmits<{
    (e: 'select', sessionId: string): void;
    (e: 'create'): void;
    (e: 'close'): void;
}>();

const { toast } = useToast();

const handleSessionSelect = async (sessionId: string) => {
    await chatStore.selectSession(sessionId);
    isOpen.value = false;
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

    isOpen.value = false;
    toast({
        description: '新会话已创建',
        duration: 1000,
    });
};
</script>

<style scoped>
.group:hover .opacity-0 {
    opacity: 1;
}
</style>
