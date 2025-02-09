<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import sidebar from './components/sidebar.vue';
</script>

<template>
    <Dialog>
        <DialogTrigger as-child>
            <slot />
        </DialogTrigger>
        <DialogContent class="h-3/4 max-h-3/4 p-2">
            <DialogHeader>
                <DialogTitle>设置</DialogTitle>
            </DialogHeader>
            <sidebar />
        </DialogContent>
    </Dialog>
</template>
