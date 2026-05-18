// src/stores/zeitwerk.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calcActualHours, getKW, MONTH_NAMES, today } from '@/composables/useTime'

const STORAGE_KEY = 'zeitwerk_data'

function loadStorage() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    }
    catch {
        return {}
    }
}

const stored = loadStorage()

export const useZeitwerkStore = defineStore('zeitwerk', () => {
    // State
    const entries = ref(stored.entries || [])

    const settings = ref(stored.settings || {
        hoursPerDay: 8,
        hoursPerWeek: 40,
        defaultBreak: 30,
        workDays: 5
    })

    const currYear = ref(new Date().getFullYear())
    const currMonth = ref(new Date().getMonth()) // 0-indexed

    // Persist
    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            entries: entries.value,
            settings: settings.value
        }))
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
            group.actual += calcActualHours(entry)
            group.planned += entry.plannedDay || settings.value.hoursPerDay
        })
        groups.forEach(g => g.actualDiff = g.actual - g.planned)
        return groups
    })

    const monthActual = computed(() => entriesForMonth.value.reduce((accumulator, entry) => accumulator + calcActualHours(entry), 0))
    const monthPlanned = computed(() => entriesForMonth.value.reduce((accumulator, entry) => accumulator + (entry.plannedDay || settings.value.hoursPerDay), 0))
    const monthDiff = computed(() => monthActual.value - monthPlanned.value)

    // CRUD
    function addEntry(data) {
        entries.value.push({ id: Date.now(), ...data })
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

    return {
        entries, settings, currYear, currMonth,
        currMonthLabel, entriesForMonth, weekGroups,
        monthActual, monthPlanned, monthDiff,
        persist,
        addEntry, updateEntry, deleteEntry, patchEntryField,
        saveSettings,
        prevMonth, nextMonth,
        exportJSON, importJSON
    }
})
