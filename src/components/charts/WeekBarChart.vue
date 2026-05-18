<!-- src/components/charts/WeekBarChart.vue -->

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const chartData = computed(() => ({
    labels: store.weekGroups.map(g => `KW ${g.kw}`),
    datasets: [
            {
                label: 'Actual (h)',
                data: store.weekGroups.map(g => parseFloat(g.actual.toFixed(2))),
            backgroundColor: colors.value.primaryHL,
            borderColor: colors.value.primary,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false
        },
        {
            label: 'Planned (h)',
            data: store.weekGroups.map(g => parseFloat(g.planned.toFixed(2))),
            backgroundColor: 'transparent',
            borderColor: colors.value.border,
            borderWidth: 2,
            borderDash: [4, 4],
            borderRadius: 6,
            borderSkipped: false,
            type: 'line',
            pointRadius: 0
        }
    ]
}))

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        title: {
            display: true,
            text: 'Actual vs. Planned pro Woche',
            color: colors.value.text,
            font: { family: 'Inter', size: 14, weight: '600' },
            padding: { bottom: 16 }
        },
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

<template>
    <div class="chart-card">
        <div class="chart-wrap">
            <Bar :data="chartData" :options="options" />
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
