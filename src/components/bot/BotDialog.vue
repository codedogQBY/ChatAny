<template>
    <Dialog :open="show" @update:open="(v) => emit('update:show', v)">
        <DialogContent
            class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar overflow-x-hidden"
        >
            <DialogHeader>
                <DialogTitle
                    class="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
                >
                    {{ isEdit ? '编辑机器人' : '创建机器人' }}
                </DialogTitle>
                <DialogDescription>
                    {{ isEdit ? '修改机器人的信息' : '创建一个新的机器人' }}
                </DialogDescription>
            </DialogHeader>
            <div class="overflow-y-auto pr-6 -mr-6">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="space-y-6">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-2 ring-primary/20 cursor-pointer transition-all duration-300 hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/20"
                                @click="triggerFileInput"
                            >
                                <img
                                    v-if="formData.avatar"
                                    :src="formData.avatar"
                                    :alt="formData.name"
                                    class="w-full h-full object-cover"
                                />
                                <UserCircle2Icon v-else class="w-12 h-12 text-primary/40" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    class="group hover:border-primary/50 transition-all duration-300"
                                    @click="triggerFileInput"
                                >
                                    <UploadIcon
                                        class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                                    />
                                    上传头像
                                </Button>
                                <p class="text-xs text-muted-foreground">推荐使用正方形图片</p>
                            </div>
                        </div>

                        <div class="bg-muted/30 rounded-lg p-4 space-y-4">
                            <div class="space-y-2">
                                <Label for="name" class="text-sm font-medium">名称</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    v-model="formData.name"
                                    placeholder="给你的机器人起个名字"
                                    class="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                                />
                            </div>

                            <div class="space-y-2">
                                <Label for="description" class="text-sm font-medium">描述</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    v-model="formData.description"
                                    placeholder="简单描述一下这个机器人"
                                    class="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                                />
                            </div>
                        </div>

                        <div class="bg-muted/30 rounded-lg p-4 space-y-4">
                            <div class="space-y-2">
                                <Label
                                    for="prompt"
                                    class="text-sm font-medium flex items-center gap-2"
                                >
                                    <WandIcon class="w-4 h-4 text-primary" />
                                    系统提示词
                                </Label>
                                <Textarea
                                    id="prompt"
                                    v-model="formData.prompt"
                                    placeholder="设置机器人的行为和个性"
                                    rows="3"
                                    class="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                                />
                            </div>

                            <div class="space-y-2">
                                <Label
                                    for="prologue"
                                    class="text-sm font-medium flex items-center gap-2"
                                >
                                    <MessageSquareIcon class="w-4 h-4 text-primary" />
                                    开场白
                                </Label>
                                <Textarea
                                    id="prologue"
                                    v-model="formData.prologue"
                                    placeholder="设置机器人的第一句话"
                                    rows="3"
                                    class="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <DialogFooter
                class="sticky -bottom-6 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-6 mt-4 border-t border-border/50"
            >
                <Button variant="outline" @click="emit('update:show', false)">取消</Button>
                <Button type="submit" :disabled="!formData.name" @click="handleSubmit">
                    {{ isEdit ? '保存' : '创建' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
import { UserCircle2Icon, UploadIcon, WandIcon, MessageSquareIcon } from 'lucide-vue-next';
import type { Bot } from '@/types';

const props = defineProps<{
    show: boolean;
    bot?: Bot;
}>();

const emit = defineEmits<{
    (e: 'update:show', value: boolean): void;
    (e: 'submit', data: Omit<Bot, 'id' | 'isDefault'>): void;
}>();

const isEdit = computed(() => !!props.bot);

const initialFormData = {
    name: '',
    description: '',
    prompt: '',
    prologue: '',
    avatar: '',
};

const formData = ref({ ...initialFormData });

watch(
    () => props.bot,
    (newBot) => {
        if (newBot) {
            formData.value = {
                name: newBot.name,
                description: newBot.description,
                prompt: newBot.prompt || '',
                prologue: newBot.prologue || '',
                avatar: newBot.avatar || '',
            };
        }
    },
    { immediate: true }
);

watch(
    () => props.show,
    (newValue) => {
        if (!newValue && !props.bot) {
            formData.value = { ...initialFormData };
        }
    }
);

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
            formData.value.avatar = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const handleSubmit = () => {
    emit('submit', formData.value);
    emit('update:show', false);
};
</script>
