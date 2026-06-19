<!-- src/components/charts/WeekdayPatternChart.vue -->

<template>
    <Bar :data="chartData" :options="chartOptions" aria-label="Average actual working hours by weekday" role="img" />
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = useZeitwerkStore()
const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const weekdayMap = computed(() => {
    const buckets = Array.from({ length: 7 }, () => [])

    for (const entry of store.entriesForMonth) {
        const jsDay = new Date(entry.date).getDay()
        const idx = (jsDay + 6) % 7
        buckets[idx].push(store.effectiveActualHours(entry))
    }
    return buckets.map(items => {
        if (!items.length)
            return 0

        return Number((items.reduce((a, b) => a + b, 0) / items.length).toFixed(2))
    })
})

const chartData = computed(() => ({
    labels,
    datasets: [
        {
            label: 'Avg hours',
            data: weekdayMap.value,
            backgroundColor: 'rgba(67, 122, 34, 0.82)',
            borderRadius: 8,
            maxBarThickness: 28
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true }
    }
}
</script>
