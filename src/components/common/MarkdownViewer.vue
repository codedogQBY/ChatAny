// MarkdownViewer.vue
<script setup lang="ts">
import { markdownRenderer } from '@/utils/markdownRenderer';
import { onMounted, ref, watch, nextTick } from 'vue';

const props = defineProps<{
    content: string;
}>();

const html = ref<string>('');
const containerRef = ref<HTMLElement>();
const contentHash = ref<string>('');

// 计算内容的简单哈希值，用于避免重复渲染相同内容
const getContentHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

const updateContent = async () => {
    // 检查内容是否已更改
    const newHash = getContentHash(props.content);
    if (newHash === contentHash.value && html.value) {
        return; // 内容未更改，跳过渲染
    }

    contentHash.value = newHash;
    // 渲染Markdown内容
    html.value = markdownRenderer.render(props.content);

    // 使用setTimeout确保DOM完全更新
    setTimeout(async () => {
        if (containerRef.value) {
            await markdownRenderer.renderMermaid(containerRef.value);
        }
    }, 100);
};

// 监听内容变化
watch(() => props.content, updateContent, { immediate: true });

onMounted(async () => {
    await updateContent();
});
</script>

<template>
    <div ref="containerRef" class="markdown-viewer" v-html="html"></div>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

.markdown-viewer {
    line-height: 1.6;
}

.markdown-viewer :deep(.mermaid-container) {
    background: #f8f9fa;
    border-radius: 8px;
    overflow-x: auto;
}

.markdown-viewer :deep(.mermaid) {
    overflow-x: visible;
    min-height: 50px; /* 确保图表有足够空间 */
}

.markdown-viewer :deep(.mermaid-error) {
    color: #e74c3c;
    padding: 10px;
    border: 1px dashed #e74c3c;
    border-radius: 4px;
    margin: 10px 0;
}

.markdown-viewer :deep(.mermaid-loading) {
    color: #3498db;
    padding: 10px;
    border: 1px dashed #3498db;
    border-radius: 4px;
    margin: 10px 0;
    text-align: center;
}

.markdown-viewer :deep(.markdown-error) {
    color: #e74c3c;
    padding: 10px;
    border: 1px dashed #e74c3c;
    border-radius: 4px;
    margin: 10px 0;
}

.markdown-viewer :deep(.katex) {
    font-size: 1.1em;
}

/* 表格样式 */
.markdown-viewer :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
}

.markdown-viewer :deep(table th),
.markdown-viewer :deep(table td) {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.markdown-viewer :deep(table th) {
    background-color: #f2f2f2;
    font-weight: bold;
}

.markdown-viewer :deep(table tr:nth-child(even)) {
    background-color: #f9f9f9;
}

.markdown-viewer :deep(table tr:hover) {
    background-color: #f1f1f1;
}
</style>
