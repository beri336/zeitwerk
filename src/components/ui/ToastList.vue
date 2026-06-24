<!-- src/components/ui/ToastList.vue -->

<template>

  <div class="toast-wrap">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type === 'ok' ? 'toast-ok' : 'toast-err'"
    >
      {{ toast.msg }}
    </div>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

const { toasts } = useToast();
</script>
