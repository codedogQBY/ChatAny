import type { Chat, Message } from '@/types';
import { useBotStore } from '@/store/bot';
import { useChatStore } from '@/store/chat';

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    model: string;
    apiKey: string;
    baseURL?: string;
    systemMessage?: string;
    botId: string;
}

export class ChatService {
    private options: ChatOptions;

    constructor(options: ChatOptions) {
        this.options = options;
    }

    async sendMessageStream(
        message: string,
        context: Message[] = [],
        onUpdate: (content: string) => void
    ): Promise<string> {
        try {
            // 构建消息历史 (与sendMessage相同)
            const messages = [];

            const botStore = useBotStore();

            const bot = botStore.getBotByBotId(this.options.botId!);

            console.log(this.options.botId, bot);

            if (bot?.prompt) {
                messages.push({
                    role: 'system',
                    content: bot?.prompt,
                });
            }

            messages.push(
                ...context.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.quoteContent
                        ? `
                            <user-quoted-message>
                            ${msg.quoteContent}
                            </user-quoted-message>
                            ------------
                            ${message}
                        `
                        : msg.content,
                }))
            );

            if (messages[0].role === 'assistant') {
                // 删除第一个助手消息,默认开场白不计入
                messages.shift();
            }
            const chatStore = useChatStore();

            // 引用消息
            if (chatStore.quotedMessage) {
                messages.push({
                    role: 'user',
                    content: `
                        <user-quoted-message>
                        ${chatStore.quotedMessage.content}
                        </user-quoted-message>
                        ------------
                        ${message}
                        `,
                });
                // 清除原来的引用
                chatStore.cancelQuote();
            } else {
                messages.push({
                    role: 'user',
                    content: message,
                });
            }

            // 处理baseURL
            let baseUrl = this.options.baseURL || 'https://api.openai.com';
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }

            // 与sendMessage中相同的模型名称处理
            let modelName = this.options.model;

            // 构建请求体
            let requestBody: any = {
                model: modelName,
                messages,
                temperature: this.options.temperature ?? 0.7,
                max_tokens: this.options.maxTokens ?? 1000,
                top_p: this.options.topP ?? 0.9,
                stream: true, // 设置为流式
            };

            if (!this.options.apiKey || this.options.apiKey.trim() === '') {
                throw new Error('API 密钥不能为空');
            }

            const response = await fetch(baseUrl + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.options.apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: { message: `HTTP错误: ${response.status}` } }));
                console.error('API流式响应错误:', errorData);
                throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('无法获取响应流');
            }

            // 处理流式响应
            let fullContent = '';
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 解码收到的数据
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk
                    .split(/\r?\n/)
                    .filter((line) => line.trim() !== '' && line.trim() !== 'data: [DONE]');

                for (const line of lines) {
                    try {
                        const trimmedLine = line.replace(/^data: /, '').trim();
                        if (!trimmedLine) continue;

                        const parsedData = JSON.parse(trimmedLine);
                        if (parsedData.error) {
                            throw new Error(parsedData.error);
                        }
                        const content = parsedData.choices?.[0]?.delta?.content || '';

                        if (content) {
                            fullContent += content;
                            onUpdate(fullContent);
                        }
                    } catch (e) {
                        console.warn('解析流数据失败:', e, 'Line:', line);
                    }
                }
            }
            onUpdate(fullContent);
            return fullContent;
        } catch (error) {
            console.error('流式聊天错误:', error);
            throw error;
        }
    }
}

// 添加模拟 API 响应的辅助函数
export function getSimulatedResponse(message: string): string {
    return `这是模拟的回复。您发送的消息是: "${message}"。\n\n请确保在设置中配置有效的 API 密钥，以便连接到真实的 AI 服务。`;
}

// 创建聊天服务实例的工厂函数
export function createChatService(chat: Chat, apiKey: string, baseURL?: string): ChatService {
    // 使用供应商提供的原始 URL
    let processedBaseURL = baseURL;

    // 如果没有提供 baseURL，使用默认值
    if (!processedBaseURL) {
        processedBaseURL = 'https://api.openai.com/v1';
    }

    // 确保 URL 没有以 / 结尾
    if (processedBaseURL.endsWith('/')) {
        processedBaseURL = processedBaseURL.slice(0, -1);
    }

    // 处理模型 ID
    let modelId = chat.modelId || 'gpt-3.5-turbo';

    return new ChatService({
        temperature: chat.temperature,
        maxTokens: chat.maxTokens,
        topP: chat.topP,
        model: modelId,
        apiKey,
        baseURL: processedBaseURL,
        botId: chat.botId || '',
    });
}

// 无上下文发起非流式请求,用于测试和会话命名
export async function sendMessageNoContext(
    message: string,
    options: {
        url: string;
        model: string;
        apiKey: string;
        maxTokens: number;
        systemPrompt?: string;
    }
): Promise<any> {
    try {
        const messages = [];
        if (options.systemPrompt) {
            messages.push({
                role: 'system',
                content: options.systemPrompt,
            });
        }
        messages.push({
            role: 'user',
            content: message,
        });
        // 构建请求体
        const requestBody = {
            model: options.model,
            messages,
            max_tokens: options.maxTokens || 1280,
            stream: false,
        };

        const authHeader = `Bearer ${options.apiKey}`;

        const response = await fetch(options.url + '/chat/completions', {
            // 确保正确的端点
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ error: { message: `HTTP错误: ${response.status}` } }));
            console.error('无上下文API响应错误:', errorData);
            throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error('无上下文非流式请求错误:', e);
        throw e;
    }
}
