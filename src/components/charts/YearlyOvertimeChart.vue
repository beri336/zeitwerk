<!-- src/components/charts/YearlyOvertimeChart.vue -->

<template>
    <ChartCard title="Yearly Overtime Balance" :subtitle="`Cumulative overtime · ${store.currYear}`" wide>
        <Line :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { MONTH_NAMES } from '@/composables/useTime'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const data = computed(() => {
    let running = 0

    return Array.from({ length: 12 }, (_, i) => {
        const entries = store.entries.filter(entry => {
            const date = new Date(entry.date)

            return date.getFullYear() === store.currYear && date.getMonth() === i
        })
        const actual = entries.reduce((s, e) => s + store.effectiveActualHours(e), 0)
        const planned = entries.reduce((s, e) => s + (e.plannedHours || store.settings.hoursPerDay), 0)
        running += actual - planned

        return {
            label: MONTH_NAMES[i].slice(0, 3),
            cumulative: parseFloat(running.toFixed(2)),
            monthly: parseFloat((actual - planned).toFixed(2)),
            hasData: entries.length > 0
        }
    })
})

// show only months with data
const visibleData = computed(() => data.value.filter((_, i) => {
    // display up to the current month
    return i <= store.currMonth
}))

const chartData = computed(() => ({
    labels: visibleData.value.map(d => d.label),
    datasets: [
        {
            type: 'line',
            label: 'Cumulative (h)',
            data: visibleData.value.map(d => d.cumulative),
            borderColor: ctx => {
                const last = visibleData.value[visibleData.value.length - 1]?.cumulative ?? 0

                return last >= 0
                    ? colors.value.success
                    : colors.value.error
            },
            backgroundColor: ctx => {
                const chart = ctx.chart
                const { ctx: c, chartArea } = chart

                if (!chartArea)
                    return colors.value.successHL

                const last = visibleData.value[visibleData.value.length - 1]?.cumulative ?? 0
                const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)

                if (last >= 0) {
                    gradient.addColorStop(0, colors.value.success + '44')
                    gradient.addColorStop(1, colors.value.success + '00')
                } else {
                    gradient.addColorStop(0, colors.value.error + '44')
                    gradient.addColorStop(1, colors.value.error + '00')
                }

                return gradient
            },
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: visibleData.value.map(data =>
                data.cumulative >= 0
                    ? colors.value.success
                    : colors.value.error
            ),
            borderWidth: 2,
            order: 1,
            yAxisID: 'y',
        },
        {
            type: 'bar',
            label: 'Monthly diff (h)',
            data: visibleData.value.map(data => data.monthly),
            backgroundColor: visibleData.value.map(data =>
                data.monthly >= 0 ? colors.value.primaryHL : colors.value.errorHL
            ),
            borderColor: visibleData.value.map(data =>
                data.monthly >= 0 ? colors.value.primary : colors.value.error
            ),
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
            order: 2,
            yAxisID: 'y',
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
                    const data = visibleData.value[ctx.dataIndex]

                    if (ctx.dataset.label === 'Cumulative (h)')
                        return ` Total: ${data.cumulative >= 0 ? '+' : ''}${data.cumulative}h`

                    return ` Month: ${data.monthly >= 0 ? '+' : ''}${data.monthly}h`
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
                callback: v => `${v >= 0 ? '+' : ''}${v}h`
            }
        }
    }
}))
</script>
