// src/composables/useRecovery.js

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useTodoStore } from '@/composables/useTodoStore'
import { useProfileStore } from '@/composables/useProfileStore'
import { useExport } from '@/composables/useExport'

const STORAGE_KEY = 'zeitwerk_recovery'
const MAX_SNAPSHOTS = 3

function readSnapshots() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeSnapshots(snapshots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.slice(0, MAX_SNAPSHOTS)))
}

function hasData(data) {
    return data.zeitwerk.entries.length > 0
        || data.calendar.events.length > 0
        || data.todos.todos.length > 0
        || Object.values(data.profile).some(Boolean)
}

function isDue(lastCreatedAt, frequency) {
    if (!lastCreatedAt)
        return true

    const last = new Date(lastCreatedAt)
    const now = new Date()
    const elapsedDays = (now.getTime() - last.getTime()) / 86400000

    if (frequency === 'daily')
        return elapsedDays >= 1
    if (frequency === 'biweekly')
        return elapsedDays >= 14
    if (frequency === 'monthly')
        return now.getFullYear() !== last.getFullYear()
            || now.getMonth() !== last.getMonth()

    return elapsedDays >= 7
}

export function useRecovery() {
    const zeitwerk = useZeitwerkStore()
    const calendar = useCalendarStore()
    const todos = useTodoStore()
    const profile = useProfileStore()
    const { collectAll, applyImport } = useExport()
    const snapshots = ref(readSnapshots())

    function createSnapshot({ force = false } = {}) {
        const data = collectAll()
        if (!hasData(data))
            return false

        const stored = readSnapshots()
        const last = stored[0]
        if (!force && !zeitwerk.settings.recoveryEnabled)
            return false
        if (!force && !isDue(last?.createdAt, zeitwerk.settings.recoveryFrequency))
            return false

        stored.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            data,
        })
        writeSnapshots(stored)
        snapshots.value = stored.slice(0, MAX_SNAPSHOTS)
        return true
    }

    function restoreSnapshot(snapshot) {
        createSnapshot({ force: true })
        applyImport(snapshot.data)
    }

    function deleteSnapshot(snapshotId) {
        const remaining = readSnapshots().filter(snapshot => snapshot.id !== snapshotId)
        writeSnapshots(remaining)
        snapshots.value = remaining.slice(0, MAX_SNAPSHOTS)
    }

    return {
        snapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
    }
}

export function useAutoRecovery() {
    const zeitwerk = useZeitwerkStore()
    const calendar = useCalendarStore()
    const todos = useTodoStore()
    const profile = useProfileStore()
    const { createSnapshot } = useRecovery()

    function check() {
        createSnapshot()
    }

    check()
    watch(
        [zeitwerk.entries, zeitwerk.settings, calendar.events, todos.todos, profile.profile],
        check,
        { deep: true },
    )

    let intervalId
    onMounted(() => {
        intervalId = window.setInterval(check, 60000)
    })
    onUnmounted(() => window.clearInterval(intervalId))

    return {
        zeitwerk,
        calendar,
        todos,
        profile,
        check,
    }
}
