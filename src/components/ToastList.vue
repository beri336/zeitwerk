<!-- src/components/ToastList.vue -->

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<template>
    <div class="toast-wrap">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type === 'ok' ? 'toast-ok' : 'toast-err'">
            {{ t.msg }}
        </div>
    </div>
</template>
