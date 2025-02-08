<script setup lang="ts">
import { ref } from 'vue';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import SettingDialog from '@/components/setting-dialog/index.vue';
import { Settings, UserRound, MoonStar, Sun } from 'lucide-vue-next';
import { routes } from '@/router';
import { useRouter } from 'vue-router';

const router = useRouter();

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

// 是否是暗黑模式
const isDarkMode = ref(false);
// 切换模式文案
const changeThemeText = ref('切换到暗黑模式');

const handleMenuItemClick = (item: MenuItem) => {
    menuItems.value.forEach((menuItem) => {
        menuItem.isActive = menuItem.label === item.label;
    });
    router.push(item.href);
};

const changeTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    changeThemeText.value = isDarkMode.value ? '切换到明亮模式' : '切换到暗黑模式';
};
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
                            href="javascript:void(0)"
                            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                            @click="changeTheme"
                        >
                            <MoonStar v-if="isDarkMode" class="h-5 w-5" />
                            <Sun class="h-5 w-5" v-else />
                            <span class="sr-only">{{ bottomMenuItem.label }}</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {{ changeThemeText }}
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
