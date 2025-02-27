import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { Skill, Model, ModelGroup, Supplier } from '@/types';
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
                        skills: ['inference', 'online', 'plugin'],
                    },
                    {
                        id: 'deepseek-chat',
                        name: 'DeepSeek-V3',
                        skills: ['inference', 'online', 'plugin'],
                    },
                ],
            },
        ],
        name: 'deepseek',
        websiteUrl: 'https://www.deepseek.com',
    },
    {
        apiDocUrl: 'https://docs.siliconflow.cn/introduction',
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
                        name: 'deepseek-ai/DeepSeek-R1',
                        skills: [],
                    },
                    {
                        description: '',
                        id: 'deepseek-ai/DeepSeek-V3',
                        name: 'DeepSeek-V3',
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'Qwen',
                id: 'e82a60ad-5a6d-42ca-aec5-2ba5c0b3fa39',
                models: [
                    {
                        id: 'Qwen2.5-7B-Instruct',
                        name: 'Qwen2.5-7B-Instruct',
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'BAAI',
                id: 'ed2ede01-8fcd-4435-9cd7-86c1ad360071',
                models: [
                    {
                        id: 'BAAI/bge-m3',
                        name: 'BAAI/bge-m3',
                        skills: [],
                    },
                ],
            },
        ],
        name: 'sillconflow',
        websiteUrl: 'https://siliconflow.cn',
    },
    {
        apiDocUrl: 'https://platform.openai.com/docs',
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
                        skills: [],
                    },
                    {
                        id: 'gpt-4o-mini',
                        name: 'GPT-4o-mini',
                        skills: [],
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
                        skills: [],
                    },
                    {
                        id: 'o1-preview',
                        name: 'o1-preview',
                        skills: [],
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
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'Claude 3',
                id: 'd490a386-c60e-4071-b2b0-be429886e306',
                models: [
                    {
                        id: 'claude-3-opus-latest',
                        name: 'Claude 3 Opus',
                        skills: [],
                    },
                    {
                        id: 'claude-3-sonnet-20240229',
                        name: 'Claude 3 Sonnet',
                        skills: [],
                    },
                    {
                        id: 'claude-3-haiku-20240307',
                        name: 'Claude 3 Haiku',
                        skills: [],
                    },
                ],
            },
        ],
        name: 'claude',
        websiteUrl: 'https://claude.ai',
    },
    {
        apiDocUrl: 'https://platform.moonshot.cn',
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
                        skills: [],
                    },
                ],
            },
        ],
        name: 'kimi',
        websiteUrl: 'https://kimi.moonshot.cn',
    },
    {
        apiDocUrl: 'https://bigmodel.cn/dev/api',
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
                        skills: [],
                    },
                ],
            },
        ],
        name: 'zhipu',
        websiteUrl: 'https://bigmodel.cn',
    },
    {
        apiDocUrl: 'https://www.volcengine.com/docs/82379',
        apiKey: '',
        apiUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        isDefault: true,
        label: '豆包',
        logo: '/src/assets/model/logo/doubao.png',
        modelGroup: [],
        name: 'doubao',
        websiteUrl: 'https://www.volcengine.com',
    },
    {
        apiDocUrl: 'https://www.xfyun.cn/doc/spark/Web.html',
        apiKey: '',
        apiUrl: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
        isDefault: true,
        label: '讯飞星火',
        logo: '/src/assets/model/logo/xinghuo.png',
        modelGroup: [],
        name: 'xinghuo',
        websiteUrl: 'https://xinghuo.xfyun.cn',
    },
];

