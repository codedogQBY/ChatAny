<template>
    <!--    <div v-if="isLoading" class="flex items-center justify-center h-screen">-->
    <!--        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>-->
    <!--    </div>-->
    <div class="min-h-screen bg-gradient-to-br from-background to-background/95">
        <div class="flex h-screen">
            <!-- Sidebar -->
            <div
                class="w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 relative overflow-hidden"
            >
                <!-- Decorative elements -->
                <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(var(--primary-rgb),0.12),transparent_50%)]"
                ></div>
                <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--primary-rgb),0.12),transparent_50%)]"
                ></div>

                <div
                    class="relative h-full flex flex-col p-4 user-select-none"
                    data-tauri-drag-region
                >
                    <div class="flex justify-between items-center mb-6 user-select-none">
                        <h1
                            class="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent user-select-none"
                        >
                            机器人
                        </h1>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-2 mb-8">
                        <Button
                            class="w-full justify-start group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                        >
                            <div
                                class="mr-2 p-1 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors"
                            >
                                <SmilePlusIcon class="h-4 w-4" />
                            </div>
                            创建一个机器人
                        </Button>
                    </div>

                    <!-- Bot List -->

                    <div class="flex-1 space-y-6 overflow-auto custom-scrollbar">
                        <div v-for="section in sections" :key="section.letter" class="space-y-2">
                            <h2 class="text-sm font-medium text-muted-foreground px-2">
                                {{ section.letter }}
                            </h2>
                            <div class="group relative px-3">
                                <TransitionGroup name="bot-list" tag="div" class="space-y-2">
                                    <div
                                        v-for="bot in section.bots"
                                        :key="bot.id"
                                        @click="selectBot(bot)"
                                        :class="[
                                            'flex items-center p-3 cursor-pointer rounded-lg transition-all duration-300',
                                            selectedBot?.id === bot.id
                                                ? 'bg-primary/20 shadow-lg scale-105'
                                                : 'hover:bg-primary/10',
                                        ]"
                                    >
                                        <div class="relative mr-2">
                                            <div
                                                class="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-border"
                                            >
                                                <span
                                                    v-if="!bot.avatar"
                                                    class="text-sm font-semibold"
                                                    >{{ bot.name[0] }}</span
                                                >
                                                <img
                                                    v-else
                                                    :src="bot.avatar"
                                                    :alt="bot.name"
                                                    class="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div class="flex-1 text-left overflow-hidden">
                                            <div class="font-medium truncate">{{ bot.name }}</div>
                                            <div class="text-sm text-muted-foreground truncate">
                                                {{ bot.description }}
                                            </div>
                                        </div>
                                    </div>
                                </TransitionGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 relative overflow-y-auto bg-dot-pattern">
                <!-- Background decorative elements -->
                <div
                    class="absolute inset-0 bg-gradient-to-br from-primary/5 to-background/80 backdrop-blur-sm"
                ></div>
                <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at-50%_0%,rgba(var(--primary-rgb),0.1),transparent_50%)]"
                ></div>
                <div v-if="selectedBot" class="relative min-h-full p-4 sm:p-8">
                    <div class="max-w-5xl mx-auto space-y-6">
                        <!-- Header -->
                        <div
                            class="flex flex-col sm:flex-row items-start gap-4 sm:gap-8"
                            data-tauri-drag-region
                        >
                            <div class="relative group w-24 sm:w-32">
                                <div
                                    class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-muted flex items-center justify-center ring-4 ring-background shadow-2xl group-hover:shadow-primary/25 transition-all duration-500"
                                >
                                    <span
                                        v-if="!selectedBot.avatar"
                                        class="text-3xl sm:text-4xl font-bold"
                                        >{{ selectedBot.name[0] }}</span
                                    >
                                    <img
                                        v-else
                                        :src="selectedBot.avatar"
                                        :alt="selectedBot.name"
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                                <div
                                    class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"
                                ></div>
                            </div>

                            <div class="flex-1">
                                <p class="text-base sm:text-lg text-muted-foreground mb-2">
                                    {{ selectedBot.model }}
                                </p>
                                <h1
                                    class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                                >
                                    {{ selectedBot.name }}
                                </h1>
                                <p class="mt-2 text-base sm:text-lg text-muted-foreground">
                                    {{ selectedBot.description }}
                                </p>

                                <div class="flex items-center gap-4 mt-4 sm:mt-6">
                                    <Button
                                        size="lg"
                                        class="group hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                                    >
                                        <MessageCircleMoreIcon
                                            class="mr-2 h-5 w-5 group-hover:scale-110 transition-transform"
                                        />
                                        现在聊天
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        class="rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                    >
                                        <BoltIcon class="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <!-- Instruction Card -->
                        <Transition
                            enter-active-class="transition-all duration-700 ease-out"
                            enter-from-class="opacity-0 translate-y-8"
                            enter-to-class="opacity-100 translate-y-0"
                        >
                            <div v-if="selectedBot.instruction" class="mt-12">
                                <p
                                    class="text-primary font-medium text-lg mb-4 flex items-center gap-2"
                                >
                                    <WandIcon class="h-5 w-5" />
                                    我是根据以下指令创建的
                                </p>
                                <div class="relative">
                                    <div
                                        class="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur-2xl"
                                    ></div>
                                    <Card
                                        class="relative overflow-hidden backdrop-blur-sm border-primary/20"
                                    >
                                        <CardContent class="p-6">
                                            <div
                                                class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
                                            ></div>
                                            <div class="relative text-lg">
                                                {{ selectedBot.instruction }}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </Transition>

                        <!-- Usage Frequency Chart -->
                        <Card
                            class="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                        >
                            <CardHeader>
                                <CardTitle>使用频率</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsageChart
                                    :data="selectedBot?.usageData || []"
                                    :year="selectedYear"
                                    :available-years="availableYears"
                                    @update:year="selectedYear = $event"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { MessageCircleMoreIcon, BoltIcon, WandIcon, SmilePlusIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsageChart from './UsageChart.vue';

interface DayData {
    date: string;
    count: number;
}

interface Bot {
    id: string;
    name: string;
    description: string;
    avatar: string;
    instruction: string;
    usageData: DayData[];
    model: string;
}

function generateUsageData(): DayData[] {
    const data: DayData[] = [];
    const startDate = new Date(2021, 0, 1);
    const endDate = new Date(2024, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        data.push({
            date: d.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10),
        });
    }

    return data;
}

