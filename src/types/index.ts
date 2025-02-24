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

// 模型相关
export type Skill = 'inference' | 'online' | 'image' | 'plugin';

export type Model = {
    id: string;
    name: string;
    skills: Skill[];
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

export type MessageSender = 'user' | 'bot';

export interface Message {
    id: string;
    sessionId: string;
    chatId: string;
    content: string;
    sender: MessageSender;
    status?: 'pending' | 'sent' | 'error';
    metadata?: Record<string, any>;
    createdAt: number;
    updatedAt: number;
}

export interface Session {
    id: string;
    messages: Message[];
    title: string;
    createdAt: number;
    updatedAt: number;
}

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
    isDefault: boolean;
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
