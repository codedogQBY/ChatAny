<template>
    <div class="space-y-2 px-2">
        <div>
            <Label class="block mb-2" for="api-url">API 地址</Label>
            <Input id="api-url" v-model="props.model.apiUrl" />
        </div>
        <div>
            <Label class="block mb-2" for="api-key">API 密钥</Label>
            <Input id="api-key" v-model="props.model.apiKey" />
        </div>
        <div>
            <div class="flex">
                <Label class="block mb-2">模型</Label>
            </div>
            <div class="space-y-2">
                <Card class="w-full" v-for="group in props.model.modelGroup" :key="model.groupName">
                    <CardHeader class="py-2 px-4 border-gray-300 mb-2 border-b">
                        <CardTitle class="text-base font-semibold">
                            {{ group.groupName }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="mb-2" v-for="model in group.models" :key="model.id">
                            <div class="space-x-2 flex items-center">
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
                                                                handleChange(skill, model)
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
import { ModelItem, Model } from '@/components/setting-dialog/components/model/type';
import { Skill } from '@/components/setting-dialog/components/model/type';
import { GlobeIcon, Blocks, ImageIcon, Siren, Settings } from 'lucide-vue-next';
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

const handleChange = (skill: Skill, model: Model) => {
    const index = model.skills.indexOf(skill);
    if (index === -1) {
        model.skills.push(skill);
    } else {
        model.skills.splice(index, 1);
    }
};
</script>
