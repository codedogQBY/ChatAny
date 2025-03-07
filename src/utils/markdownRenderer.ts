import { marked, MarkedOptions, Renderer, Tokens } from 'marked';
import mermaid from 'mermaid';
// @ts-ignore
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
                    // 为 mermaid 代码块创建一个可交互的容器
                    return `
                    <div class="mermaid-container" data-processed="false">
                        <div class="code-block-wrapper mermaid-code-wrapper">
                            <div class="code-header">
                                <span class="code-language">mermaid</span>
                                <button class="mermaid-render-button">渲染图表</button>
                            </div>
                            <pre class="code-block"><code class="mermaid-code hljs">${hljs.highlight(code.text, { language: 'javascript' }).value}</code></pre>
                        </div>
                        <div class="mermaid-render-container" style="display:none;">
                            <div class="mermaid-controls">
                                <span class="mermaid-language">mermaid</span>
                                <button class="mermaid-back-to-code">返回代码</button>
                            </div>
                            <div class="mermaid-loading" style="display:none;">图表加载中...</div>
                            <pre class="mermaid" style="display:none;">${code.text}</pre>
                            <div class="mermaid-error-container" style="display:none;"></div>
                        </div>
                    </div>`;
                }

                // 使用highlightAuto来确保代码高亮正确应用
                const highlighted = hljs.highlightAuto(code.text);
                const language = code.lang || highlighted.language || 'javascript';

                return `
                <div class="code-block-wrapper">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-button">复制</button>
                    </div>
                    <pre class="code-block"><code class="hljs ${highlighted.language || ''}">${highlighted.value}</code></pre>
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

    private async initMermaid(): Promise<void> {
        if (!this.mermaidInitialized) {
            try {
                // 返回一个Promise以确保初始化完成
                return new Promise((resolve, reject) => {
                    if (typeof window !== 'undefined') {
                        // 添加超时处理
                        const timeoutId = setTimeout(() => {
                            reject(new Error('Mermaid初始化超时'));
                        }, 5000);

                        try {
                            mermaid.initialize({
                                ...this.mermaidConfig,
                                startOnLoad: false,
                                securityLevel: 'loose',
                            });

                            clearTimeout(timeoutId);
                            this.mermaidInitialized = true;
                            resolve();
                        } catch (error) {
                            clearTimeout(timeoutId);
                            reject(error);
                        }
                    } else {
                        resolve(); // 非浏览器环境直接解析
                    }
                });
            } catch (error) {
                console.error('Mermaid初始化失败:', error);
                return Promise.reject(error);
            }
        }
        return Promise.resolve();
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

        try {
            // 查找所有Mermaid容器
            const mermaidContainers = container.querySelectorAll('.mermaid-container');
            if (mermaidContainers.length === 0) return;

            // 绑定事件处理器
            mermaidContainers.forEach((container) => {
                // 如果已经处理过事件绑定，则跳过
                if (container.getAttribute('data-events-bound') === 'true') return;

                // 获取渲染按钮和返回按钮
                const renderButton = container.querySelector('.mermaid-render-button');
                const backButton = container.querySelector('.mermaid-back-to-code');

                // 绑定渲染按钮事件
                if (renderButton) {
                    renderButton.addEventListener('click', async () => {
                        await this.renderMermaidDiagram(container as HTMLElement);
                    });
                }

                // 绑定返回代码按钮事件
                if (backButton) {
                    backButton.addEventListener('click', () => {
                        // 显示代码，隐藏图表
                        const codeWrapper = container.querySelector('.mermaid-code-wrapper');
                        const renderContainer = container.querySelector(
                            '.mermaid-render-container'
                        );

                        if (codeWrapper && renderContainer) {
                            codeWrapper.setAttribute('style', 'display:block');
                            renderContainer.setAttribute('style', 'display:none');
                        }
                    });
                }

                // 标记为已绑定事件
                container.setAttribute('data-events-bound', 'true');
            });
        } catch (error) {
            console.error('Mermaid事件绑定失败:', error);
        }
    }

    // 新增方法：渲染单个Mermaid图表
    private async renderMermaidDiagram(container: HTMLElement): Promise<void> {
        try {
            // 确保Mermaid已初始化
            await this.initMermaid();

            // 获取代码和渲染容器
            const codeWrapper = container.querySelector('.mermaid-code-wrapper');
            const renderContainer = container.querySelector('.mermaid-render-container');
            const mermaidElem = renderContainer?.querySelector('.mermaid') as HTMLElement;
            const loadingElem = renderContainer?.querySelector('.mermaid-loading') as HTMLElement;
            const errorContainer = renderContainer?.querySelector(
                '.mermaid-error-container'
            ) as HTMLElement;

            if (
                !codeWrapper ||
                !renderContainer ||
                !mermaidElem ||
                !loadingElem ||
                !errorContainer
            ) {
                throw new Error('缺少必要的DOM元素');
            }

            // 显示渲染容器和加载提示
            codeWrapper.setAttribute('style', 'display:none');
            renderContainer.setAttribute('style', 'display:block');
            loadingElem.setAttribute('style', 'display:block');
            errorContainer.setAttribute('style', 'display:none');

            try {
                // 获取要渲染的内容
                const content = mermaidElem.textContent || '';
                if (!content.trim()) {
                    throw new Error('图表内容为空');
                }

                // 生成唯一ID
                const id = `mermaid-${uuidV4()}`;

                // 使用mermaid API渲染图表，添加超时控制
                const renderPromise = Promise.race([
                    mermaid.render(id, content),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('图表渲染超时')), 5000)
                    ),
                ]);

                const { svg } = (await renderPromise) as { svg: string };

                // 隐藏加载提示
                loadingElem.setAttribute('style', 'display:none');

                // 在返回按钮后添加渲染结果
                const renderedDiv = document.createElement('div');
                renderedDiv.className = 'mermaid-rendered';
                renderedDiv.innerHTML = svg;

                // 清除之前的渲染结果
                const oldRendered = renderContainer.querySelector('.mermaid-rendered');
                if (oldRendered) {
                    oldRendered.remove();
                }

                // 添加新的渲染结果
                renderContainer.appendChild(renderedDiv);
            } catch (err) {
                console.error('图表渲染失败:', err);

                // 隐藏加载提示
                loadingElem.setAttribute('style', 'display:none');

                // 显示错误信息
                errorContainer.setAttribute('style', 'display:block');

                // 简化错误信息
                // @ts-ignore
                let errorMsg = err?.message || '未知错误';
                if (errorMsg.includes('Failed to load resource')) {
                    errorMsg = '无法加载Mermaid资源，请检查网络连接或重启应用';
                }

                errorContainer.innerHTML = `
                    <div class="mermaid-error">
                        <div class="mermaid-error-title">图表渲染失败</div>
                        <div class="mermaid-error-message">${errorMsg}</div>
                    </div>
                `;
            }
        } catch (containerError) {
            console.error('处理图表容器时出错:', containerError);
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
