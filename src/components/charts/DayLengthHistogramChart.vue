<!-- src/components/charts/DayLengthHistogramChart.vue -->
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

const bucketLabels = ['<4h', '4–6h', '6–8h', '8–10h', '10h+']

const buckets = computed(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const entry of store.entriesForMonth) {
        const h = store.effectiveActualHours(entry)
        if (h < 4) counts[0]++
        else if (h < 6) counts[1]++
        else if (h < 8) counts[2]++
        else if (h < 10) counts[3]++
        else counts[4]++
    }
    return counts
})

const chartData = computed(() => ({
    labels: bucketLabels,
    datasets: [
        {
            label: 'Days',
            data: buckets.value,
            backgroundColor: 'rgba(0, 100, 148, 0.82)',
            borderRadius: 8,
            maxBarThickness: 34
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
        y: { beginAtZero: true, ticks: { precision: 0 } }
    }
}
</script>

<template>
    <Bar :data="chartData" :options="chartOptions"
        aria-label="Distribution of day lengths in hours for the current month" role="img" />
</template>