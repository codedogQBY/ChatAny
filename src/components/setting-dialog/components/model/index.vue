<template>
    <Accordion type="single" class="w-full" collapsible default-value="deepseek">
        <AccordionItem v-for="item in models" :key="item.name" :value="item.name">
            <AccordionTrigger>
                <div class="flex items-center space-x-2">
                    <Avatar class="bg-transparent w-6 h-6">
                        <AvatarImage class="w-6 h-6" :src="item.logo" alt="@radix-vue" />
                    </Avatar>
                    <div class="no-underline">{{ item.label }}</div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <InfoCard :model="item" />
            </AccordionContent>
        </AccordionItem>
    </Accordion>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import InfoCard from '@/components/setting-dialog/components/model/info-card.vue';
import deepseekLogo from '@/assets/model/logo/deepseek.png';
import siliconflowLogo from '@/assets/model/logo/siliconflow.png';
import chatGPTLogo from '@/assets/model/logo/chatGPT.png';
import claudeLogo from '@/assets/model/logo/claude.png';
import kimiLogo from '@/assets/model/logo/kimi.png';
import zhipuLogo from '@/assets/model/logo/zhipu.png';
import doubaoLogo from '@/assets/model/logo/doubao.png';
import xinghuoLogo from '@/assets/model/logo/xinghuo.png';
import { ModelItem } from '@/components/setting-dialog/components/model/type';

// 模型数据
const models = ref<ModelItem[]>([
    {
        name: 'deepseek',
        label: 'DeepSeek',
        logo: deepseekLogo,
        apiKey: '',
        apiUrl: 'https://api.deepseek.com',
        apiDocUrl: 'https://api-docs.deepseek.com',
        websiteUrl: 'https://www.deepseek.com',
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
                groupName: 'DeepSeek-R1',
                models: [
                    {
                        id: 'deepseek-ai/DeepSeek-R1',
                        name: 'deepseek-ai/DeepSeek-R1',
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
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
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
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
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
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
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
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
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
        modelGroup: [
            {
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
                        skills: [],
                    },
                ],
            },
        ],
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
        modelGroup: [
            {
                groupName: '模型组1',
                models: [
                    {
                        id: 'deepseek',
                        name: 'deepseek',
                        skills: [],
                    },
                ],
            },
        ],
        extraConfig: {},
    },
]);
</script>
