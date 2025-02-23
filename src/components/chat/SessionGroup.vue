<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PencilIcon, TrashIcon } from 'lucide-vue-next';
import type { Session } from '@/store/chat';
import { useChatStore } from '@/store/chat';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const props = defineProps<{
    sessions: Session[];
}>();

const chatStore = useChatStore();
const { toast } = useToast();

const emit = defineEmits<{
    (e: 'select', sessionId: string): void;
    (e: 'close'): void;
}>();

const editingId = ref<string | null>(null);
const editingTitle = ref('');
const showDeleteAlert = ref(false);
const sessionToDelete = ref<string | null>(null);

const startEdit = (session: Session, event: Event) => {
    event.stopPropagation();
    editingId.value = session.id;
    editingTitle.value = session.title;
    nextTick(() => {
        const input = document.querySelector(`input[data-session-id="${session.id}"]`) as HTMLInputElement;
        if (input) {
            input.focus();
            input.select();
        }
    });
};

const finishEdit = async (sessionId: string) => {
    if (editingTitle.value.trim() !== '') {
        try {
            await chatStore.renameSession(sessionId, editingTitle.value.trim());
            await chatStore.syncData();
            toast({
                description: '会话已重命名',
                duration: 1000,
            });
        } catch (error) {
            console.error('重命名失败:', error);
            toast({
                description: '重命名失败',
                variant: 'destructive',
                duration: 2000,
            });
        }
        nextTick(() => {
            editingTitle.value = '';
            editingId.value = null;
        });
    }
};

const handleDeleteClick = (sessionId: string, event: Event) => {
    event.stopPropagation();
    sessionToDelete.value = sessionId;
    showDeleteAlert.value = true;
};

const handleDeleteConfirm = async () => {
    if (sessionToDelete.value) {
        try {
            await chatStore.deleteSession(sessionToDelete.value);
            await chatStore.syncData();
            toast({
                description: '会话已删除',
                duration: 1000,
            });
        } catch (error) {
            console.error('删除失败:', error);
            toast({
                description: '删除失败',
                variant: 'destructive',
                duration: 2000,
            });
        }
        showDeleteAlert.value = false;
        sessionToDelete.value = null;
        emit('close');
    }
};
</script>

<template>
    <div class="space-y-0.5">
        <div
            v-for="session in sessions"
            :key="session.id"
            class="flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm group"
            @click="emit('select', session.id)"
        >
            <template v-if="editingId === session.id">
                <div class="flex-1">
                    <Input
                        :data-session-id="session.id"
                        v-model="editingTitle"
                        class="h-6 text-sm"
                        @blur="finishEdit(session.id)"
                        @keydown.enter="finishEdit(session.id)"
                        @keydown.esc="editingId = null"
                        @click.stop
                    />
                </div>
            </template>
            <template v-else>
                <span class="truncate">{{ session.title }}</span>
                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        class="h-5 w-5"
                        @click.stop="startEdit(session, $event)"
                    >
                        <PencilIcon class="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        class="h-5 w-5 text-destructive hover:text-destructive"
                        @click.stop="handleDeleteClick(session.id, $event)"
                    >
                        <TrashIcon class="h-3 w-3" />
                    </Button>
                </div>
            </template>
        </div>
    </div>
    <Dialog v-model:open="showDeleteAlert">
        <DialogContent class="sm:max-w-[300px]">
            <DialogHeader>
                <DialogTitle>删除会话</DialogTitle>
                <DialogDescription>
                    确定要删除这个会话吗？此操作不可恢复。
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" @click="showDeleteAlert = false">取消</Button>
                <Button 
                    variant="destructive" 
                    @click="handleDeleteConfirm"
                    @click.stop
                >
                    删除
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template> 