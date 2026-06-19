// src/composables/useExport.js

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useHabitStore } from '@/composables/useHabitStore'
import { useTodoStore } from '@/composables/useTodoStore'
import { useProfileStore } from '@/composables/useProfileStore'

export function useExport() {

    function collectAll() {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const habits = useHabitStore()
        const todos = useTodoStore()
        const profile = useProfileStore()

        return {
            meta: {
                exportedAt: new Date().toISOString(),
                version: 1,
            },
            zeitwerk: {
                entries: zeitwerk.entries,
                settings: zeitwerk.settings,
            },
            calendar: {
                events: calendar.events,
            },
            habits: {
                habits: habits.habits,
                completions: Object.fromEntries(
                    Object.entries(habits.completions).map(([k, v]) => [k, [...v]])
                ),
            },
            todos: {
                todos: todos.todos,
            },
            profile: {
                ...profile.profile,
            },
        }
    }

    // JSON
    function exportJSON() {
        const data = collectAll()
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: 'application/json' }
        )
        download(blob, `zeitwerk-backup-${dateStamp()}.json`)
    }

    // CSV (Zeiteinträge)
    function exportCSV(entries = null) {
        const zeitwerk = useZeitwerkStore()
        const rows = entries ?? zeitwerk.entries

        const header = ['date', 'typ', 'plannedHours', 'actualHours', 'notes', 'remarks']
        const lines = [
            header.join(';'),
            ...rows.map(e => [
                e.date,
                e.typ ?? 'on-site',
                e.plannedHours ?? '',
                zeitwerk.effectiveActualHours(e).toFixed(2),
                `"${(e.notes ?? '').replace(/"/g, '""')}"`,
                `"${(e.remarks ?? '').replace(/"/g, '""')}"`,
            ].join(';'))
        ]

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
        download(blob, `zeitwerk-entries-${dateStamp()}.csv`)
    }

    // Import
    function importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result)
                    applyImport(data)
                    resolve()
                } catch {
                    reject(new Error('Invalid JSON file'))
                }
            }
            reader.readAsText(file)
        })
    }

    function applyImport(data) {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const habits = useHabitStore()
        const todos = useTodoStore()
        const profile = useProfileStore()

        if (data.zeitwerk?.entries)
            zeitwerk.entries = data.zeitwerk.entries

        if (data.zeitwerk?.settings)
            Object.assign(zeitwerk.settings, data.zeitwerk.settings)

        if (data.calendar?.events) calendar.events = data.calendar.events

        if (data.habits?.habits)
            habits.habits = data.habits.habits

        if (data.habits?.completions) {
            habits.completions = Object.fromEntries(
                Object.entries(data.habits.completions).map(([k, v]) => [k, new Set(v)])
            )
            habits.persistCompletions()
        }

        if (data.todos?.todos)
            todos.todos = data.todos.todos

        if (data.profile)
            Object.assign(profile.profile, data.profile)
    }

    // Helpers
    function dateStamp() {
        return new Date().toISOString().slice(0, 10)
    }

    function download(blob, filename) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }

    return {
        exportJSON,
        exportCSV,
        importJSON,
        collectAll
    }
}
