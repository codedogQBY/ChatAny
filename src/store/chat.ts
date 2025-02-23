import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import store from '@/hook/useStore';
import { useBotStore } from './bot';

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
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

export const useChatStore = defineStore('chat', () => {
    const chats = ref<Chat[]>([]);
    const currentChat = ref<Chat | null>(null);
    const currentSession = ref<Session | null>(null);

    const botStore = useBotStore();

    // 创建一个新的会话
    const createSession = (botId: string, chatId: string, title: string = '新的会话'): Session => {
        const bot = botStore.sections
            .flatMap(section => section.bots)
            .find(bot => bot.id === botId);
        if (!bot) throw new Error('Bot not found');

        const session: Session = {
            id: uuidv4(),
            title,
            messages: [{
                id: uuidv4(),
                sessionId: '', // 将在下面设置
                chatId,
                content: bot.prologue,
                sender: 'bot',
                status: 'sent',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // 设置 sessionId
        session.messages[0].sessionId = session.id;
        return session;
    };

    // 为每个bot创建默认chat
    const generateDefaultChats = (): Chat[] => {
        return botStore.sections.flatMap(section => 
            section.bots.map(bot => {
                const chatId = uuidv4();
                const chat: Chat = {
                    id: chatId,
                    name: bot.name,
                    botId: bot.id,
                    sessions: [createSession(bot.id, chatId)],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    temperature: 0.7,
                    maxTokens: 2000,
                    topP: 0.9,
                };
                return chat;
            })
        );
    };

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('chats', {
            chats: chats.value,
            currentChat: currentChat.value,
            currentSession: currentSession.value,
        });
    };

    // 初始化数据
    const initializeStore = async () => {
        // 等待 botStore 完全初始化
        if (botStore.sections.length === 0) {
            await botStore.initializeStore();
        }

        const savedState = await store.get<{
            chats: Chat[];
            currentChat: Chat | null;
            currentSession: Session | null;
        }>('chats');

        if (savedState) {
            chats.value = savedState.chats;
            currentChat.value = savedState.currentChat;
            currentSession.value = savedState.currentSession;

            // 检查是否需要为新的bot创建chat
            const existingBotIds = new Set(chats.value.map(chat => chat.botId));
            const newChats = botStore.sections
                .flatMap(section => section.bots)
                .filter(bot => !existingBotIds.has(bot.id))
                .map(bot => {
                    const chatId = uuidv4();
                    const chat: Chat = {
                        id: chatId,
                        name: bot.name,
                        botId: bot.id,
                        sessions: [createSession(bot.id, chatId)],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        temperature: 0.7,
                        maxTokens: 2000,
                        topP: 0.9,
                    };
                    return chat;
                });

            if (newChats.length > 0) {
                chats.value.push(...newChats);
                await syncData();
            }
        } else {
            chats.value = generateDefaultChats();
            if (chats.value.length > 0) {
                currentChat.value = chats.value[0];
                currentSession.value = chats.value[0].sessions[0];
            }
            await syncData();
        }
    };

    // 选择聊天
    const selectChat = async (chatId: string) => {
        const chat = chats.value.find(c => c.id === chatId);
        if (chat) {
            currentChat.value = chat;
            currentSession.value = chat.sessions[chat.sessions.length - 1];
            await syncData();
        }
    };

    // 选择会话
    const selectSession = async (sessionId: string) => {
        if (!currentChat.value) return;
        
        const session = currentChat.value.sessions.find(s => s.id === sessionId);
        if (session) {
            currentSession.value = session;
            await syncData();
        }
    };

    // 添加消息
    const addMessage = async (message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!currentChat.value || !currentSession.value) return;

        const newMessage: Message = {
            ...message,
            id: uuidv4(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        currentSession.value.messages.push(newMessage);
        currentSession.value.updatedAt = Date.now();
        currentChat.value.updatedAt = Date.now();
        
        await syncData();
        return newMessage;
    };

    // 更新消息状态
    const updateMessageStatus = async (messageId: string, status: Message['status']) => {
        if (!currentChat.value || !currentSession.value) return;

        const message = currentSession.value.messages.find(m => m.id === messageId);
        if (message) {
            message.status = status;
            message.updatedAt = Date.now();
            await syncData();
        }
    };

    return {
        chats,
        currentChat,
        currentSession,
        initializeStore,
        selectChat,
        selectSession,
        addMessage,
        updateMessageStatus,
        createSession,
    };
}); 