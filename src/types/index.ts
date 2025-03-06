// 语言枚举
export enum LanguageEnum {
    ZH_CN = 'zh_CN',
    EN = 'en',
    JA = 'ja',
    KO = 'ko',
}

// 暗黑
export enum DARK_MODE {
    LIGHT = 'light',
    DARK = 'dark',
}

// 主题色枚举
export enum ThemeEnum {
    GREEN = 'green',
    ROSE = 'rose',
    BLUE = 'blue',
    ZINC = 'zinc',
    ORANGE = 'orange',
    YELLOW = 'yellow',
    VIOLET = 'violet',
    RED = 'red',
}

// 会话显示模式（左右分布、左对齐）
export enum SessionModeEnum {
    LEFT = 'left',
    Flank = 'flank',
}

export type Model = {
    id: string;
    name: string;
    description?: string;
    extraConfig?: Record<keyof any, any>;
};

export type ModelGroup = {
    id: string;
    groupName: string;
    models: Model[];
};

export type Supplier = {
    name: string;
    label: string;
    logo: string;
    apiKey: string;
    apiUrl: string;
    apiDocUrl: string;
    websiteUrl: string;
    apiKeyUrl?: string;
    modelGroup: ModelGroup[];
    isDefault: boolean;
};

// 消息状态类型
export type MessageStatus = 'sent' | 'loading' | 'streaming' | 'error' | 'pending';

// 消息发送者类型
export type MessageSender = 'user' | 'assistant' | 'bot';

// 消息数据结构
export interface Message {
    id: string;
    sessionId: string;
    chatId: string;
    content: string;
    // 思考内容
    thinkContent?: string;
    // 引用内容
    quoteContent?: string;
    sender: MessageSender;
    status: MessageStatus;
    createdAt: number;
    updatedAt: number;
}

// 会话数据结构
export interface Session {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

// 聊天数据结构
export interface Chat {
    id: string;
    name: string;
    botId: string;
    sessions: Session[];
    createdAt: number;
    updatedAt: number;
    temperature: number;
    maxTokens: number;
    topP: number;
    contextSize: number;
    avatar?: string;
    isDefault?: boolean;
    modelId?: string;
}

export interface Bot {
    id: string;
    name: string;
    avatar: string;
    description: string;
    isDefault: boolean;
    prologue?: string;
    prompt?: string;
    // 添加模型相关信息
    model?: {
        supplierId: string; // 供应商ID
        modelId: string; // 模型ID
    };
}
