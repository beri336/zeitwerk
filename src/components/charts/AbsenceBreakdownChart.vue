<!-- src/components/charts/AbsenceBreakdownChart.vue -->

<template>
    <ChartCard title="Entry Breakdown" :subtitle="`${total} entries · ${store.currMonthLabel}`">
        <div class="donut-wrap">
            <Doughnut :data="chartData" :options="options" />
            <!-- Center Label -->
            <div class="donut-center">
                <span class="donut-value">{{ total }}</span>
                <span class="donut-label">{{ $t('diagrams.days') }}</span>
            </div>
        </div>
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useI18n } from 'vue-i18n'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import ChartCard from './ChartCard.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const { t } = useI18n()
const store = useZeitwerkStore()
const { colors } = useChartTheme()

const TYPE_LABELS = {
    'on-site': 'On-Site',
    'homeoffice': 'Homeoffice',
    'vacation': 'Vacation',
    'sick': 'Sick',
    'publicholiday': 'Public Holiday',
    'other': 'Other',
}

const TYPE_COLORS = {
    'on-site': '#6366f1',
    'homeoffice': '#06b6d4',
    'vacation': '#f59e0b',
    'sick': '#ef4444',
    'publicholiday': '#22c55e',
    'other': '#94a3b8',
}

const breakdown = computed(() => {
    const map = new Map()

    for (const entry of store.entriesForMonth) {
        const type = entry.typ || 'on-site'
        map.set(type, (map.get(type) || 0) + 1)
    }
    return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
})

const total = computed(() => breakdown.value.reduce((s, [, n]) => s + n, 0))

const chartData = computed(() => ({
    labels: breakdown.value.map(([t]) => TYPE_LABELS[t] ?? t),
    datasets: [{
        data: breakdown.value.map(([, n]) => n),
        backgroundColor: breakdown.value.map(([t]) => TYPE_COLORS[t] ?? colors.value.border),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 6,
    }]
}))

const options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
                padding: 14,
                color: colors.value.textMuted,
                font: { family: 'Inter', size: 12 }
            }
        },
        tooltip: {
            backgroundColor: colors.value.surface,
            borderColor: colors.value.border,
            borderWidth: 1,
            titleColor: colors.value.text,
            bodyColor: colors.value.textMuted,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
                label: ctx => {
                    const pct = total.value ? Math.round((ctx.parsed / total.value) * 100) : 0
                    return ` ${ctx.parsed} days (${pct}%)`
                }
            }
        }
    }
}))
</script>

<style scoped>
.donut-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-center {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -62%);
}

.donut-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
}

.donut-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-top: 2px;
}
</style>
