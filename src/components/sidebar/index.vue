<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import SettingDialog from '@/components/setting-dialog/index.vue';
import { Settings, UserRound, MoonStar, Sun } from 'lucide-vue-next';
import { routes } from '@/router';
import { useRouter } from 'vue-router';
import useLightDarkSwitch from '@/hook/useLightDarkSwitch';
import { DARK_MODE } from '@/types';
import { useCommonStore } from '@/store/common';
import { useToast } from '@/components/ui/toast/use-toast';

const router = useRouter();
const { toast } = useToast();

const { darkMode, setDarkMode } = useLightDarkSwitch();
const commonStore = useCommonStore();

type MenuItem = {
    icon: unknown;
    label: string;
    href: string;
    isActive?: boolean;
};

const defaultMenuItems: MenuItem[] = routes
    .filter((route) => route?.meta?.isSidebar)
    .map((route, index) => ({
        icon: route?.meta?.icon,
        label: (route?.meta?.title || '') as string,
        href: route.path,
        isActive: index === 0,
    }));

const menuItems = ref<MenuItem[]>(defaultMenuItems);

const bottomMenuItem = ref({
    icon: Settings,
    label: '设置',
    href: 'javascript:void(0)',
});

// 切换模式文案
const changeThemeText = ref('切换到暗黑模式');

// 根据当前路由更新激活状态
const updateActiveMenuItem = (path: string) => {
    menuItems.value.forEach((menuItem) => {
        menuItem.isActive = menuItem.href === path;
    });
};

// 监听路由变化
watch(
    () => router.currentRoute.value.path,
    (newPath) => {
        updateActiveMenuItem(newPath);
    }
);

// 初始化时设置当前路由对应的菜单项为激活状态
onMounted(() => {
    updateActiveMenuItem(router.currentRoute.value.path);
    changeThemeText.value = darkMode.value === DARK_MODE.DARK ? '切换到明亮模式' : '切换到暗黑模式';

    if (commonStore.getFollowSystem) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        handleSystemThemeChange(mediaQuery);
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
});

watch(darkMode, (newVal) => {
    changeThemeText.value = newVal === DARK_MODE.DARK ? '切换到明亮模式' : '切换到暗黑模式';
});

const handleMenuItemClick = (item: MenuItem) => {
    router.push(item.href);
    // 不需要在这里手动更新 isActive，因为路由变化会触发 watch
};

const changeTheme = () => {
    if (commonStore.getFollowSystem) {
        toast({
            description: "当前为跟随系统模式，请在设置中关闭后再手动切换",
            duration: 2000,
        });
        return;
    }
    
    const newMode = darkMode.value === DARK_MODE.DARK ? DARK_MODE.LIGHT : DARK_MODE.DARK;
    setDarkMode(newMode);
    changeThemeText.value = newMode === DARK_MODE.DARK ? '切换到明亮模式' : '切换到暗黑模式';
};

const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (!commonStore.getFollowSystem) return;
    const isDark = e.matches;
    setDarkMode(isDark ? DARK_MODE.DARK : DARK_MODE.LIGHT);
    changeThemeText.value = isDark ? '切换到明亮模式' : '切换到暗黑模式';
};

onUnmounted(() => {
    if (commonStore.getFollowSystem) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange);
    }
});
</script>

<template>
    <aside
        data-tauri-drag-region
        class="fixed inset-y-0 left-0 z-10 flex w-16 flex-col border-r bg-background"
    >
        <nav class="flex flex-col items-center gap-4 px-2 py-5 mt-4">
            <a
                class="cursor-pointer group flex h-8 w-8 shrink-0 items-center justify-center gap-2 rounded-sm bg-primary text-base font-semibold text-primary-foreground"
            >
                <UserRound class="h-4 w-4 transition-all group-hover:scale-110" />
                <span class="sr-only">Acme Inc</span>
            </a>
            <TooltipProvider v-for="item in menuItems" :key="item.label">
                <Tooltip>
                    <TooltipTrigger as-child>
                        <a
                            @click="handleMenuItemClick(item)"
                            :class="`cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:text-foreground ${
                                item.isActive
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground'
                            }`"
                        >
                            <component :is="item.icon" class="h-5 w-5" />
                            <span class="sr-only">{{ item.label }}</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {{ item.label }}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </nav>
        <nav class="mt-auto flex flex-col items-center gap-4 px-2 py-5">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <a
                            :class="[
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                commonStore.getFollowSystem 
                                    ? 'text-muted-foreground cursor-not-allowed' 
                                    : 'text-muted-foreground hover:text-foreground cursor-pointer'
                            ]"
                            @click="changeTheme"
                        >
                            <MoonStar v-if="darkMode === DARK_MODE.DARK" class="h-5 w-5" />
                            <Sun class="h-5 w-5" v-else />
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {{ commonStore.getFollowSystem ? '跟随系统模式已开启' : changeThemeText }}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <SettingDialog>
                            <a
                                href="javascript:void(0)"
                                class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Settings class="h-5 w-5" />
                                <span class="sr-only">{{ '设置' }}</span>
                            </a>
                        </SettingDialog>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {{ '设置' }}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </nav>
    </aside>
</template>
