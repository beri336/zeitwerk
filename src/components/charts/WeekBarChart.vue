<!-- src/components/charts/WeekBarChart.vue -->

<template>
    <ChartCard title="Actual vs. Planned" :subtitle="`${store.weekGroups.length} weeks · ${store.currMonthLabel}`">
        <Bar :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, LineElement, PointElement, Tooltip, Legend
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const chartData = computed(() => ({
    labels: store.weekGroups.map(g => `KW ${g.kw}`),
    datasets: [
        {
            type: 'bar',
            label: 'Actual (h)',
            data: store.weekGroups.map(g => parseFloat(g.actual.toFixed(2))),
            backgroundColor: colors.value.primaryHL,
            borderColor: colors.value.primary,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            order: 2,
        },
        {
            type: 'line',
            label: 'Planned (h)',
            data: store.weekGroups.map(g => parseFloat(g.planned.toFixed(2))),
            borderColor: colors.value.textMuted,
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0,
            order: 1,
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
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}h`
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
