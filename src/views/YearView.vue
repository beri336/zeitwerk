<!-- src/views/YearView.vue -->

<template>
    <main class="main">
        <section class="year-toolbar" aria-label="Year navigation">
            <button class="year-nav-btn" type="button" @click="prevYear" aria-label="Previous year">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            <div class="year-label" aria-live="polite">
                {{ store.currYear }}
            </div>

            <button class="year-nav-btn" type="button" @click="nextYear" aria-label="Next year">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            <button class="year-current-btn" type="button" @click="goToCurrentYear" :disabled="isCurrentYear">
                This year
            </button>
        </section>

        <p class="year-hint">
            Tap a day to open or create an entry. Colored days indicate tracked work, absences, or public holidays.
        </p>

        <section class="year-summary" aria-label="Year summary">
            <KpiCard label="Months with entries"
                :value="String(yearMonths.filter(month => month.stats.count > 0).length)" />

            <KpiCard label="Entries" :value="String(yearEntries.length)" />

            <KpiCard label="Actual"
                :value="formatHours(yearEntries.reduce((sum, entry) => sum + store.effectiveActualHours(entry), 0))" />

            <KpiCard label="Planned" :value="formatHours(
                yearEntries.reduce(
                    (sum, entry) => sum + (entry.plannedHours || store.settings.hoursPerDay),
                    0
                )
            )" />

            <!-- Only if salary is set -->
            <KpiCard v-if="store.grossHourlyRate > 0" label="Year Gross" :value="yearGrossLabel" sub="Gross earnings"
                variant="ok" :private="true" />

            <!-- Vacation -->
            <KpiCard label="Used Vacation Days" :value="String(store.usedVacationDays)" sub="Days taken" />

            <KpiCard label="Remaining Vacation Days" :value="String(store.remainingVacationDays)"
                :sub="`${store.remainingVacationDays === 1 ? 'Day left' : 'Days left'}`" />
        </section>

        <section class="year-grid" aria-label="Year calendar overview">
            <article v-for="month in yearMonths" :key="month.index" class="year-month"
                :class="[monthCardClass(month), { 'year-month--current': isCurrentMonthCard(month.index) }]">
                <header class="year-month-header">
                    <div class="year-month-title">{{ month.name }}</div>
                    <div class="year-month-meta">
                        <span>{{ month.stats.count }} entries</span>
                        <span :class="month.stats.diff >= 0 ? 'stat-ok' : 'stat-err'">
                            {{ month.stats.diff >= 0 ? '+' : '' }}{{ formatHours(month.stats.diff) }}
                        </span>
                    </div>
                </header>

                <div class="year-weekdays">
                    <span v-for="day in DAY_HEADERS" :key="day" class="year-weekday">
                        {{ day.slice(0, 2) }}
                    </span>
                </div>

                <div class="year-days">
                    <button v-for="day in month.days" :key="day.date" type="button" class="year-day"
                        :class="dayClass(day)" :aria-label="day.date" @click="openDay(day.date)">
                        <span class="year-day-number">{{ day.dayNumber }}</span>
                    </button>
                </div>
            </article>
        </section>

        <EntryModal v-model="showModal" :edit-entry="editEntry" :prefill-date="clickedDate" />
    </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, MONTH_NAMES } from '@/composables/useTime'
import { getAbsenceType } from '@/composables/useAbsence'
import EntryModal from '@/components/EntryModal.vue'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useZeitwerkStore()
const showModal = ref(false)
const editEntry = ref(null)
const clickedDate = ref(null)

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const todayStr = computed(() => {
    const date = new Date()
    const p = num => String(num).padStart(2, '0')

    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
})

const isCurrentYear = computed(() => {
    return store.currYear === new Date().getFullYear()
})

function pad(num) {
    return String(num).padStart(2, '0')
}

function formatDateString(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7

    const days = []

    for (let index = startDow - 1; index >= 0; index--) {
        const date = new Date(year, month, -index)

        days.push({
            date: formatDateString(date),
            dayNumber: date.getDate(),
            outside: true
        })
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        
        days.push({
            date: formatDateString(date),
            dayNumber: day,
            outside: false
        })
    }

    while (days.length < 42) {
        const date = new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1)

        days.push({
            date: formatDateString(date),
            dayNumber: date.getDate(),
            outside: true
        })
    }

    return days
}

const yearEntries = computed(() =>
    store.entries.filter(entry => {
        const date = new Date(entry.date)

        return date.getFullYear() === store.currYear
    })
)

function getEntryForDate(date) {
    return store.entries.find(entry => entry.date === date) ?? null
}

function getMonthStats(month) {
    const monthEntries = yearEntries.value.filter(entry => {
        const date = new Date(entry.date)
        return date.getMonth() === month
    })

    const actual = monthEntries.reduce((sum, entry) => sum + store.effectiveActualHours(entry), 0)
    const planned = monthEntries.reduce(
        (sum, entry) => sum + (entry.plannedHours || store.settings.hoursPerDay),
        0
    )

    return {
        count: monthEntries.length,
        actual,
        planned,
        diff: actual - planned
    }
}

const yearMonths = computed(() =>
    MONTH_NAMES.map((name, monthIndex) => {
        const stats = getMonthStats(monthIndex)

        return {
            index: monthIndex,
            name,
            stats,
            days: getMonthDays(store.currYear, monthIndex).map(day => {
                const entry = getEntryForDate(day.date)
                const absence = entry ? getAbsenceType(entry.typ ?? 'on-site') : null
                const isToday = day.date === todayStr.value

                return {
                    ...day,
                    isToday,
                    hasEntry: !!entry,
                    entry,
                    absence,
                    isAbsence: !!entry && entry.typ && entry.typ !== 'on-site',
                    isHoliday: entry?.typ === 'publicholiday'
                }
            })
        }
    })
)

