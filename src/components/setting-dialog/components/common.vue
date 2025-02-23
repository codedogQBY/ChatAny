<template>
    <div class="space-y-6">
        <!-- 语言设置 -->
        <div class="space-y-2">
            <div class="text-lg font-medium">系统语言</div>
            <Select v-model="language">
                <SelectTrigger>
                    <SelectValue placeholder="请选择系统语言" />
                </SelectTrigger>
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
        </div>

        <!-- 主题模式 -->
        <div class="space-y-2">
            <div class="text-lg font-medium">主题模式</div>
            <div class="flex items-center space-x-2">
                <Checkbox 
                    v-model:checked="followSystem"
                    @update:checked="handleFollowSystemChange"
                /> 
                <Label>跟随系统</Label>
            </div>
            <div class="text-sm text-muted-foreground">勾选后，将根据系统设置自动切换主题模式</div>
            
            <RadioGroup
                class="grid max-w-md grid-cols-2 gap-8 pt-2"
                v-model="theme"
                :class="{ 'opacity-50 pointer-events-none': followSystem }"
            >
                <div @click="setDarkMode(DARK_MODE.LIGHT)">
                    <Label class="[&:has([data-state=checked])>div]:border-primary">
                        <RadioGroupItem value="light" class="sr-only" />
                        <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer">
                            <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                    <div class="h-2 w-20 rounded-lg bg-[#ecedef]" />
                                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                </div>
                            </div>
                        </div>
                        <span class="block w-full p-2 text-center font-normal">明亮模式</span>
                    </Label>
                </div>
                <div @click="setDarkMode(DARK_MODE.DARK)">
                    <Label class="[&:has([data-state=checked])>div]:border-primary">
                        <RadioGroupItem value="dark" class="sr-only" />
                        <div class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                                <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                    <div class="h-2 w-20 rounded-lg bg-slate-400" />
                                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                                </div>
                            </div>
                        </div>
                        <span class="block w-full p-2 text-center font-normal">黑暗模式</span>
                    </Label>
                </div>
            </RadioGroup>
        </div>

        <!-- 主题色 -->
        <div class="space-y-2">
            <div class="text-lg font-medium">主题色</div>
            <RadioGroup
                class="grid grid-cols-4 gap-x-28"
                v-model="themeColor"
            >
                <div
                    v-for="color in themeColors"
                    :key="color.value"
                    @click="setThemeColor(color.value)"
                >
                    <Label class="[&:has([data-state=checked])>div]:border-x-slate-500">
                        <RadioGroupItem :value="color.value" class="sr-only" />
                        <div class="cursor-pointer border-transparent border-4 w-12 h-12 rounded-full flex items-center justify-center">
                            <div
                                class="w-8 h-8 rounded-full"
                                :style="{ backgroundColor: color.color }"
                            ></div>
                        </div>
                        <span class="block text-center font-normal">{{ color.label }}</span>
                    </Label>
                </div>
            </RadioGroup>
        </div>

        <!-- 清除缓存 -->
        <div class="space-y-4">
            <div class="text-lg font-medium">系统数据</div>
            <div class="relative p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300">
                <div class="flex items-center space-x-2 mb-2">
                    <DatabaseIcon class="h-5 w-5 text-muted-foreground" />
                    <div class="font-medium">重置系统数据</div>
                </div>
                <div class="text-sm text-muted-foreground mb-4">
                    将重置所有本地数据到初始状态，包括聊天记录、模型配置、系统设置等
                </div>
                <Transition
                    enter-active-class="transition-all duration-300"
                    leave-active-class="transition-all duration-300"
                    enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0 -translate-y-1"
                >
                    <div 
                        v-if="showTip" 
                        class="absolute left-6 text-xs text-destructive"
                        style="top: 5rem;"
                    >
                        {{ tipMessage }}
                    </div>
                </Transition>
                <div class="flex justify-end">
                    <Popover v-model:open="showResetConfirm">
                        <PopoverTrigger asChild>
                            <Button 
                                variant="destructive" 
                                class="relative"
                                :disabled="isResetting || isDebouncing"
                            >
                                <Loader2Icon v-if="isResetting" class="h-4 w-4 animate-spin" />
                                <RotateCcwIcon v-else class="h-4 w-4" />
                                <span class="ml-2">{{ isResetting ? '重置中...' : '重置系统' }}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-80">
                            <div class="space-y-4">
                                <div class="font-medium">确认重置系统？</div>
                                <div class="text-sm text-muted-foreground">
                                    此操作将清除所有本地数据并恢复到初始状态，包括：
                                    <ul class="list-disc list-inside mt-2 space-y-1">
                                        <li>所有的聊天记录</li>
                                        <li>模型配置信息</li>
                                        <li>系统个性化设置</li>
                                    </ul>
                                    此操作不可恢复！
                                </div>
                                <div class="flex justify-end gap-2">
                                    <Button variant="outline" @click="showResetConfirm = false">取消</Button>
                                    <Button 
                                        variant="destructive"
                                        :disabled="isResetting"
                                        @click="handleResetSystem"
                                    >
                                        确认重置
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <!-- 装饰性背景 -->
                <div class="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DARK_MODE, ThemeEnum } from '@/types';
