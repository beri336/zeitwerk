<!-- src/components/features/MonthOverviewCard.vue -->

<template>
    <main class="main">
        <section class="cal-toolbar" aria-label="Calendar navigation">
            <button class="cal-nav-btn" type="button" @click="store.prevMonth()" aria-label="Previous month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            <div class="cal-month-label" aria-live="polite">
                {{ store.currMonthLabel }}
            </div>

            <button class="cal-nav-btn" type="button" @click="store.nextMonth()" aria-label="Next month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            <button class="cal-today-chip" type="button" @click="goToToday" :disabled="isCurrentMonth"
                aria-label="Jump to current month">
                Today
            </button>
        </section>

        <p class="cal-hint">Tap a day to add or edit an entry.</p>

        <section class="cal-header" aria-label="Month statistics">
            <div class="cal-stats">
                <div class="cal-stat">
                    <span class="cal-stat-label">Working days</span>
                    <span class="cal-stat-value">{{ workdays }}</span>
                </div>

                <div class="cal-stat">
                    <span class="cal-stat-label">Entries</span>
                    <span class="cal-stat-value">{{ store.entriesForMonth.length }}</span>
                </div>

                <div class="cal-stat">
                    <span class="cal-stat-label">Month Actual</span>
                    <span class="cal-stat-value" :class="store.monthDiff >= 0 ? 'stat-ok' : 'stat-err'">
                        {{ formatHours(store.monthActual) }}
                    </span>
                </div>

                <div class="cal-stat">
                    <span class="cal-stat-label">Month Planned</span>
                    <span class="cal-stat-value">{{ formatHours(store.monthPlanned) }}</span>
                </div>

                <div class="cal-stat">
                    <span class="cal-stat-label">Difference</span>
                    <span class="cal-stat-value" :class="store.monthDiff >= 0 ? 'stat-ok' : 'stat-err'">
                        {{ store.monthDiff >= 0 ? '+' : '' }}{{ formatHours(store.monthDiff) }}
                    </span>
                </div>
            </div>
        </section>

        <section class="cal-grid-wrap" aria-label="Month calendar">
            <div class="cal-grid">
                <div v-for="header in DAY_HEADERS" :key="header" class="cal-weekday"
                    :class="{ 'cal-weekday--weekend': header === 'Sat' || header === 'Sun' }">
                    {{ header }}
                </div>

                <CalenderDay v-for="day in calendarDays" :key="day.date" :date="day.date"
                    :is-today="day.date === todayStr" :is-outside="day.outside"
                    :flash-today="flashToday && day.date === todayStr" @click="onDayClick" />
            </div>
        </section>

        <EntryModal v-model="showModal" :edit-entry="editEntry" :prefill-date="clickedDate" />
    </main>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours } from '@/composables/useTime'
import CalenderDay from '@/components/CalenderDay.vue'
import EntryModal from '@/components/EntryModal.vue'
import HolidayImportModal from '@/components/HolidayImportModal.vue'

const store = useZeitwerkStore()

const showModal = ref(false)
const editEntry = ref(null)
const clickedDate = ref(null)
const flashToday = ref(false)
const showHolidayModal = ref(false)

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const calendarDays = computed(() => {
    const year = store.currYear
    const month = store.currMonth

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDow = (firstDay.getDay() + 6) % 7

    const days = []
    const pad = num => String(num).padStart(2, '0')
    const format = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

    for (let index = startDow - 1; index >= 0; index--) {
        const date = new Date(year, month, -index)
        days.push({ date: format(date), outside: true })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: format(new Date(year, month, d)), outside: false })
    }

    while (days.length < 42) {
        const date = new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1)
        days.push({ date: format(date), outside: true })
    }

    return days
})

const todayStr = computed(() => {
    const date = new Date()
    const p = num => String(num).padStart(2, '0')

    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
})

const isCurrentMonth = computed(() => {
    const now = new Date()

    return store.currYear === now.getFullYear()
        && store.currMonth === now.getMonth()
})

function onDayClick(date) {
    const existing = store.entries.find(e => e.date === date)
    clickedDate.value = date

    if (existing) {
        editEntry.value = existing
    } else {
        editEntry.value = null
        clickedDate.value = date
    }

    showModal.value = true
}

async function goToToday() {
    const now = new Date()
    store.currYear = now.getFullYear()
    store.currMonth = now.getMonth()

    flashToday.value = false
    await nextTick()

    const todayElement = document.querySelector(`[data-cal-date="${todayStr.value}"]`)
    todayElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    })

    flashToday.value = true

    window.setTimeout(() => {
        flashToday.value = false
    }, 1800)
}

const workdays = computed(() =>
    calendarDays.value.filter(date => {
        if (date.outside)
            return false

        const dow = new Date(date.date + 'T00:00:00').getDay()

        return dow !== 0 && dow !== 6
    }).length
)
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

/* Calendar Header */
.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
}

.cal-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    margin-top: calc(var(--space-2) * -1);
}

/* Toolbar */
.cal-toolbar {
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

.cal-month-label {
    min-width: 0;
    text-align: center;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cal-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    flex-shrink: 0;
}

.cal-nav-btn:hover,
.cal-nav-btn:active {
    background: var(--color-surface-offset);
    color: var(--color-text);
}

.cal-today-chip {
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

.cal-today-chip:hover    { background: var(--color-surface-offset); }
.cal-today-chip:disabled { opacity: 0.55; cursor: default; }

/* Stats */
.cal-stats {
    display: flex;
    gap: var(--space-5);
    flex-wrap: wrap;
}

.cal-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.cal-stat-label {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
}

.cal-stat-value {
    font-size: var(--text-base);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.stat-ok  { color: var(--color-success); }
.stat-err { color: var(--color-error); }

/* Grid */
.cal-grid-wrap {
    background: transparent;
}

.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--space-2);
}

.cal-weekday {
    text-align: center;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: var(--space-2) 0;
}

.cal-weekday--weekend {
    color: var(--color-warning);
}

/* Tablet */
@media (max-width: 900px) {
    .cal-grid  { gap: var(--space-1); }
    .cal-stats { gap: var(--space-4); }
}

/* Mobile */
@media (max-width: 768px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }

    .cal-toolbar {
        grid-template-columns: 36px minmax(0, 1fr) 36px;
        grid-template-areas:
            "prev month next"
            "today today today";
    }

    .cal-toolbar > .cal-nav-btn:first-child   { grid-area: prev; }
    .cal-toolbar > .cal-nav-btn:nth-of-type(2) { grid-area: next; justify-self: end; }
    .cal-month-label { grid-area: month; font-size: var(--text-sm); }

    .cal-today-chip {
        grid-area: today;
        width: 100%;
        margin-top: var(--space-1);
    }

    .cal-hint   { margin-top: 0; }
    .cal-header { gap: var(--space-3); }

    .cal-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-3);
        width: 100%;
    }

    .cal-stat {
        padding: var(--space-2) var(--space-3);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }
}
</style>
