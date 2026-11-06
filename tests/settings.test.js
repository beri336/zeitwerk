// tests/settings.test.js

import { describe, expect, it } from 'vitest'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { getDefaultWorkplace } from '@/composables/useEntryDefaults'
import { getExtraVacationNotice } from '@/composables/extraVacationNotice'

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

    it('defaults extra vacation days to zero', () => {
        const store = useZeitwerkStore()

        expect(store.settings.extraVacationDays).toBe(0)
        expect(store.settings.extraVacationDeadline).toBe('')
        expect(store.settings.extraVacationNoticeDays).toBe(30)
        expect(store.remainingExtraVacationDays).toBe(0)
    })

    it('spends extra vacation days before the yearly allowance', () => {
        const store = useZeitwerkStore()
        const year = new Date().getFullYear()

        store.saveSettings({ vacationDaysPerYear: 30, extraVacationDays: 4 })
        store.currYear = year
        store.addEntry({ date: `${year}-03-02`, typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: `${year}-03-03`, typ: 'vacation', timeEntries: [] })

        expect(store.remainingExtraVacationDays).toBe(2)
        expect(store.remainingRegularVacationDays).toBe(30)
        expect(store.remainingVacationDays).toBe(32)

        store.addEntry({ date: `${year}-03-04`, typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: `${year}-03-05`, typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: `${year}-03-06`, typ: 'vacation', timeEntries: [] })

        expect(store.remainingExtraVacationDays).toBe(0)
        expect(store.remainingRegularVacationDays).toBe(29)
        expect(store.remainingVacationDays).toBe(29)
    })

    it('notifies inside the lead time and after a missed extra-vacation deadline', () => {
        const deadline = '2026-03-31'

        expect(getExtraVacationNotice({
            extraDays: 4,
            usedDays: 1,
            deadline,
            noticeDays: 30,
            today: new Date(2026, 1, 1),
        })).toBeNull()

        expect(getExtraVacationNotice({
            extraDays: 4,
            usedDays: 1,
            deadline,
            noticeDays: 30,
            today: new Date(2026, 2, 1),
        })).toMatchObject({ remaining: 3, daysUntil: 30, overdue: false })

        expect(getExtraVacationNotice({
            extraDays: 4,
            usedDays: 4,
            deadline,
            noticeDays: 30,
            today: new Date(2026, 2, 1),
        })).toBeNull()

        expect(getExtraVacationNotice({
            extraDays: 4,
            usedDays: 0,
            deadline,
            noticeDays: 30,
            today: new Date(2026, 3, 2),
        })).toMatchObject({ remaining: 4, overdue: true })
    })

    it('uses the configured workplace for new entries and falls back safely', () => {
        expect(getDefaultWorkplace({ defaultWorkplace: 'homeoffice' })).toBe('homeoffice')
        expect(getDefaultWorkplace({ defaultWorkplace: 'on-site' })).toBe('on-site')
        expect(getDefaultWorkplace({ defaultWorkplace: 'invalid' })).toBe('on-site')
    })
})