import useLightDarkSwitch from '@/hook/useLightDarkSwitch';
import { useCommonStore } from '@/store/common';
import { TrashIcon, Loader2Icon, RotateCcwIcon, DatabaseIcon } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';
import store from '@/hook/useStore';
import { useModelStore } from '@/store/model';
import { useBotStore } from '@/store/bot';
import { useChatStore } from '@/store/chat';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const { setDarkMode, darkMode } = useLightDarkSwitch();
const { getThemeColor, setThemeColor, getFollowSystem, setFollowSystem } = useCommonStore();
const { toast } = useToast();

const theme = ref(darkMode.value);
const themeColor = ref<ThemeEnum>(getThemeColor);
const language = ref('zh-CN');
const isResetting = ref(false);
const isDebouncing = ref(false);
const showResetConfirm = ref(false);
const showTip = ref(false);
const tipMessage = ref('');
const followSystem = ref(false);

// 主题色选项
const themeColors = [
    { value: 'green', label: '绿色', color: '#16A34A' },
    { value: 'rose', label: '玫红色', color: '#E11D48' },
    { value: 'blue', label: '蓝色', color: '#2563EB' },
    { value: 'zinc', label: '黑色', color: '#18181B' },
    { value: 'orange', label: '橙色', color: '#F97316' },
    { value: 'yellow', label: '黄色', color: '#FACC15' },
    { value: 'violet', label: '紫色', color: '#7C3AED' },
    { value: 'red', label: '红色', color: '#DC2626' },
];

// 语言选项
const languages = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
];

// 显示提示的函数
const showTipMessage = (message: string) => {
    tipMessage.value = message;
    showTip.value = true;
    setTimeout(() => {
        showTip.value = false;
    }, 1000);
};

const handleResetSystem = async () => {
    if (isDebouncing.value) return;
    isResetting.value = true;
    isDebouncing.value = true;

    try {
        await store.clear();
        
        const modelStore = useModelStore();
        const botStore = useBotStore();
        const chatStore = useChatStore();
        const commonStore = useCommonStore();

        await modelStore.initializeStore();
        await botStore.initializeStore();
        await chatStore.initializeStore();
        await commonStore.initializeStore();

        // 更新当前界面状态
        theme.value = DARK_MODE.LIGHT; // 重置为默认的亮色模式
        themeColor.value = ThemeEnum.GREEN; // 重置为默认的绿色主题
        language.value = 'zh-CN'; // 重置为默认的中文
        followSystem.value = false; // 重置为默认不跟随系统

        showResetConfirm.value = false;
        showTipMessage('系统已重置，请重启应用');
    } catch (error) {
        showTipMessage('重置失败，请稍后重试');
    } finally {
        isResetting.value = false;
        setTimeout(() => {
            isDebouncing.value = false;
        }, 1000);
    }
};

// 监听系统主题变化
const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (!followSystem.value) return;
    const isDark = e.matches;
    setDarkMode(isDark ? DARK_MODE.DARK : DARK_MODE.LIGHT);
    theme.value = isDark ? DARK_MODE.DARK : DARK_MODE.LIGHT;
};

// 处理跟随系统选项变化
const handleFollowSystemChange = async (checked: boolean) => {
    followSystem.value = checked;
    await setFollowSystem(checked);  // 保存到 store
    
    if (checked) {
        // 获取系统当前主题
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        handleSystemThemeChange(mediaQuery);
        // 添加系统主题变化监听
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
        // 移除系统主题变化监听
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange);
    }
};

// 在组件挂载时初始化
onMounted(() => {
    // 从 store 中获取跟随系统设置
    const commonStore = useCommonStore();
    followSystem.value = commonStore.getFollowSystem;
    
    if (followSystem.value) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        handleSystemThemeChange(mediaQuery);
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
});

// 在组件卸载时清理
onUnmounted(() => {
    if (followSystem.value) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange);
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* 添加禁用状态的样式 */
.radio-group[disabled] {
    opacity: 0.5;
    pointer-events: none;
}
</style>
