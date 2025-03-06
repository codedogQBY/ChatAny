// MarkdownViewer.vue
<script setup lang="ts">
import { markdownRenderer } from '@/utils/markdownRenderer';
import { onMounted, ref, watch, computed } from 'vue';
import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps<{
    content: string;
}>();

const html = ref<string>('');
const containerRef = ref<HTMLElement>();
const contentHash = ref<string>('');

// 計算簡化內容，移除多餘換行符
const sanitizedContent = computed(() => {
    // 移除連續的換行符，保留最多兩個
    return props.content.replace(/\n{3,}/g, '\n\n').trim();
});

// 計算內容的簡單哈希值，用於避免重複渲染相同內容
const getContentHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

// 添加一个函数来清理渲染的HTML，移除多余空元素
const cleanRenderedHtml = (htmlContent: string) => {
    // 移除空段落
    let cleaned = htmlContent.replace(/<p>\s*<\/p>/g, '');
    // 移除连续的空行
    cleaned = cleaned.replace(/(\r?\n){3,}/g, '\n\n');
    return cleaned;
};

const updateContent = async () => {
    // 檢查內容是否已更改
    const newHash = getContentHash(sanitizedContent.value);
    if (newHash === contentHash.value && html.value) {
        return; // 內容未更改，跳過渲染
    }

    contentHash.value = newHash;

    // 檢查是否內容為空或只有空白字元
    if (!sanitizedContent.value.trim()) {
        html.value = ''; // 空內容不需要渲染
        return;
    }

    // 渲染Markdown內容並清理
    const renderedHtml = markdownRenderer.render(sanitizedContent.value);
    html.value = cleanRenderedHtml(renderedHtml);

    // 檢查是否有Mermaid圖表
    const hasMermaid = html.value.includes('class="mermaid"');

    // 只有當存在mermaid圖表時才調用渲染
    if (hasMermaid) {
        // 使用setTimeout確保DOM完全更新
        setTimeout(async () => {
            if (containerRef.value) {
                await markdownRenderer.renderMermaid(containerRef.value);
            }
        }, 100);
    }
};

// 添加复制功能
const handleCopyClick = (event: Event) => {
    const button = event.target as HTMLButtonElement;
    const wrapper = button.closest('.code-block-wrapper');
    if (!wrapper) return;
    
    const codeBlock = wrapper.querySelector('code');
    if (!codeBlock) return;
    
    // 获取纯文本内容
    const textToCopy = codeBlock.textContent || '';
    
    // 复制到剪贴板
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // 更改按钮文本
            button.textContent = '复制成功';
            
            // 2秒后恢复
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        })
        .catch(err => {
            console.error('复制失败:', err);
            button.textContent = '复制失败';
            
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        });
};

// 在DOM更新后添加事件监听
const addCopyListeners = () => {
    if (!containerRef.value) return;
    
    const copyButtons = containerRef.value.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', handleCopyClick);
    });
};

// 在内容更新后添加事件监听
watch(() => html.value, () => {
    // 使用setTimeout确保DOM已更新
    setTimeout(addCopyListeners, 100);
}, { immediate: false });

// 監聽內容變化
watch(() => props.content, updateContent, { immediate: true });

onMounted(async () => {
    await updateContent();
    addCopyListeners();
});
</script>

<template>
    <div ref="containerRef" class="markdown-viewer" v-html="html"></div>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

.markdown-viewer {
    line-height: 1.6;
    min-height: 0; /* 重置最小高度 */
    display: inline-block; /* 使容器宽度适应内容 */
    width: 100%; /* 但仍然保持最大宽度 */
}

.markdown-viewer:empty {
    display: none; /* 完全空的容器不显示 */
}

/* 移除段落的默认边距 */
.markdown-viewer :deep(p) {
    margin-top: 0;
    margin-bottom: 0.5em; /* 只保留适当的底部间距 */
}

/* 最后一个元素不需要底部边距 */
.markdown-viewer :deep(p:last-child) {
    margin-bottom: 0;
}

/* 移除额外空白段落 */
.markdown-viewer :deep(p:empty) {
    display: none;
}

.markdown-viewer :deep(.mermaid-container) {
    background: #f8f9fa;
    border-radius: 8px;
    overflow-x: auto;
    margin: 10px 0;
}

.markdown-viewer :deep(.mermaid) {
    overflow-x: visible;
    min-height: 50px; /* 確保圖表有足夠空間 */
    display: block; /* 避免不必要的空間 */
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

/* 代码块样式 - 修改为深色顶部栏 */
.markdown-viewer :deep(.code-block-wrapper) {
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #333;
}

.markdown-viewer :deep(.code-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #333;
    color: #fff;
    font-size: 0.9rem;
}

.markdown-viewer :deep(.code-language) {
    font-family: 'Consolas', 'Monaco', monospace;
    color: #ccc;
    font-weight: normal;
}

/* 修改复制按钮样式，移除边框 */
.markdown-viewer :deep(.copy-button) {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #ccc;
}

.markdown-viewer :deep(.copy-button:hover) {
    background-color: #444;
    color: #fff;
}

.markdown-viewer :deep(.code-block) {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    background-color: #282c34; /* atom-one-dark 背景色 */
}

/* 确保代码文本颜色在深色背景上可见 */
.markdown-viewer :deep(.code-block code) {
    color: #abb2bf; /* 浅灰色文本，适合深色背景 */
    font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
}

/* 确保highlight.js样式正确应用 */
.markdown-viewer :deep(.hljs) {
    display: block;
    overflow-x: auto;
    color: #abb2bf;
    background: #282c34;
}

/* 暗色模式适配 - 保持一致的深色样式 */
@media (prefers-color-scheme: dark) {
    .markdown-viewer :deep(.code-block-wrapper) {
        border-color: #222;
    }
    
    .markdown-viewer :deep(.code-header) {
        background-color: #222;
        border-color: #333;
    }
}
</style>
