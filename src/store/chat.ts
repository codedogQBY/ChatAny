import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import store from '@/hook/useStore';
import { useBotStore } from './bot';
import type { Chat, Session, Message } from '@/types';

export const useChatStore = defineStore('chat', () => {
    const chats = ref<Chat[]>([]);
    const currentChat = ref<Chat | null>(null);
    const currentSession = ref<Session | null>(null);
    const quotedMessage = ref<Message | null>(null);

    const botStore = useBotStore();

    // 创建一个新的会话
    const createSession = (botId: string, chatId: string, title: string = '新的会话'): Session => {
        const bot = botStore.sections
            .flatMap((section) => section.bots)
            .find((bot) => bot.id === botId);
        if (!bot) throw new Error('Bot not found');

        const session: Session = {
            id: uuidv4(),
            title,
            messages: [
                {
                    id: uuidv4(),
                    sessionId: '', // 将在下面设置
                    chatId,
                    content: bot.prologue || '开始新的对话',
                    sender: 'bot',
                    status: 'sent',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // 设置 sessionId
        session.messages[0].sessionId = session.id;
        return session;
    };

    // 为每个bot创建默认chat
    const generateDefaultChats = (): Chat[] => {
        return botStore.sections.flatMap((section) =>
            section.bots.map((bot) => {
                const chatId = uuidv4();
                return {
                    id: chatId,
                    name: bot.name,
                    botId: bot.id,
                    sessions: [createSession(bot.id, chatId)],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    temperature: 0.7,
                    maxTokens: 1280,
                    topP: 0.9,
                    contextSize: 6,
                    avatar: bot.avatar,
                    isDefault: bot.isDefault,
                    modelId: bot.model?.modelId,
                };
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
            const existingBotIds = new Set(chats.value.map((chat) => chat.botId));
            const newChats = botStore.sections
                .flatMap((section) => section.bots)
                .filter((bot) => !existingBotIds.has(bot.id))
                .map((bot) => {
                    const chatId = uuidv4();
                    const chat: Chat = {
                        id: chatId,
                        name: bot.name,
                        botId: bot.id,
                        sessions: [createSession(bot.id, chatId)],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        temperature: 0.7,
                        maxTokens: 1280,
                        contextSize: 6,
                        topP: 0.9,
                        avatar: bot.avatar,
                        isDefault: bot.isDefault,
                        modelId: bot.model?.modelId,
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
        const chat = chats.value.find((c) => c.id === chatId);
        if (chat) {
            currentChat.value = chat;
            currentSession.value = chat.sessions[chat.sessions.length - 1];
            await syncData();
        }
    };

    // 选择会话
    const selectSession = async (sessionId: string) => {
        if (!currentChat.value) return;

        const session = currentChat.value.sessions.find((s) => s.id === sessionId);
        if (session) {
            currentSession.value = session;
            // 重置所有消息的状态
            session.messages.forEach((msg) => {
                if (msg.status === 'pending') {
                    msg.status = 'sent';
                }
            });
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

        const message = currentSession.value.messages.find((m) => m.id === messageId);
        if (message) {
            console.log(`更新消息状态: ${messageId} -> ${status}`);
            message.status = status;
            message.updatedAt = Date.now();
            await syncData();
            return true;
        }
        return false;
    };

    // 通过 botId 获取或创建 chat
    const getChatByBotId = async (botId: string) => {
        // 先查找是否已存在
        const existingChat = chats.value.find((chat) => chat.botId === botId);
        if (existingChat) {
            await selectChat(existingChat.id);
            return existingChat;
        }

        // 不存在则创建新的
        const bot = botStore.sections
            .flatMap((section) => section.bots)
            .find((bot) => bot.id === botId);

        if (!bot) throw new Error('Bot not found');

        const chatId = uuidv4();
        const newChat: Chat = {
            id: chatId,
            name: bot.name,
            botId: bot.id, // 使用机器人的 ID
            sessions: [createSession(bot.id, chatId)],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            temperature: 0.7,
            maxTokens: 1280,
            contextSize: 6,
            topP: 0.9,
            avatar: bot.avatar,
            isDefault: bot.isDefault,
            modelId: bot.model?.supplierId
                ? bot.model.modelId // 如果有指定模型，使用指定的模型
                : undefined, // 否则等待用户选择
        };

        chats.value.push(newChat);
        await selectChat(newChat.id);
        await syncData();
        return newChat;
    };

    // 更新聊天设置
    const updateChatSettings = async (
        chatId: string,
        settings: {
            temperature: number;
            maxTokens: number;
            topP: number;
            contextSize: number;
        }
    ) => {
        const chat = chats.value.find((c) => c.id === chatId);
        if (!chat) return;
        chat.temperature = settings.temperature;
        chat.maxTokens = settings.maxTokens;
        chat.topP = settings.topP;
        chat.contextSize = settings.contextSize;
        chat.updatedAt = Date.now();

        await syncData();
    };

    // 重命名会话
    const renameSession = async (sessionId: string, title: string) => {
        // 先确保有当前聊天
        if (!currentChat.value) return;

        // 在当前聊天中查找会话
        const session = currentChat.value.sessions.find((s) => s.id === sessionId);
        if (!session) return;

        session.title = title;
        session.updatedAt = Date.now();
        currentChat.value.updatedAt = Date.now();

        await syncData();
    };

    // 删除会话
    const deleteSession = async (sessionId: string) => {
        // 先确保有当前聊天
        if (!currentChat.value) return;

        // 在当前聊天中查找会话
        const index = currentChat.value.sessions.findIndex((s) => s.id === sessionId);
        if (index === -1) return;

        // 如果删除的是当前会话，先切换到其他会话
        if (currentSession.value?.id === sessionId) {
            // 如果还有其他会话，切换到最新的一个
            if (currentChat.value.sessions.length > 1) {
                const newIndex =
                    index === currentChat.value.sessions.length - 1 ? index - 1 : index + 1;
                currentSession.value = currentChat.value.sessions[newIndex];
            } else {
                currentSession.value = null;
            }
        }

        // 删除会话
        currentChat.value.sessions.splice(index, 1);
        currentChat.value.updatedAt = Date.now();

        // 如果这是最后一个会话，创建一个新的默认会话
        if (currentChat.value.sessions.length === 0) {
            const newSession = createSession(currentChat.value.botId, currentChat.value.id);
            currentChat.value.sessions.push(newSession);
            currentSession.value = newSession;
        }

        await syncData();
    };

    // 删除指定 botId 的所有聊天
    const deleteChatsByBotId = async (botId: string) => {
        // 如果当前聊天属于要删除的机器人，先清空当前聊天
        if (currentChat.value?.botId === botId) {
            currentChat.value = null;
            currentSession.value = null;
        }

        // 过滤掉要删除的聊天
        chats.value = chats.value.filter((chat) => chat.botId !== botId);
        await syncData();
    };

    const clearSessionMessages = async (sessionId: string) => {
        // 先确保有当前聊天
        if (!currentChat.value) return;

        // 在当前聊天中查找会话
        const session = currentChat.value.sessions.find((s) => s.id === sessionId);
        if (!session) return;

        // 清空会话的消息
        session.messages = [];

        // 更新时间戳
        session.updatedAt = Date.now();
        currentChat.value.updatedAt = Date.now();

        await syncData();
    };

    // 更新聊天的模型
    const updateChatModel = async (chatId: string, modelId: string) => {
        const chat = chats.value.find((c) => c.id === chatId);
        if (!chat) return;

        // 只更新 chat 的模型设置，不改变 botId
        chat.modelId = modelId; // 需要在 Chat 类型中添加 modelId 字段
        chat.updatedAt = Date.now();

        // 更新当前会话
        if (currentChat.value?.id === chatId) {
            currentChat.value = chat;
        }

        await syncData();
    };

    // 替换消息（完全替换对象以解决响应式更新问题）
    const replaceMessage = async (messageId: string, newMessage: Message) => {
        if (!currentChat.value || !currentSession.value) return false;

        const index = currentSession.value.messages.findIndex((m) => m.id === messageId);
        if (index === -1) return false;

        // 直接替换整个对象
        currentSession.value.messages.splice(index, 1, newMessage);
        console.log(`替换消息 ${messageId} 成功，新状态:`, newMessage.status);

        // 触发视图更新，但不调用syncData来减少IO负担
        return true;
    };

    const setQuotedMessage = (message: Message) => {
        quotedMessage.value = message;
    };

    const cancelQuote = () => {
        quotedMessage.value = null;
    };

    return {
        chats,
        currentChat,
        currentSession,
        quotedMessage,
        initializeStore,
        selectChat,
        selectSession,
        addMessage,
        updateMessageStatus,
        createSession,
        getChatByBotId,
        syncData,
        updateChatSettings,
        renameSession,
        deleteSession,
        deleteChatsByBotId,
        clearSessionMessages,
        updateChatModel,
        replaceMessage,
        setQuotedMessage,
        cancelQuote,
    };
});
