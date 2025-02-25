/**
 * 格式化消息时间，根据距离现在的时间显示不同格式
 * @param timestamp 时间戳（毫秒）
 * @param format 格式化选项
 * @returns 格式化后的时间字符串
 */
export function formatMessageTime(timestamp: number, format: 'default' | 'compact' = 'default') {
    const messageDate = new Date(timestamp);
    const now = new Date();
    
    // 今天的起始时间
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // 昨天的起始时间
    const yesterday = today - 86400000; // 24小时的毫秒数
    
    // 本周的起始时间（以周日为一周的开始）
    const dayOfWeek = now.getDay(); // 0是周日，6是周六
    const startOfWeek = today - dayOfWeek * 86400000;
    
    const timeStr = messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (timestamp >= today) {
        // 今天的消息只显示时间
        return timeStr;
    } else if (timestamp >= yesterday) {
        // 昨天的消息
        return format === 'compact' ? `昨天·${timeStr}` : `昨天 ${timeStr}`;
    } else if (timestamp >= startOfWeek) {
        // 本周的消息显示周几
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return format === 'compact' ? `${weekdays[messageDate.getDay()]}·${timeStr}` : `${weekdays[messageDate.getDay()]} ${timeStr}`;
    } else {
        // 更早的消息显示完整日期
        const dateStr = `${messageDate.getFullYear()}/${messageDate.getMonth() + 1}/${messageDate.getDate()}`;
        return format === 'compact' ? `${dateStr}·${timeStr}` : `${dateStr} ${timeStr}`;
    }
}

/**
 * 格式化日期，显示完整的年月日
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp?: number) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
} 