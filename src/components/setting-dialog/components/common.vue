<template>
    <form class="space-y-2">
        <FormField v-slot="{ componentField }" name="theme">
            <FormItem>
                <FormLabel class="text-lg">主题模式</FormLabel>
                <FormControl>
                    <div class="flex items-center space-x-2">
                        <Checkbox /> <Label>跟随系统</Label>
                    </div>
                </FormControl>
                <FormDescription class="text-slate-500 text-sm"
                    >勾选后，将根据系统设置切换主题模式</FormDescription
                >
                <FormMessage />
                <RadioGroup
                    class="grid max-w-md grid-cols-2 gap-8 pt-2"
                    v-bind="componentField"
                    :default-value="theme"
                >
                    <FormItem>
                        <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                            <FormControl>
                                <RadioGroupItem value="light" class="sr-only" />
                            </FormControl>
                            <div
                                class="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer"
                            >
                                <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                    <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                        <div class="h-2 w-20 rounded-lg bg-[#ecedef]" />
                                        <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                    </div>
                                </div>
                            </div>
                            <span class="block w-full p-2 text-center font-normal"> 明亮模式 </span>
                        </FormLabel>
                    </FormItem>
                    <FormItem>
                        <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                            <FormControl>
                                <RadioGroupItem value="dark" class="sr-only" />
                            </FormControl>
                            <div
                                class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                                <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                                    <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                        <div class="h-2 w-20 rounded-lg bg-slate-400" />
                                        <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <span class="block w-full p-2 text-center font-normal"> 黑暗模式 </span>
                        </FormLabel>
                    </FormItem>
                </RadioGroup>
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="themeColor">
            <FormItem>
                <FormLabel class="text-lg">主题色</FormLabel>
                <RadioGroup
                    class="grid grid-cols-4 gap-4"
                    v-bind="componentField"
                    :default-value="themeColor"
                >
                    <FormItem v-for="color in themeColors" :key="color.value">
                        <FormLabel class="[&:has([data-state=checked])>div]:border-red-500">
                            <FormControl>
                                <RadioGroupItem :value="color.value" class="sr-only" />
                            </FormControl>
                            <div
                                class="w-8 h-8 cursor-pointer rounded-full"
                                :style="{ backgroundColor: color.color }"
                            ></div>
                        </FormLabel>
                    </FormItem>
                </RadioGroup>
            </FormItem>
        </FormField>
    </form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    FormItem,
    FormField,
    FormLabel,
    FormDescription,
    FormMessage,
    FormControl,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const theme = ref('light');

// 主题色
const themeColors = ref([
    { value: 'Green', label: '绿色', color: '#16A34A' },
    { value: 'Rose', label: '玫红色', color: '#E11D48' },
    { value: 'Blue', label: '蓝色', color: '#2563EB' },
    { value: 'Zinc', label: '黑色', color: '#18181B' },
    { value: 'Orange', label: '橙色', color: '#F97316' },
    { value: 'Yellow', label: '黄色', color: '#FACC15' },
    { value: 'Violet', label: '紫色', color: '#7C3AED' },
    { value: 'Red', label: '红色', color: '#DC2626' },
]);

const themeColor = ref('Green');
</script>
