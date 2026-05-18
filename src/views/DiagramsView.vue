<!-- src/views/DiagramsView.vue -->

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, calcActualHours } from '@/composables/useTime'
import WeekBarChart from '@/components/charts/WeekBarChart.vue'
import MonthOverviewChart from '@/components/charts/MonthOverviewChart.vue'
import DayDistributionChart from '@/components/charts/DayDistributionChart.vue'

const store = useZeitwerkStore()

const hasData = computed(() => store.entriesForMonth.length > 0)

const avgPerDay = computed(() => {
    if (!store.entriesForMonth.length)
        return 0

    return store.monthActual / store.entriesForMonth.length
})

const longestDay = computed(() => {
    if (!store.entriesForMonth.length)
        return null

    return store.entriesForMonth.reduce((max, e) => {
        if (!max) return e
        return calcActualHours(e) > calcActualHours(max) ? e : max
    }, null)
})
</script>

<template>
    <main class="main">
        <div v-if="!hasData" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h3>No data for {{ store.currentMonthLabel }}</h3>
            <p>First, enter entries for the month to view the charts.</p>
        </div>

        <template v-else>
            <!-- Summary KPIs -->
            <div class="kpi-row">
                <div class="kpi-mini">
                    <div class="kpi-mini-label">Ø Hours / Day</div>
                    <div class="kpi-mini-value">{{ formatHours(avgPerDay) }}</div>
                </div>
                <div class="kpi-mini">
                    <div class="kpi-mini-label">Month Actual</div>
                    <div class="kpi-mini-value">{{ formatHours(store.monthActual) }}</div>
                </div>
                <div class="kpi-mini">
                    <div class="kpi-mini-label">Month Planned</div>
                    <div class="kpi-mini-value">{{ formatHours(store.monthPlanned) }}</div>
                </div>
                <div class="kpi-mini" :class="store.monthDiff >= 0 ? 'kpi-ok' : 'kpi-err'">
                    <div class="kpi-mini-label">Difference</div>
                    <div class="kpi-mini-value">{{ store.monthDiff >= 0 ? '+' : '' }}{{ formatHours(store.monthDiff) }}</div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="charts-grid">
                <WeekBarChart />
                <MonthOverviewChart />
                <DayDistributionChart />
            </div>
        </template>
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
    gap: var(--space-6);
}

.kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-4);
}

.kpi-mini {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);
}

.kpi-mini-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: var(--space-2);
    font-weight: 500;
}

.kpi-mini-value {
    font-size: var(--text-lg);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.kpi-ok .kpi-mini-value {
    color: var(--color-success);
}

.kpi-err .kpi-mini-value {
    color: var(--color-error);
}

.charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
}

.charts-grid> :last-child {
    grid-column: 1 / -1;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-12) var(--space-8);
    color: var(--color-text-muted);
}

.empty-icon {
    width: 48px;
    height: 48px;
    color: var(--color-text-faint);
    margin-bottom: var(--space-4);
}

.empty-state h3 {
    color: var(--color-text);
    margin-bottom: var(--space-2);
    font-size: var(--text-base);
}

.empty-state p {
    max-width: 36ch;
    font-size: var(--text-sm);
}

@media (max-width: 768px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }

    .charts-grid> :last-child {
        grid-column: auto;
    }
}
</style>
