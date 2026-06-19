<!-- src/components/charts/RunningBalanceChart.vue -->

<template>
    <ChartCard title="Running Balance" :subtitle="`Cumulative overtime · ${store.currMonthLabel}`">
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
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const cumulative = computed(() => {
    let running = 0

    return [...store.entriesForMonth]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(entry => {
            const planned = entry.plannedHours || store.settings.hoursPerDay
            const actual = store.effectiveActualHours(entry)
            running += actual - planned

            return {
                label: new Date(entry.date + 'T00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
                value: parseFloat(running.toFixed(2))
            }
        })
})

const chartData = computed(() => {
    const vals = cumulative.value.map(d => d.value)

    return {
        labels: cumulative.value.map(d => d.label),
        datasets: [{
            label: 'Balance (h)',
            data: vals,
            borderColor: ctx => {
                const last = vals[vals.length - 1] ?? 0
                return last >= 0 ? colors.value.success : colors.value.error
            },
            backgroundColor: ctx => {
                const chart = ctx.chart
                const { ctx: c, chartArea } = chart
                if (!chartArea) return colors.value.successHL
                const last = vals[vals.length - 1] ?? 0
                const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
                if (last >= 0) {
                    gradient.addColorStop(0, colors.value.success + '33')
                    gradient.addColorStop(1, colors.value.success + '00')
                } else {
                    gradient.addColorStop(0, colors.value.error + '33')
                    gradient.addColorStop(1, colors.value.error + '00')
                }

                return gradient
            },
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
        }]
    }
})

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        legend: { display: false },
        tooltip: {
            ...baseOptions.value.plugins.tooltip,
            callbacks: {
                label: ctx => ` ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}h`
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
