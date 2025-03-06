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
                        <SelectItem v-for="lang in languages" :key="lang.value" :value="lang.value">
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
                        <span class="block w-full p-2 text-center font-normal">明亮模式</span>
                    </Label>
                </div>
                <div @click="setDarkMode(DARK_MODE.DARK)">
                    <Label class="[&:has([data-state=checked])>div]:border-primary">
                        <RadioGroupItem value="dark" class="sr-only" />
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
                        <span class="block w-full p-2 text-center font-normal">黑暗模式</span>
                    </Label>
                </div>
            </RadioGroup>
        </div>

        <!-- 主题色 -->
        <div class="space-y-2">
            <div class="text-lg font-medium">主题色</div>
            <RadioGroup class="grid grid-cols-4 gap-x-28" v-model="themeColor">
                <div
                    v-for="color in themeColors"
                    :key="color.value"
                    @click="setThemeColor(color.value)"
                >
                    <Label class="[&:has([data-state=checked])>div]:border-x-slate-500">
                        <RadioGroupItem :value="color.value" class="sr-only" />
                        <div
                            class="cursor-pointer border-transparent border-4 w-12 h-12 rounded-full flex items-center justify-center"
                        >
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

        <!-- 系统数据 -->
        <div class="space-y-6">
            <h3 class="text-lg font-medium">系统数据</h3>
            <Card>
                <CardHeader>
                    <CardTitle class="text-base font-medium flex items-center">
                        <ImagesIcon class="h-5 w-5 mr-2 text-muted-foreground" />
                        图片存储</CardTitle
                    >
                    <CardDescription class="text-sm text-muted-foreground"
                        >所有图片将保存在此目录中</CardDescription
                    >
                </CardHeader>
                <CardContent class="flex items-center space-x-2">
                    <Input
                        v-model="imagePath"
                        readonly
                        class="flex-1 bg-muted/50 outline-none focus:border-none focus:outline-none"
                    />
                </CardContent>
                <CardFooter class="flex items-center space-x-2 justify-end">
                    <Button variant="outline" @click="openAvatarFolder">
                        <FolderOpenIcon class="h-4 w-4 mr-2" />
                        打开目录
                    </Button>
                    <Button variant="outline" @click="changeAvatarFolder">
                        <FolderIcon class="h-4 w-4 mr-2" />
                        更改目录
                    </Button>
                </CardFooter>
            </Card>

            <!-- 数据备份与恢复 -->
            <div class="relative overflow-hidden rounded-xl border bg-card">
                <div
                    class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"
                />

                <div class="relative p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-muted-foreground">
                                数据备份与恢复
                            </h4>
                            <p class="text-xs text-muted-foreground mt-1">
                                导出或导入系统数据，包含所有配置和聊天记录
                            </p>
                        </div>
                        <div class="flex space-x-2">
                            <!-- 导出按钮 -->
                            <Button
                                variant="outline"
                                class="relative group hover:border-primary/50"
                                :disabled="isExporting"
                                @click="exportData"
                            >
                                <Download
                                    class="h-4 w-4 mr-2 transition-transform group-hover:-translate-y-1"
                                />
                                导出
                                <span
                                    class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform"
                                />
                            </Button>

                            <!-- 导入按钮 -->
                            <div class="relative">
                                <Button
                                    variant="outline"
                                    class="relative group hover:border-primary/50"
                                    :disabled="isImporting"
                                    @click="importData"
                                >
                                    <Upload
                                        class="h-4 w-4 mr-2 transition-transform group-hover:translate-y-1"
                                    />
                                    导入
                                    <span
                                        class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <!-- 导入进度 -->
                    <Transition
                        enter-active-class="transition-all duration-300 ease-out"
                        enter-from-class="opacity-0 transform translate-y-4"
                        enter-to-class="opacity-100 transform translate-y-0"
                        leave-active-class="transition-all duration-200 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <div v-if="isImporting" class="space-y-2">
                            <Progress :value="importProgress" class="h-1">
                                <div
                                    class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                />
                            </Progress>
                            <p class="text-xs text-muted-foreground text-center animate-pulse">
                                正在导入数据 {{ importProgress }}%
                            </p>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- 重置系统数据 -->
            <div class="space-y-4">
                <div
                    class="relative p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300"
                >
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
                            style="top: 5rem"
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
                                    <span class="ml-2">{{
                                        isResetting ? '重置中...' : '重置系统'
                                    }}</span>
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
                                        <Button variant="outline" @click="showResetConfirm = false"
                                            >取消</Button
                                        >
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
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"
                    />
                </div>
            </div>
        </div>

        <!-- 默认模型设置 -->
        <div class="space-y-6">
            <h3 class="text-lg font-medium flex items-center">默认模型设置</h3>
            <div class="space-y-4">
                <div
                    class="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                    <div class="flex items-center">
                        <EditIcon class="h-5 w-5 text-muted-foreground mr-2" />
                        <div>
                            <span class="text-sm font-medium">话题命名模型</span>
                            <p class="text-xs text-muted-foreground mt-1">
                                用于自动生成新会话的标题
                            </p>
                        </div>
                    </div>
                    <ModelSelector
                        v-model:modelId="sessionModelId"
                        @change="handleSessionModelChange"
                    />
                </div>

                <div
                    class="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                    <div class="flex items-center">
                        <WandSparklesIcon class="h-5 w-5 text-muted-foreground mr-2" />
                        <div>
                            <span class="text-sm font-medium">快捷指令模型</span>
                            <p class="text-xs text-muted-foreground mt-1">用于处理预设的快捷指令</p>
                        </div>
                    </div>
                    <ModelSelector
                        v-model:modelId="shortcutModelId"
                        @change="handleShortcutModelChange"
                    />
                </div>

                <div
                    class="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                    <div class="flex items-center">
                        <LanguagesIcon class="h-5 w-5 text-muted-foreground mr-2" />
                        <div>
                            <span class="text-sm font-medium">翻译模型</span>
                            <p class="text-xs text-muted-foreground mt-1">
                                用于内容翻译和多语言处理
                            </p>
                        </div>
                    </div>
                    <ModelSelector
                        v-model:modelId="translateModelId"
                        @change="handleTranslateModelChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { useModelStore } from '@/store/model';
