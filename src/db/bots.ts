import DB from './index';
import type { Bot } from '@/types';

export default class BotDb {
    private collection = 'bots';

    async create(data: Omit<Bot, 'id'>): Promise<Bot> {
        return DB.create<Bot>(this.collection, data);
    }

    async read(id: string): Promise<Bot> {
        return DB.read<Bot>(this.collection, id);
    }

    async update(id: string, data: Partial<Bot>): Promise<Bot> {
        return DB.update<Bot>(this.collection, id, data);
    }

    async delete(id: string): Promise<void> {
        return DB.delete<Bot>(this.collection, id);
    }
}
