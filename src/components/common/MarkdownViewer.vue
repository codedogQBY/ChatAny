<script setup lang="ts">
import { markdownRenderer } from '@/utils/markdownRenderer';
import { onMounted, ref, watch, computed } from 'vue';
import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps<{
    content: string;
    steaming?: boolean;
}>();

const html = ref<string>('');
const containerRef = ref<HTMLElement>();
const contentHash = ref<string>('');

let lastRenderedLength = 0; // 添加这个变量来追踪上次渲染的长度

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
    // 检查内容是否已更改
    const newHash = getContentHash(sanitizedContent.value);
    if (newHash === contentHash.value && html.value) {
        return;
    }

    contentHash.value = newHash;

    // 检查是否内容为空或只有空白字符
    if (!sanitizedContent.value.trim()) {
        html.value = '';
        lastRenderedLength = 0;
        return;
    }

    if (props.steaming) {
        // 获取完整的渲染HTML
        const fullHtml = await markdownRenderer.render(sanitizedContent.value);
        const cleanedHtml = cleanRenderedHtml(fullHtml);

        // 只处理新增的内容
        if (cleanedHtml.length > lastRenderedLength) {
            const newContent = cleanedHtml.slice(lastRenderedLength);
            html.value = cleanedHtml.slice(0, lastRenderedLength) + newContent;
            lastRenderedLength = cleanedHtml.length;
        }
    } else {
        // 非流式渲染，直接显示完整内容
        const renderedHtml = await markdownRenderer.render(sanitizedContent.value);
        html.value = cleanRenderedHtml(renderedHtml);
        lastRenderedLength = html.value.length;
    }

    // 使用 setTimeout 确保 DOM 完全更新
    setTimeout(async () => {
        if (containerRef.value) {
            addCopyListeners();

            // 只有当存在 mermaid 图表时才调用渲染
            if (html.value.includes('class="mermaid-container"')) {
                await markdownRenderer.renderMermaid(containerRef.value);
            }
        }
    }, 100);
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
    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
            // 更改按钮文本
            button.textContent = '复制成功';

            // 2秒后恢复
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        })
        .catch((err) => {
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
    copyButtons.forEach((button) => {
        button.addEventListener('click', handleCopyClick);
    });
};

// 在内容更新后添加事件监听
watch(
    () => html.value,
    () => {
        // 使用setTimeout确保DOM已更新
        setTimeout(addCopyListeners, 100);
    },
    { immediate: false }
);

// 監聽內容變化
watch(() => props.content, updateContent, { immediate: true });

onMounted(async () => {
    await updateContent();
    addCopyListeners();
});
</script>

<template>
    <div ref="containerRef" class="markdown-viewer" :class="{ typing: props.steaming }">
        <div class="content-wrapper">
            <div v-html="html" class="markdown-content"></div>
        </div>
    </div>
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
    border-radius: 8px;
    margin: 10px 0;
}

.markdown-viewer :deep(.mermaid-code-wrapper) {
    margin: 0;
}

.markdown-viewer :deep(.mermaid-render-button) {
    border: none;
    color: #ccc;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.markdown-viewer :deep(.mermaid-render-button:hover) {
    background-color: #444;
    color: #fff;
}

/* Mermaid控制栏样式 - 类似代码块顶部栏 */
.markdown-viewer :deep(.mermaid-controls) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #333;
    color: #fff;
    font-size: 0.9rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    margin-bottom: 0;
}

.markdown-viewer :deep(.mermaid-language) {
    font-family: 'Consolas', 'Monaco', monospace;
    color: #ccc;
    font-weight: normal;
}

.markdown-viewer :deep(.mermaid-back-to-code) {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #ccc;
}

.markdown-viewer :deep(.mermaid-back-to-code:hover) {
    background-color: #444;
    color: #fff;
}

.markdown-viewer :deep(.mermaid-rendered) {
    padding: 16px;
    background-color: #f8f9fa;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow-x: auto;
    margin-top: 0;
    border: 1px solid #333;
    border-top: none;
}

.markdown-viewer :deep(.mermaid-loading) {
    color: #3498db;
    padding: 16px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #eee;
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

/* 修改打字机相关样式 */
.content-wrapper {
    position: relative;
    display: block;
}

.markdown-content {
    display: inline;
}

/* 使用伪元素实现光标 */
.typing .markdown-content::after {
    content: '';
    display: inline-block;
    width: 4px; /* 调整光标宽度 */
    height: 1.2em; /* 调整光标高度 */
    background-color: currentColor;
    vertical-align: text-bottom;
    margin-left: 2px;
    animation: cursor-blink 1s step-start infinite;
}

@keyframes cursor-blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

/* 确保 markdown 内容中的块级元素正确显示 */
.markdown-viewer :deep(p),
.markdown-viewer :deep(pre),
.markdown-viewer :deep(blockquote),
.markdown-viewer :deep(ul),
.markdown-viewer :deep(ol) {
    display: block;
    margin: 1em 0;
}

/* 确保最后一个块级元素和光标在同一行 */
.markdown-viewer :deep(p:last-child),
.markdown-viewer :deep(pre:last-child),
.markdown-viewer :deep(blockquote:last-child),
.markdown-viewer :deep(ul:last-child),
.markdown-viewer :deep(ol:last-child) {
    display: inline;
}
</style>
