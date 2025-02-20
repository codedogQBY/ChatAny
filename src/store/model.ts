import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { Skill, Model, ModelGroup, ModelItem } from '@/types/index.d.ts';
import deepseekLogo from '@/assets/model/logo/deepseek.png';
import siliconflowLogo from '@/assets/model/logo/siliconflow.png';
import chatGPTLogo from '@/assets/model/logo/chatGPT.png';
import claudeLogo from '@/assets/model/logo/claude.png';
import kimiLogo from '@/assets/model/logo/kimi.png';
import zhipuLogo from '@/assets/model/logo/zhipu.png';
import doubaoLogo from '@/assets/model/logo/doubao.png';
import xinghuoLogo from '@/assets/model/logo/xinghuo.png';
import useStore from '@/hook/useStore';

// 大模型基础数据
const defaultModels: ModelItem[] = [
    {
        name: 'deepseek',
        label: 'DeepSeek',
        logo: deepseekLogo,
        apiKey: '',
        apiUrl: 'https://api.deepseek.com',
        apiDocUrl: 'https://api-docs.deepseek.com',
        websiteUrl: 'https://www.deepseek.com',
        apiKeyUrl: 'https://platform.deepseek.com/api_keys',
        modelGroup: [
            {
                groupName: 'DeepSeek',
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
        extraConfig: {},
    },
    {
        name: 'sillconflow',
        label: '硅基流动',
        logo: siliconflowLogo,
        apiKey: '',
        apiUrl: 'https://api.siliconflow.cn',
        apiDocUrl: 'https://docs.siliconflow.cn/introduction',
        websiteUrl: 'https://siliconflow.cn',
        modelGroup: [
            {
                groupName: 'DeepSeek-ai',
                models: [
                    {
                        id: 'deepseek-ai/DeepSeek-R1',
                        name: 'deepseek-ai/DeepSeek-R1',
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'Qwen',
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
                models: [
                    {
                        id: 'BAAI/bge-m3',
                        name: 'BAAI/bge-m3',
                        skills: [],
                    },
                ],
            },
        ],
        extraConfig: {},
    },
    {
        name: 'chatGPT',
        label: 'chatGPT',
        logo: chatGPTLogo,
        apiKey: '',
        apiUrl: 'https://api.openai.com',
        apiDocUrl: 'https://platform.openai.com/docs',
        websiteUrl: 'https://openai.com',
        modelGroup: [
            {
                groupName: 'GPT 4o',
                models: [
                    {
                        id: 'GPT-4o',
                        name: 'GPT-4o',
                        skills: [],
                    },
                    {
                        id: 'GPT-4o-mini',
                        name: 'GPT-4o-mini',
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'o1',
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
        extraConfig: {},
    },
    {
        name: 'claude',
        label: 'Claude',
        logo: claudeLogo,
        apiKey: '',
        apiUrl: 'https://api.anthropic.com',
        apiDocUrl: 'https://docs.anthropic.com/en/docs',
        websiteUrl: 'https://claude.ai',
        modelGroup: [
            {
                groupName: 'Claude 3.5',
                models: [
                    {
                        id: 'Claude 3.5 Sonnet',
                        name: 'Claude 3.5 Sonnet',
                        skills: [],
                    },
                ],
            },
            {
                groupName: 'Claude 3',
                models: [
                    {
                        id: 'Claude 3 Opus',
                        name: 'Claude 3 Opus',
                        skills: [],
                    },
                    {
                        id: 'Claude 3 Sonnet',
                        name: 'Claude 3 Sonnet',
                        skills: [],
                    },
                    {
                        id: 'Claude 3 Haiku',
                        name: 'Claude 3 Haiku',
                        skills: [],
                    },
                ],
            },
        ],
        extraConfig: {},
    },
    {
        name: 'kimi',
        label: 'Kimi',
        logo: kimiLogo,
        apiKey: '',
        apiUrl: 'https://api.moonshot.cn/v1',
        apiDocUrl: 'https://platform.moonshot.cn',
        websiteUrl: 'https://kimi.moonshot.cn',
        modelGroup: [
            {
                groupName: 'moonshot-v1',
                models: [
                    {
                        id: 'moonshot-v1-auto',
                        name: 'moonshot-v1-auto',
                        skills: [],
                    },
                ],
            },
        ],
        extraConfig: {},
    },
    {
        name: 'zhipu',
        label: '智谱清言',
        logo: zhipuLogo,
        apiKey: '',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4',
        apiDocUrl: 'https://bigmodel.cn/dev/api',
        websiteUrl: 'https://bigmodel.cn',
        modelGroup: [
            {
                groupName: 'GLM-Zero',
                models: [
                    {
                        id: 'GLM-Zero-Preview',
                        name: 'GLM-Zero-Preview',
                        skills: [],
                    },
                ],
            },
        ],
        extraConfig: {},
    },
    {
        name: 'doubao',
        label: '豆包',
        logo: doubaoLogo,
        apiKey: '',
        apiUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        apiDocUrl: 'https://www.volcengine.com/docs/82379',
        websiteUrl: 'https://www.volcengine.com',
        modelGroup: [],
        extraConfig: {},
    },
    {
        name: 'xinghuo',
        label: '讯飞星火',
        logo: xinghuoLogo,
        apiKey: '',
        apiUrl: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
        apiDocUrl: 'https://www.xfyun.cn/doc/spark/Web.html',
        websiteUrl: 'https://xinghuo.xfyun.cn',
        modelGroup: [],
        extraConfig: {},
    },
];

export const useModelStore = defineStore('model', () => {
    const { setStoreData, getStoreData, hasStoreData } = useStore();
    if (!hasStoreData('model')) {
        setStoreData('model', defaultModels);
    }

    const storeData: ModelItem[] = getStoreData('model');

    const models = ref<ModelItem[]>(storeData);

    const getModels = computed<ModelItem[]>(() => models.value);

    // 同步数据到本地存储
    const syncData = () => {
        setStoreData('model', models.value);
    };

    // 修改模型技能组
    const changeModelSkill = (model: ModelItem, group: ModelGroup, skill: Skill) => {};

    // 删除模型组中的小模型
    const removeSmallModel = (model: ModelItem, modelGroup: ModelGroup, modelItem: Model) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = models.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const smallModelIndex = models.value[modelIndex].modelGroup[
            modelGroupIndex
        ].models.findIndex((item) => item.id === modelItem.id);
        models.value[modelIndex].modelGroup[modelGroupIndex].models.splice(smallModelIndex, 1);
        syncData();
    };

    // 新增模型组中的小模型
    const addSmallModel = (model: ModelItem, modelGroup: ModelGroup) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = models.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        models.value[modelIndex].modelGroup[modelGroupIndex].models.push({
            id: Math.random().toString(36).substr(2),
            name: '新模型',
            skills: [],
        });
        syncData();
    };

    // 新增模型组
    const addModelGroup = (model: ModelItem) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        models.value[modelIndex].modelGroup.push({
            groupName: '新模型组',
            models: [],
        });
        syncData();
    };

    // 删除模型组
    const removeModelGroup = (model: ModelItem, modelGroup: ModelGroup) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = models.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        models.value[modelIndex].modelGroup.splice(modelGroupIndex, 1);
        syncData();
    };

    // 更新模型组名称
    const updateModelGroupName = (model: ModelItem, modelGroup: ModelGroup, groupName: string) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = models.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        models.value[modelIndex].modelGroup[modelGroupIndex].groupName = groupName;
        syncData();
    };

    // 更新模型名称
    const updateModelName = (
        model: ModelItem,
        modelGroup: ModelGroup,
        modelItem: Model,
        name: string
    ) => {
        const modelIndex = models.value.findIndex((item) => item.name === model.name);
        const modelGroupIndex = models.value[modelIndex].modelGroup.findIndex(
            (item) => item.groupName === modelGroup.groupName
        );
        const skillIndex = models.value[modelIndex].modelGroup[modelGroupIndex].models.findIndex(
            (item) => item.id === modelItem.id
        );
        models.value[modelIndex].modelGroup[modelGroupIndex].models[skillIndex].name = name;
        syncData();
    };

    return {
        getModels,
        changeModelSkill,
        removeModelGroup,
        addSmallModel,
        addModelGroup,
        updateModelGroupName,
        updateModelName,
        removeSmallModel,
    };
});
