// src/composables/usePwaUpdate.js

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const needRefresh = ref(false)
const updating = ref(false)
const registration = ref(null)
let initialized = false
let updateServiceWorker = null

export function usePwaUpdate() {
    if (!initialized) {
        const sw = useRegisterSW({
            onRegistered(reg) {
                registration.value = reg
                console.log('[Zeitwerk] SW registered:', reg)
            },
            onRegisterError(error) {
                console.error('[Zeitwerk] SW error:', error)
            }
        })

        watch(sw.needRefresh, value => {
            needRefresh.value = value
        })
        updateServiceWorker = sw.updateServiceWorker
        initialized = true
    }

    async function update() {
        if (!navigator.onLine)
            return false

        updating.value = true
        try {
            await updateServiceWorker?.(true)
            return true
        } finally {
            updating.value = false
        }
    }

    async function checkForUpdates() {
        if (!registration.value || !navigator.onLine)
            return false

        try {
            await registration.value.update()
            return needRefresh.value
        } catch (error) {
            console.error('[Zeitwerk] Update check failed:', error)
            return false
        }
    }

    function dismissUpdate() {
        needRefresh.value = false
    }

    let intervalId
    const handleOnline = () => checkForUpdates()
    onMounted(() => {
        window.addEventListener('online', handleOnline)
        intervalId = window.setInterval(checkForUpdates, 15 * 60 * 1000)
    })
    onUnmounted(() => {
        window.removeEventListener('online', handleOnline)
        window.clearInterval(intervalId)
    })

    return { needRefresh, updating, update, checkForUpdates, dismissUpdate }
}