import ModelSelector from '@/components/common/ModelSelector.vue';
import {
    Loader2Icon,
    RotateCcwIcon,
    DatabaseIcon,
    Download,
    Upload,
    FolderOpenIcon,
    FolderIcon,
    ImagesIcon,
    EditIcon,
    LanguagesIcon,
    WandSparklesIcon,
} from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';
import store from '@/hook/useStore';
import { useBotStore } from '@/store/bot';
import { useChatStore } from '@/store/chat';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { open, save } from '@tauri-apps/plugin-dialog';
import { writeFile, readTextFile } from '@tauri-apps/plugin-fs';
import { Input } from '@/components/ui/input';

const { setDarkMode, darkMode } = useLightDarkSwitch();
const { getThemeColor, setThemeColor, setFollowSystem, getImagePath, setImagePath } =
    useCommonStore();
const { toast } = useToast();

const commonStore = useCommonStore();
const modelStore = useModelStore();

// 使用 storeToRefs 获取响应式引用
const { getSessionModelId, getShortcutModelId, getTranslateModelId } = storeToRefs(commonStore);

// 创建本地状态绑定到store中的值
const sessionModelId = ref(getSessionModelId.value);
const shortcutModelId = ref(getShortcutModelId.value);
const translateModelId = ref(getTranslateModelId.value);

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

const theme = ref(darkMode.value);
const themeColor = ref<ThemeEnum>(getThemeColor);
const language = ref('zh-CN');
const isResetting = ref(false);
const isDebouncing = ref(false);
const showResetConfirm = ref(false);
const showTip = ref(false);
const tipMessage = ref('');
const followSystem = ref(false);
const importProgress = ref(0);
const isImporting = ref(false);
const isExporting = ref(false);
const imagePath = ref('');

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

        const botStore = useBotStore();
        const chatStore = useChatStore();

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
    await setFollowSystem(checked); // 保存到 store

    if (checked) {
        // 获取系统当前主题
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        handleSystemThemeChange(mediaQuery);
        // 添加系统主题变化监听
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
        // 移除系统主题变化监听
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .removeEventListener('change', handleSystemThemeChange);
    }
};

// 在组件挂载时初始化
onMounted(async () => {
    // 从 store 中获取跟随系统设置
    const commonStore = useCommonStore();
    followSystem.value = commonStore.getFollowSystem;

    if (followSystem.value) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        handleSystemThemeChange(mediaQuery);
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    // 获取头像路径
    imagePath.value = commonStore.getImagePath;

    // 如果路径为空，初始化它
    if (!imagePath.value) {
        try {
            const { appDataDir } = await import('@tauri-apps/api/path');
            const { mkdir, exists } = await import('@tauri-apps/plugin-fs');

            const appDirPath = await appDataDir();
            const newPath = `${appDirPath}/images`;

            if (!(await exists(newPath))) {
                await mkdir(newPath, { recursive: true });
            }

            imagePath.value = newPath;
            await commonStore.setImagePath(newPath);
        } catch (error) {
            console.error('初始化头像路径失败:', error);
        }
    }

    // 初始化模型 ID
    sessionModelId.value = commonStore.getSessionModelId;
    shortcutModelId.value = commonStore.getShortcutModelId;
    translateModelId.value = commonStore.getTranslateModelId;
});

