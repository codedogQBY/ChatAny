<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast/use-toast';
import { useChatStore } from '@/store/chat';

const props = defineProps<{
    open: boolean;
    chatId: string;
    temperature: number;
    maxTokens: number;
    topP: number;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { toast } = useToast();
const chatStore = useChatStore();

const settings = ref({
    temperature: [props.temperature],
    maxTokens: [props.maxTokens],
    topP: [props.topP],
});

watch(
    () => props.open,
    (newValue) => {
        if (newValue) {
            settings.value = {
                temperature: [props.temperature],
                maxTokens: [props.maxTokens],
                topP: [props.topP],
            };
        }
    }
);

const saveSettings = () => {
    // 确保值在有效范围内
    const validatedSettings = {
        temperature: Math.min(Math.max(settings.value.temperature[0], 0), 2),
        maxTokens: Math.min(Math.max(settings.value.maxTokens[0], 100), 4000),
        topP: Math.min(Math.max(settings.value.topP[0], 0), 1),
    };

    chatStore.updateChatSettings(props.chatId, validatedSettings);
    emit('update:open', false);
    toast({
        description: '设置已保存',
        duration: 1000,
    });
};
</script>

<template>
    <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>聊天设置</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="space-y-6">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <Label>Temperature</Label>
                            <span class="text-sm text-muted-foreground w-12 text-right">
                                {{ settings.temperature[0].toFixed(1) }}
                            </span>
                        </div>
                        <Slider
                            v-model="settings.temperature"
                            :min="0"
                            :max="2"
                            :step="0.1"
                            class="w-full"
                        />
                        <p class="text-xs text-muted-foreground">
                            值越高，回答越随机创造性；值越低，回答越确定精准
                        </p>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <Label>Max Tokens</Label>
                            <span class="text-sm text-muted-foreground w-12 text-right">
                                {{ settings.maxTokens[0] }}
                            </span>
                        </div>
                        <Slider
                            v-model="settings.maxTokens"
                            :min="128"
                            :max="8092"
                            :step="128"
                            class="w-full"
                        />
                        <p class="text-xs text-muted-foreground">生成文本的最大长度</p>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <Label>Top P</Label>
                            <span class="text-sm text-muted-foreground w-12 text-right">
                                {{ settings.topP[0].toFixed(2) }}
                            </span>
                        </div>
                        <Slider
                            v-model="settings.topP"
                            :min="0"
                            :max="1"
                            :step="0.05"
                            class="w-full"
                        />
                        <p class="text-xs text-muted-foreground">控制生成文本的新颖程度</p>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" @click="emit('update:open', false)">取消</Button>
                <Button @click="saveSettings">保存</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
