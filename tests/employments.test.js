// tests/employments.test.js

import { describe, expect, it } from 'vitest'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { employmentForDate, vacationBalance } from '@/composables/employments'

describe('employments', () => {
    it('keeps one open employment until a start date is set', () => {
        const store = useZeitwerkStore()

        expect(store.employments).toHaveLength(1)
        expect(store.employments[0].start).toBe('')
        expect(store.employmentForDate('2020-06-01')?.id).toBe(store.employments[0].id)
    })

    it('counts vacation inside each employment and keeps historical entries', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]

        store.addEntry({ date: '2019-12-20', typ: 'vacation', timeEntries: [] })
        store.updateEmployment(first.id, {
            name: 'Erste',
            start: '2020-01-01',
            end: '2021-01-01',
            vacationDaysPerYear: 30,
            extraVacationDays: 4,
            grossMonthlySalary: 3000,
            hoursPerWeek: 40,
        })
        store.addEntry({ date: '2020-03-02', typ: 'vacation', timeEntries: [] })

        const second = store.addEmployment()
        store.updateEmployment(second.id, {
            name: 'Zweite',
            start: '2021-01-01',
            end: '',
            vacationDaysPerYear: 20,
            extraVacationDays: 0,
            grossMonthlySalary: 4000,
            hoursPerWeek: 40,
        })
        store.addEntry({ date: '2021-06-01', typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: '2021-06-02', typ: 'on-site', timeEntries: [{ start: '08:00', end: '16:00', pause: 0 }] })

        expect(store.entries.some(entry => entry.date === '2019-12-20')).toBe(true)
        expect(employmentForDate(store.employments, '2020-12-31')?.name).toBe('Erste')
        expect(employmentForDate(store.employments, '2021-01-01')?.name).toBe('Zweite')

        store.currYear = 2020
        expect(store.viewedEmployment.name).toBe('Erste')
        expect(vacationBalance(store.viewedEmployment, store.usedVacationDays)).toMatchObject({
            remainingExtra: 3,
            remainingRegular: 30,
            remaining: 33,
        })

        store.currYear = 2021
        expect(store.viewedEmployment.name).toBe('Zweite')
        expect(store.remainingVacationDays).toBe(19)

        const workday = store.entries.find(entry => entry.date === '2021-06-02')
        const earned = store.grossEarnedForEntry(workday)
        const expected = ((4000 * 12) / (40 * 52)) * 8
        expect(earned).toBeCloseTo(expected)
    })

    it('lists vacation for every employment in the same year', () => {
        const store = useZeitwerkStore()
        store.currYear = 2026
        store.updateEmployment(store.employments[0].id, {
            name: 'Erste',
            start: '2026-01-01',
            end: '2026-07-01',
            vacationDaysPerYear: 30,
            extraVacationDays: 4,
        })

        const second = store.addEmployment()
        store.updateEmployment(second.id, {
            name: 'Zweite',
            start: '2026-07-01',
            end: '',
            vacationDaysPerYear: 20,
            extraVacationDays: 2,
        })
        store.addEntry({ date: '2026-03-02', typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: '2026-08-03', typ: 'vacation', timeEntries: [] })
        store.addEntry({ date: '2026-08-04', typ: 'vacation', timeEntries: [] })

        expect(store.yearVacationBalances).toMatchObject([
            { name: 'Erste', used: 1, remainingExtra: 3, remaining: 33 },
            { name: 'Zweite', used: 2, remainingExtra: 0, remaining: 20 },
        ])
    })

    it('suggests leftover vacation for the same employment and applies it only after a click', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]

        store.updateEmployment(first.id, {
            name: 'Erste',
            start: '2025-01-01',
            end: '',
            vacationDaysPerYear: 30,
            extraVacationDays: 4,
        })
        store.addEntry({ date: '2026-03-02', typ: 'vacation', timeEntries: [] })

        store.currYear = 2026
        const before = store.remainingVacationDays
        expect(store.vacationCarryoverOffers).toMatchObject([
            { employmentId: first.id, fromYear: 2025, year: 2026, days: 34 },
        ])

        store.dismissVacationCarryover(first.id, 2026)
        expect(store.vacationCarryoverOffers).toEqual([])
        expect(store.remainingVacationDays).toBe(before)

        store.updateEmployment(first.id, { dismissedVacationCarryover: {} })
        const accepted = store.acceptVacationCarryover(first.id, 2026)
        expect(accepted.days).toBe(34)
        expect(store.extraVacationAllowance).toBe(34)
        expect(store.remainingExtraVacationDays).toBe(33)
        expect(store.employments[0].extraVacationByYear['2025']).toBe(4)

        store.currYear = 2025
        expect(store.extraVacationAllowance).toBe(4)
        expect(store.remainingVacationDays).toBe(34)
        expect(store.vacationCarryoverOffers).toEqual([])
    })

    it('does not offer leftover vacation to a different employment', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]

        store.updateEmployment(first.id, {
            name: 'Erste',
            start: '2026-01-01',
            end: '2027-01-01',
            vacationDaysPerYear: 30,
            extraVacationDays: 0,
        })
        const second = store.addEmployment()
        store.updateEmployment(second.id, {
            name: 'Zweite',
            start: '2027-01-01',
            end: '',
            vacationDaysPerYear: 20,
        })

        store.currYear = 2027
        expect(store.vacationCarryoverOffers).toEqual([])
    })

    it('rejects overlapping employments', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]
        store.updateEmployment(first.id, { name: 'Erste', start: '2020-01-01', end: '' })

        const second = store.addEmployment()
        const result = store.updateEmployment(second.id, { start: '2020-06-01', end: '' })

        expect(result.ok).toBe(false)
        expect(result.reason).toBe('overlap')
    })

    it('uses the employment hours of that day when planned hours are missing', () => {
        const store = useZeitwerkStore()
        store.updateEmployment(store.employments[0].id, {
            name: 'Früher',
            start: '2020-01-01',
            end: '2024-01-01',
            hoursPerDay: 6,
        })
        const second = store.addEmployment()
        store.updateEmployment(second.id, {
            name: 'Heute',
            start: '2024-01-01',
            end: '',
            hoursPerDay: 8,
        })

        store.entries.push({
            id: 'old-work',
            date: '2020-03-02',
            typ: 'on-site',
            timeEntries: [{ start: '08:00', end: '14:00', pause: 0 }],
        })
        store.entries.push({
            id: 'old-vacation',
            date: '2020-03-03',
            typ: 'vacation',
            timeEntries: [],
        })
        store.entries.push({
            id: 'old-explicit',
            date: '2020-03-04',
            typ: 'on-site',
            timeEntries: [],
            plannedHours: 7.5,
        })

        store.currYear = 2020
        store.currMonth = 2

        const work = store.entries.find(entry => entry.id === 'old-work')
        const vacation = store.entries.find(entry => entry.id === 'old-vacation')
        expect(store.settings.hoursPerDay).toBe(8)
        expect(store.plannedHoursFor(work)).toBe(6)
        expect(store.effectiveActualHours(vacation)).toBe(6)
        expect(store.plannedHoursFor(store.entries.find(entry => entry.id === 'old-explicit'))).toBe(7.5)
        expect(store.monthPlanned).toBe(19.5)
    })
})
