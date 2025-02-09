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
    modelGroup: ModelGroup[];
    extraConfig: Record<keyof any, any>;
};
