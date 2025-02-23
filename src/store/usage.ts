import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import store from '@/hook/useStore';

interface DayData {
    date: string;
    count: number;
}

interface UsageData {
    [botId: string]: DayData[];
}

export const useUsageStore = defineStore('usage', () => {
    const usageData = ref<UsageData>({});
    const selectedYear = ref(new Date().getFullYear());

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('usage', {
            usageData: usageData.value,
            selectedYear: selectedYear.value,
        });
    };

    // 初始化数据
    const initializeStore = async () => {
        const savedState = await store.get<{
            usageData: UsageData;
            selectedYear: number;
        }>('usage');

        if (savedState) {
            usageData.value = savedState.usageData;
            selectedYear.value = savedState.selectedYear;
        } else {
            usageData.value = {};
            selectedYear.value = new Date().getFullYear();
            await syncData();
        }
    };

    const getBotUsage = (botId: string) => {
        return usageData.value[botId] || [];
    };

    const getAvailableYears = (botId: string) => {
        const data = getBotUsage(botId);
        if (!data.length) return [];
        const years = new Set(data.map((d) => new Date(d.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    };

    return {
        usageData,
        selectedYear,
        getBotUsage,
        getAvailableYears,
        initializeStore,
    };
}); 