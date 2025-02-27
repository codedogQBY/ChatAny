<template>
    <div class="usage-chart">
        <div class="w-full">
            <div class="flex flex-col lg:flex-row gap-4">
                <!-- 热力图区域 -->
                <div class="flex-1 min-w-0">
                    <!-- 可滚动容器 -->
                    <div class="overflow-x-auto pb-2">
                        <div class="min-w-[732px]">
                            <!-- 月份标签 -->
                            <div class="flex mb-2">
                                <div class="w-6"></div>
                                <div
                                    class="flex-1 flex justify-between text-xs text-muted-foreground"
                                >
                                    <span
                                        v-for="month in months"
                                        :key="month"
                                        class="min-w-[3ch] text-center"
                                    >
                                        {{ month }}
                                    </span>
                                </div>
                            </div>

                            <!-- 热力图内容 -->
                            <div class="flex">
                                <!-- 星期标签 -->
                                <div
                                    class="flex flex-col justify-between text-xs text-muted-foreground pr-1"
                                >
                                    <span>Mon</span>
                                    <span class="invisible">Tue</span>
                                    <span>Wed</span>
                                    <span class="invisible">Thu</span>
                                    <span>Fri</span>
                                    <span class="invisible">Sat</span>
                                    <span class="invisible">Sun</span>
                                </div>

                                <!-- 贡献格子 -->
                                <TooltipProvider>
                                    <div class="flex-1 grid grid-flow-col gap-[2px]">
                                        <div
                                            v-for="(week, weekIndex) in weeks"
                                            :key="weekIndex"
                                            class="grid grid-rows-7 gap-[2px]"
                                        >
                                            <Tooltip
                                                v-for="(day, dayIndex) in week"
                                                :key="`${weekIndex}-${dayIndex}`"
                                            >
                                                <TooltipTrigger as-child>
                                                    <div
                                                        class="w-3 h-3 rounded-sm transition-colors duration-200 cursor-pointer"
                                                        :class="getContributionClass(day.count)"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p class="text-xs">
                                                        {{ day.count }} messages on
                                                        {{ formatDate(day.date) }}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>

                    <!-- 图例 -->
                    <div
                        class="flex items-center justify-end mt-2 text-xs text-muted-foreground gap-2"
                    >
                        <span>Less</span>
                        <div class="flex gap-[2px]">
                            <div
                                v-for="level in 5"
                                :key="level"
                                class="w-3 h-3 rounded-sm"
                                :class="getContributionClass((level - 1) * 4)"
                            />
                        </div>
                        <span>More</span>
                    </div>
                </div>

                <!-- 年份选择器 -->
                <div class="lg:ml-4">
                    <!-- 移动端：Select 组件 -->
                    <div class="lg:hidden w-32" v-if="sortedYears.length > 0">
                        <Select
                            v-model:modelValue="selectedYear"
                            @update:modelValue="handleYearChange"
                        >
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem
                                        v-for="year in sortedYears"
                                        :key="year"
                                        :value="year"
                                    >
                                        {{ year }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <!-- 桌面端：Button 组件 -->
                    <div
                        class="hidden lg:flex flex-col gap-2 text-sm"
                        v-if="sortedYears.length > 0"
                    >
                        <Button
                            v-for="year in sortedYears"
                            :key="year"
                            :variant="selectedYear === year ? 'default' : 'secondary'"
                            class="justify-start"
                            @click="handleYearChange(year)"
                        >
                            {{ year }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DayData {
    date: string;
    count: number;
}

const props = defineProps<{
    data: DayData[];
    year: number;
    availableYears: number[];
}>();

const emit = defineEmits<{
    (e: 'update:year', year: number): void;
}>();

onMounted(() => {
    if (props.availableYears.length > 0 && !props.year) {
        emit('update:year', props.availableYears[0]);
    }
});

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const selectedYear = computed({
    get: () => props.year,
    set: (value) => emit('update:year', value),
});

const sortedYears = computed(() => {
    return [...props.availableYears].sort((a, b) => b - a); // 倒序排列
});

const handleYearChange = (year: number) => {
    selectedYear.value = year;
};

const weeks = computed(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // Fill in all days of the year
    const startDate = new Date(props.year, 0, 1);
    const endDate = new Date(props.year + 1, 0, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = d.toISOString().split('T')[0];
        const dayData = props.data.find((d) => d.date === date) || { date, count: 0 };

        currentWeek.push(dayData);

        if (currentWeek.length === 7) {
            result.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        result.push(currentWeek);
    }

    return result;
});

const getContributionClass = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 4) return 'bg-primary/40';
    if (count <= 6) return 'bg-primary/60';
    if (count <= 8) return 'bg-primary/80';
    return 'bg-primary';
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};
</script>
