// tests/recovery.test.js

import { describe, expect, it } from 'vitest'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useRecovery } from '@/composables/useRecovery'

describe('recovery backups', () => {

    it('keeps only the latest three backups', () => {
        const store = useZeitwerkStore()
        const recovery = useRecovery()
        store.entries = []
        store.addEntry({ id: 1, date: '2026-10-30' })

        for (let index = 0; index < 4; index += 1)
            recovery.createSnapshot({ force: true })

        expect(recovery.snapshots.value).toHaveLength(3)
        expect(JSON.parse(localStorage.getItem('zeitwerk_recovery'))).toHaveLength(3)
    })

    it('creates a safety backup before restoring an older snapshot', () => {
        const store = useZeitwerkStore()
        const recovery = useRecovery()
        store.entries = []
        store.addEntry({ id: 1, date: '2026-10-30' })
        recovery.createSnapshot({ force: true })
        const snapshot = recovery.snapshots.value[0]

        store.entries = [{ id: 2, date: '2026-10-31' }]
        recovery.restoreSnapshot(snapshot)

        expect(store.entries[0].id).toBe(1)
        expect(recovery.snapshots.value).toHaveLength(2)
    })
})
