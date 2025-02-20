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
};

export type ModelGroup = {
    groupName: string;
    models: Model[];
};

export type ModelItem = {
    name: string;
    label: string;
    logo: string;
    apiKey: string;
    apiUrl: string;
    apiDocUrl: string;
    websiteUrl: string;
    apiKeyUrl?: string;
    modelGroup: ModelGroup[];
    extraConfig: Record<keyof any, any>;
};
