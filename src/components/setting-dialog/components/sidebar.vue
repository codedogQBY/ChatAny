<template>
    <div class="flex justify-start items-start min-h-96">
        <!-- 侧边栏菜单 -->
        <div class="w-32">
            <ul class="space-y-2 p-2">
                <li
                    v-for="(item, index) in menuItems"
                    :key="index"
                    @click="activateMenuItem(item)"
                    :class="item.isActive ? 'bg-primary text-white' : ''"
                    class="rounded-md p-2 cursor-pointer hover:bg-primary hover:text-white"
                >
                    <div class="flex items-center space-x-2">
                        <component :is="item.icon" class="h-5 w-5" />
                        <span>{{ item.label }}</span>
                    </div>
                </li>
            </ul>
        </div>
        <!-- 内容区域 -->
        <div class="px-4 py-2 flex-1 h-full overflow-y-auto">
            <component :is="activeView" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChartNoAxesGanttIcon, DatabaseIcon, Contact2Icon, GlobeIcon } from 'lucide-vue-next';
import Common from './common.vue';
import Log from './log.vue';
import About from './about.vue';
import Model from './model.vue';

type MenuItem = {
    label: string;
    icon: any;
    view: any;
    isActive?: boolean;
};

const menuItems = ref([
    {
        label: '通用',
        icon: ChartNoAxesGanttIcon,
        view: Common,
        isActive: true,
    },
    {
        label: '大模型',
        icon: GlobeIcon,
        view: Model,
        isActive: false,
    },
    {
        label: '日志',
        icon: DatabaseIcon,
        view: Log,
        isActive: false,
    },
    {
        label: '关于',
        icon: Contact2Icon,
        view: About,
        isActive: false,
    },
]);

// 存储当前激活的视图
const activeView = ref(menuItems.value.find((item) => item.isActive)?.view);

// 激活菜单项的函数
const activateMenuItem = (item: MenuItem) => {
    menuItems.value.forEach((menuItem) => {
        menuItem.isActive = menuItem === item;
    });
    activeView.value = item.view;
};
</script>

<style scoped>
/* 如果你需要自定义样式，可以在这里添加 */
</style>
