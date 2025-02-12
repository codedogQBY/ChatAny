<template>
    <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>选择模型</DialogTitle>
                <DialogDescription> 请选择一个 AI 模型并填写必要的信息。 </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="model" class="text-right">模型</Label>
                    <Select v-model="selectedModel" class="col-span-3">
                        <SelectTrigger id="model">
                            <SelectValue placeholder="选择一个模型" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="claude-v1">Claude v1</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="temperature" class="text-right">温度</Label>
                    <div class="col-span-3 flex items-center space-x-2">
                        <Input
                            id="temperature"
                            v-model="temperature"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            class="flex-1"
                        />
                        <span class="w-12 text-center">{{ temperature }}</span>
                    </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="max-tokens" class="text-right">最大 Tokens</Label>
                    <Input
                        id="max-tokens"
                        v-model="maxTokens"
                        type="number"
                        min="1"
                        class="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button @click="$emit('update:isOpen', false)" variant="outline">取消</Button>
                <Button @click="confirmSelection" :disabled="!selectedModel">确认</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'confirm', modelInfo: { model: string; temperature: number; maxTokens: number }): void;
}>();

const selectedModel = ref('');
const temperature = ref(0.7);
const maxTokens = ref(2048);

const confirmSelection = () => {
    emit('confirm', {
        model: selectedModel.value,
        temperature: parseFloat(temperature.value),
        maxTokens: parseInt(maxTokens.value),
    });
    emit('update:isOpen', false);
};

watch(
    () => props.isOpen,
    (newValue) => {
        if (newValue) {
            // Reset values when modal is opened
            selectedModel.value = '';
            temperature.value = 0.7;
            maxTokens.value = 2048;
        }
    }
);
</script>
