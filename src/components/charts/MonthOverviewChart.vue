<!-- src/components/charts/MonthOverviewChart.vue -->

<template>
    <ChartCard title="12-Month Overview" subtitle="Actual · Planned · Difference" wide tall>
        <Bar :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, LineElement, PointElement, Tooltip, Legend, Filler
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { MONTH_NAMES } from '@/composables/useTime'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const monthlyData = computed(() => {
    return Array.from({ length: 12 }, (_, i) => {
        let month = store.currMonth - 11 + i
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
        const diff = parseFloat((actual - planned).toFixed(2))

        return {
            label: MONTH_NAMES[month].slice(0, 3),
            actual,
            planned,
            diff
        }
    })
})

const chartData = computed(() => ({
    labels: monthlyData.value.map(data => data.label),
    datasets: [
        {
            type: 'bar',
            label: 'Actual (h)',
            data: monthlyData.value.map(data => data.actual),
            backgroundColor: colors.value.primaryHL,
            borderColor: colors.value.primary,
            borderWidth: 2,
            borderRadius: 5,
            borderSkipped: false,
            order: 2,
        },
        {
            type: 'bar',
            label: 'Planned (h)',
            data: monthlyData.value.map(data => data.planned),
            backgroundColor: colors.value.border,
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 5,
            borderSkipped: false,
            order: 3,
        },
        {
            type: 'line',
            label: 'Difference (h)',
            data: monthlyData.value.map(data => data.diff),
            borderColor: colors.value.warning,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: monthlyData.value.map(data =>
                data.diff >= 0 ? colors.value.success : colors.value.error
            ),
            tension: 0.4,
            fill: false,
            order: 1,
            yAxisID: 'diff',
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
                    const data = monthlyData.value[ctx.dataIndex]
                    if (ctx.dataset.label === 'Difference (h)')
                        return ` Diff: ${data.diff >= 0 ? '+' : ''}${data.diff}h`

                    return ` ${ctx.dataset.label}: ${ctx.parsed.y}h`
                }
            }
        }
    },
    scales: {
        ...baseOptions.value.scales,
        y: {
            ...baseOptions.value.scales.y,
            beginAtZero: true,
            ticks: { ...baseOptions.value.scales.y.ticks, callback: v => `${v}h` }
        },
        diff: {
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: {
                color: colors.value.textMuted,
                font: { family: 'Inter', size: 11 },
                callback: v => `${v >= 0 ? '+' : ''}${v}h`
            }
        }
    }
}))
</script>
