<!-- src/components/charts/DayDistributionChart.vue -->

<template>
    <ChartCard title="Avg. Hours by Weekday" :subtitle="`${store.currMonthLabel} · Weekdays vs. Weekend`">
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
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayStats = computed(() =>
    DAY_NAMES.map((name, i) => {
        const entries = store.entriesForMonth.filter(e => {
            const dow = new Date(e.date + 'T00:00').getDay()

            return ((dow + 6) % 7) === i
        })
        const avg = entries.length
            ? parseFloat((entries.reduce((s, e) => s + store.effectiveActualHours(e), 0) / entries.length).toFixed(2))
            : 0
        return {
            name,
            avg,
            count: entries.length
        }
    })
)

const chartData = computed(() => ({
    labels: DAY_NAMES,
    datasets: [{
        label: 'Ø Hours',
        data: dayStats.value.map(d => d.avg),
        backgroundColor: dayStats.value.map((_, i) =>
            i < 5
                ? colors.value.primaryHL
                : colors.value.warningHL
        ),
        borderColor: dayStats.value.map((_, i) =>
            i < 5
                ? colors.value.primary
                : colors.value.warning
        ),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
    }]
}))

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        legend: { display: false },
        tooltip: {
            ...baseOptions.value.plugins.tooltip,
            callbacks: {
                label: ctx => {
                    const d = dayStats.value[ctx.dataIndex]
                    return [
                        ` Ø ${ctx.parsed.y}h`,
                        ` ${d.count} ${d.count === 1 ? 'entry' : 'entries'}`
                    ]
                }
            }
        }
    },
    scales: {
        ...baseOptions.value.scales,
        y: {
            ...baseOptions.value.scales.y,
            beginAtZero: true,
            max: 12,
            ticks: {
                ...baseOptions.value.scales.y.ticks,
                callback: v => `${v}h`
            }
        }
    }
}))
</script>
