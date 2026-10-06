import { ref, watch } from 'vue'
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
        updating.value = true
        try {
            await updateServiceWorker?.(true)
        } finally {
            updating.value = false
        }
    }

    async function checkForUpdates() {
        if (!registration.value)
            return false

        await registration.value.update()
        return needRefresh.value
    }

    return { needRefresh, updating, update, checkForUpdates }
}
