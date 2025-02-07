<script setup lang="ts">
import Greet from "./components/Greet.vue";
import { Button } from "@/components/ui/button";
</script>

<template>
  <div>
    <Button>Click me</Button>
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
