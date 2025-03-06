import { marked, MarkedOptions, Renderer, Tokens } from 'marked';
import mermaid from 'mermaid';
import katex from 'katex';
import { v4 as uuidV4 } from 'uuid';
import hljs from 'highlight.js';

type MermaidConfig = Parameters<typeof mermaid.initialize>[0];
type KatexOptions = katex.KatexOptions;

export interface MarkdownRendererOptions {
    mermaid?: boolean | MermaidConfig;
    latex?: boolean | KatexOptions;
    markedOptions?: MarkedOptions;
}

class MarkdownRenderer {
    private readonly mermaidEnabled: boolean;
    private readonly latexEnabled: boolean;
    private mermaidInitialized: boolean = false;
    private contentCache: Map<string, string> = new Map();
    private mermaidConfig: MermaidConfig;

    constructor(options: MarkdownRendererOptions = {}) {
        this.mermaidEnabled = options.mermaid !== false;
        this.latexEnabled = options.latex !== false;

        // 初始化默认配置
        this.mermaidConfig = {
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'default',
        };

        this.initMarked(options.markedOptions);

        // 合并用户提供的Mermaid配置
        if (options.mermaid !== false && typeof options.mermaid === 'object') {
            this.mermaidConfig = { ...this.mermaidConfig, ...options.mermaid };
        }
    }

    private initMarked(markedOptions?: MarkedOptions): void {
        const renderer = new Renderer();

        if (this.mermaidEnabled) {
            renderer.code = (code: Tokens.Code): string => {
                if (code.lang === 'mermaid') {
                    // 不立即为图表分配ID，仅为其添加类名，以便后续识别和处理
                    return `<div class="mermaid-container"><pre class="mermaid">${code.text}</pre></div>`;
                }
                return `
                <div class="relative">
                    <button class="absolute top-2 right-2 p-1 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-gray-200" @click='window.navigator.clipboard.writeText(${code.text})'>
                        复制代码
                    </button>
                    <pre class="max-w-full overflow-x-auto  rounded-md p-4 mb-4 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"><code>${hljs.highlightAuto(code.text).value}</code></pre>
                </div>`;
            };
        }
        marked.setOptions({
            renderer,
            breaks: true,
            gfm: true,
            ...markedOptions,
        });
    }

    private initMermaid(): void {
        if (!this.mermaidInitialized) {
            try {
                mermaid.initialize(this.mermaidConfig);
                this.mermaidInitialized = true;
            } catch (error) {
                console.error('Mermaid初始化失败:', error);
            }
        }
    }

    public render(content: string): string | Promise<string> {
        // 检查缓存
        if (this.contentCache.has(content)) {
            return this.contentCache.get(content) as string;
        }

        try {
            const html = marked(content);
            let finalHtml = html;

            if (this.latexEnabled) {
                finalHtml = this.renderLatex(typeof finalHtml === 'string' ? finalHtml : '');
            }

            // 缓存渲染结果
            this.contentCache.set(content, typeof finalHtml === 'string' ? finalHtml : '');
            return finalHtml;
        } catch (error) {
            console.error('Markdown渲染失败:', error);
            return `<div class="markdown-error">内容渲染失败</div>`;
        }
    }

    private renderLatex(html: string): string {
        try {
            const blockRegex = /\$\$(.*?)\$\$/gs;
            const inlineRegex = /\$(.*?)\$/g;

            return html
                .replace(blockRegex, (_, math) => katex.renderToString(math, { displayMode: true }))
                .replace(inlineRegex, (_, math) =>
                    katex.renderToString(math, { displayMode: false })
                );
        } catch (error) {
            console.error('LaTeX渲染失败:', error);
            return html;
        }
    }

    public async renderMermaid(container: HTMLElement): Promise<void> {
        if (!this.mermaidEnabled) return;

        // 确保Mermaid已初始化
        this.initMermaid();

        try {
            // 查找所有未处理的Mermaid图表
            const elements = container.querySelectorAll('pre.mermaid:not([data-processed="true"])');

            if (elements.length === 0) return;

            // 逐个处理每个图表
            for (const element of Array.from(elements)) {
                try {
                    const id = `mermaid-${uuidV4()}`;
                    const content = element.textContent || '';

                    // 标记为已处理
                    element.setAttribute('data-processed', 'true');

                    // 创建一个新的容器来接收渲染后的图表
                    const container = document.createElement('div');
                    container.className = 'mermaid-rendered';
                    element.parentNode?.insertBefore(container, element);

                    // 使用mermaid API渲染图表
                    const { svg } = await mermaid.render(id, content);
                    container.innerHTML = svg;

                    // 隐藏原始元素
                    element.setAttribute('style', 'display: none');
                } catch (err) {
                    console.error('图表渲染失败:', err);
                    element.innerHTML = `<div class="mermaid-error">图表渲染失败: ${
                        err || '未知错误'
                    }</div>`;
                }
            }
        } catch (error) {
            console.error('Mermaid整体渲染失败:', error);
        }
    }

    // 清除缓存
    public clearCache(): void {
        this.contentCache.clear();
    }
}

// 单例导出
export const markdownRenderer = new MarkdownRenderer({
    mermaid: {
        theme: 'default',
        securityLevel: 'loose',
    },
    latex: { output: 'html' },
});