const sections = ref<{ letter: string; bots: Bot[] }>([
    {
        letter: 'C',
        bots: [
            {
                id: '1',
                name: 'Claude 3.5 Haiku',
                description: 'Anthropic 的快速模型，专注于简短精准的对话',
                avatar: '/placeholder.svg?height=40&width=40',
                instruction: '我是一个快速响应的AI助手，专注于提供简洁明了的回答。',
                usageData: generateUsageData(),
                model: 'Claude-3.5-Haiku',
            },
            {
                id: '2',
                name: 'Claude 3.5 Sonnet',
                description: 'Anthropic的新模型，擅长深度分析和创意写作',
                avatar: '/placeholder.svg?height=40&width=40',
                instruction:
                    '我是一个专注于深度分析和创意写作的AI助手，可以帮助你探索复杂话题和创作优美文字。',
                usageData: generateUsageData(),
                model: 'Claude-3.5-Sonnet',
            },
        ],
    },
]);

const selectedBot = ref<Bot | null>(null);
const selectedYear = ref(new Date().getFullYear());

const availableYears = computed(() => {
    if (!selectedBot.value?.usageData.length) return [];
    const years = new Set(selectedBot.value.usageData.map((d) => new Date(d.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
});

const selectBot = (bot: Bot) => {
    selectedBot.value = bot;
    if (availableYears.value.length > 0) {
        selectedYear.value = availableYears.value[0];
    }
};

onMounted(async () => {
    if (sections.value[0]?.bots.length > 0) {
        selectBot(sections.value[0].bots[0]);
    }
});
</script>

<style scoped>
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--primary-rgb), 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(var(--primary-rgb), 0.3);
    border-radius: 3px;
}

.bg-dot-pattern {
    background-image: radial-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px);
    background-size: 24px 24px;
}

/* Hover animations */
@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-5px);
    }
    100% {
        transform: translateY(0px);
    }
}

.hover-float:hover {
    animation: float 2s ease-in-out infinite;
}
</style>