function openDay(date) {
    const existing = getEntryForDate(date)
    clickedDate.value = date
    editEntry.value = existing ?? null
    showModal.value = true
}

function prevYear() { store.currYear-- }
function nextYear() { store.currYear++ }

function goToCurrentYear() {
    store.currYear = new Date().getFullYear()
}

function monthCardClass(month) {
    if (month.stats.diff > 0.1)
        return 'year-month--positive'

    if (month.stats.diff < -0.1)
        return 'year-month--negative'

    return ''
}

function dayClass(day) {
    return {
        'year-day--outside': day.outside,
        'year-day--today': day.isToday,
        'year-day--entry': day.hasEntry && !day.isAbsence,
        'year-day--absence': day.isAbsence,
        'year-day--holiday': day.isHoliday
    }
}

/* Highlight current month */
function isCurrentMonthCard(monthIndex) {
    const now = new Date()
    return store.currYear === now.getFullYear()
        && monthIndex === now.getMonth()
}

const yearGross = computed(() =>
    yearEntries
        .value
        .reduce((sum, entry) => sum + store.grossEarnedForEntry(entry), 0)
)

const yearGrossLabel = computed(() => {
    if (!store.grossHourlyRate)
        return ''

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
    }).format(yearGross.value)
})
</script>

<style scoped>
/* Main Layout */
.main {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

/* Toolbar */
.year-toolbar {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 36px auto;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.year-label {
    text-align: center;
    font-size: var(--text-sm);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.year-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
}

.year-nav-btn:hover {
    background: var(--color-surface-offset);
    color: var(--color-text);
}

.year-current-btn {
    height: 36px;
    padding: 0 var(--space-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text);
    font-size: var(--text-xs);
    font-weight: 600;
    white-space: nowrap;
}

.year-current-btn:hover    { background: var(--color-surface-offset); }
.year-current-btn:disabled { opacity: 0.55; cursor: default; }

.year-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    margin-top: calc(var(--space-2) * -1);
}

/* Summary */
.year-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-3);
}

.stat-ok  { color: var(--color-success); }
.stat-err { color: var(--color-error); }

/* Year Grid */
.year-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-4);
}

/* Month Card */
.year-month {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.year-month--positive {
    border-color: color-mix(in oklch, var(--color-success) 28%, var(--color-border));
}

.year-month--negative {
    border-color: color-mix(in oklch, var(--color-error) 28%, var(--color-border));
}

.year-month--current {
    /* Highlight current month */
    border-color: color-mix(in oklch, var(--color-gold) 42%, var(--color-border));
    box-shadow:
        inset 0 0 0 1px color-mix(in oklch, var(--color-gold) 38%, transparent),
        0 0 0 3px color-mix(in oklch, var(--color-gold) 16%, transparent),
        var(--shadow-sm);
}

.year-month--current .year-month-title {
    /* Highlight current month title */
    color: var(--color-gold);
}

.year-month-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.year-month-title {
    font-size: var(--text-sm);
    font-weight: 700;
}

.year-month-meta {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
}

/* Weekday Labels & Day Grid */
.year-weekdays,
.year-days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
}

.year-weekday {
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* Day Cell */
.year-day {
    aspect-ratio: 1 / 1;
    min-height: 28px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    background: var(--color-surface-2);
    color: var(--color-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-variant-numeric: tabular-nums;
}

.year-day-number {
    font-size: 11px;
    line-height: 1;
}

.year-day:hover {
    background: var(--color-surface-offset);
    border-color: var(--color-border);
}

.year-day--outside { opacity: 0.35; }

.year-day--entry {
    background: color-mix(in oklch, var(--color-primary) 10%, var(--color-surface-2));
    border-color: color-mix(in oklch, var(--color-primary) 24%, var(--color-border));
}

.year-day--absence {
    background: color-mix(in oklch, var(--color-warning) 12%, var(--color-surface-2));
    border-color: color-mix(in oklch, var(--color-warning) 28%, var(--color-border));
}

.year-day--holiday {
    background: color-mix(in oklch, var(--color-error-highlight) 45%, var(--color-surface-2));
    border-color: color-mix(in oklch, var(--color-error) 20%, var(--color-border));
}

/* Today Highlight */
.year-day.year-day--today,
.year-day.year-day--today.year-day--entry,
.year-day.year-day--today.year-day--absence,
.year-day.year-day--today.year-day--holiday {
    background: color-mix(in oklch, var(--color-gold) 28%, var(--color-surface-2));
    border-color: color-mix(in oklch, var(--color-gold) 42%, var(--color-border));
    outline: none;
    font-weight: 700;
}

/* Large screens */
@media (max-width: 1100px) {
    .year-grid    { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .year-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* Mobile */
@media (max-width: 768px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }

    .year-toolbar {
        grid-template-columns: 36px minmax(0, 1fr) 36px;
        grid-template-areas:
            "prev label next"
            "current current current";
    }

    .year-toolbar > .year-nav-btn:first-child   { grid-area: prev; }
    .year-toolbar > .year-nav-btn:nth-of-type(2) { grid-area: next; justify-self: end; }
    .year-label { grid-area: label; }

    .year-current-btn {
        grid-area: current;
        width: 100%;
        margin-top: var(--space-1);
    }

    .year-summary { grid-template-columns: 1fr 1fr; }
    .year-grid    { grid-template-columns: 1fr; }
    .year-day     { min-height: 30px; }
}
</style>
