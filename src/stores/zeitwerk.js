// src/stores/zeitwerk.js

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getKW, MONTH_NAMES } from '@/composables/useTime'
import { getAbsenceType } from '@/composables/useAbsence'
import { getHolidaysForMonth, getHolidays } from '@/composables/useHolidays'
import {
    CONTRACT_KEYS,
    contractFrom,
    dateBelongsToEmployment,
    earliestEmploymentStart,
    employmentFileSlug,
    employmentForDate,
    employmentForYear,
    employmentsInYear,
    employmentOverlapsYear,
    pinVacationYearsBefore,
    vacationCarryoverOffer,
    entryIsBeforeStart,
    findOverlap,
    hourlyRate,
    managedHolidayYears,
    normalizeEmployment,
    todayIso,
    vacationBalance,
} from '@/composables/employments'

const STORAGE_KEY = 'zeitwerk_data'

export const chartExportTrigger = ref(null) // null | 'png' | 'jpg'

// Default settings defined centrally
const DEFAULT_SETTINGS = {
    hoursPerDay: 8,
    hoursPerWeek: 40,
    defaultBreak: 30,
    workDays: 5,
    defaultWorkplace: 'on-site',
    recoveryEnabled: true,
    recoveryFrequency: 'weekly',
    maxWorkHours: 9,
    warnWorkHours: 8,
    inactivityMinutes: 30,
    state: 'BW',
    grossMonthlySalary: 0,
    vacationDaysPerYear: 30,
    extraVacationDays: 0,
    extraVacationDeadline: '',
    extraVacationNoticeDays: 30,
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

    const DEFAULT_ACTIVE_SESSION = {
        date: null,
        status: 'idle', // idle | working | break
        currentEntryId: null,
        currentBlockIndex: null,
        breakStartedAt: null,
        startedAt: null,
        lastResumedAt: null
    }

    // State
    const entries = ref(Array.isArray(stored.entries)
        ? stored.entries
        : []
    )

    // Settings: Merge saved values with defaults (no data loss for new keys)
    const settings = ref({
        ...DEFAULT_SETTINGS,
        ...(stored.settings ?? {})
    })

    const employments = ref(
        Array.isArray(stored.employments) && stored.employments.length
            ? stored.employments.map(employment => normalizeEmployment(employment, settings.value))
            : [normalizeEmployment({ id: 'emp_initial', name: '' }, settings.value)]
    )

    const activeSession = ref({
        ...DEFAULT_ACTIVE_SESSION,
        ...(stored.activeSession ?? {})
    })

    watch(
        [entries, settings, activeSession, employments],
        () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                entries: entries.value,
                settings: settings.value,
                activeSession: activeSession.value,
                employments: employments.value,
            }))
        },
        { deep: true } // deep because it is an array/ object
    )

    const currYear = ref(new Date().getFullYear())
    const currMonth = ref(new Date().getMonth()) // 0-indexed

    // count vacations per year
    function isVacationInYear(entry, year) {
        if (entry?.typ !== 'vacation' || !entry.date)
            return false

        const raw = String(entry.date)
        const date = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`)
        return date.getFullYear() === year
    }

    function countVacationDays(year, employment = null) {
        const job = employment ?? employmentForYear(employments.value, year, todayIso())
        return entries.value.filter(entry => {
            if (!isVacationInYear(entry, year))
                return false
            if (!job?.start && employments.value.every(item => !item.start))
                return true
            return employmentForDate(employments.value, String(entry.date).slice(0, 10))?.id === job?.id
        }).length
    }

    const viewedEmployment = computed(() =>
        employmentForYear(employments.value, currYear.value, todayIso())
    )

    const viewedVacation = computed(() =>
        vacationBalance(
            viewedEmployment.value ?? settings.value,
            countVacationDays(currYear.value),
            currYear.value,
        )
    )

    const usedVacationDays = computed(() => viewedVacation.value.used)
    const extraVacationAllowance = computed(() => viewedVacation.value.extra)
    const remainingExtraVacationDays = computed(() => viewedVacation.value.remainingExtra)
    const remainingRegularVacationDays = computed(() => viewedVacation.value.remainingRegular)
    const remainingVacationDays = computed(() => viewedVacation.value.remaining)

    const yearVacationBalances = computed(() =>
        employmentsInYear(employments.value, currYear.value).map(employment => ({
            id: employment.id,
            name: employment.name,
            ...vacationBalance(employment, countVacationDays(currYear.value, employment), currYear.value),
        }))
    )

    const vacationCarryoverOffers = computed(() =>
        employmentsInYear(employments.value, currYear.value)
            .map(employment => {
                const offer = vacationCarryoverOffer({
                    employment,
                    employments: employments.value,
                    year: currYear.value,
                    usedPreviousYear: countVacationDays(currYear.value - 1, employment),
                })

                return offer ? { ...offer, name: employment.name } : null
            }).filter(Boolean)
    )

    // Persist
    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            entries: entries.value,
            settings: settings.value,
            activeSession: activeSession.value,
            employments: employments.value,
        }))
    }

    function mirrorActiveEmployment() {
        const active = employmentForDate(employments.value, todayIso())
        if (!active)

            return
        settings.value = { ...settings.value, ...contractFrom(active) }
    }

    function applyContractPatch(data) {
        const patch = {}
        CONTRACT_KEYS.forEach(key => {
            if (key in data)
                patch[key] = data[key]
        })
        if (!Object.keys(patch).length)
            return

        const target = employmentForDate(employments.value, todayIso()) || employments.value[0]
        if (!target)
            return

        const index = employments.value.findIndex(employment => employment.id === target.id)
        if (index < 0)
            return
        employments.value[index] = syncEditedExtraYear(
            normalizeEmployment({ ...target, ...patch, id: target.id }),
            patch,
        )
    }

    function syncEditedExtraYear(employment, patch) {
        if (!patch || !('extraVacationDays' in patch) || ('extraVacationByYear' in patch))
            return employment

        const year = String(new Date().getFullYear())
        const map = employment.extraVacationByYear
        if (!map || !Object.prototype.hasOwnProperty.call(map, year))
            return employment

        return {
            ...employment,
            extraVacationByYear: {
                ...map,
                [year]: employment.extraVacationDays,
            },
        }
    }

    function holidayEntry(holiday, employment, index) {
        return {
            id: Date.now() + index,
            date: holiday.date,
            typ: 'publicholiday',
            timeEntries: [],
            plannedHours: employment?.hoursPerDay || settings.value.hoursPerDay,
            notes: holiday.name,
        }
    }

    function addHolidaysForYear(year) {
        const dated = employments.value.filter(employment =>
            employment.start && employmentOverlapsYear(employment, year)
        )
        const sources = dated.length ? dated : employments.value.slice(0, 1)
        const seen = new Set(
            entries.value
                .filter(entry => entry.typ === 'publicholiday')
                .map(entry => String(entry.date).slice(0, 10))
        )

        sources.forEach(employment => {
            getHolidays(year, employment.state || settings.value.state || 'BW').forEach((holiday, index) => {
                if (seen.has(holiday.date))
                    return
                const owner = employmentForDate(employments.value, holiday.date)
                if (dated.length && owner?.id !== employment.id)
                    return
                entries.value.push(holidayEntry(holiday, employment, index))
                seen.add(holiday.date)
            })
        })
    }

    function pruneBeforeFirstEmployment() {
        const start = earliestEmploymentStart(employments.value)
        if (!start)
            return

        entries.value = entries.value.filter(entry => !entryIsBeforeStart(entry, start))
    }

    function removeUncoveredHolidays() {
        if (!employments.value.some(employment => employment.start))
            return

        entries.value = entries.value.filter(entry => {
            if (entry.typ !== 'publicholiday')
                return true
            return Boolean(employmentForDate(employments.value, String(entry.date).slice(0, 10)))
        })
    }

    // Rebuild public holidays inside employment ranges. Days before the first start are dropped.
    function rebuildHolidays() {
        pruneBeforeFirstEmployment()
        const years = new Set(managedHolidayYears(employments.value, todayIso()))
        entries.value = entries.value.filter(entry => {
            if (entry.typ !== 'publicholiday')
                return true
            const year = Number(String(entry.date).slice(0, 4))
            return !years.has(year)
        })
        years.forEach(year => addHolidaysForYear(year))
        persist()
    }

    function syncHolidays() {
        rebuildHolidays()
    }

    function applyEmploymentCoverage() {
        pruneBeforeFirstEmployment()
        removeUncoveredHolidays()
        persist()
    }

    pruneBeforeFirstEmployment()
    removeUncoveredHolidays()
    if (!entries.value.some(entry =>
        entry.typ === 'publicholiday'
        && String(entry.date).startsWith(String(new Date().getFullYear()))
    )) {
        addHolidaysForYear(new Date().getFullYear())
        persist()
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
                group = {
                    kw,
                    entries: [],
                    actual: 0,
                    planned: 0
                }; groups.push(group)
            }

            group.entries.push(entry)
            group.actual += effectiveActualHours(entry)
            group.planned += plannedHoursFor(entry)
        })
        groups.forEach(group => group.ActualDiff = group.actual - group.planned)

        return groups
    })

    const monthActual = computed(() =>
        entriesForMonth
            .value
            .reduce((accumulator, entry) => accumulator + effectiveActualHours(entry), 0))

    const monthPlanned = computed(() =>
        entriesForMonth
            .value
            .reduce((accumulator, entry) =>
                accumulator + plannedHoursFor(entry), 0)
    )

    const monthDiff = computed(() => monthActual.value - monthPlanned.value)

    const todayEntry = computed(() => {
        const today = nowDateString()

        return entries
            .value
            .find(entry => entry.date === today) ?? null
    })

    const monthGross = computed(() =>
        entriesForMonth
            .value
            .reduce((sum, entry) => sum + grossEarnedForEntry(entry), 0)
    )

    const weekGrossGroups = computed(() =>
        weekGroups.value.map(group => ({
            kw: group.kw,
            gross: group
                .entries
                .reduce((sum, entry) => sum + grossEarnedForEntry(entry), 0)
        }))
    )

    const liveStatus = computed(() => activeSession.value.status || 'idle')

    const liveWorkedHours = computed(() => {
        const entry = todayEntry.value
        if (!entry)
            return 0

        return effectiveActualHours(entry)
    })

    // Year change -> add holidays for the new year if none are present
    watch(
        () => currYear.value,
        (newYear) => {
            const already = entries.value.some(entry =>
                entry.typ === 'publicholiday' &&
                String(entry.date).startsWith(String(newYear))
            )

            if (!already) {
                addHolidaysForYear(newYear)
                persist()
            }
        }
    )

    // CRUD
    function addEntry(data) {
        const trackedFrom = earliestEmploymentStart(employments.value)

        if (entryIsBeforeStart({ date: data?.date }, trackedFrom))
            return null

        entries.value.push({
            id: Date.now(),
            date: '',
            typ: 'on-site',
            timeEntries: [{ start: '', end: '', pause: 0 }],
            plannedHours: settings.value.hoursPerDay,
            notes: '',
            ...data // overrides what is found from modal
        })
        persist()
    }

    function deleteAllEntries() {
        entries.value = []
        activeSession.value = { ...DEFAULT_ACTIVE_SESSION }
        persist()
    }

    function updateEntry(id, data) {
        const index = entries.value.findIndex(entry => entry.id === id)
        if (index < 0)
            return

        const next = { ...entries.value[index], ...data }
        if (entryIsBeforeStart(next, earliestEmploymentStart(employments.value))) {
            entries.value = entries.value.filter(entry => entry.id !== id)
            persist()
            return
        }

        entries.value[index] = next
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

    function resetActiveSession() {
        activeSession.value = { ...DEFAULT_ACTIVE_SESSION }
        persist()
    }

    function startWork() {
        if (activeSession.value.status === 'working')
            return

        const entry = ensureTodayEntry()
        const nowIso = new Date().toISOString()
        const start = nowTimeString()

        entry.typ = 'on-site'
        entry.timeEntries = entry.timeEntries ?? []

        entry.timeEntries.push({
            start,
            end: '',
            pause: 0
        })

        activeSession.value = {
            date: entry.date,
            status: 'working',
            currentEntryId: entry.id,
            currentBlockIndex: entry.timeEntries.length - 1,
            breakStartedAt: null,
            startedAt: nowIso,
            lastResumedAt: nowIso
        }

        persist()
    }

    function startBreak() {
        if (activeSession.value.status !== 'working')
            return

        const entry = findEntryById(activeSession.value.currentEntryId)
        if (!entry)
            return

        const block = entry.timeEntries?.[activeSession.value.currentBlockIndex]
        if (!block || block.end)
            return

        block.end = nowTimeString()

        activeSession.value.status = 'break'
        activeSession.value.breakStartedAt = new Date().toISOString()

        persist()
    }

    function resumeWork() {
        if (activeSession.value.status !== 'break')
            return

        const entry = findEntryById(activeSession.value.currentEntryId)
        if (!entry)
            return

        const breakStartedAt = activeSession.value.breakStartedAt
        let breakMinutes = 0

        if (breakStartedAt) {
            const diffMs = Date.now() - new Date(breakStartedAt).getTime()
            breakMinutes = Math.max(0, Math.round(diffMs / 60000))
        }

        const previousBlock = entry.timeEntries?.[activeSession.value.currentBlockIndex]
        if (previousBlock) {
            previousBlock.pause = breakMinutes
        }

        const nowIso = new Date().toISOString()

        entry.timeEntries.push({
            start: nowTimeString(),
            end: '',
            pause: 0
        })

        activeSession.value.status = 'working'
        activeSession.value.currentBlockIndex = entry.timeEntries.length - 1
        activeSession.value.breakStartedAt = null
        activeSession.value.lastResumedAt = nowIso

        persist()
    }

    function recoverActiveSession() {
        if (!activeSession.value || activeSession.value.status === 'idle')
            return

        const today = nowDateString()

        if (activeSession.value.date !== today) {
            finishWorkDay()
        }
    }

    function finishWorkDay() {
        const entry = findEntryById(activeSession.value.currentEntryId)

        if (activeSession.value.status === 'working' && entry) {
            const block = entry.timeEntries?.[activeSession.value.currentBlockIndex]
            if (block && !block.end) {
                block.end = nowTimeString()
            }
        }

        if (activeSession.value.status === 'break' && entry) {
            const breakStartedAt = activeSession.value.breakStartedAt
            let breakMinutes = 0

            if (breakStartedAt) {
                const diffMs = Date.now() - new Date(breakStartedAt).getTime()
                breakMinutes = Math.max(0, Math.round(diffMs / 60000))
            }

            const previousBlock = entry.timeEntries?.[activeSession.value.currentBlockIndex]
            if (previousBlock) {
                previousBlock.pause = breakMinutes
            }
        }

        resetActiveSession()
        persist()
    }

    // Settings
    function saveSettings(data) {
        const previousState = settings.value.state
        settings.value = { ...settings.value, ...data }
        applyContractPatch(data)
        if (data.state && data.state !== previousState)
            rebuildHolidays()
        else
            persist()
    }

    function updateEmployment(id, patch) {
        const index = employments.value.findIndex(employment => employment.id === id)
        if (index < 0)
            return { ok: false, reason: 'missing' }

        const current = employments.value[index]
        const next = normalizeEmployment({ ...current, ...patch, id })
        if (next.start && next.end && next.end <= next.start)
            return { ok: false, reason: 'end_before_start', employment: current }

        const overlap = findOverlap(employments.value, next)
        if (overlap)
            return { ok: false, reason: 'overlap', employment: current }

        const rangeChanged = current.start !== next.start
            || current.end !== next.end
            || current.state !== next.state
        employments.value[index] = syncEditedExtraYear(next, patch)
        mirrorActiveEmployment()

        if (rangeChanged)
            rebuildHolidays()
        else
            persist()

        return { ok: true, employment: employments.value[index] }
    }

    function acceptVacationCarryover(employmentId, year) {
        const employment = employments.value.find(item => item.id === employmentId)
        const offer = vacationCarryoverOffer({
            employment,
            employments: employments.value,
            year,
            usedPreviousYear: countVacationDays(Number(year) - 1, employment),
        })
        if (!offer)
            return null

        const byYear = pinVacationYearsBefore(employment, offer.year)
        byYear[String(offer.year)] = offer.days
        const patch = { extraVacationByYear: byYear }
        if (offer.year === new Date().getFullYear())
            patch.extraVacationDays = offer.days

        const result = updateEmployment(employmentId, patch)

        return result.ok ? offer : null
    }

    function dismissVacationCarryover(employmentId, year) {
        const employment = employments.value.find(item => item.id === employmentId)
        const offer = vacationCarryoverOffer({
            employment,
            employments: employments.value,
            year,
            usedPreviousYear: countVacationDays(Number(year) - 1, employment),
        })
        if (!offer)
            return null

        const result = updateEmployment(employmentId, {
            dismissedVacationCarryover: {
                ...(employment.dismissedVacationCarryover || {}),
                [String(offer.year)]: offer.days,
            },
        })

        return result.ok ? offer : null
    }

    function addEmployment() {
        const today = todayIso()
        const openIndex = employments.value.findIndex(employment =>
            employment.start && !employment.end && employment.start < today
        )
        if (openIndex >= 0)
            employments.value[openIndex] = { ...employments.value[openIndex], end: today }

        const template = employments.value[employments.value.length - 1] || settings.value
        const created = normalizeEmployment({
            ...contractFrom(template),
            name: '',
            start: today,
            end: '',
        })
        employments.value.push(created)

        mirrorActiveEmployment()
        rebuildHolidays()

        return created
    }

    function removeEmployment(id) {
        if (employments.value.length <= 1)
            return null

        employments.value = employments.value.filter(employment => employment.id !== id)
        mirrorActiveEmployment()
        rebuildHolidays()
        return employments.value[0]?.id ?? null
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
                entries: entries.value.filter(entry =>
                    !entryIsBeforeStart(entry, earliestEmploymentStart(employments.value))
                ),
                settings: settings.value,
                employments: employments.value,
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
            throw new Error('Invalid format')

        entries.value = data.entries

        if (data.settings)
            settings.value = data.settings

        persist()

        return data.entries.length
    }

    // Export as CSV for Excel, with semicolon as separator and UTF-8 BOM
    function exportCSV({
        fromYear,
        fromMonth,
        toYear = fromYear,
        toMonth = fromMonth,
        employmentId = '',
        download = true,
    } = {}) {
        const pad = num => String(num).padStart(2, '0')
        const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        const start = new Date(fromYear, fromMonth, 1)
        const end = new Date(toYear, toMonth + 1, 0)

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
            throw new Error('Invalid export range')
        }

        const headers = [
            'Date',
            'Employer',
            'Weekday',
            'KW',
            'Type',
            'Time Blocks',
            'First Start',
            'Last End',
            'Break (min)',
            'Actual (h)',
            'Planned (h)',
            'Difference (h)',
            'Gross Hourly Rate',
            'Gross Earned',
            'Notes'
        ]

        const rows = []
        const cursor = new Date(start)

        while (cursor <= end) {
            const yyyy = cursor.getFullYear()
            const mm = pad(cursor.getMonth() + 1)
            const dd = pad(cursor.getDate())
            const isoDate = `${yyyy}-${mm}-${dd}`

            if (!dateBelongsToEmployment(employments.value, isoDate, employmentId)) {
                cursor.setDate(cursor.getDate() + 1)
                continue
            }

            const entry = entries.value.find(item => item.date === isoDate) ?? null
            const date = new Date(`${isoDate}T00:00:00`)

            const actualValue = entry ? effectiveActualHours(entry) : null
            const plannedValue = entry ? plannedHoursFor(entry) : null
            const diffValue = entry ? (actualValue - plannedValue) : null
            const breakMinutes = entry ? getBreakMinutes(entry) : null
            const grossEarned = entry ? grossEarnedForEntry(entry) : null

            const validBlocks = entry ? getValidTimeBlocks(entry) : []
            const firstStart = validBlocks.length ? validBlocks[0].start : ''
            const lastEnd = validBlocks.length ? validBlocks[validBlocks.length - 1].end : ''

            const timeBlocks = entry
                ? (entry.timeEntries ?? [])
                    .filter(block => block.start || block.end)
                    .map(block => `${block.start || ''}–${block.end || ''} (${block.pause ?? 0}min)`)
                    .join(', ')
                : ''

            rows.push([
                `${dd}.${mm}.${yyyy}`,
                employmentForDate(employments.value, isoDate)?.name ?? '',
                days[date.getDay()],
                getKW(isoDate),
                entry?.typ || '',
                timeBlocks,
                firstStart,
                lastEnd,
                breakMinutes == null ? '' : String(breakMinutes),
                actualValue == null ? '' : actualValue.toFixed(2),
                plannedValue == null ? '' : plannedValue.toFixed(2),
                diffValue == null ? '' : diffValue.toFixed(2),
                rateForDate(isoDate) ? rateForDate(isoDate).toFixed(2) : '',
                grossEarned == null ? '' : grossEarned.toFixed(2),
                entry?.notes || ''
            ].map(quote).join(';'))

            cursor.setDate(cursor.getDate() + 1)
        }

        const csv = [headers.map(quote).join(';'), ...rows].join('\n')
        if (!download)
            return csv

        const bom = '\uFEFF'
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl

        const rangeLabel = fromYear === toYear && fromMonth === toMonth
            ? `${fromYear}_${pad(fromMonth + 1)}`
            : `${fromYear}_${pad(fromMonth + 1)}-to-${toYear}_${pad(toMonth + 1)}`

        const job = employmentId
            ? employments.value.find(employment => employment.id === employmentId)
            : null

        link.download = job
            ? `zeitwerk_${employmentFileSlug(job.name)}_${rangeLabel}.csv`
            : `zeitwerk_${rangeLabel}.csv`

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
    // Returns actual hours worked -> if absent = target
    function timeToMinutes(value) {
        if (!value || typeof value !== 'string' || !value.includes(':'))
            return null

        const [hours, minutes] = value.split(':').map(Number)

        if (Number.isNaN(hours) || Number.isNaN(minutes))
            return null

        return hours * 60 + minutes
    }

    function getValidTimeBlocks(entry) {
        return [...(entry.timeEntries ?? [])]
            .filter(block => block.start && block.end)
            .map(block => ({
                ...block,
                startMinutes: timeToMinutes(block.start),
                endMinutes: timeToMinutes(block.end)
            }))
            .filter(block =>
                block.startMinutes !== null &&
                block.endMinutes !== null &&
                block.endMinutes > block.startMinutes
            )
            .sort((a, b) => a.startMinutes - b.startMinutes)
    }

    function getWorkedMinutes(entry) {
        const blocks = getValidTimeBlocks(entry)

        if (!blocks.length)
            return 0

        if (blocks.length === 1) {
            const only = blocks[0]
            const blockMinutes = only.endMinutes - only.startMinutes
            const pauseMinutes = Math.max(0, Number(only.pause ?? 0))

            return Math.max(0, blockMinutes - pauseMinutes)
        }

        return blocks.reduce((sum, block) => {
            return sum + (block.endMinutes - block.startMinutes)
        }, 0)
    }

    function getBreakMinutes(entry) {
        const blocks = getValidTimeBlocks(entry)

        if (!blocks.length)
            return 0

        if (blocks.length === 1) {
            return Math.max(0, Number(blocks[0].pause ?? 0))
        }

        let totalBreak = 0

        for (let index = 1; index < blocks.length; index++) {
            const previous = blocks[index - 1]
            const current = blocks[index]
            const gap = current.startMinutes - previous.endMinutes

            if (gap > 0)
                totalBreak += gap
        }

        return totalBreak
    }

    function effectiveActualHours(entry) {
        const type = getAbsenceType(entry.typ ?? 'on-site')

        if (!type.counter)
            return plannedHoursFor(entry)

        return getWorkedMinutes(entry) / 60
    }

    // Enter holidays as entries for a month (manually via a modal window)
    function importHolidays(year, month) {
        const start = earliestEmploymentStart(employments.value)
        const holidays = getHolidaysForMonth(year, month, settings.value.state)
        let added = 0
        let skipped = 0

        holidays.forEach((holiday, index) => {
            if (start && holiday.date < start) {
                skipped++
                return
            }

            if (employments.value.some(employment => employment.start)
                && !employmentForDate(employments.value, holiday.date)) {
                skipped++
                return
            }

            const exists = entries.value.find(entry => entry.date === holiday.date)
            if (exists) {
                skipped++
                return
            }

            const owner = employmentForDate(employments.value, holiday.date)
            entries.value.push(holidayEntry(holiday, owner, index))

            added++
        })

        persist()

        return { added, skipped, total: holidays.length }
    }

    // Calculate gross salary based on gross monthly salary and hours worked
    function hoursOnDate(isoDate) {
        const employment = employmentForDate(employments.value, String(isoDate || '').slice(0, 10))
        const hours = Number(employment?.hoursPerDay ?? settings.value.hoursPerDay)
        return Number.isFinite(hours) ? hours : 0
    }

    function plannedHoursFor(entry) {
        if (typeof entry === 'string')
            return hoursOnDate(entry)
        if (!entry)
            return hoursOnDate(todayIso())

        if (entry.plannedHours !== null && entry.plannedHours !== undefined && entry.plannedHours !== '') {
            const stored = Number(entry.plannedHours)
            if (Number.isFinite(stored))
                return stored
        }

        return hoursOnDate(entry.date)
    }

    function rateForDate(isoDate) {
        const employment = employmentForDate(employments.value, isoDate)
        const monthly = employment?.grossMonthlySalary ?? settings.value.grossMonthlySalary
        const weeklyHours = employment?.hoursPerWeek ?? settings.value.hoursPerWeek

        return hourlyRate(monthly, weeklyHours)
    }

    const grossHourlyRate = computed(() => rateForDate(todayIso()))

    const grossDailyRate = computed(() => {
        const monthly = Number(settings.value.grossMonthlySalary || 0)
        const workDays = Number(settings.value.workDays || 0)

        if (!monthly || !workDays)
            return 0

        return (monthly * 12) / (workDays * 52)
    })

    function grossEarnedForEntry(entry) {
        if (!entry)
            return 0

        return rateForDate(String(entry.date).slice(0, 10)) * effectiveActualHours(entry)
    }

    // Live-tracking timer
    function padTime(num) {
        return String(num).padStart(2, '0')
    }

    function nowDateString() {
        const now = new Date()
        return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(now.getDate())}`
    }

    function nowTimeString() {
        const now = new Date()
        return `${padTime(now.getHours())}:${padTime(now.getMinutes())}`
    }

    function findEntryById(id) {
        return entries.value.find(entry => entry.id === id) ?? null
    }

    function ensureTodayEntry() {
        const today = nowDateString()
        let entry = entries.value.find(entry => entry.date === today)

        if (!entry) {
            entry = {
                id: Date.now(),
                date: today,
                typ: 'on-site',
                timeEntries: [],
                plannedHours: settings.value.hoursPerDay,
                notes: ''
            }
            entries.value.push(entry)
        }

        return entry
    }

    return {
        entries, settings, employments, viewedEmployment, currYear, currMonth,
        currMonthLabel, entriesForMonth, weekGroups,
        monthActual, monthPlanned, monthDiff,
        persist,
        addEntry, updateEntry, deleteEntry, patchEntryField,
        saveSettings, updateEmployment, addEmployment, removeEmployment,
        prevMonth, nextMonth,
        exportJSON, importJSON, exportCSV,
        effectiveActualHours, importHolidays, syncHolidays, applyEmploymentCoverage,
        grossHourlyRate, grossDailyRate, grossEarnedForEntry, plannedHoursFor,
        activeSession, todayEntry, liveStatus, liveWorkedHours, startWork, startBreak, resumeWork, finishWorkDay, resetActiveSession,
        recoverActiveSession,
        deleteAllEntries,
        monthGross, weekGrossGroups,
        usedVacationDays, remainingVacationDays, yearVacationBalances, vacationCarryoverOffers,
        acceptVacationCarryover, dismissVacationCarryover,
        extraVacationAllowance, remainingExtraVacationDays, remainingRegularVacationDays,
        countVacationDays, employmentForDate: date => employmentForDate(employments.value, date),
    }
})
