<!-- src/components/charts/DayLengthHistogramChart.vue -->

<template>
    <ChartCard title="Day Length Distribution" :subtitle="`How long were your workdays · ${store.currMonthLabel}`">
        <Bar :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Tooltip
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const BUCKETS = [
    { label: '< 4h', min: 0, max: 4 },
    { label: '4 – 6h', min: 4, max: 6 },
    { label: '6 – 8h', min: 6, max: 8 },
    { label: '8 – 10h', min: 8, max: 10 },
    { label: '> 10h', min: 10, max: Infinity },
]

const buckets = computed(() => {
    const counts = BUCKETS.map(() => 0)
    for (const entry of store.entriesForMonth) {
        const h = store.effectiveActualHours(entry)
        const i = BUCKETS.findIndex(b => h >= b.min && h < b.max)

        if (i >= 0)
            counts[i]++
    }
    return counts
})

const chartData = computed(() => ({
    labels: BUCKETS.map(b => b.label),
    datasets: [{
        label: 'Days',
        data: buckets.value,
        backgroundColor: buckets.value.map((_, i) => {
            const palette = [
                colors.value.errorHL,
                colors.value.warningHL,
                colors.value.primaryHL,
                colors.value.successHL,
                colors.value.error + '33',
            ]
            return palette[i]
        }),
        borderColor: buckets.value.map((_, i) => {
            const palette = [
                colors.value.error,
                colors.value.warning,
                colors.value.primary,
                colors.value.success,
                colors.value.error,
            ]
            return palette[i]
        }),
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
                label: ctx => ` ${ctx.parsed.y} ${ctx.parsed.y === 1 ? 'day' : 'days'}`
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
                precision: 0,
                callback: v => `${v}d`
            }
        }
    }
}))
</script>
