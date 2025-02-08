<script setup lang="ts">
import Sidebar from "@/components/sidebar/index.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40">
    <div>
      <Sidebar />
    </div>
    <div class="flex flex-col pl-16">
      <KeepAlive>
        <RouterView />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}
</style>
