import type { Chat, Message } from '@/types';

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    model: string;
    apiKey: string;
    baseURL?: string;
    systemMessage?: string;
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

            // 添加系统消息（如果供应商是 DeepSeek）
            if (this.options.baseURL?.includes('deepseek')) {
                messages.push({
                    role: 'system',
                    content: '你是一个有帮助的助手。',
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

            console.log('发送请求到:', baseUrl);
            console.log('请求体:', JSON.stringify(requestBody, null, 2));
            console.log('使用模型:', modelName, '原始模型名称:', this.options.model);
            console.log('API 密钥前几位:', this.options.apiKey.substring(0, 5) + '...');

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

            // 如果是余额不足错误，返回模拟响应
            if (error instanceof Error && error.message.includes('余额不足')) {
                console.log('使用模拟响应模式 - 余额不足');
                return this.simulateResponse(message);
            }

            // 如果是 API 密钥错误，也返回模拟响应
            if (error instanceof Error && error.message.includes('密钥无效')) {
                console.log('API 密钥无效，使用模拟响应模式');
                return this.simulateResponse(message) + '\n\n请检查您的 API 密钥设置。';
            }

            // 其他错误也使用模拟响应
            console.log('未知错误，使用模拟响应模式:', error);
            return this.simulateResponse(message);
        }
    }

    // 修改流式响应函数，确保回调更频繁地被调用
    async sendMessageStream(
        message: string,
        context: Message[] = [],
        onUpdate: (content: string) => void
    ): Promise<string> {
        try {
            // 构建消息历史 (与sendMessage相同)
            const messages = [];

            if (this.options.baseURL?.includes('deepseek')) {
                messages.push({
                    role: 'system',
                    content: '你是一个有帮助的助手。',
                });
            }

            messages.push(
                ...context.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                }))
            );

            messages.push({
                role: 'user',
                content: message,
            });

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

            console.log('发送流式请求到:', baseUrl);

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
                        const content = parsedData.choices?.[0]?.delta?.content || '';

                        if (content) {
                            fullContent += content;
                            // 每有新内容就立即回调
                            console.log('流式内容更新:', content);
                            onUpdate(fullContent);
                        }
                    } catch (e) {
                        console.warn('解析流数据失败:', e, 'Line:', line);
                    }
                }
            }

            // 最终回调一次确保完整内容
            console.log('流式响应完成，总长度:', fullContent.length);
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
    return `这是模拟的 DeepSeek 回复。您发送的消息是: "${message}"。\n\n请确保在设置中配置有效的 API 密钥，以便连接到真实的 AI 服务。`;
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
    console.log('使用模型 ID:', chat.modelId);

    // 检查 API 密钥
    if (!apiKey || apiKey.trim() === '') {
        console.warn('DeepSeek API 密钥为空，将使用模拟响应');

        // 返回一个使用模拟响应的服务
        return {
            async sendMessage(message: string): Promise<string> {
                return getSimulatedResponse(message);
            },
        } as ChatService;
    } else {
        console.log('API 密钥有效，长度:', apiKey.length);
    }

    console.log('创建聊天服务，使用 URL:', processedBaseURL);
    console.log('使用模型 ID:', modelId);

    return new ChatService({
        temperature: chat.temperature,
        maxTokens: chat.maxTokens,
        topP: chat.topP,
        model: modelId,
        apiKey,
        baseURL: processedBaseURL,
    });
}
