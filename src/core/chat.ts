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

    // 添加一个模拟响应的方法
    private simulateResponse(message: string): string {
        return `这是一个模拟响应。你发送的消息是: "${message}"。由于API账户余额不足或其他原因，我们无法连接到真实的AI服务。`;
    }

    async sendMessage(message: string, context: Message[] = []): Promise<string> {
        try {
            // 构建消息历史
            const messages = [];

            const botStore = useBotStore();

            const bot = botStore.getBotByBotId(this.options.botId!);

            if (bot?.prompt) {
                messages.push({
                    role: 'system',
                    content: bot?.prompt,
                });
            }

            // 添加上下文消息
            messages.push(
                ...context.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                }))
            );

            // 添加新消息
            messages.push({
                role: 'user',
                content: message,
            });

            // 处理 baseURL
            let baseUrl = this.options.baseURL || 'https://api.openai.com';

            // 移除末尾的斜杠
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }

            // 根据供应商调整模型名称
            let modelName = this.options.model;
            // 构建请求体，根据不同的 API 供应商调整格式
            let requestBody: any = {
                model: modelName,
                messages,
                temperature: this.options.temperature ?? 0.7,
                max_tokens: this.options.maxTokens ?? 1000,
                top_p: this.options.topP ?? 1,
            };

            requestBody.stream = false;

            // 检查 API 密钥格式
            if (!this.options.apiKey || this.options.apiKey.trim() === '') {
                throw new Error('API 密钥不能为空');
            }

            // 根据不同的供应商调整 Authorization 头
            let authHeader = `Bearer ${this.options.apiKey}`;

            const response = await fetch(baseUrl + '/chat/completions', {
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
                console.error('API响应错误:', errorData);

                // 处理特定的错误类型
                if (errorData.error?.message === 'Insufficient Balance') {
                    throw new Error('API 账户余额不足，请充值后再试');
                } else if (errorData.error?.code === 'invalid_api_key' || response.status === 401) {
                    throw new Error('API 密钥无效，请检查您的设置');
                } else {
                    throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('API 返回的完整响应:', JSON.stringify(data, null, 2));

            // 这里不应该有任何检查 API 供应商的条件，直接处理响应
            return data.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Chat completion error:', error);

            // 其他错误也使用模拟响应
            console.log('未知错误，使用模拟响应模式:', error);
            return this.simulateResponse(message);
        }
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
                            user quoted message start
                            ${msg.quoteContent}
                            user quoted message end
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
                        user quoted message start
                        ${chatStore.quotedMessage.content}
                        user quoted message end
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

    // 检查 API 密钥
    if (!apiKey || apiKey.trim() === '') {
        console.warn('密钥为空，将使用模拟响应');

        // 返回一个使用模拟响应的服务
        return {
            async sendMessage(message: string): Promise<string> {
                return getSimulatedResponse(message);
            },
        } as ChatService;
    }

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
