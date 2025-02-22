<template>
    <form class="space-y-2">
        <FormField v-slot="{ componentField }" name="language">
            <FormItem>
                <FormLabel class="text-lg">系统语言</FormLabel>
                <Select v-bind="componentField" :default-value="language">
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="请选择系统语言" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem
                                v-for="lang in languages"
                                :key="lang.value"
                                :value="lang.value"
                            >
                                {{ lang.label }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </FormItem>
        </FormField>
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
                    v-model:modelValue="theme"
                >
                    <FormItem @click="setDarkMode(DARK_MODE.LIGHT)">
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
                    <FormItem @click="setDarkMode(DARK_MODE.DARK)">
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
                    class="grid grid-cols-4 gap-x-28"
                    v-bind="componentField"
                    :default-value="themeColor"
                >
                    <FormItem
                        v-for="color in themeColors"
                        :key="color.value"
                        @click="setThemeColor(color.value)"
                    >
                        <FormLabel class="[&:has([data-state=checked])>div]:border-x-slate-500">
                            <FormControl>
                                <RadioGroupItem :value="color.value" class="sr-only" />
                            </FormControl>
                            <div
                                class="cursor-pointer border-transparent border-4 w-12 h-12 rounded-full flex items-center justify-center"
                            >
                                <div
                                    class="w-8 h-8 rounded-full"
                                    :style="{ backgroundColor: color.color }"
                                ></div>
                            </div>
                            <span class="block text-center font-normal">
                                {{ color.label }}
                            </span>
                        </FormLabel>
                    </FormItem>
                </RadioGroup>
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="sessionDisplayMode">
            <FormItem>
                <FormLabel class="text-lg">会话显示模式</FormLabel>
                <RadioGroup
                    class="grid max-w-md grid-cols-2 gap-8 pt-2"
                    v-bind="componentField"
                    default-value="left-and-right"
                >
                    <FormItem>
                        <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                            <FormControl>
                                <RadioGroupItem class="sr-only" value="left-and-right" />
                            </FormControl>
                            <div
                                class="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer"
                            >
                                <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                    <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                        <div class="flex space-x-1">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-4 w-10 rounded-sm bg-[#ecedef]" />
                                        </div>
                                        <div class="flex space-x-1 justify-end">
                                            <div class="h-4 w-14 rounded-sm bg-cyan-100" />
                                            <div class="h-4 w-4 rounded-full bg-cyan-100" />
                                        </div>
                                        <div class="flex space-x-1">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-4 w-8 rounded-sm bg-[#ecedef]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span class="block w-full p-2 text-center font-normal">
                                消息气泡左右分布
                            </span>
                        </FormLabel>
                    </FormItem>
                    <FormItem>
                        <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                            <FormControl>
                                <RadioGroupItem class="sr-only" value="left" />
                            </FormControl>
                            <div
                                class="items-center rounded-md border-2 border-muted bg-popover p-1 cursor-pointer"
                            >
                                <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                    <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                        <div class="flex space-x-1">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-4 w-10 rounded-sm bg-[#ecedef]" />
                                        </div>
                                        <div class="flex space-x-1">
                                            <div class="h-4 w-4 rounded-full bg-cyan-100" />
                                            <div class="h-4 w-14 rounded-sm bg-cyan-100" />
                                        </div>
                                        <div class="flex space-x-1">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-4 w-8 rounded-sm bg-[#ecedef]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span class="block w-full p-2 text-center font-normal">
                                消息气泡左对齐
                            </span>
                        </FormLabel>
                    </FormItem>
                </RadioGroup>
            </FormItem>
        </FormField>
    </form>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DARK_MODE, ThemeEnum } from '@/types';
import useLightDarkSwitch from '@/hook/useLightDarkSwitch';
import { useCommonStore } from '@/store/common';

const { setDarkMode, darkMode } = useLightDarkSwitch();
const { getThemeColor, setThemeColor } = useCommonStore();

const theme = ref(DARK_MODE.LIGHT);

// 主题色
const themeColors = ref([
    { value: 'green', label: '绿色', color: '#16A34A' },
    { value: 'rose', label: '玫红色', color: '#E11D48' },
    { value: 'blue', label: '蓝色', color: '#2563EB' },
    { value: 'zinc', label: '黑色', color: '#18181B' },
    { value: 'orange', label: '橙色', color: '#F97316' },
    { value: 'yellow', label: '黄色', color: '#FACC15' },
    { value: 'violet', label: '紫色', color: '#7C3AED' },
    { value: 'red', label: '红色', color: '#DC2626' },
]);

const themeColor = ref<ThemeEnum>(getThemeColor);

// 语言
const languages = ref([
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
]);

const language = ref('zh-CN');

onMounted(() => {
    theme.value = darkMode.value;
    themeColor.value = getThemeColor;
});
</script>
