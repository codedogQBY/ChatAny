<template>
    <Dialog :open="true" @close="$emit('close')" modal>
        <DialogOverlay class="fixed inset-0 bg-black/50" @click="$emit('close')" />
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle class="text-2xl font-bold">创建新对话</DialogTitle>
                <DialogDescription> 请输入新对话的名称和选择AI模型。 </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="createChat" class="space-y-4">
                <div class="space-y-2">
                    <Label for="name">对话名称</Label>
                    <Input id="name" v-model="name" placeholder="输入对话名称" />
                </div>
                <div class="space-y-2">
                    <Label for="model">AI模型</Label>
                    <Select v-model="model">
                        <SelectTrigger id="model">
                            <SelectValue placeholder="选择AI模型" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="claude-3">Claude 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="submit" class="w-full">创建对话</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'create', name: string, model: string): void;
}>();

const name = ref('');
const model = ref('gpt-4');

const createChat = () => {
    if (name.value.trim()) {
        emit('create', name.value, model.value);
        emit('close');
    }
};
</script>
