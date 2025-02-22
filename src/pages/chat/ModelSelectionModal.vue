<template>
    <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
        <DialogContent class="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle class="text-2xl font-bold">聊天设置</DialogTitle>
                <DialogDescription> 配置您的聊天会话参数。 </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="onConfirm" class="space-y-4 mt-4">
                <div
                    v-for="(field, key) in formFields"
                    :key="key"
                    class="flex items-center space-x-2"
                >
                    <div class="w-1/3 text-right">
                        <Label :for="key">{{ field.label }}</Label>
                    </div>
                    <div class="w-2/3 flex items-center space-x-2">
                        <component
                            :is="field.component"
                            v-model="form[key]"
                            :id="key"
                            v-bind="field.props"
                            class="flex-grow"
                        >
                            <template v-if="field.component === Select">
                                <SelectTrigger>
                                    <SelectValue :placeholder="field.props.placeholder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in field.options"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </template>
                        </component>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" class="flex-shrink-0">
                                        <MessageCircleQuestionIcon class="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" class="max-w-xs">
                                    <p>{{ field.description }}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </form>
            <DialogFooter class="mt-6">
                <div class="flex justify-end space-x-2 w-full">
                    <Button @click="$emit('update:isOpen', false)" variant="outline">取消</Button>
                    <Button @click="onConfirm">确认</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircleQuestionIcon } from 'lucide-vue-next';

interface Props {
    isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'confirm', formData: typeof form): void;
}>();

const form = reactive({
    chatName: '',
    bot: '',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    contextLength: 5,
});

const formFields = {
    chatName: {
        label: '聊天名称',
        component: Input,
        props: { placeholder: '输入聊天名称' },
        description: '为您的聊天起一个独特的名字，方便识别。',
    },
    bot: {
        label: '机器人',
        component: Select,
        props: { placeholder: '选择一个机器人' },
        options: [
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        ],
        description: '选择用于对话的AI模型。',
    },
    systemPrompt: {
        label: '系统提示词',
        component: Textarea,
        props: { placeholder: '输入系统提示词', rows: 3 },
        description: '设置AI的初始上下文或指令。',
    },
    temperature: {
        label: '温度',
        component: Input,
        props: { type: 'number', min: 0, max: 2, step: 0.1 },
        description: '控制随机性：0表示确定性，2表示高度随机。',
    },
    maxTokens: {
        label: '最大令牌数',
        component: Input,
        props: { type: 'number', min: 1, max: 32768, step: 1 },
        description: '生成响应的最大令牌数。',
    },
    topP: {
        label: 'Top P',
        component: Input,
        props: { type: 'number', min: 0, max: 1, step: 0.01 },
        description: '通过核采样控制多样性。',
    },
    contextLength: {
        label: '上下文长度',
        component: Input,
        props: { type: 'number', min: 1, max: 20, step: 1 },
        description: '包含作为上下文的先前消息数量。',
    },
};

const onConfirm = () => {
    emit('confirm', { ...form });
    emit('update:isOpen', false);
};
</script>

<style scoped>
:deep(.input),
:deep(.select),
:deep(.textarea) {
    @apply transition-all duration-200 ease-in-out;
}

:deep(.input:focus),
:deep(.select:focus),
:deep(.textarea:focus) {
    @apply ring-2 ring-primary ring-opacity-50;
}
</style>
