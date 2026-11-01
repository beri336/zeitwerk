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

        const invalid = new File(['{}'], 'invalid.json', { type: 'application/json' })

        await expect(readImportFile(valid)).resolves.toEqual({
            zeitwerk: { entries: [{ id: 1 }] },
        })
        await expect(readImportFile(invalid)).rejects.toThrow('Invalid JSON file')
    })

    it('collects and applies all local data stores', () => {
        const zeitwerk = useZeitwerkStore()
        const calendar = useCalendarStore()
        const todos = useTodoStore()
        const profile = useProfileStore()
        const { collectAll, applyImport } = useExport()

        zeitwerk.entries = []
        zeitwerk.addEntry(
            { id: 1,
              date: '2026-10-30',
              typ: 'homeoffice' }
        )
        calendar.events.push(
            { id: 1,
              title: 'Meeting' }
        )

        todos.todos.push({ id: 1, title: 'Task' })
        profile.profile.displayName = 'name'

        const backup = collectAll()
        zeitwerk.entries = []
        calendar.events = []
        todos.todos = []
        profile.profile.displayName = ''

        applyImport(backup)

        expect(zeitwerk.entries).toHaveLength(1)
        expect(zeitwerk.entries[0].typ).toBe('homeoffice')
        expect(calendar.events).toEqual( [{ id: 1, title: 'Meeting' }] )
        expect(todos.todos).toEqual( [{ id: 1, title: 'Task' }] )
        expect(profile.profile.displayName).toBe('name')
    })
})
