import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import store from '@/hook/useStore';
import { useChatStore } from './chat';

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
    
    // 缓存已计算过的使用数据，避免重复计算，提高性能
    const usageCache = ref<Record<string, Record<string, any>>>({});

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
        // 如果没有botId，返回空数组
        if (!botId) return [];
        
        // 检查缓存中是否有此botId和年份的数据
        const cacheKey = `${botId}-${selectedYear.value}`;
        if (usageCache.value[cacheKey]) {
            return usageCache.value[cacheKey];
        }
        
        const chatStore = useChatStore();
        
        // 找出所有属于该机器人的聊天记录
        const botsChats = chatStore.chats.filter(chat => chat.botId === botId);
        
        // 构建日期到消息数的映射
        const dateCountMap: Record<string, number> = {};
        
        // 遍历每个聊天的每个会话的每条消息
        botsChats.forEach(chat => {
            chat.sessions.forEach(session => {
                session.messages.forEach(message => {
                    // 只统计用户发送的消息
                    if (message.sender !== 'user') return;
                    
                    // 获取消息的日期部分 (YYYY-MM-DD)
                    const date = new Date(message.createdAt);
                    const messageYear = date.getFullYear();
                    
                    // 只统计选定年份的消息
                    if (messageYear === selectedYear.value) {
                        const dateStr = date.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
                        dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
                    }
                });
            });
        });
        
        // 将映射转换为热力图所需的数组格式
        const result = Object.entries(dateCountMap).map(([date, count]) => ({
            date,
            count
        }));
        
        // 缓存结果
        usageCache.value[cacheKey] = result;
        return result;
    };

    const getAvailableYears = (botId: string) => {
        if (!botId) return [new Date().getFullYear()];
        
        const chatStore = useChatStore();
        const years = new Set<number>();
        
        // 默认至少包含当前年份
        years.add(new Date().getFullYear());
        
        // 遍历该机器人的所有消息，收集年份
        const botsChats = chatStore.chats.filter(chat => chat.botId === botId);
        botsChats.forEach(chat => {
            chat.sessions.forEach(session => {
                session.messages.forEach(message => {
                    // 只考虑用户消息
                    if (message.sender !== 'user') return;
                    
                    const year = new Date(message.createdAt).getFullYear();
                    years.add(year);
                });
            });
        });
        
        return Array.from(years).sort((a, b) => b - a); // 降序排列，最近的年份在前
    };

    // 清除缓存
    const clearCache = () => {
        usageCache.value = {};
    };
    
    // 重置选定年份为当前年份
    const resetSelectedYear = () => {
        selectedYear.value = new Date().getFullYear();
    };

    return {
        usageData,
        selectedYear,
        getBotUsage,
        getAvailableYears,
        clearCache,
        resetSelectedYear,
        initializeStore,
    };
}); 