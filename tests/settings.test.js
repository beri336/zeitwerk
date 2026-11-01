// tests/settings.test.js

import { describe, expect, it } from 'vitest'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { getDefaultWorkplace } from '@/composables/useEntryDefaults'

describe('automatic settings', () => {
    it('defaults recovery to enabled and weekly', () => {
        const store = useZeitwerkStore()

        expect(store.settings.recoveryEnabled).toBe(true)
        expect(store.settings.recoveryFrequency).toBe('weekly')
    })

    it('persists changed recovery settings', () => {
        const store = useZeitwerkStore()
        store.saveSettings({ recoveryEnabled: false, recoveryFrequency: 'monthly' })

        const saved = JSON.parse(localStorage.getItem('zeitwerk_data'))
        expect(saved.settings.recoveryEnabled).toBe(false)
        expect(saved.settings.recoveryFrequency).toBe('monthly')
    })

    it('uses the configured workplace for new entries and falls back safely', () => {
        expect(getDefaultWorkplace({ defaultWorkplace: 'homeoffice' })).toBe('homeoffice')
        expect(getDefaultWorkplace({ defaultWorkplace: 'on-site' })).toBe('on-site')
        expect(getDefaultWorkplace({ defaultWorkplace: 'invalid' })).toBe('on-site')
    })
})
