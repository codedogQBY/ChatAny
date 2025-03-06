<template>
    <Select
        v-model="modelValue"
        @update:modelValue="handleChange"
        :disabled="disabled"
    >
        <SelectTrigger class="w-[140px] h-8 hover:bg-accent">
            <SelectValue placeholder="选择模型" />
        </SelectTrigger>
        <SelectContent side="top" class="max-h-[200px]">
            <SelectGroup v-for="group in availableModels" :key="group.name">
                <SelectLabel
                    class="font-semibold text-primary px-2 py-1.5 text-sm border-b"
                >
                    {{ group.name }}
                </SelectLabel>
                <div class="py-1">
                    <SelectItem
                        v-for="model in group.models"
                        :key="model.id"
                        :value="model.id"
                        class="text-sm hover:bg-accent cursor-pointer ml-2"
                    >
                        {{ model.name }}
                    </SelectItem>
                </div>
            </SelectGroup>
        </SelectContent>
    </Select>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useModelStore } from '@/store/model';

const props = defineProps<{
    modelId: string;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelId', id: string): void;
    (e: 'change', modelId: string, modelKey: string): void;
}>();

const modelStore = useModelStore();
const modelValue = ref(props.modelId);

// 获取所有可用的模型
const availableModels = computed(() => {
    const models = modelStore.getAllModels;
    if (!models) return [];

    // 直接返回所有模型，按组分类
    const groupedModels = models.reduce(
        (acc, model) => {
            if (!acc[model.groupName]) {
                acc[model.groupName] = [];
            }
            acc[model.groupName].push(model);
            return acc;
        },
        {} as Record<string, typeof models>
    );

    return Object.entries(groupedModels).map(([groupName, models]) => ({
        name: groupName,
        models: models,
    }));
});

// 处理模型变更
const handleChange = (id: string) => {
    if (!id) return;
    
    modelValue.value = id;
    emit('update:modelId', id);
    
    // 找到对应的模型
    const model = modelStore.getAllModels.find((m) => m.id === id);
    
    if (model) {
        emit('change', model.modelId, id);
    }
};

// 监听props变化
watch(() => props.modelId, (newId) => {
    if (newId !== modelValue.value) {
        modelValue.value = newId;
    }
});
</script> 