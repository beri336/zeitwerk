<!-- src/views/DiagramsView.vue -->

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
                    <div class="kpi-mini-value">{{ store.monthDiff >= 0 ? '+' : '' }}{{ formatHours(store.monthDiff) }}
                    </div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="charts-grid">
                <ChartCard title="Weekly Planned vs Actual"
                    subtitle="Compare planned and actual hours for each calendar week" large>
                    <WeeklyComparisonChart />
                </ChartCard>

                <ChartCard title="Running Balance"
                    subtitle="See how your overtime or deficit develops through the month" large>
                    <RunningBalanceChart />
                </ChartCard>

                <ChartCard title="Weekday Pattern" subtitle="Average actual hours grouped by weekday">
                    <WeekdayPatternChart />
                </ChartCard>

                <ChartCard title="Absence Breakdown"
                    subtitle="Distribution of work, vacation, sick days and other types">
                    <AbsenceBreakdownChart />
                </ChartCard>

                <ChartCard title="Day Length Distribution"
                    subtitle="How often short, regular or long working days occurred">
                    <DayLengthHistogramChart />
                </ChartCard>

                <!-- Wide Charts -->
                <ChartCard title="Week Bar Chart" subtitle="Actual hours per week, color-coded by performance" wide
                    large>
                    <WeekBarChart />
                </ChartCard>

                <ChartCard title="Month Overview" subtitle="Overview of actual and planned hours across the month" wide
                    large>
                    <MonthOverviewChart />
                </ChartCard>

                <ChartCard title="Day Distribution" subtitle="Distribution of actual working time across the days" wide
                    large>
                    <DayDistributionChart />
                </ChartCard>

                <GrossEarningsChart v-if="store.grossHourlyRate > 0" :items="store.weekGrossGroups" />
            </div>
        </template>
    </main>
</template>

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, calcActualHours } from '@/composables/useTime'
import WeekBarChart from '@/components/charts/WeekBarChart.vue'
import MonthOverviewChart from '@/components/charts/MonthOverviewChart.vue'
import DayDistributionChart from '@/components/charts/DayDistributionChart.vue'

import ChartCard from '@/components/charts/ChartCard.vue'
import WeeklyComparisonChart from '@/components/charts/WeeklyComparisonChart.vue'
import RunningBalanceChart from '@/components/charts/RunningBalanceChart.vue'
import WeekdayPatternChart from '@/components/charts/WeekdayPatternChart.vue'
import AbsenceBreakdownChart from '@/components/charts/AbsenceBreakdownChart.vue'
import DayLengthHistogramChart from '@/components/charts/DayLengthHistogramChart.vue'

import GrossEarningsChart from '@/components/charts/GrossEarningsChart.vue'

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

    return store.entriesForMonth.reduce((max, entry) => {
        if (!max) return entry
        return calcActualHours(entry) > calcActualHours(max) ? entry : max
    }, null)
})

const activeDays = computed(() => {
    return store
        .entriesForMonth
        .filter(entry => store.effectiveActualHours(entry) > 0)
        .length
})
</script>

<style scoped>
/* Main Layout */
.main {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

/* KPI Row */
.kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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

.kpi-mini-sub {
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
}

.kpi-ok .kpi-mini-value  { color: var(--color-success); }
.kpi-err .kpi-mini-value { color: var(--color-error); }

/* Charts */
.charts-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
}

/* Empty State */
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

/* Tablet */
@media (max-width: 900px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}
</style>
