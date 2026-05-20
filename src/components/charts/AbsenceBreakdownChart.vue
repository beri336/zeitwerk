<!-- src/components/charts/AbsenceBreakdownChart.vue -->
<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useZeitwerkStore()

const breakdown = computed(() => {
    const map = new Map()
    for (const entry of store.entriesForMonth) {
        const type = entry.typ || 'on-site'
        map.set(type, (map.get(type) || 0) + 1)
    }
    return Array.from(map.entries())
})

const palette = {
    work: '#01696f',
    vacation: '#d19900',
    sick: '#a12c7b',
    holiday: '#006494',
    other: '#964219'
}

const chartData = computed(() => ({
    labels: breakdown.value.map(([label]) => label),
    datasets: [
        {
            data: breakdown.value.map(([, count]) => count),
            backgroundColor: breakdown.value.map(([label]) => palette[label] || '#7a7974'),
            borderWidth: 0
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 10 }
        }
    }
}
</script>

<template>
    <Doughnut :data="chartData" :options="chartOptions"
        aria-label="Breakdown of work and absence entry types for the current month" role="img" />
</template>