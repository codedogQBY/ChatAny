import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { Model, ModelGroup, Supplier } from '@/types';
import { v4 as uuidV4 } from 'uuid';
import store from '@/hook/useStore';
import { useChatStore } from '@/store/chat';
import { useBotStore } from '@/store/bot';

// 大模型基础数据
const defaultSuppliers: Supplier[] = [
    {
        apiDocUrl: 'https://api-docs.deepseek.com',
        apiKey: '',
        apiKeyUrl: 'https://platform.deepseek.com/api_keys',
        apiUrl: 'https://api.deepseek.com',
        isDefault: true,
        label: 'DeepSeek',
        logo: '/src/assets/model/logo/deepseek.png',
        modelGroup: [
            {
                groupName: 'DeepSeek',
                id: 'cac88f76-fc11-4fa8-9654-9b2f6cca9fbb',
                models: [
                    {
                        id: 'deepseek-reasoner',
                        name: 'DeepSeek-R1',
                    },
                    {
                        id: 'deepseek-chat',
                        name: 'DeepSeek-V3',
                    },
                ],
            },
        ],
        name: 'deepseek',
        websiteUrl: 'https://www.deepseek.com',
    },
    {
        apiDocUrl: 'https://docs.siliconflow.cn/introduction',
        apiKeyUrl: 'https://cloud.siliconflow.cn/account/ak',
        apiKey: '',
        apiUrl: 'https://api.siliconflow.cn',
        isDefault: true,
        label: '硅基流动',
        logo: '/src/assets/model/logo/siliconflow.png',
        modelGroup: [
            {
                groupName: 'DeepSeek-ai',
                id: 'bca0276d-be20-4a28-9570-89a704428e23',
                models: [
                    {
                        id: 'deepseek-ai/DeepSeek-R1',
                        name: 'DeepSeek-R1',
                    },
                    {
                        description: '',
                        id: 'deepseek-ai/DeepSeek-V3',
                        name: 'DeepSeek-V3',
                    },
                ],
            },
            {
                groupName: 'Qwen',
                id: 'e82a60ad-5a6d-42ca-aec5-2ba5c0b3fa39',
                models: [
                    {
                        id: 'Qwen/Qwen2.5-7B-Instruct',
                        name: 'Qwen/Qwen2.5-7B-Instruct',
                    },
                ],
            },
        ],
        name: 'sillconflow',
        websiteUrl: 'https://siliconflow.cn',
    },
    {
        apiDocUrl: 'https://platform.openai.com/docs',
        apiKeyUrl: 'https://platform.openai.com/api-keys',
        apiKey: '',
        apiUrl: 'https://api.openai.com',
        isDefault: true,
        label: 'chatGPT',
        logo: '/src/assets/model/logo/chatGPT.png',
        modelGroup: [
            {
                groupName: 'GPT 4o',
                id: '541dfad0-95b1-45ac-9ecf-e5ef1d263172',
                models: [
                    {
                        id: 'gpt-4o',
                        name: 'GPT-4o',
                    },
                    {
                        id: 'gpt-4o-mini',
                        name: 'GPT-4o-mini',
                    },
                ],
            },
            {
                groupName: 'o1',
                id: '051a5563-4883-4cb3-a233-2aac8afba5e8',
                models: [
                    {
                        id: 'o1-mini',
                        name: 'o1-mini',
                    },
                    {
                        id: 'o1-preview',
                        name: 'o1-preview',
                    },
                ],
            },
        ],
        name: 'chatGPT',
        websiteUrl: 'https://openai.com',
    },
    {
        apiDocUrl: 'https://docs.anthropic.com/en/docs',
        apiKey: '',
        apiUrl: 'https://api.anthropic.com',
        isDefault: true,
        label: 'Claude',
        logo: '/src/assets/model/logo/claude.png',
        modelGroup: [
            {
                groupName: 'Claude 3.5',
                id: 'aacaaf53-fb64-48bb-a863-4effc9c32e0b',
                models: [
                    {
                        id: 'claude-3-5-sonnet-latest',
                        name: 'Claude 3.5 Sonnet',
                    },
                ],
            },
        ],
        name: 'claude',
        websiteUrl: 'https://claude.ai',
    },
    {
        apiDocUrl: 'https://platform.moonshot.cn',
        apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
        apiKey: '',
        apiUrl: 'https://api.moonshot.cn/v1',
        isDefault: true,
        label: 'Kimi',
        logo: '/src/assets/model/logo/kimi.png',
        modelGroup: [
            {
                groupName: 'moonshot-v1',
                id: '1677dc3a-a0b1-4c08-ad62-f55296b5c4ef',
                models: [
                    {
                        id: 'moonshot-v1-auto',
                        name: 'moonshot-v1-auto',
                    },
                ],
            },
        ],
        name: 'kimi',
        websiteUrl: 'https://kimi.moonshot.cn',
    },
    {
        apiDocUrl: 'https://bigmodel.cn/dev/api',
        apiKeyUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
        apiKey: '',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4',
        isDefault: true,
        label: '智谱清言',
        logo: '/src/assets/model/logo/zhipu.png',
        modelGroup: [
            {
                groupName: 'GLM-Zero',
                id: 'd68a89a3-ba5f-443c-9d0b-0eb014355678',
                models: [
                    {
                        id: 'GLM-Zero-Preview',
                        name: 'GLM-Zero-Preview',
                    },
                ],
            },
        ],
        name: 'zhipu',
        websiteUrl: 'https://bigmodel.cn',
    },
    {
        apiDocUrl: 'https://openrouter.ai/docs/quickstart',
        apiKey: '',
        apiKeyUrl: 'https://openrouter.ai/settings/keys',
        apiUrl: 'https://openrouter.ai/api/v1',
        isDefault: true,
        label: 'OpenRouter',
        logo: '/src/assets/model/logo/openrouter.png',
        modelGroup: [
            {
                groupName: 'Gemini',
                id: 'd68sse3-ba5f-443c-9d0b-0rruur5678',
                models: [
                    {
                        id: 'google/gemini-2.0-flash-lite-preview-02-05:free',
                        name: 'Gemini-2-free',
                    },
                ],
            },
            {
                groupName: 'Anthropic',
                id: 'dwere3-rr5f-789c-9d0b-0rrrjkjr8',
                models: [
                    {
                        id: 'anthropic/claude-3.7-sonnet:beta',
                        name: 'Glaude-3.7-free',
                    },
                ],
            },
        ],
        name: 'openrouter',
        websiteUrl: 'https://openrouter.ai',
    },
    {
        apiDocUrl: 'https://www.volcengine.com/docs/82379',
        apiKeyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
        apiKey: '',
        apiUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        isDefault: true,
        label: '火山引擎',
        logo: '/src/assets/model/logo/huoshan.png',
        modelGroup: [
            {
                groupName: '火山引擎-DeepSeek',
                id: 'd68sse3-ba5f-443c-9d0b-0rabcd5678',
                models: [
                    {
                        id: 'deepseek-r1-250120',
                        name: 'DeepSeek-R1-250120',
                    },
                    {
                        id: 'deepseek-v3-241226',
                        name: 'DeepSeek-V3-250120',
                    },
                ],
            },
        ],
        name: 'huoshan',
        websiteUrl: 'https://www.volcengine.com/experience/ark',
    },
];

