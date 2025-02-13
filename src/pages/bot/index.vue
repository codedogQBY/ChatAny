<template>
    <div class="flex h-screen bg-background">
        <!-- Sidebar -->
        <div
            class="w-80 border-r border-primary/10 bg-background/80 backdrop-blur-xl overflow-y-auto"
            data-tauri-drag-region
        >
            <!-- Add Bot Button -->
            <div class="p-4">
                <button
                    class="group relative w-full overflow-hidden rounded-lg bg-primary p-3 text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 opacity-0 group-hover:animate-shine"
                    />
                    <div class="flex items-center justify-center gap-2">
                        <Plus class="h-5 w-5" />
                        <span class="font-medium">创建一个机器人</span>
                    </div>
                </button>
            </div>

            <!-- Bot List -->
            <div class="space-y-4 p-4">
                <div v-for="category in categories" :key="category.letter">
                    <div class="flex items-center px-2 mb-2">
                        <span class="text-sm font-medium text-primary/40">{{
                            category.letter
                        }}</span>
                        <div class="ml-3 h-px flex-1 bg-primary/10"></div>
                    </div>

                    <div class="space-y-1">
                        <button
                            v-for="bot in category.bots"
                            :key="bot.id"
                            class="group relative w-full rounded-lg p-2 transition-all duration-300"
                            :class="
                                selectedBot?.id === bot.id ? 'bg-primary/10' : 'hover:bg-primary/5'
                            "
                            @click="selectBot(bot)"
                        >
                            <div class="flex items-center gap-3">
                                <div class="relative h-10 w-10 shrink-0">
                                    <div
                                        class="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 blur transition group-hover:opacity-100"
                                    ></div>
                                    <img
                                        :src="bot.avatar"
                                        :alt="bot.name"
                                        class="relative h-full w-full rounded-full object-cover"
                                    />
                                </div>
                                <div class="flex-1 text-left overflow-hidden">
                                    <h3 class="font-medium text-primary truncate">
                                        {{ bot.name }}
                                    </h3>
                                    <p class="text-sm text-primary/60 truncate">
                                        {{ bot.description }}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main data-tauri-drag-region class="flex-1 overflow-y-auto p-6">
            <div v-if="selectedBot" class="max-w-3xl mx-auto">
                <!-- Bot Header -->
                <div class="flex items-center gap-6 mb-8">
                    <img
                        :src="selectedBot.avatar"
                        :alt="selectedBot.name"
                        class="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
                    />
                    <div>
                        <h1 class="text-4xl font-bold text-primary mb-2">{{ selectedBot.name }}</h1>
                        <p class="text-xl text-primary/60">{{ selectedBot.description }}</p>
                    </div>
                </div>

                <!-- Instruction Section -->
                <div class="bg-primary/5 rounded-xl p-6 mb-8 shadow-md">
                    <h2 class="text-2xl font-semibold text-primary mb-4">指令说明</h2>
                    <p class="text-primary/80 leading-relaxed">
                        {{ selectedBot.instruction }}
                    </p>
                </div>

                <!-- Chat Button -->
                <button
                    class="w-full flex items-center justify-center gap-3 rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                    <MessageSquare class="h-5 w-5" />
                    <span>开始对话</span>
                </button>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessageSquare, Plus } from 'lucide-vue-next';

interface Bot {
    id: string;
    name: string;
    avatar: string;
    description: string;
    instruction: string;
}

const selectedBot = ref<Bot | null>(null);

const bots: Bot[] = [
    {
        id: 'ai-writing-tutor',
        name: 'AI Writing Tutor',
        avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RUXrVBc779fjFJvGjFGFRsFCP800vU.png',
        description: '使用 NLP 对写作进行反馈，建议有效的写作技巧。',
        instruction:
            '我希望你扮演辩手的角色。我将为你提供一些与时事相关的话题，你的任务是研究辩论双方，为每一方提出有效的论据，反驳相反的观点，并根据证据得出有说服力的结论。您的目标是帮助人们从讨论中解脱出来，增加对当前主题的了解和洞察力。',
    },
    {
        id: 'code-assistant',
        name: 'Code Assistant',
        avatar: '/placeholder.svg?height=80&width=80',
        description: '智能代码助手，帮助解决编程问题和优化代码。',
        instruction:
            '我是您的智能编程助手。请提供您的代码或描述您的编程问题，我将为您提供解决方案、代码优化建议或解释复杂的编程概念。',
    },
    {
        id: 'data-analyst',
        name: 'Data Analyst',
        avatar: '/placeholder.svg?height=80&width=80',
        description: '专业数据分析工具，提供深入的数据洞察。',
        instruction:
            '作为您的数据分析助手，我可以帮助您处理和分析各种数据集。请提供您的数据或分析需求，我将为您生成报告、可视化图表或提供数据驱动的建议。',
    },
    {
        id: 'language-tutor',
        name: 'Language Tutor',
        avatar: '/placeholder.svg?height=80&width=80',
        description: '个性化语言学习助手，提高您的语言技能。',
        instruction:
            '我是您的个人语言教师。无论您想学习哪种语言，我都可以提供个性化的学习计划、语法解释、口语练习和写作反馈。让我们一起开始您的语言学习之旅吧！',
    },
    {
        id: 'music-composer',
        name: 'Music Composer',
        avatar: '/placeholder.svg?height=80&width=80',
        description: 'AI驱动的音乐创作助手，激发您的音乐灵感。',
        instruction:
            '我是您的AI音乐创作伙伴。告诉我您的音乐风格、情感或灵感来源，我将为您生成独特的旋律、和声进行或完整的音乐片段。让我们一起探索音乐的无限可能！',
    },
    {
        id: 'chinese-literature',
        name: '中国文学大师',
        avatar: '/placeholder.svg?height=80&width=80',
        description: '深入探讨中国古典文学，解读诗词歌赋。',
        instruction:
            '我精通中国古典文学。如果您对诗词歌赋、文言文或古代文学作品有任何疑问，我都可以为您提供详细解读和赏析。让我们一同领略中华文化的博大精深。',
    },
];

const categories = computed(() => {
    const categorizedBots = bots.reduce(
        (acc, bot) => {
            const firstChar = bot.name.charAt(0).toLowerCase();
            const letter = /^[a-z]$/.test(firstChar)
                ? firstChar
                : /^[\u4e00-\u9fa5]$/.test(firstChar)
                  ? firstChar.localeCompare('a') >= 0
                      ? 'z'
                      : 'a'
                  : '#';
            if (!acc[letter]) {
                acc[letter] = [];
            }
            acc[letter].push(bot);
            return acc;
        },
        {} as Record<string, Bot[]>
    );

    return Object.entries(categorizedBots)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, bots]) => ({ letter, bots }));
});

const selectBot = (bot: Bot) => {
    selectedBot.value = bot;
};

// 默认选中第一个机器人
onMounted(() => {
    if (bots.length > 0) {
        selectedBot.value = bots[0];
    }
});
</script>

<style scoped>
@keyframes shine {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}

.animate-shine {
    animation: shine 1.5s ease-in-out infinite;
}

/* Add smooth scroll behavior */
html {
    scroll-behavior: smooth;
}

/* Main Content Styling */
main {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.02) 100%
    );
    backdrop-filter: blur(15px);
    border-radius: 10px;
    padding: 2rem;
}

/* Bot Header Styling */
.bot-header img {
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.bot-header h1 {
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Instruction Section Styling */
.instruction-section {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.04) 100%
    );
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.instruction-section h2 {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Chat Button Styling */
.chat-button {
    background: linear-gradient(45deg, #6a11cb, #2575fc);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.chat-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}
</style>
