// src/composables/useExport.js

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useTodoStore } from '@/composables/useTodoStore'
import { useProfileStore } from '@/composables/useProfileStore'
import {
    dateBelongsToEmployment,
    employmentForDate,
    normalizeEmployment
} from '@/composables/employments'

export const BACKUP_FORMAT = 'zeitwerk-backup'
export const CURRENT_BACKUP_VERSION = 3

class ImportValidationError extends Error {
    constructor(code) {
        super(code)
        this.name = 'ImportValidationError'
        this.code = code
    }
}

export function useExport() {

    function collectAll({ employmentId = '', from = '', to = '' } = {}) {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const todos = useTodoStore()
        const profile = useProfileStore()
        const scoped = Boolean(employmentId || from || to)

        function inExport(isoDate) {
            const date = String(isoDate ?? '').slice(0, 10)
            if (employmentId && !dateBelongsToEmployment(zeitwerk.employments, date, employmentId))
                return false

            if (from && date < from)
                return false

            if (to && date > to)
                return false

            return true
        }

        return {
            meta: {
                exportedAt: new Date().toISOString(),
                format: BACKUP_FORMAT,
                version: CURRENT_BACKUP_VERSION,
                ...(employmentId ? { employmentId } : {}),
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
            },
            zeitwerk: {
                entries: zeitwerk.entries.filter(entry => inExport(entry.date)),
                settings: zeitwerk.settings,
                employments: employmentId
                    ? zeitwerk.employments.filter(employment => employment.id === employmentId)
                    : zeitwerk.employments,
            },
            calendar: {
                events: scoped
                    ? calendar.events.filter(event => inExport(event.date))
                    : calendar.events,
            },
            todos: {
                todos: scoped
                    ? todos.todos.filter(todo => todo.dueDate && inExport(todo.dueDate))
                    : todos.todos,
            },
            profile: {
                ...profile.profile,
            },
        }
    }

    // JSON
    function exportJSON(options = {}) {
        const data = collectAll(options)
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: 'application/json' }
        )
        download(blob, options.filename || `zeitwerk-backup-${dateTimeStamp()}-${deviceLabel()}.json`)
    }

    // CSV (Zeiteinträge)
    function exportCSV(entries = null, { employmentId = '' } = {}) {
        const zeitwerk = useZeitwerkStore()
        const rows = (entries ?? zeitwerk.entries)
            .filter(entry => dateBelongsToEmployment(
                zeitwerk.employments,
                String(entry.date ?? '').slice(0, 10),
                employmentId,
            ))

        const header = ['date', 'employer', 'typ', 'plannedHours', 'actualHours', 'notes', 'remarks']
        const lines = [
            header.join(';'),
            ...rows.map(entry => [
                entry.date,
                employmentForDate(zeitwerk.employments, String(entry.date).slice(0, 10))?.name ?? '',
                entry.typ ?? 'on-site',
                entry.plannedHours ?? '',
                zeitwerk.effectiveActualHours(entry).toFixed(2),
                `"${(entry.notes ?? '').replace(/"/g, '""')}"`,
                `"${(entry.remarks ?? '').replace(/"/g, '""')}"`,
            ].join(';'))
        ]

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
        download(blob, `zeitwerk-entries-${dateStamp()}.csv`)
    }

    // Import
    function readImportFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result)
                    resolve(migrateImport(data))
                } catch (error) {
                    reject(error instanceof ImportValidationError
                        ? error
                        : new ImportValidationError('invalid_json'))
                }
            }

            reader.onerror = () => reject(new ImportValidationError('read_failed'))
            reader.readAsText(file)
        })
    }

    async function importJSON(file) {
        const data = await readImportFile(file)
        applyImport(data)
    }

    function applyImport(data) {
        const normalized = migrateImport(data)
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const todos = useTodoStore()
        const profile = useProfileStore()

        Object.assign(zeitwerk.settings, normalized.zeitwerk.settings)

        zeitwerk.employments = normalized.zeitwerk.employments.length
            ? normalized.zeitwerk.employments.map(employment =>
                normalizeEmployment(employment, normalized.zeitwerk.settings))
            : [normalizeEmployment({ id: 'emp_initial', name: '' }, {
                ...zeitwerk.settings,
                ...normalized.zeitwerk.settings,
            })]
        zeitwerk.entries = normalized.zeitwerk.entries
        zeitwerk.applyEmploymentCoverage()

        calendar.events = normalized.calendar.events

        todos.todos = normalized.todos.todos

        Object.assign(profile.profile, normalized.profile)
    }

    function migrateImport(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data))
            throw new ImportValidationError('invalid_format')

        const version = data.meta?.version
        if (version !== undefined && (!Number.isInteger(version) || version < 1))
            throw new ImportValidationError('invalid_version')

        if (version > CURRENT_BACKUP_VERSION)
            throw new ImportValidationError('unsupported_version')

        if (data.meta?.format && data.meta.format !== BACKUP_FORMAT)
            throw new ImportValidationError('unsupported_format')

        const zeitwerk = data.zeitwerk
        if (!zeitwerk || typeof zeitwerk !== 'object' || !Array.isArray(zeitwerk.entries))
            throw new ImportValidationError('missing_entries')

        if (zeitwerk.settings !== undefined
            && (!zeitwerk.settings || typeof zeitwerk.settings !== 'object' || Array.isArray(zeitwerk.settings)))
            throw new ImportValidationError('invalid_settings')

        if (data.calendar?.events !== undefined && !Array.isArray(data.calendar.events))
            throw new ImportValidationError('invalid_calendar')

        if (data.todos?.todos !== undefined && !Array.isArray(data.todos.todos))
            throw new ImportValidationError('invalid_todos')

        if (data.profile !== undefined
            && (!data.profile || typeof data.profile !== 'object' || Array.isArray(data.profile)))
            throw new ImportValidationError('invalid_profile')

        return {
            meta: {
                ...data.meta,
                format: BACKUP_FORMAT,
                version: CURRENT_BACKUP_VERSION,
                migratedFrom: version ?? 0,
            },
            zeitwerk: {
                entries: data.zeitwerk.entries,
                settings: data.zeitwerk.settings ?? {},
                employments: Array.isArray(data.zeitwerk.employments) ? data.zeitwerk.employments : [],
            },
            calendar: {
                events: data.calendar?.events ?? [],
            },
            todos: {
                todos: data.todos?.todos ?? [],
            },
            profile: data.profile ?? {},
        }
    }

    // Helpers
    function dateStamp() {
        return new Date().toISOString().slice(0, 10)
    }

    function dateTimeStamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19)
    }

    function deviceLabel() {
        const ua = navigator.userAgent
        if (/iPhone/i.test(ua)) return 'iphone'
        if (/iPad/i.test(ua)) return 'ipad'
        if (/Android/i.test(ua)) return 'android'
        if (/Macintosh|MacIntel/i.test(ua)) return 'mac'
        if (/Windows/i.test(ua)) return 'windows'
        if (/Linux/i.test(ua)) return 'linux'
        return 'device'
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
        readImportFile,
        applyImport,
        collectAll,
        migrateImport,
    }
}
