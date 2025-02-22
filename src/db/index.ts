// src/lib/db.ts
import Database from '@tauri-apps/plugin-sql';

// 初始化数据库实例
let dbInstance: Database | null = null;

export async function initializeDatabase() {
    if (!dbInstance) {
        dbInstance = await Database.load('sqlite:chat.db');

        // 执行建表语句
        await dbInstance.execute(`
          CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            logo TEXT NOT NULL,
            api_key TEXT NOT NULL,
            api_base_url TEXT NOT NULL,
            api_doc_url TEXT NOT NULL,
            website_url TEXT NOT NULL,
            api_key_url TEXT,
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
          );

          CREATE TABLE model_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            supplier_id INTEGER NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
          );

          CREATE TABLE models (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              supplier_id INTEGER NOT NULL,
              group_id INTEGER NOT NULL,
              skills TEXT NOT NULL,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
              updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
              FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
              FOREIGN KEY (group_id) REFERENCES model_groups(id) ON DELETE CASCADE
          );

          CREATE TABLE bots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                prompt TEXT,
                description TEXT NOT NULL,
                prologue TEXT NOT NULL,
                avatar TEXT NOT NULL,
                model_id INTEGER,
                is_default BOOLEAN NOT NULL DEFAULT FALSE,
                created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL
          );

          CREATE TABLE chats (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 bot_id INTEGER NOT NULL,
                 config TEXT,
                 created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                 updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                 FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
          );

          CREATE TABLE sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
          );

          CREATE TABLE messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                chat_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                sender TEXT NOT NULL,
                status TEXT,
                metadata TEXT,
                created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
          );
        `);
    }
    return dbInstance;
}

// 字段名转换工具
const camelToSnake = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const snakeToCamel = (str: string) => str.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());

export abstract class BaseRepository<T extends Entity> {
    protected abstract tableName: string;

    // 转换数据库字段到对象属性
    protected fromDB(row: any): T {
        const transformed = this.transformKeys(row, snakeToCamel);
        return {
            ...transformed,
            id: parseInt(transformed.id),
            createdAt: parseInt(transformed.createdAt),
            updatedAt: parseInt(transformed.updatedAt),
        } as T;
    }

    // 转换对象属性到数据库字段
    protected toDB(entity: Partial<T>): Record<string, any> {
        const { id, createdAt, updatedAt, ...rest } = entity;
        return this.transformKeys(rest, camelToSnake);
    }

    private transformKeys(obj: Record<string, any>, transformFn: (key: string) => string) {
        return Object.keys(obj).reduce(
            (acc, key) => {
                acc[transformFn(key)] = obj[key];
                return acc;
            },
            {} as Record<string, any>
        );
    }

    // 通用查询方法
    protected async query(sql: string, bindValues?: any[]) {
        const db = await initializeDatabase();
        return await db.select<T[]>(sql, bindValues);
    }

    // 通用执行方法
    protected async execute(sql: string, bindValues?: any[]) {
        const db = await initializeDatabase();
        return await db.execute(sql, bindValues);
    }

    // 创建记录
    async create(entity: Omit<T, keyof Entity>): Promise<T> {
        const fields = this.toDB(entity);
        const columns = Object.keys(fields).join(', ');
        const placeholders = Object.keys(fields)
            .map(() => '?')
            .join(', ');
        const values = Object.values(fields);

        const sql = `
      INSERT INTO ${this.tableName} (${columns}, created_at, updated_at)
      VALUES (${placeholders}, strftime('%s','now'), strftime('%s','now'))
      RETURNING *;
    `;

        const result = await this.query(sql, values);
        return this.fromDB(result[0]);
    }

    // 更新记录
    async update(id: number, entity: Partial<Omit<T, keyof Entity>>): Promise<T> {
        const fields = this.toDB(entity);
        const setClause = Object.keys(fields)
            .map((key) => `${key} = ?`)
            .join(', ');
        const values = Object.values(fields);

        const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = strftime('%s','now')
      WHERE id = ?
      RETURNING *;
    `;

        const result = await this.query(sql, [...values, id]);
        return this.fromDB(result[0]);
    }

    // 删除记录
    async delete(id: number): Promise<boolean> {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.rowsAffected > 0;
    }

    // 查询全部
    async findAll(): Promise<T[]> {
        const sql = `SELECT * FROM ${this.tableName}`;
        const result = await this.query(sql);
        return result.map(this.fromDB);
    }

    // 按ID查询
    async findById(id: number): Promise<T | null> {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await this.query(sql, [id]);
        return result.length > 0 ? this.fromDB(result[0]) : null;
    }
}

// 基础实体类型
export type Entity = {
    id: number;
    createdAt: number;
    updatedAt: number;
};
