<!-- src/components/charts/MonthOverviewChart.vue -->

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { calcActualHours, MONTH_NAMES } from '@/composables/useTime'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

// Calculate Overtime/Missed Hours for the last 12 months
const monthlyData = computed(() => {
    const results = []

    for (let i = 11; i >= 0; i--) {
        let month = store.currMonth - i
        let year = store.currYear
        if (month < 0) {
            month += 12;
            year--
        }

        const monthEntries = store.entries.filter(entry => {
            const date = new Date(entry.date)
            return date.getFullYear() === year && date.getMonth() === month
        })

        const actual = monthEntries.reduce((a, entry) => a + calcActualHours(entry), 0)
        const planned = monthEntries.reduce((a, entry) => a + (entry.plannedHours || store.settings.hoursPerDay), 0)

        results.push({ label: MONTH_NAMES[month].slice(0, 3), diff: parseFloat((actual - planned).toFixed(2)), ist: parseFloat(actual.toFixed(2)), soll: parseFloat(planned.toFixed(2)) })
    }
    return results
})

const chartData = computed(() => ({
    labels: monthlyData.value.map(d => d.label),

    datasets: [
        {
            label: 'Overtime (h)',
            data: monthlyData.value.map(d => d.diff),
            borderColor: colors.value.primary,
            backgroundColor: ctx => {
                const canvas = ctx.chart.canvas
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, canvas.height)
                gradient.addColorStop(0, colors.value.primaryHL + 'cc')
                gradient.addColorStop(1, colors.value.primaryHL + '00')
                return gradient
            },
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: colors.value.primary,
            tension: 0.4,
            fill: true
        }
    ]
}))

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        title: {
            display: true,
            text: 'Overtime-History (12 Months)',
            color: colors.value.text,
            font: { family: 'Inter', size: 14, weight: '600' },
            padding: { bottom: 16 }
        },
        tooltip: {
            ...baseOptions.value.plugins.tooltip,
            callbacks: {
                label: ctx => {
                    const d = monthlyData.value[ctx.dataIndex]
                    return [
                        ` Difference: ${ctx.parsed.y}h`,
                        ` Actual: ${d.ist}h`,
                        ` Planned: ${d.soll}h`
                    ]
                }
            }
        }
    },
    scales: {
        ...baseOptions.value.scales,
        y: {
            ...baseOptions.value.scales.y,
            ticks: {
                ...baseOptions.value.scales.y.ticks,
                callback: v => `${v > 0 ? '+' : ''}${v}h`
            }
        }
    }
}))
</script>

<template>
    <div class="chart-card">
        <div class="chart-wrap">
            <Line :data="chartData" :options="options" />
        </div>
    </div>
</template>

<style scoped>
.chart-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    box-shadow: var(--shadow-sm);
}

.chart-wrap {
    height: 280px;
}
</style>
