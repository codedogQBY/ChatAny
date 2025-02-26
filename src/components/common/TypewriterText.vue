<template>
  <div class="typing-container">
    <span ref="textContainer" v-html="parsedContent"></span>
    <span class="cursor" :class="{ 'blink': !isTyping }">▌</span>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  isTyping: {
    type: Boolean,
    default: false
  }
});

const textContainer = ref(null);

// 将Markdown转换为HTML
const parsedContent = computed(() => {
  return marked.parse(props.content, { breaks: true });
});

// 在内容更新后滚动到底部
watchEffect(() => {
  if (textContainer.value) {
    const container = textContainer.value.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
});
</script>

<style scoped>
.typing-container {
  display: inline;
  white-space: pre-wrap;
}

.cursor {
  display: inline-block;
  vertical-align: middle;
  margin-left: 1px;
}

.blink {
  animation: blink-animation 0.8s steps(2) infinite;
}

@keyframes blink-animation {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style> 