// 在组件卸载时清理
onUnmounted(() => {
    if (followSystem.value) {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .removeEventListener('change', handleSystemThemeChange);
    }
});

// 修改导出系统数据函数
const exportData = async () => {
    try {
        isExporting.value = true;
        const systemData = {
            bots: await store.get('bots'),
            chats: await store.get('chats'),
            models: await store.get('suppliers'),
            common: await store.get('common'), // 添加 common store 数据
            version: '1.0.0',
            exportDate: new Date().toISOString(),
        };

        // 使用 dialog 插件选择保存位置
        const savePath = await save({
            filters: [
                {
                    name: '系统数据',
                    extensions: ['json'],
                },
            ],
            defaultPath: `ai-chat-backup-${new Date().toISOString().split('T')[0]}.json`,
        });

        if (savePath) {
            await writeFile(
                savePath,
                new TextEncoder().encode(JSON.stringify(systemData, null, 2))
            );

            toast({
                description: '系统数据已导出',
                duration: 3000,
            });
        }
    } catch (error) {
        console.error('Export error:', error);
        toast({
            description: '导出失败，请重试',
            variant: 'destructive',
        });
    } finally {
        isExporting.value = false;
    }
};

// 修改导入系统数据函数
const importData = async () => {
    try {
        isImporting.value = true;
        importProgress.value = 0;

        const filePath = await open({
            multiple: false,
            filters: [
                {
                    name: '系统数据',
                    extensions: ['json'],
                },
            ],
        });

        if (!filePath) return;

        importProgress.value = 30;

        const content = await readTextFile(filePath as string);
        const data = JSON.parse(content);

        if (!data.bots || !data.chats || !data.models || !data.common) {
            // 检查 common 数据
            throw new Error('无效的数据格式');
        }

        importProgress.value = 50;

        // 更新数据，包括 common store
        await Promise.all([
            store.set('bots', data.bots),
            store.set('chats', data.chats),
            store.set('suppliers', data.models),
            store.set('common', data.common), // 添加 common store 数据
        ]);

        importProgress.value = 100;

        toast({
            description: '系统数据已导入，即将刷新页面',
            duration: 3000,
        });

        // 重新加载页面以应用新数据
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Import error:', error);
        toast({
            description: error instanceof Error ? error.message : '导入失败，请重试',
            variant: 'destructive',
        });
    } finally {
        isImporting.value = false;
        importProgress.value = 0;
    }
};

// 打开头像文件夹
const openAvatarFolder = async () => {
    try {
        // 修复：使用正确的 shell.open API
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(imagePath.value);
    } catch (error) {
        console.error('打开文件夹失败:', error);
        toast({
            description: '打开文件夹失败',
            variant: 'destructive',
        });
    }
};

// 更改头像文件夹
const changeAvatarFolder = async () => {
    try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const { mkdir, exists } = await import('@tauri-apps/plugin-fs');

        const selected = await open({
            directory: true,
            multiple: false,
            title: '选择头像存储目录',
        });

        if (selected) {
            const newPath = selected as string;

            // 确保目录存在
            if (!(await exists(newPath))) {
                await mkdir(newPath, { recursive: true });
            }

            // 更新路径
            imagePath.value = newPath;
            await setImagePath(newPath);

            toast({
                description: '头像存储目录已更新',
            });
        }
    } catch (error) {
        console.error('更改目录失败:', error);
        toast({
            description: '更改目录失败',
            variant: 'destructive',
        });
    }
};

// 处理话题命名模型变化
const handleSessionModelChange = async (modelId: string, modelKey: string) => {
    sessionModelId.value = modelKey;
    await commonStore.setSessionModelId(modelKey);
};

// 处理快捷指令模型变化
const handleShortcutModelChange = async (modelId: string, modelKey: string) => {
    shortcutModelId.value = modelKey;
    await commonStore.setShortcutModelId(modelKey);
};

// 处理翻译模型变化
const handleTranslateModelChange = async (modelId: string, modelKey: string) => {
    translateModelId.value = modelKey;
    await commonStore.setTranslateModelId(modelKey);
};
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

.animate-gradient {
    background-size: 200% 200%;
    animation: gradient 8s linear infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>
