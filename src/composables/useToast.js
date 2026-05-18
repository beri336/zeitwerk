// src/composables/useToast.js

import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
    function showToast(msg, type = 'ok') {
        const id = Date.now()
        toasts.value.push({ id, msg, type })

        setTimeout(() => {
            toasts.value = toasts.value.filter(toast => toast.id !== id)
        }, 2800)
    }
    return { toasts, showToast }
}
