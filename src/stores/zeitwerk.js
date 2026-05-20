// src/stores/zeitwerk.js

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { calcActualHours, getKW, MONTH_NAMES } from '@/composables/useTime'
import { getAbsenceType } from '@/composables/useAbsence'
import { getHolidaysForMonth, getHolidays } from '@/composables/useHolidays'

const STORAGE_KEY = 'zeitwerk_data'

// Default-Settings zentral definiert
const DEFAULT_SETTINGS = {
    hoursPerDay: 8,
    hoursPerWeek: 40,
    defaultBreak: 30,
    workDays: 5,
    state: 'BW',
    grossMonthlySalary: 0
}

function loadStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw)
            return {}

        const parsed = JSON.parse(raw)

        if (typeof parsed !== 'object' || parsed === null)
            return {}

        return parsed
    } catch {
        return {}
    }
}

export const useZeitwerkStore = defineStore('zeitwerk', () => {
    const stored = loadStorage()

    // State
    const entries = ref(Array.isArray(stored.entries) ? stored.entries : [])

    // Settings: Merge saved values with defaults (no data loss for new keys)
    const settings = ref({
        ...DEFAULT_SETTINGS,
        ...(stored.settings ?? {})
    })

    watch(
        [entries, settings],
        () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                entries: entries.value,
                settings: settings.value
            }))
        },
        { deep: true } // deep because it is array/object
    )

    const currYear = ref(new Date().getFullYear())
    const currMonth = ref(new Date().getMonth()) // 0-indexed

    // Persist
    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            entries: entries.value,
            settings: settings.value
        }))
    }

    // Public holidays
    // Removes all holidays from a given year and adds new ones
    function syncHolidays(year, state) {
        if (!state)
            return

        // Remove all holiday entries for this year
        entries.value = entries.value.filter(entry => {
            if (entry.typ !== 'publicholiday')
                return true // keep other types
            const y = new Date(entry.date).getFullYear()

            return y !== year // only remove this year
        })

        // Add new holidays for the entire year
        const holidays = getHolidays(year, state)
        holidays.forEach((h, i) => {
            entries.value.push({
                id: Date.now() + i,
                date: h.date,
                typ: 'publicholiday',
                timeEntries: [], // public holidays have no time entries
                plannedHours: settings.value.hoursPerDay,
                notes: h.name
            })
        })

        persist()
    }

    // When you first launch the program, enter the holidays for the current year,
    //  but only if there are NO holidays scheduled for this year yet.
    const initYear = new Date().getFullYear()
    const hasHolidaysThisYear = entries.value.some(e =>
        e.typ === 'publicholiday' &&
        new Date(e.date).getFullYear() === initYear
    )
    if (!hasHolidaysThisYear && settings.value.state) {
        syncHolidays(initYear, settings.value.state)
        // persist() is called by syncHolidays
    }

    // Computed
    const currMonthLabel = computed(() =>
        `${MONTH_NAMES[currMonth.value]} ${currYear.value}`
    )

    const entriesForMonth = computed(() =>
        entries.value
            .filter(entry => {
                const date = new Date(entry.date)
                return date.getFullYear() === currYear.value
                    && date.getMonth() === currMonth.value
            })
            .sort((first, second) => first.date.localeCompare(second.date))
    )

    const weekGroups = computed(() => {
        const groups = []

        entriesForMonth.value.forEach(entry => {
            const kw = getKW(entry.date)
            let group = groups.find(item => item.kw === kw)

            if (!group) {
                group = { kw, entries: [], actual: 0, planned: 0 }; groups.push(group)
            }

            group.entries.push(entry)
            group.actual += effectiveActualHours(entry)
            group.planned += entry.plannedHours || settings.value.hoursPerDay
        })
        groups.forEach(g => g.ActualDiff = g.actual - g.planned)
        return groups
    })

    const monthActual = computed(() => entriesForMonth.value.reduce((accumulator, entry) => accumulator + effectiveActualHours(entry), 0))
    const monthPlanned = computed(() => entriesForMonth.value.reduce((accumulator, entry) => accumulator + (entry.plannedHours || settings.value.hoursPerDay), 0))
    const monthDiff = computed(() => monthActual.value - monthPlanned.value)

    // Watcher
    // Change state -> Resync holidays for the current year
    watch(
        () => settings.value.state,
        (newState, oldState) => {
            if (!newState || !oldState || newState === oldState)
                return
            syncHolidays(currYear.value, newState)
        },
        { immediate: false }
    )

    // Year change → Add holidays for the new year if none are present
    watch(
        () => currYear.value,
        (newYear) => {
            const already = entries.value.some(e =>
                e.typ === 'publicholiday' &&
                new Date(e.date).getFullYear() === newYear
            )
            if (!already && settings.value.state) {
                syncHolidays(newYear, settings.value.state)
            }
        },
        { immediate: false }
    )

    // CRUD
    function addEntry(data) {
        entries.value.push({
            id: Date.now(),
            date: '',
            typ: 'work',
            timeEntries: [{ start: '', end: '', pause: 0 }],
            plannedHours: settings.value.hoursPerDay,
            notes: '',
            ...data  // overrides what is found from modal
        })
        persist()
    }

    function updateEntry(id, data) {
        const index = entries.value.findIndex(entry => entry.id === id)

        if (index >= 0)
            entries.value[index] = { ...entries.value[index], ...data }

        persist()
    }

    function deleteEntry(id) {
        entries.value = entries.value.filter(entry => entry.id !== id)
        persist()
    }

    function patchEntryField(id, field, value) {
        const index = entries.value.findIndex(entry => entry.id === id)

        if (index >= 0)
            entries.value[index][field] = value

        persist()
    }

    // Settings
    function saveSettings(data) {
        settings.value = { ...settings.value, ...data }
        persist()
    }

    // Month navigation
    function prevMonth() {
        if (currMonth.value === 0) {
            currMonth.value = 11
            currYear.value--
        }
        else
            currMonth.value--
    }

    function nextMonth() {
        if (currMonth.value === 11) {
            currMonth.value = 0
            currYear.value++
        }
        else
            currMonth.value++
    }

    // Import / Export
    function exportJSON() {
        const blob = new Blob(
            [JSON.stringify({
                entries: entries.value,
                settings: settings.value,
                exportedAt: new Date().toISOString()
            }, null, 2)],
            { type: 'application/json' }
        )

        const url = document.createElement('a')
        const pad = number => String(number).padStart(2, '0')
        url.href = URL.createObjectURL(blob)
        url.download = `zeitwerk_${currYear.value}_${pad(currMonth.value + 1)}.json`
        url.click()
    }

    function importJSON(data) {
        if (!data.entries)
            throw new Error('Ungültiges Format')

        entries.value = data.entries

        if (data.settings)
            settings.value = data.settings

        persist()
        return data.entries.length
    }

    // Export as CSV for Excel, with semicolon as separator and UTF-8 BOM
    function exportCSV() {
        console.log('exportCSV called')
        const pad = num => String(num).padStart(2, '0')

        const headers = [
            'Date',
            'Weekday',
            'KW',
            'Type',
            'Time Blocks',
            'Actual (h)',
            'Planned (h)',
            'Difference (h)',
            'Notes'
        ]

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const rows = [...entries.value]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(entry => {
                const actual = effectiveActualHours(entry)
                const planned = entry.plannedHours ?? settings.value.hoursPerDay
                const dt = new Date(entry.date + 'T00:00:00')

                const blocks = (entry.timeEntries ?? [])
                    .filter(block => block.start && block.end)
                    .map(block => `${block.start}–${block.end} (${block.pause ?? 0}min)`)
                    .join(', ') || '—'

                return [
                    `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`,
                    days[dt.getDay()],
                    getKW(entry.date),
                    entry.typ || 'work',
                    blocks,
                    actual.toFixed(2),
                    planned.toFixed(2),
                    (actual - planned).toFixed(2),
                    entry.notes || ''
                ]
                    .map(value => `"${String(value).replace(/"/g, '""')}"`)
                    .join(';')
            })

        const csv = [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n')
        const bom = '\uFEFF'
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = objectUrl
        link.download = `zeitwerk_${currYear.value}_${pad(currMonth.value + 1)}.csv`
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.setTimeout(() => {
            URL.revokeObjectURL(objectUrl)
        }, 1000)

        return true
    }

    // Helpers
    // Returns actual hours worked — if absent = target
    function effectiveActualHours(entry) {
        const type = getAbsenceType(entry.typ ?? 'work')
        if (!type.counter)
            return entry.plannedHours ?? settings.value.hoursPerDay

        return calcActualHours(entry)
    }

    // Enter holidays as entries for a month (manually via a modal window)
    function importHolidays(year, month) {
        const holidays = getHolidaysForMonth(year, month, settings.value.state)
        let added = 0
        let skipped = 0

        holidays.forEach((h, i) => {
            const exists = entries.value.find(e => e.date === h.date)
            if (exists) {
                skipped++
                return
            }

            entries.value.push({
                id: Date.now() + i,
                date: h.date,
                typ: 'publicholiday',
                timeEntries: [],
                plannedHours: settings.value.hoursPerDay,
                notes: h.name
            })
            added++
        })

        persist()
        return { added, skipped, total: holidays.length }
    }

    // Calculate gross salary based on gross monthly salary and hours worked
    const grossHourlyRate = computed(() => {
        const monthly = Number(settings.value.grossMonthlySalary || 0)
        const weeklyHours = Number(settings.value.hoursPerWeek || 0)

        if (!monthly || !weeklyHours)
            return 0

        return (monthly * 12) / (weeklyHours * 52)
    })

    const grossDailyRate = computed(() => {
        const dayHours = Number(settings.value.hoursPerDay || 0)
        if (!dayHours)
            return 0

        return grossHourlyRate.value * dayHours
    })

    function grossEarnedForEntry(entry) {
        if (!entry)
            return 0

        return grossHourlyRate.value * effectiveActualHours(entry)
    }

    return {
        entries, settings, currYear, currMonth,
        currMonthLabel, entriesForMonth, weekGroups,
        monthActual, monthPlanned, monthDiff,
        persist,
        addEntry, updateEntry, deleteEntry, patchEntryField,
        saveSettings,
        prevMonth, nextMonth,
        exportJSON, importJSON, exportCSV,
        effectiveActualHours, importHolidays, syncHolidays,
        grossHourlyRate, grossDailyRate, grossEarnedForEntry,
    }
})
