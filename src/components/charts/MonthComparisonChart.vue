<!-- src/components/charts/MonthComparisonChart.vue -->

<template>
    <ChartCard title="6-Month Comparison" subtitle="Actual vs. Planned · last 6 months" wide>
        <Bar :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Tooltip, Legend
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { MONTH_NAMES } from '@/composables/useTime'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const MONTHS_BACK = 6

const data = computed(() =>
    Array.from({ length: MONTHS_BACK }, (_, i) => {
        let month = store.currMonth - (MONTHS_BACK - 1) + i
        let year = store.currYear

        if (month < 0) {
            month += 12
            year--
        }

        const entries = store.entries.filter(e => {
            const date = new Date(e.date)

            return date.getFullYear() === year && date.getMonth() === month
        })

        const actual = parseFloat(entries.reduce((s, e) => s + store.effectiveActualHours(e), 0).toFixed(2))
        const planned = parseFloat(entries.reduce((s, e) => s + (e.plannedHours || store.settings.hoursPerDay), 0).toFixed(2))

        return {
            label: `${MONTH_NAMES[month].slice(0, 3)} ${year !== store.currYear ? year : ''}`.trim(),
            actual,
            planned,
            isCurrent: month === store.currMonth && year === store.currYear
        }
    })
)

const chartData = computed(() => ({
    labels: data.value.map(d => d.label),
    datasets: [
        {
            label: 'Actual (h)',
            data: data.value.map(d => d.actual),
            backgroundColor: data.value.map(d =>
                d.isCurrent ? colors.value.primary : colors.value.primaryHL
            ),
            borderColor: colors.value.primary,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
        },
        {
            label: 'Planned (h)',
            data: data.value.map(d => d.planned),
            backgroundColor: 'transparent',
            borderColor: colors.value.border,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            borderDash: [5, 4],
            type: 'line',
            pointRadius: 0,
            fill: false,
            tension: 0,
        }
    ]
}))

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        tooltip: {
            ...baseOptions.value.plugins.tooltip,
            callbacks: {
                label: ctx => {
                    const d = data.value[ctx.dataIndex]
                    if (ctx.dataset.label === 'Actual (h)')
                        return [
                            ` Actual: ${d.actual}h`,
                            ` Diff: ${d.actual - d.planned >= 0 ? '+' : ''}${(d.actual - d.planned).toFixed(2)}h`
                        ]
                    return ` Planned: ${d.planned}h`
                }
            }
        }
    },
    scales: {
        ...baseOptions.value.scales,
        y: {
            ...baseOptions.value.scales.y,
            beginAtZero: true,
            ticks: {
                ...baseOptions.value.scales.y.ticks,
                callback: v => `${v}h`
            }
        }
    }
}))
</script>
