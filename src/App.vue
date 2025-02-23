<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue';
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useModelStore } from './store/model';
import { useCommonStore } from './store/common';
import { useBotStore } from './store/bot';
import { useUsageStore } from './store/usage';
import { useChatStore } from './store/chat';
import Toaster from './components/ui/toast/Toaster.vue';

const modelStore = useModelStore();
const commonStore = useCommonStore();
const botStore = useBotStore();
const usageStore = useUsageStore();
const chatStore = useChatStore();

onMounted(async () => {
    await commonStore.initializeStore();
    await modelStore.initializeStore();
    await botStore.initializeStore();
    await chatStore.initializeStore();
    await usageStore.initializeStore();
});
</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted/40">
        <div>
            <Sidebar />
        </div>
        <div class="flex flex-col pl-16">
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
    </div>
    <!-- 全局通知 -->
    <div class="fixed top-4 right-4 z-50">
        <Toaster />
    </div>
</template>

<style scoped>
.logo.vite:hover {
    filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #249b73);
}
</style>
