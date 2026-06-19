<!-- src/components/features/DiagramsCard.vue -->

<template>
    <main class="main">
        
        <div v-if="!hasData" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h3>No data for {{ store.currMonthLabel }}</h3>
            <p>Add entries for this month to see your charts.</p>
        </div>

        <template v-else>

            <!-- Section: This Month -->
            <div class="section-label">This Month</div>
            <div class="charts-wide">
                <WeekBarChart />
                <RunningBalanceChart />
            </div>

            <div class="charts-grid">
                <DayDistributionChart />
                <DayLengthHistogramChart />
                <AbsenceBreakdownChart />
                <GrossEarningsChart v-if="store.grossHourlyRate > 0" />
                <p v-if="store.grossHourlyRate === 0"
                    style="color: var(--color-text-muted); font-size: var(--text-sm); border: 1px solid var(--color-border); padding: var(--space-4); border-radius: var(--space-2);">
                    Set your 'Gross Monthly Salary (Brutto)' in the <a href="/#/settings"
                        style="color: var(--color-link); text-decoration: underline;">settings</a> to see earnings
                    charts.
                </p>
            </div>

            <!-- Section: This Year -->
            <div class="section-label">This Year</div>
            <div class="charts-wide">
                <MonthOverviewChart />
                <MonthComparisonChart />
                <YearlyOvertimeChart />
                <YearlyGrossChart v-if="store.grossHourlyRate > 0" />
                <p v-if="store.grossHourlyRate === 0"
                    style="color: var(--color-text-muted); font-size: var(--text-sm); border: 1px solid var(--color-border); padding: var(--space-4); border-radius: var(--space-2);">
                    Set your 'Gross Monthly Salary (Brutto)' in the <a href="/#/settings"
                        style="color: var(--color-link); text-decoration: underline;">settings</a> to see earnings
                    charts.
                </p>
            </div>
        </template>
    </main>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useZeitwerkStore, chartExportTrigger } from '@/stores/zeitwerk'
import { useChartExport } from '@/composables/useChartExport'

import WeekBarChart from '@/components/charts/WeekBarChart.vue'
import MonthOverviewChart from '@/components/charts/MonthOverviewChart.vue'
import MonthComparisonChart from '@/components/charts/MonthComparisonChart.vue'
import YearlyOvertimeChart from '@/components/charts/YearlyOvertimeChart.vue'
import YearlyGrossChart from '@/components/charts/YearlyGrossChart.vue'
import DayDistributionChart from '@/components/charts/DayDistributionChart.vue'
import RunningBalanceChart from '@/components/charts/RunningBalanceChart.vue'
import AbsenceBreakdownChart from '@/components/charts/AbsenceBreakdownChart.vue'
import DayLengthHistogramChart from '@/components/charts/DayLengthHistogramChart.vue'
import GrossEarningsChart from '@/components/charts/GrossEarningsChart.vue'

const store = useZeitwerkStore()
const hasData = computed(() => store.entriesForMonth.length > 0)
const { exportAllCharts } = useChartExport()

// Triggered by the top-bar-button via `emit`
watch(chartExportTrigger, format => {
    if (format)
        exportAllCharts(format)
})
</script>

<style scoped>
/* Main Layout */
.main {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

/* Section Label */
.section-label {
    font-size: var(--text-xs, 0.75rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
    opacity: 0.6;
}

/* Charts */
.charts-wide {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

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

/* Responsive */
@media (max-width: 900px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 767px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-4);
    }
}
</style>