export const useModelStore = defineStore('model', () => {
    const chatStore = useChatStore();
    const botStore = useBotStore();

    const suppliers = ref<Supplier[]>(defaultSuppliers);

    const getSuppliers = computed(() => suppliers.value);

    // 获取所有可用的模型
    const getAllModels = computed(() => {
        if (!suppliers.value) return [];
        // 返回所有模型的扁平数组，包含供应商信息
        return suppliers.value
            .filter((supplier) => supplier.apiKey)
            .flatMap((supplier) =>
                supplier.modelGroup.flatMap((group) =>
                    group.models.map((model) => ({
                        id: `${supplier.name}/${model.id}`, // 完整的模型ID
                        name: model.name,
                        groupName: group.groupName,
                        supplierId: supplier.name, // 添加供应商ID
                        modelId: model.id, // 原始模型ID
                        isDefault: supplier.isDefault,
                    }))
                )
            );
    });

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('suppliers', suppliers.value);
    };

    // 初始化数据
    const initializeStore = async () => {
        // 从存储中获取供应商
        const storedSuppliers = ((await store.get('suppliers')) as Array<Supplier>) || [];

        if (storedSuppliers.length > 0) {
            suppliers.value = storedSuppliers;
        } else {
            suppliers.value = defaultSuppliers;
        }

        // 检查供应商的 API 密钥
        suppliers.value.forEach((supplier) => {
            if (!supplier.apiKey || supplier.apiKey.trim() === '') {
                console.warn(`供应商 ${supplier.name} 的 API 密钥为空`);
                supplier.apiKey = ''; // 确保至少有一个空字符串而不是 undefined
            }
        });

        return suppliers.value;
    };

    // 删除模型组中的模型
    const removeModel = async (supplier: Supplier, modelGroup: ModelGroup, model: Model) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const modelIndex = suppliers.value[supplierIndex].modelGroup[
            modelGroupIndex
        ].models.findIndex((item) => item.id === model.id);

        suppliers.value[supplierIndex].modelGroup[modelGroupIndex].models.splice(modelIndex, 1);

        const modelId = supplier.name + '/' + model.id;
        // 删除bot
        await botStore.deleteBot(modelId);
        // 删除chat
        await chatStore.deleteChatsByBotId(modelId);
        await syncData();
    };

    // 新增模型组中的模型
    const addModel = async (supplier: Supplier, modelGroup: ModelGroup) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const modelId = `new-${uuidV4().slice(0, 8)}`;
        suppliers.value[supplierIndex].modelGroup[modelGroupIndex].models.push({
            id: modelId,
            name: '新模型',
            description: '',
        });

        const bot = await botStore.addBot({
            name: '新模型',
            avatar: supplier.logo || '',
            description: '',
            isDefault: true,
            model: {
                supplierId: supplier.name,
                modelId,
            },
        });

        await chatStore.createChatForBot(bot);

        syncData();
    };

    // 新增模型组
    const addModelGroup = (model: Supplier) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === model.name);
        suppliers.value[modelIndex].modelGroup.push({
            id: uuidV4(),
            groupName: '新模型组',
            models: [],
        });
        syncData();
    };

    // 删除模型组
    const removeModelGroup = async (supplier: Supplier, modelGroup: ModelGroup) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        for (const model of modelGroup.models) {
            const modelId = supplier.name + '/' + model.id;
            // 删除bot
            await botStore.deleteBot(modelId);
            // 删除chat
            await chatStore.deleteChatsByBotId(modelId);
        }
        await suppliers.value[supplierIndex].modelGroup.splice(modelGroupIndex, 1);

        syncData();
    };

    // 更新模型组名称
    const updateModelGroupName = (model: Supplier, modelGroup: ModelGroup, groupName: string) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        suppliers.value[modelIndex].modelGroup[modelGroupIndex].groupName = groupName;
        syncData();
    };

    // 更新模型名称
    const updateModelName = async (
        supplier: Supplier,
        modelGroup: ModelGroup,
        model: Model,
        name: string
    ) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const modelIndex = suppliers.value[supplierIndex].modelGroup[
            modelGroupIndex
        ].models.findIndex((item) => item.id === model.id);

        // 更新模型名称
        suppliers.value[supplierIndex].modelGroup[modelGroupIndex].models[modelIndex].name = name;
        await syncData();

        // 构造完整的模型ID - 使用与 bot.ts 相同的构造方式
        const modelId = supplier.name + '/' + model.id;

        // 更新 chat
        const affectedChats = chatStore.chats.filter((chat) => chat.botId === modelId);

        for (const chat of affectedChats) {
            chat.name = name;
            // 更新bot
            botStore.updateBotName(chat.botId, name);
        }
        if (affectedChats.length > 0) {
            await chatStore.syncData();
        }
    };

    // 更新模型id
    const updateModelId = async (
        supplier: Supplier,
        modelGroup: ModelGroup,
        model: Model,
        id: string
    ) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const modelIndex = suppliers.value[supplierIndex].modelGroup[
            modelGroupIndex
        ].models.findIndex((item) => item.id === model.id);

        // 更新模型id
        suppliers.value[supplierIndex].modelGroup[modelGroupIndex].models[modelIndex].id = id;
        await syncData();
    };

    // 更新供应商配置
    const updateSupplierConfig = async (updatedSupplier: Supplier) => {
        const index = suppliers.value.findIndex((s) => s.name === updatedSupplier.name);
        if (index !== -1) {
            suppliers.value[index] = {
                ...suppliers.value[index],
                apiKey: updatedSupplier.apiKey,
                apiUrl: updatedSupplier.apiUrl,
            };
            await syncData();
        }
    };

    return {
        suppliers,
        getSuppliers,
        getAllModels,
        removeModel,
        initializeStore,
        addModel,
        addModelGroup,
        updateModelGroupName,
        updateModelName,
        removeModelGroup,
        syncData,
        updateSupplierConfig,
        updateModelId,
    };
});
