import { load } from '@tauri-apps/plugin-store';

class StoreManager {
    private static instance: Awaited<ReturnType<typeof load>> | null = null;
    private static readonly path = 'store.json';

    private static async getInstance() {
        if (!this.instance) {
            this.instance = await load(this.path, { autoSave: true });
        }
        return this.instance;
    }

    static async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        const store = await this.getInstance();
        const value = await store.get(key);
        return value !== null ? (value as T) : defaultValue;
    }

    static async set(key: string, value: any): Promise<void> {
        const store = await this.getInstance();
        await store.set(key, value);
    }

    static async remove(key: string): Promise<void> {
        const store = await this.getInstance();
        await store.delete(key);
    }

    static async clear(): Promise<void> {
        const store = await this.getInstance();
        await store.clear();
    }

    static async has(key: string): Promise<boolean> {
        const store = await this.getInstance();
        return (await store.get(key)) !== null;
    }
}

// 导出默认的 store 实例
const store = {
    /**
     * 获取存储的值
     * @param key 键名
     * @param defaultValue 默认值
     */
    get: StoreManager.get.bind(StoreManager),

    /**
     * 设置存储的值
     * @param key 键名
     * @param value 值
     */
    set: StoreManager.set.bind(StoreManager),

    /**
     * 删除存储的值
     * @param key 键名
     */
    remove: StoreManager.remove.bind(StoreManager),

    /**
     * 清空所有存储
     */
    clear: StoreManager.clear.bind(StoreManager),

    /**
     * 检查是否存在某个键
     * @param key 键名
     */
    has: StoreManager.has.bind(StoreManager),
};

export default store;

// 导出类型
export type StoreInstance = typeof store;
