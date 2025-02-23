<template>
    <Dialog :open="props.show" @update:open="$emit('update:show', $event)">
        <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{{ isEdit ? '编辑机器人' : '创建机器人' }}</DialogTitle>
                <DialogDescription>
                    {{ isEdit ? '修改机器人的设置' : '创建一个新的机器人' }}
                </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="flex justify-center mb-6">
                    <div class="relative group">
                        <div
                            class="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-border cursor-pointer"
                            @click="triggerFileInput"
                        >
                            <img
                                v-if="form.avatar"
                                :src="form.avatar"
                                :alt="form.name"
                                class="w-full h-full object-cover"
                            />
                            <UserCircle2Icon v-else class="w-12 h-12 text-muted-foreground" />
                        </div>
                        <input
                            type="file"
                            ref="fileInput"
                            class="hidden"
                            accept="image/*"
                            @change="handleFileChange"
                        />
                        <div
                            class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                            <UploadIcon class="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="name">名称</Label>
                    <Input id="name" v-model="form.name" required />
                </div>

                <div class="space-y-2">
                    <Label for="description">描述</Label>
                    <Textarea id="description" v-model="form.description" />
                </div>

                <div class="space-y-2">
                    <Label for="prompt">指令</Label>
                    <Textarea
                        id="prompt"
                        v-model="form.prompt"
                        placeholder="设定这个机器人的行为和特征..."
                    />
                </div>

                <div class="space-y-2">
                    <Label for="prologue">开场白</Label>
                    <Textarea
                        id="prologue"
                        v-model="form.prologue"
                        placeholder="机器人的第一句话..."
                    />
                </div>

                <DialogFooter>
                    <Button type="submit" :disabled="!form.name">
                        {{ isEdit ? '保存' : '创建' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserCircle2Icon, UploadIcon } from 'lucide-vue-next';
import type { Bot } from '@/store/bot';

const props = defineProps<{
    show: boolean;
    bot?: Bot;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    'submit': [bot: Omit<Bot, 'id' | 'isDefault'>];
}>();

const isEdit = computed(() => !!props.bot);

const form = ref({
    name: props.bot?.name || '',
    description: props.bot?.description || '',
    prompt: props.bot?.prompt || '',
    prologue: props.bot?.prologue || '您好，我能为您做什么？',
    avatar: props.bot?.avatar || '',
});

const fileInput = ref<HTMLInputElement>();

const triggerFileInput = () => {
    fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            form.value.avatar = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const handleSubmit = () => {
    emit('submit', {
        name: form.value.name,
        description: form.value.description,
        prompt: form.value.prompt,
        prologue: form.value.prologue,
        avatar: form.value.avatar,
        model: props.bot?.model,
    });
    emit('update:show', false);
};
</script> 