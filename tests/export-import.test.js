// tests/export-import.test.js

import { describe, expect, it } from 'vitest'
import { useExport } from '@/composables/useExport'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useTodoStore } from '@/composables/useTodoStore'
import { useProfileStore } from '@/composables/useProfileStore'

describe('export and import', () => {

    it('parses valid JSON files and rejects invalid import data', async () => {
        const { readImportFile } = useExport()

        const valid = new File([
            JSON.stringify({ zeitwerk: { entries: [{ id: 1 }] } }),
        ], 'backup.json', { type: 'application/json' })

        const invalid = new File(['{'],
            'invalid.json',
            { type: 'application/json' })

        await expect(readImportFile(valid)).resolves.toMatchObject({
            meta: { format: 'zeitwerk-backup', version: 3 },
            zeitwerk: { entries: [{ id: 1 }], settings: {} },
        })
        await expect(readImportFile(invalid)).rejects.toThrow('invalid_json')
    })

    it('migrates legacy and version 1 backups', () => {
        const { migrateImport } = useExport()

        expect(migrateImport({
            zeitwerk: { entries: [{ id: 1 }] },
        })).toMatchObject({
            meta: { version: 3, migratedFrom: 0 },
            calendar: { events: [] },
            todos: { todos: [] },
            profile: {},
        })

        expect(migrateImport({
            meta: { format: 'zeitwerk-backup', version: 1 },
            zeitwerk: { entries: [] },
        }).meta.migratedFrom).toBe(1)
    })

    it('rejects unsupported versions and malformed backup sections', () => {
        const { migrateImport } = useExport()

        expect(() => migrateImport({
            meta: { format: 'zeitwerk-backup', version: 99 },
            zeitwerk: { entries: [] },
        })).toThrow('unsupported_version')
        expect(() => migrateImport({
            meta: { format: 'zeitwerk-backup', version: 2 },
            zeitwerk: { entries: [] },
            calendar: { events: 'invalid' },
        })).toThrow('invalid_calendar')
    })

    it('collects and applies all local data stores', () => {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const todos = useTodoStore()
        const profile = useProfileStore()
        const { collectAll, applyImport } = useExport()

        zeitwerk.entries = []
        zeitwerk.addEntry({ id: 1, date: '2026-10-30', typ: 'homeoffice' })
        calendar.events.push({ id: 1, title: 'Meeting' })
        todos.todos.push({ id: 1, title: 'Task' })
        profile.profile.displayName = 'Beri'

        const backup = collectAll()
        zeitwerk.entries = []
        calendar.events = []
        todos.todos = []
        profile.profile.displayName = ''

        applyImport(backup)

        expect(zeitwerk.entries).toHaveLength(1)
        expect(zeitwerk.entries[0].typ).toBe('homeoffice')
        expect(calendar.events).toEqual([{ id: 1, title: 'Meeting' }])
        expect(todos.todos).toEqual([{ id: 1, title: 'Task' }])
        expect(profile.profile.displayName).toBe('Beri')
    })

    it('exports one employment period with the employer on every CSV row', () => {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const todos = useTodoStore()
        const { collectAll } = useExport()
        const first = zeitwerk.employments[0]

        zeitwerk.updateEmployment(first.id, {
            name: 'Erste',
            start: '2020-01-01',
            end: '2021-01-01',
        })
        zeitwerk.addEntry({ date: '2019-12-20', typ: 'on-site', timeEntries: [] })
        zeitwerk.addEntry({ date: '2020-03-02', typ: 'vacation', timeEntries: [] })

        const second = zeitwerk.addEmployment()
        zeitwerk.updateEmployment(second.id, {
            name: 'Zweite',
            start: '2021-01-01',
            end: '',
        })
        zeitwerk.addEntry({ date: '2021-06-01', typ: 'on-site', timeEntries: [] })
        zeitwerk.entries.push({ id: 99, date: '2019-12-20', typ: 'on-site' })

        calendar.events.push(
            { id: 1, title: 'Im Job', date: '2020-05-01' },
            { id: 2, title: 'Danach', date: '2021-02-01' },
        )
        todos.todos.push(
            { id: 1, title: 'Im Job', dueDate: '2020-05-02' },
            { id: 2, title: 'Ohne Datum' },
            { id: 3, title: 'Danach', dueDate: '2021-03-01' },
        )

        const csv = zeitwerk.exportCSV({
            fromYear: 2019,
            fromMonth: 11,
            toYear: 2021,
            toMonth: 0,
            employmentId: first.id,
            download: false,
        })

        expect(csv.split('\n')[0]).toContain('"Employer"')
        expect(csv).toContain('"31.12.2020";"Erste"')
        expect(csv).not.toContain('01.12.2019')
        expect(csv).not.toContain('01.01.2021')
        expect(csv).not.toContain('Zweite')

        const backup = collectAll({ employmentId: first.id })
        expect(backup.zeitwerk.employments.map(job => job.name)).toEqual(['Erste'])
        expect(backup.meta.employmentId).toBe(first.id)
        expect(backup.zeitwerk.entries.some(entry => entry.date === '2020-03-02')).toBe(true)
        expect(backup.zeitwerk.entries.every(entry => entry.date >= '2020-01-01' && entry.date < '2021-01-01')).toBe(true)
        expect(backup.calendar.events).toEqual([{ id: 1, title: 'Im Job', date: '2020-05-01' }])
        expect(backup.todos.todos).toEqual([{ id: 1, title: 'Im Job', dueDate: '2020-05-02' }])

        const march = collectAll({ employmentId: first.id, from: '2020-03-01', to: '2020-03-31' })
        expect(march.zeitwerk.entries.every(entry => entry.date.startsWith('2020-03'))).toBe(true)
        expect(march.calendar.events).toEqual([])

        const full = collectAll()
        expect(full.zeitwerk.employments).toHaveLength(2)
        expect(full.calendar.events).toHaveLength(2)
        expect(full.todos.todos).toHaveLength(3)
        expect(full.zeitwerk.entries.some(entry => entry.date < '2020-01-01')).toBe(false)
    })
})