export const useModelStore = defineStore('model', () => {
    const suppliers = ref<Supplier[]>(defaultSuppliers);

    const getSuppliers = computed(() => suppliers.value);

    // 获取所有可用的模型
    const getAllModels = computed(() => {
        if (!suppliers.value) return [];

        // 返回所有模型的扁平数组，包含供应商信息
        return suppliers.value.flatMap((supplier) =>
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

    // 修改模型技能组
    const changeModelSkill = async (
        supplier: Supplier,
        group: ModelGroup,
        model: Model,
        skill: Skill
    ) => {
        const supplierIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        if (supplierIndex === -1) return;

        const groupIndex = suppliers.value[supplierIndex].modelGroup.findIndex(
            (item) => item.id === group.id
        );
        if (groupIndex === -1) return;

        const modelIndex = suppliers.value[supplierIndex].modelGroup[groupIndex].models.findIndex(
            (item) => item.id === model.id
        );
        if (modelIndex === -1) return;

        const currentModel =
            suppliers.value[supplierIndex].modelGroup[groupIndex].models[modelIndex];

        // 如果技能已存在则移除,否则添加
        if (currentModel.skills.includes(skill)) {
            currentModel.skills = currentModel.skills.filter((s) => s !== skill);
        } else {
            currentModel.skills.push(skill);
        }

        // 强制更新引用以触发响应式
        suppliers.value = [...suppliers.value];
        await syncData();
    };

    // 删除模型组中的模型
    const removeModel = async (model: Supplier, modelGroup: ModelGroup, Supplier: Model) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const smallModelIndex = suppliers.value[modelIndex].modelGroup[
            modelGroupIndex
        ].models.findIndex((item) => item.id === Supplier.id);
        suppliers.value[modelIndex].modelGroup[modelGroupIndex].models.splice(smallModelIndex, 1);
        await syncData();
    };

    // 新增模型组中的小模型
    const addModel = (model: Supplier, modelGroup: ModelGroup) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        suppliers.value[modelIndex].modelGroup[modelGroupIndex].models.push({
            id: `new-${uuidV4().slice(0, 8)}`,
            name: '新模型',
            skills: [],
            description: '',
        });
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
    const removeModelGroup = (model: Supplier, modelGroup: ModelGroup) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        suppliers.value[modelIndex].modelGroup.splice(modelGroupIndex, 1);
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
        const modelIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const skillIndex = suppliers.value[modelIndex].modelGroup[modelGroupIndex].models.findIndex(
            (item) => item.id === model.id
        );

        // 更新模型名称
        suppliers.value[modelIndex].modelGroup[modelGroupIndex].models[skillIndex].name = name;
        await syncData();

        // 获取 chatStore 和 botStore 实例
        const chatStore = useChatStore();
        const botStore = useBotStore();

        // 构造完整的模型ID - 使用与 bot.ts 相同的构造方式
        const modelId = supplier.name + model.id; // 使用 supplier.name 而不是 model.name

        // 更新 chat
        const affectedChats = chatStore.chats.filter((chat) => chat.botId === modelId);
        for (const chat of affectedChats) {
            chat.name = name;
        }

        if (affectedChats.length > 0) {
            await chatStore.syncData();
        }

        // 强制更新 bot store
        await botStore.forceUpdate();

        // 如果当前选中的是被修改的 bot，更新选中状态
        if (botStore.selectedBot?.id === modelId) {
            const updatedBot = botStore.sections
                .flatMap((section) => section.bots)
                .find((bot) => bot.id === modelId);
            if (updatedBot) {
                botStore.selectedBot = updatedBot;
            }
        }
    };

    // 更新模型id
    const updateModelId = async (
        supplier: Supplier,
        modelGroup: ModelGroup,
        model: Model,
        id: string
    ) => {
        const modelIndex = suppliers.value.findIndex((item) => item.name === supplier.name);
        const modelGroupIndex = suppliers.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const skillIndex = suppliers.value[modelIndex].modelGroup[modelGroupIndex].models.findIndex(
            (item) => item.id === model.id
        );

        // 更新模型id
        suppliers.value[modelIndex].modelGroup[modelGroupIndex].models[skillIndex].id = id;
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
        changeModelSkill,
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
