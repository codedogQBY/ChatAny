export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    time: string;
}

export interface Chat {
    id: number;
    name: string;
    avatar: string;
    model: string;
    lastMessage: string;
    messages: Message[];
}
