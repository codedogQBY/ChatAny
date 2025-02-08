import { createMemoryHistory, createRouter, RouteRecordRaw } from "vue-router";
import { Chat, Bot } from "@/pages/index";
import { MessageCircleMore, BotIcon } from "lucide-vue-next";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/chat",
  },
  {
    path: "/chat",
    component: Chat,
    meta: {
      icon: MessageCircleMore,
      title: "聊天",
      isSidebar: true,
    },
  },
  {
    path: "/bot",
    component: Bot,
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
