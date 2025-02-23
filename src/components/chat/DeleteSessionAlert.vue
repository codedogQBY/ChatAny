<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'confirm'): void;
}>();
</script>

<template>
    <AlertDialog :open="open" @update:open="(v) => emit('update:open', v)">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>删除会话</AlertDialogTitle>
                <AlertDialogDescription>
                    确定要删除这个会话吗？此操作不可恢复。
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction @click="emit('confirm')">删除</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template> 