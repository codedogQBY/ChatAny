<template>
    <div class="space-y-4 px-2">
        <div class="space-y-2">
            <Label for="api-url" class="block mb-2 flex justify-between">
                <div>API 地址</div>
                <div v-if="props.model.apiDocUrl">
                    <a
                        :href="props.model.apiDocUrl"
                        target="_blank"
                        class="text-xs text-gray-400 hover:text-primary flex items-center justify-center"
                    >
                        API 文档
                        <ExternalLinkIcon class="h-4 w-4 inline-block ml-1" />
                    </a>
                </div>
            </Label>
            <Input id="api-url" v-model="props.model.apiUrl" @change="handleApiUrlChange" />
        </div>
        <div class="space-y-2">
            <Label for="api-key" class="block mb-2 flex justify-start items-center space-x-2">
                <div>API 密钥</div>
                <div
                    v-if="props.model.apiKeyUrl"
                    class="text-xs text-gray-400 hover:text-primary flex items-center justify-center"
                >
                    <a
                        :href="props.model.apiKeyUrl"
                        target="_blank"
                        class="text-xs text-gray-400 hover:text-primary flex items-center justify-center"
                    >
                        获取密钥？
                    </a>
                </div>
            </Label>
            <div class="flex w-full items-center gap-1.5">
                <div class="relative w-full">
                    <Input
                        :type="showApiKey ? 'text' : 'password'"
                        id="api-key"
                        v-model="props.model.apiKey"
                        @change="handleApiKeyChange"
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
                            <div class="space-x-2 flex items-center">
                                <OctagonMinusIcon
                                    @click="handleDeleteModelGroup(group)"
                                    class="h-4 w-4 cursor-pointer text-red-600 hover:text-red-300"
                                />
                                <TextInput
                                    :modelValue="group.groupName"
                                    @update:modelValue="handleUpdateModelGroupName($event, group)"
                                ></TextInput>
                            </div>
                            <PlusCircleIcon
                                @click="handleAddModel(group)"
                                class="h-4 w-4 cursor-pointer font-semibold hover:text-gray-400"
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <div class="mb-2" v-for="model in group.models" :key="model.id">
                            <div class="flex items-center relative space-x-2">
                                <span>
                                    {{ model.name }}
                                </span>
                                <div>
                                    <Popover>
                                        <PopoverTrigger>
                                            <Settings
                                                class="h-4 w-4 mt-1 cursor-pointer hover:text-gray-400"
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent
                                            class="p-3 bg-white rounded-lg shadow-lg min-w-[260px]"
                                        >
                                            <div class="space-y-2.5">
                                                <!-- 模型名称 -->
                                                <div class="items-center">
                                                    <span
                                                        class="text-gray-500 text-sm min-w-[70px] mr-4"
                                                        >模型名称:</span
                                                    >
                                                    <TextInput
                                                        class="text-gray-700 border-0 focus:ring-1 focus:ring-blue-400 text-sm"
                                                        :modelValue="model.name"
                                                        @update:modelValue="
                                                            handleUpdateModelName(
                                                                $event,
                                                                group,
                                                                model
                                                            )
                                                        "
                                                    />
                                                </div>

                                                <!-- 模型 ID -->
                                                <div class="items-center">
                                                    <span
                                                        class="text-gray-500 text-sm min-w-[70px] mr-4"
                                                        >模型 ID:</span
                                                    >
                                                    <TextInput
                                                        class="text-gray-700 border-0 focus:ring-1 focus:ring-blue-400 text-sm"
                                                        :modelValue="model.id"
                                                        @update:modelValue="
                                                            handleUpdateModelId(
                                                                $event,
                                                                group,
                                                                model
                                                            )
                                                        "
                                                    />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div class="absolute right-0">
                                    <CircleMinusIcon
                                        @click="handleDeleteModel(model, group)"
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
import { ref, defineProps } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Supplier, Model, ModelGroup } from '@/types';
import {
    Settings,
    EyeIcon,
    EyeOffIcon,
    PlusCircleIcon,
    CircleMinusIcon,
    OctagonMinusIcon,
    ExternalLinkIcon,
} from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import TextInput from '@/components/setting-dialog/components/model/text-input.vue';
import { useModelStore } from '@/store/model';

const {
    removeModelGroup,
    addModel,
    addModelGroup,
    updateModelGroupName,
    updateModelName,
    removeModel,
    updateSupplierConfig,
    updateModelId,
} = useModelStore();

const props = defineProps<{
    model: Supplier;
}>();

// 是否显示 API 密钥
const showApiKey = ref(false);

// 展示/隐藏 API 密钥
const toggleShowApiKey = () => {
    showApiKey.value = !showApiKey.value;
};

// 删除模型
const handleDeleteModel = (model: Model, group: ModelGroup) => {
    removeModel(props.model, group, model);
};

// 新增模型组
const handleAddModelGroup = () => {
    addModelGroup(props.model);
};

// 新增模型
const handleAddModel = (group: ModelGroup) => {
    addModel(props.model, group);
};

// 删除模型组
const handleDeleteModelGroup = (group: ModelGroup) => {
    removeModelGroup(props.model, group);
};

// 更新模型组名称
const handleUpdateModelGroupName = (groupName: string, group: ModelGroup) => {
    updateModelGroupName(props.model, group, groupName);
};

// 更新模型名称
const handleUpdateModelName = (name: string, group: ModelGroup, model: Model) => {
    updateModelName(props.model, group, model, name);
};

const handleUpdateModelId = (id: string, group: ModelGroup, model: Model) => {
    updateModelId(props.model, group, model, id);
};

// 处理API地址变更
const handleApiUrlChange = () => {
    updateSupplierConfig(props.model);
};

// 处理API密钥变更
const handleApiKeyChange = () => {
    updateSupplierConfig(props.model);
};
</script>
