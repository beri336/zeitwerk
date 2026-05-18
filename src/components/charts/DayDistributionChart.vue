<!-- src/components/charts/DayDistributionChart.vue -->

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { calcActualHours } from '@/composables/useTime'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayStats = computed(() => {
    // Index 0 = Mon, 6 = Sun
    const totals = Array(7).fill(0)
    const counts = Array(7).fill(0)

    store.entriesForMonth.forEach(e => {
        const dow = new Date(e.date + 'T00:00:00').getDay() // 0=Sun
        
        const index = dow === 0 ? 6 : dow - 1                  // Mon=0
        totals[index] += calcActualHours(e)
        counts[index]++
    })

    return DAY_NAMES.map((name, index) => ({
        name,
        avg: counts[index] > 0 ? parseFloat((totals[index] / counts[index]).toFixed(2)) : 0,
        count: counts[index]
    }))
})

const chartData = computed(() => ({
    labels: dayStats.value.map(d => d.name),
    datasets: [{
        label: 'Ø Hours',
        data: dayStats.value.map(d => d.avg),
        backgroundColor: dayStats.value.map((_, index) =>
            index < 5 ? colors.value.primaryHL : colors.value.successHL
        ),
        borderColor: dayStats.value.map((_, index) =>
            index < 5 ? colors.value.primary : colors.value.success
        ),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
    }]
}))

const options = computed(() => ({
    ...baseOptions.value,
    plugins: {
        ...baseOptions.value.plugins,
        title: {
            display: true,
            text: 'Ø Hours per Weekday',
            color: colors.value.text,
            font: { family: 'Inter', size: 14, weight: '600' },
            padding: { bottom: 16 }
        },
        tooltip: {
            ...baseOptions.value.plugins.tooltip,
            callbacks: {
                label: ctx => {
                    const d = dayStats.value[ctx.dataIndex]
                    return [
                        ` Ø ${ctx.parsed.y}h`,
                        ` ${d.count} Entries`
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
