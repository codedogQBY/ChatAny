import { ChatService, createChatService } from './chat';
import type { Chat, Supplier } from '@/types';

class ServiceManager {
  private services: Map<string, ChatService> = new Map();

  async getService(chat: Chat, supplier: Supplier): Promise<ChatService> {
    const serviceKey = `${supplier.name}-${chat.id}`;
    
    // 检查 API 密钥
    if (!supplier.apiKey || supplier.apiKey.trim() === '') {
      console.warn(`供应商 ${supplier.name} 的 API 密钥为空`);
    } else {
      console.log(`使用供应商 ${supplier.name} 的 API 密钥，长度: ${supplier.apiKey.length}`);
    }
    
    if (!this.services.has(serviceKey)) {
      // 创建新的服务实例
      const service = createChatService(
        chat,
        supplier.apiKey,
        supplier.apiUrl
      );
      this.services.set(serviceKey, service);
    }

    return this.services.get(serviceKey)!;
  }

  // 清理特定服务实例
  clearService(supplierId: string, chatId: string) {
    const serviceKey = `${supplierId}-${chatId}`;
    this.services.delete(serviceKey);
  }

  // 清理所有服务实例
  clearAll() {
    this.services.clear();
  }
}

// 导出单例
export const serviceManager = new ServiceManager(); 