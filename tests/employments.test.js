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

    it('counts vacation inside each employment and drops days before the first start', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]

        store.updateEmployment(first.id, {
            name: 'Erste',
            start: '2020-01-01',
            end: '2021-01-01',
            vacationDaysPerYear: 30,
            extraVacationDays: 4,
            grossMonthlySalary: 3000,
            hoursPerWeek: 40,
        })
        store.addEntry({ date: '2019-12-20', typ: 'vacation', timeEntries: [] })
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

        expect(store.entries.some(entry => entry.date === '2019-12-20')).toBe(false)
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

    it('rejects overlapping employments', () => {
        const store = useZeitwerkStore()
        const first = store.employments[0]
        store.updateEmployment(first.id, { name: 'Erste', start: '2020-01-01', end: '' })

        const second = store.addEmployment()
        const result = store.updateEmployment(second.id, { start: '2020-06-01', end: '' })

        expect(result.ok).toBe(false)
        expect(result.reason).toBe('overlap')
    })
})
