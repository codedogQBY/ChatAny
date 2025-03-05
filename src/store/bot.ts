import { defineStore } from 'pinia';
import { ref } from 'vue';
import pinyin from 'pinyin';
import store from '@/hook/useStore';
import { useModelStore } from './model';
import type { Bot } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useBotStore = defineStore('bot', () => {
    const sections = ref<{ letter: string; bots: Bot[] }[]>([]);
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

    // 根据botId 获取bot
    function getBotByBotId(botId: string): Bot | undefined {
        console.log('botId', botId);
        for (const section of sections.value) {
            const bot = section.bots.find((b) => b.id === botId);
            if (bot) {
                return bot;
            }
        }
    }

    // 按字母顺序排序sections
    const sortSections = (sectionsToSort: { letter: string; bots: Bot[] }[]) => {
        return sectionsToSort.sort((a, b) => {
            if (a.letter === '#') return 1;
            if (b.letter === '#') return -1;
            return a.letter.localeCompare(b.letter);
        });
    };

    // 从模型数据生成默认机器人列表
    function generateBotsFromModels() {
        const suppliers = modelStore.getSuppliers;

        const bots = suppliers.reduce((bots: { letter: string; bots: Bot[] }[], supplier) => {
            supplier.modelGroup.forEach((group) => {
                group.models.forEach((model) => {
                    const letter = getFirstLetter(model.name);
                    const bot: Bot = {
                        id: supplier.name + '/' + model.id, // 保持这种构造方式
                        name: model.name,
                        description: model.description || '',
                        prologue: `您好，我是${model.name}，有什么可以帮助您的吗？`,
                        isDefault: true, // 默认机器人
                        avatar: supplier.logo,
                        prompt: '',
                        model: {
                            // 默认机器人的模型信息固定
                            supplierId: supplier.name,
                            modelId: model.id,
                        },
                    };

                    const sectionIndex = bots.findIndex((s) => s.letter === letter);
                    if (sectionIndex === -1) {
                        bots.push({ letter, bots: [bot] });
                    } else {
                        bots[sectionIndex].bots.push(bot);
                    }
                });
            });
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
            sections: { letter: string; bots: Bot[] }[];
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
                const botIndex = section.bots.findIndex((b) => b.id === botId);
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
                const sectionIndex = sections.value.findIndex((s) => s.letter === newLetter);
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
                const bot = section.bots.find((b) => b.id === botId);
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

        // 如果更新了头像，确保使用新的头像路径
        if (updates.avatar && updates.avatar.startsWith('file://')) {
            // 头像已经是文件路径，不需要额外处理
        }

        await syncData();
        return updatedBot;
    };

    // 删除机器人
    const deleteBot = async (botId: string) => {
        // 先备份当前的自定义机器人
        const customBots = sections.value.flatMap((section) =>
            section.bots.filter((bot) => !bot.isDefault)
        );

        // 重新生成包含默认机器人的列表
        sections.value = generateBotsFromModels();

        // 将未被删除的自定义机器人添加回去
        customBots.forEach((bot) => {
            if (bot.id !== botId) {
                const letter = getFirstLetter(bot.name);
                const sectionIndex = sections.value.findIndex((s) => s.letter === letter);
                if (sectionIndex === -1) {
                    sections.value.push({ letter, bots: [bot] });
                } else {
                    sections.value[sectionIndex].bots.push(bot);
                }
            }
        });

        // 删除空的分组
        sections.value = sections.value.filter((section) => section.bots.length > 0);

        // 重新排序
        sections.value = sortSections(sections.value);

        // 如果当前选中的机器人被删除了，选择第一个可用的机器人
        if (selectedBot.value?.id === botId) {
            const firstBot = sections.value[0]?.bots[0];
            if (firstBot) {
                selectedBot.value = firstBot;
            }
        }

        await syncData();
    };

    // 更新机器人名称
    const updateBotName = async (botId: string, newName: string) => {
        for (const section of sections.value) {
            const bot = section.bots.find((b) => b.id === botId);
            if (bot) {
                bot.name = newName;
                await syncData();
                break;
            }
        }
    };

    const forceUpdate = async () => {
        sections.value = generateBotsFromModels();
        await syncData();
    };

    // 创建新的自定义机器人
    const createBot = async (bot: Partial<Bot>) => {
        const newBot: Bot = {
            id: uuidv4(),
            name: bot.name || '新机器人',
            avatar: bot.avatar || '',
            description: bot.description || '',
            isDefault: false, // 自定义机器人
            prologue: bot.prologue || '',
            prompt: bot.prompt || '',
            model: undefined, // 初始时不指定模型，等待用户选择
        };

        const letter = getFirstLetter(newBot.name);
        const sectionIndex = sections.value.findIndex((s) => s.letter === letter);

        if (sectionIndex === -1) {
            sections.value.push({ letter, bots: [newBot] });
        } else {
            sections.value[sectionIndex].bots.push(newBot);
        }

        sections.value = sortSections(sections.value);
        await syncData();
        return newBot;
    };

    // 更新机器人的模型
    const updateBotModel = async (botId: string, supplierId: string, modelId: string) => {
        for (const section of sections.value) {
            const bot = section.bots.find((b) => b.id === botId);
            if (bot && !bot.isDefault) {
                // 只允许更新非默认机器人的模型
                bot.model = {
                    supplierId,
                    modelId,
                };
                await syncData(); // 确保保存到本地存储
                break;
            }
        }
    };

    return {
        sections,
        selectedBot,
        selectBot,
        initializeStore,
        addBot,
        updateBot,
        deleteBot,
        updateBotName,
        forceUpdate,
        createBot,
        updateBotModel,
        getBotByBotId,
    };
});
