<template>
    <Accordion type="single" class="w-full" collapsible default-value="deepseek">
        <AccordionItem v-for="item in suppliers" :key="item.name" :value="item.name">
            <AccordionTrigger>
                <div class="flex items-center space-x-2">
                    <Avatar class="bg-transparent w-6 h-6">
                        <AvatarImage class="w-6 h-6" :src="item.logo" alt="@radix-vue" />
                    </Avatar>
                    <div class="no-underline">{{ item.label }}</div>
                    <div class="text-xs text-gray-400" v-if="item.apiDocUrl">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <a
                                        :href="item.websiteUrl"
                                        target="_blank"
                                        class="hover:text-primary"
                                    >
                                        <LinkIcon class="h-4 w-4" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent side="top" class="text-xs">
                                    {{ `访问 ${item.label} 官网` }}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <InfoCard :supplier="item" />
            </AccordionContent>
        </AccordionItem>
    </Accordion>
    <div class="fixed bottom-8 left-8">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger as-child>
                    <Button class="w-12 h-12 rounded-full bg-primary text-xl">
                        <SmilePlusIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" class="text-xs"> 新增服务商 </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
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
import { Supplier } from '@/types';
import { SmilePlusIcon, LinkIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useModelStore } from '@/store/model';

const { getSuppliers } = useModelStore();

// 模型数据
const suppliers = ref<Supplier[]>(getSuppliers);
</script>
