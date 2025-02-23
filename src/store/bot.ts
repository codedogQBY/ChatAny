import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import pinyin from 'pinyin';
import store from '@/hook/useStore';
import { useModelStore } from './model';
import type { ModelGroup } from '@/types';

export interface Bot {
    id: string;
    name: string;
    prompt?: string;
    description: string;
    prologue: string;
    avatar: string;
    model?: string;
    isDefault: boolean;
}

interface BotSection {
    letter: string;
    bots: Bot[];
}

export const useBotStore = defineStore('bot', () => {
    const sections = ref<BotSection[]>([]);
    const selectedBot = ref<Bot | null>(null);

    const modelStore = useModelStore();

    // 获取首字母
    function getFirstLetter(str: string): string {
        if (!str?.length) return '#';

        const firstChar = str[0];

        // 处理英文
        if (/^[a-zA-Z]$/.test(firstChar)) {
            return firstChar.toUpperCase();
        }

        // 处理中文
        if (/^[\u4e00-\u9fa5]$/.test(firstChar)) {
            try {
                const result = pinyin(firstChar, {
                    style: pinyin.STYLE_FIRST_LETTER,
                    segment: true,
                });
                return result[0]?.[0]?.toUpperCase()?.[0] || '#';
            } catch {
                return '#';
            }
        }

        // 其他字符
        return '#';
    }

    // 按字母顺序排序sections
    const sortSections = (sectionsToSort: BotSection[]) => {
        return sectionsToSort.sort((a, b) => {
            if (a.letter === '#') return 1;
            if (b.letter === '#') return -1;
            return a.letter.localeCompare(b.letter);
        });
    };

    // 从模型数据生成机器人列表
    function generateBotsFromModels(): BotSection[] {
        const bots = modelStore.getSuppliers.reduce((bots: BotSection[], supplier) => {
            const modelGroup = supplier.modelGroup as ModelGroup[];
            for (const group of modelGroup) {
                for (const model of group.models) {
                    const { name } = model;
                    const letter = getFirstLetter(name);
                    const index = bots.findIndex((b) => b.letter === letter);
                    const bot: Bot = {
                        id: supplier.name + model.name,
                        name: model.name,
                        description: model?.description || '',
                        prologue: `您好，我是${model.name}，有什么可以帮助您的吗？`,
                        isDefault: true,
                        avatar: supplier.logo,
                        prompt: '',
                    };
                    if (index === -1) {
                        bots.push({ letter, bots: [bot] });
                    } else {
                        bots[index].bots.push(bot);
                    }
                }
            }
            return bots;
        }, []);
        
        return sortSections(bots);
    }

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('bots', {
            sections: sections.value,
            selectedBot: selectedBot.value,
        });
    };

    // 初始化数据
    const initializeStore = async () => {
        const savedState = await store.get<{
            sections: BotSection[];
            selectedBot: Bot | null;
        }>('bots');

        if (savedState) {
            sections.value = sortSections(savedState.sections);
            selectedBot.value = savedState.selectedBot;
        } else {
            sections.value = generateBotsFromModels();
            if (sections.value[0]?.bots.length > 0) {
                selectedBot.value = sections.value[0].bots[0];
            }
            await syncData();
        }
    };

    const selectBot = async (bot: Bot) => {
        selectedBot.value = bot;
        await syncData();
    };

    // 添加新的机器人
    const addBot = async (bot: Omit<Bot, 'id'>) => {
        const letter = getFirstLetter(bot.name);
        const newBot: Bot = {
            ...bot,
            id: `custom-${Date.now()}`,
        };

        const index = sections.value.findIndex((s) => s.letter === letter);
        if (index === -1) {
            sections.value.push({ letter, bots: [newBot] });
            sections.value = sortSections(sections.value);
        } else {
            sections.value[index].bots.push(newBot);
        }
        
        await syncData();
        return newBot;
    };

    // 更新机器人信息
    const updateBot = async (botId: string, updates: Partial<Bot>) => {
        let updatedBot: Bot | null = null;
        
        if (updates.name) {
            const newLetter = getFirstLetter(updates.name);
            
            // 找到并移除旧的bot
            for (const section of sections.value) {
                const botIndex = section.bots.findIndex(b => b.id === botId);
                if (botIndex !== -1) {
                    const [bot] = section.bots.splice(botIndex, 1);
                    updatedBot = { ...bot, ...updates };
                    
                    // 如果分组为空，删除分组
                    if (section.bots.length === 0) {
                        const sectionIndex = sections.value.indexOf(section);
                        sections.value.splice(sectionIndex, 1);
                    }
                    break;
                }
            }
            
            // 添加到新的分组
            if (updatedBot) {
                const sectionIndex = sections.value.findIndex(s => s.letter === newLetter);
                if (sectionIndex === -1) {
                    sections.value.push({ letter: newLetter, bots: [updatedBot] });
                } else {
                    sections.value[sectionIndex].bots.push(updatedBot);
                }
            }

            // 重新排序sections
            sections.value = sortSections(sections.value);
        } else {
            // 如果名字没变，直接更新其他属性
            for (const section of sections.value) {
                const bot = section.bots.find(b => b.id === botId);
                if (bot) {
                    Object.assign(bot, updates);
                    updatedBot = bot;
                    break;
                }
            }
        }

        if (updatedBot && selectedBot.value?.id === botId) {
            selectedBot.value = updatedBot;
        }

        await syncData();
        return updatedBot;
    };

    return {
        sections,
        selectedBot,
        selectBot,
        initializeStore,
        addBot,
        updateBot,
    };
}); 