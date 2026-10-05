import { ref } from 'vue'

const STORAGE_PREFIX = 'zeitwerk_overview_stats_'

function readPreference(key) {
    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
        return stored === null ? true : stored === 'true'
    } catch {
        return true
    }
}

export function useOverviewStatsPreference(key) {
    const statsOpen = ref(readPreference(key))

    function updateStatsOpen(event) {
        statsOpen.value = event.target.open
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(statsOpen.value))
    }

    return { statsOpen, updateStatsOpen }
}
