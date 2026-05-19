<!-- src/views/CalenderView.vue -->

<script setup>
import { computed, ref } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours } from '@/composables/useTime'
import CalenderDay from '@/components/CalenderDay.vue'
import EntryModal from '@/components/EntryModal.vue'

const store = useZeitwerkStore()

const showModal = ref(false)
const editEntry = ref(null)
const clickedDate = ref(null)

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Builds the calendar grid for the current month
const calendarDays = computed(() => {
    const year = store.currYear
    const month = store.currMonth

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week of the 1st (Mon=0, Sun=6)
    const startDow = (firstDay.getDay() + 6) % 7

    const days = []
    const pad = n => String(n).padStart(2, '0')
    const format = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    // Previous days (last month)
    for (let i = startDow - 1; i >= 0; i--) {
        const date = new Date(year, month, -i)
        days.push({ date: format(date), outside: true })
    }

    // Days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: format(new Date(year, month, d)), outside: false })
    }

    // Following days to fill up to 42 cells (6 weeks)
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

function onDayClick(date) {
    const existing = store.entries.find(e => e.date === date)
    clickedDate.value = date

    if (existing) {
        editEntry.value = existing
    } else {
        editEntry.value = null
        // Pre-fill the date
        clickedDate.value = date
    }
    showModal.value = true
}

// Monthly statistics for the header
const workdays = computed(() =>
    calendarDays.value.filter(d => {
        if (d.outside)
            return false
        
        const dow = new Date(d.date + 'T00:00:00').getDay()
        return dow !== 0 && dow !== 6
    }).length
)
</script>

<template>
    <main class="main">
        <!-- Monthly total header -->
        <div class="cal-header">
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
            <div class="cal-hint">Click on a day to add or edit an entry</div>
        </div>

        <!-- Weekday header -->
        <div class="cal-grid">
            <div v-for="h in DAY_HEADERS" :key="h" class="cal-weekday"
                :class="{ 'cal-weekday--weekend': h === 'Sa' || h === 'So' }">
                {{ h }}
            </div>

            <!-- Days -->
            <CalenderDay v-for="day in calendarDays" :key="day.date" :date="day.date" :is-today="day.date === todayStr"
                :is-outside="day.outside" @click="onDayClick" />
        </div>

        <!-- Modal — Pre-fill the date -->
        <EntryModal v-model="showModal" :edit-entry="editEntry" :prefill-date="clickedDate" />
    </main>
</template>

<style scoped>
.main {
    grid-column: 2;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

/* Header */
.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
}

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

.stat-ok {
    color: var(--color-success);
}

.stat-err {
    color: var(--color-error);
}

.cal-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
}

/* Grid */
.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
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

@media (max-width: 900px) {
    .cal-grid {
        gap: var(--space-1);
    }

    .cal-hint {
        display: none;
    }
}
</style>
