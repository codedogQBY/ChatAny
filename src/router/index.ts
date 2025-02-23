import { createMemoryHistory, createRouter, RouteRecordRaw } from "vue-router";
import { MessageCircleMore, BotIcon } from "lucide-vue-next";

// 使用动态导入替代直接导入
const Chat = () => import("@/pages/chat/index.vue");
const Bot = () => import("@/pages/bot/index.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/chat",
  },
  {
    path: "/chat",
    component: Chat,  // 懒加载组件
    meta: {
      icon: MessageCircleMore,
      title: "聊天",
      isSidebar: true,
    },
  },
  {
    path: "/bot",
    component: Bot,  // 懒加载组件
    meta: {
      icon: BotIcon,
      title: "助手",
      isSidebar: true,
    },
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export { routes };
export default router;
