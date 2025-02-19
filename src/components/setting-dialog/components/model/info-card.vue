<template>
    <div class="space-y-4 px-2">
        <div class="space-y-2">
            <Label class="block mb-2" for="api-url">API 地址</Label>
            <Input id="api-url" v-model="props.model.apiUrl" />
        </div>
        <div class="space-y-2">
            <Label class="block mb-2" for="api-key">API 密钥</Label>
            <div class="flex w-full items-center gap-1.5">
                <div class="relative w-full">
                    <Input
                        :type="showApiKey ? 'text' : 'password'"
                        id="api-key"
                        v-model="props.model.apiKey"
                    />
                    <span
                        class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer"
                    >
                        <div @click="toggleShowApiKey()">
                            <EyeIcon v-if="!showApiKey" class="size-5 text-muted-foreground" />
                            <EyeOffIcon v-else class="size-6 text-muted-foreground" />
                        </div>
                    </span>
                </div>
                <Button> 测试 </Button>
            </div>
        </div>
        <div class="space-y-2">
            <div class="flex justify-between items-center">
                <Label class="block mb-2">模型组</Label>
                <Button size="sm" @click="handleAddModelGroup()">
                    新增
                    <PlusCircleIcon class="h-4 w-4" />
                </Button>
            </div>
            <div class="space-y-2">
                <Card class="w-full" v-for="group in props.model.modelGroup" :key="model.groupName">
                    <CardHeader class="py-2 px-4 mb-2 border-b">
                        <CardTitle
                            class="text-base font-semibold flex justify-between items-center"
                        >
                            <div>{{ group.groupName }}</div>
                            <PlusCircleIcon
                                @click="handleAddModel(group)"
                                class="h-4 w-4 cursor-pointer font-semibold hover:text-gray-400"
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <div class="mb-2" v-for="model in group.models" :key="model.id">
                            <div class="space-x-2 flex items-center relative">
                                <div>{{ model.name }}</div>
                                <div v-for="skill in model.skills" :key="skill">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <component
                                                    :is="skillInfo[skill].icon"
                                                    class="h-4 w-4 cursor-pointer text-primary"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" class="text-xs">
                                                {{ skillInfo[skill].label }}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div>
                                    <Popover>
                                        <PopoverTrigger>
                                            <Settings
                                                class="h-4 w-4 mt-1 cursor-pointer hover:text-gray-400"
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div class="p-2">
                                                <div class="font-bold mb-2">模型设置</div>
                                                <div class="flex space-x-1">
                                                    <div
                                                        v-for="skill in allSkills"
                                                        :key="skill"
                                                        class="flex items-center"
                                                    >
                                                        <Checkbox
                                                            :checked="model.skills.includes(skill)"
                                                            @update:checked="
                                                                handleChangeSkill(skill, model)
                                                            "
                                                        >
                                                        </Checkbox>
                                                        <span class="ml-2">
                                                            {{ skillInfo[skill].label }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div class="absolute right-0">
                                    <CircleMinusIcon
                                        @click="handleDeleteModel(model)"
                                        class="h-4 w-4 cursor-pointer text-red-600 hover:text-red-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ModelItem, Model } from '@/components/setting-dialog/components/model/type';
import { ModelGroup, Skill } from '@/components/setting-dialog/components/model/type';
import {
    GlobeIcon,
    Blocks,
    ImageIcon,
    Siren,
    Settings,
    EyeIcon,
    EyeOffIcon,
    PlusCircleIcon,
    CircleMinusIcon,
    SmilePlusIcon,
} from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const props = defineProps<{
    model: ModelItem;
}>();

type SkillInfo = {
    icon: any;
    label: string;
};

const allSkills: Skill[] = ['inference', 'online', 'plugin', 'image'];

// 是否显示 API 密钥
const showApiKey = ref(false);

const skillInfo: Record<Skill, SkillInfo> = {
    inference: {
        icon: Siren,
        label: '推理',
    },
    online: {
        icon: GlobeIcon,
        label: '联网',
    },
    plugin: {
        icon: Blocks,
        label: '插件',
    },
    image: {
        icon: ImageIcon,
        label: '图片',
    },
};

const handleChangeSkill = (skill: Skill, model: Model) => {
    const index = model.skills.indexOf(skill);
    if (index === -1) {
        model.skills.push(skill);
    } else {
        model.skills.splice(index, 1);
    }
};

// 展示/隐藏 API 密钥
const toggleShowApiKey = () => {
    showApiKey.value = !showApiKey.value;
};

// 删除模型
const handleDeleteModel = (model: Model) => {
    const index = props.model.modelGroup.findIndex((group) =>
        group.models.some((m) => m.id === model.id)
    );
    if (index !== -1) {
        const group = props.model.modelGroup[index];
        group.models = group.models.filter((m) => m.id !== model.id);
    }
};

// 新增模型组
const handleAddModelGroup = () => {
    props.model.modelGroup.push({
        groupName: '新模型组',
        models: [],
    });
};

// 新增模型
const handleAddModel = (group: ModelGroup) => {
    group.models.push({
        id: 'new-model',
        name: '新模型',
        skills: [],
    });
};
</script>
