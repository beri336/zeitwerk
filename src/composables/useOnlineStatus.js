// src/composables/useOnlineStatus.js

import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
let listenerCount = 0

function setOnline() {
    isOnline.value = true
}

function setOffline() {
    isOnline.value = false
}

export function useOnlineStatus() {
    onMounted(() => {
        if (listenerCount === 0) {
            window.addEventListener('online', setOnline)
            window.addEventListener('offline', setOffline)
        }
        listenerCount += 1
    })

    onUnmounted(() => {
        listenerCount -= 1
        if (listenerCount === 0) {
            window.removeEventListener('online', setOnline)
            window.removeEventListener('offline', setOffline)
        }
    })

    return { isOnline }
}
