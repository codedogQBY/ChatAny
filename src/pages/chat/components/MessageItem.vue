<template>
  <div class="message-item relative" :class="{ 'typing-effect': isTyping }">
    <div v-if="message.status === 'loading'" class="message-content loading bg-secondary/20 hover:shadow-md transition-shadow duration-200">
      <div class="flex flex-col space-y-2">
        <div class="skeleton-line w-3/4"></div>
        <div class="skeleton-line w-1/2"></div>
        <div class="skeleton-line w-5/6"></div>
      </div>
    </div>
    <div 
      v-else-if="isTyping" 
      class="message-content typing hover:shadow-md transition-shadow duration-200 bg-secondary/30"
      :class="{ 'blinker': message.status === 'pending' }"
    >
      <span v-html="formattedContent || ''"></span>
    </div>
    <div 
      v-else-if="message.status === 'error'" 
      class="message-content error hover:shadow-md transition-shadow duration-200 bg-destructive/10"
    >
      <span v-html="formattedContent"></span>
    </div>
    <div 
      v-else 
      class="message-content hover:shadow-md transition-shadow duration-200 bg-secondary/30"
    >
      <span v-html="formattedContent"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, defineEmits } from 'vue';
import { marked } from 'marked';
import { useToast } from '@/components/ui/toast/use-toast';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['copy', 'quote']);
const { toast } = useToast();

// 计算属性来确定是否显示打字效果
const isTyping = computed(() => {
  return props.message.status === 'streaming' || props.message.status === 'pending';
});

// 格式化消息内容（支持Markdown）
const formattedContent = computed(() => {
  if (!props.message.content || props.message.content.trim() === '') {
    return '';  // 返回空字符串，模板中会处理为非换行空格
  }
  try {
    // 转换Markdown为HTML
    return marked(props.message.content, { breaks: true });
  } catch (e) {
    console.error('Markdown解析错误:', e);
    return props.message.content;
  }
});

// 复制消息内容
const copyContent = async () => {
  try {
    // 获取纯文本内容
    const plainText = props.message.content;
    await navigator.clipboard.writeText(plainText);
    toast({
      title: '已复制',
      description: '消息内容已复制到剪贴板',
      duration: 2000
    });
    emit('copy', plainText);
  } catch (error) {
    console.error('复制失败:', error);
    toast({
      title: '复制失败',
      description: '无法复制消息内容',
      variant: 'destructive',
      duration: 2000
    });
  }
};

// 引用消息
const quoteMessage = () => {
  emit('quote', props.message);
  toast({
    description: '已添加引用',
    duration: 2000
  });
};
</script>

<style scoped>
.message-item {
  font-size: 15px;
  line-height: 1.6;
}

.message-content {
  white-space: pre-wrap;
  position: relative;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-content.error {
  color: #e53935;
}

/* 光标效果 - 使用伪元素 */
.typing::after {
  content: '▌';
  display: inline-block;
  position: relative;
  color: currentColor;
  opacity: 0.8;
  font-weight: normal;
  vertical-align: baseline;
}

/* 闪烁动画 */
.blinker::after {
  animation: blinker 1s step-end infinite;
}

@keyframes blinker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.message-content.typing {
  min-height: 1.5em;
}

.message-content.loading {
  min-height: 80px;
  min-width: 250px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 添加markdown样式 */
:deep(p) {
  margin-bottom: 0.75em;
}

:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

:deep(h1) { font-size: 1.6em; }
:deep(h2) { font-size: 1.4em; }
:deep(h3) { font-size: 1.2em; }

:deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 0.75em;
  margin: 1em 0;
  overflow-x: auto;
}

:deep(code) {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-size: 0.9em;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(ul), :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(li) {
  margin-bottom: 0.25em;
}

:deep(blockquote) {
  border-left: 4px solid rgba(0, 0, 0, 0.1);
  padding-left: 1em;
  margin: 1em 0;
  color: rgba(0, 0, 0, 0.7);
}

:deep(a) {
  color: #0366d6;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

:deep(th), :deep(td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5em;
  text-align: left;
}

:deep(th) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style> 