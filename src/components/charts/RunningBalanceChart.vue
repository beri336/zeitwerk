<!-- src/components/charts/RunningBalanceChart.vue -->
<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { useZeitwerkStore } from '@/stores/zeitwerk'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const store = useZeitwerkStore()

const cumulative = computed(() => {
    let running = 0
    const sorted = [...store.entriesForMonth].sort((a, b) => a.date.localeCompare(b.date))

    return sorted.map(entry => {
        const planned = entry.plannedHours || store.settings.hoursPerDay
        const actual = store.effectiveActualHours(entry)
        running += actual - planned
        return {
            label: new Date(entry.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            value: Number(running.toFixed(2))
        }
    })
})

const chartData = computed(() => ({
    labels: cumulative.value.map(d => d.label),
    datasets: [
        {
            label: 'Running balance',
            data: cumulative.value.map(d => d.value),
            borderColor: '#01696f',
            backgroundColor: 'rgba(1, 105, 111, 0.14)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: ctx => `${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)} h`
            }
        }
    },
    scales: {
        x: {
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted') },
            grid: { display: false }
        },
        y: {
            ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted'),
                callback: value => `${value} h`
            },
            grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-divider')
            }
        }
    }
}))
</script>

<template>
    <Line :data="chartData" :options="chartOptions"
        aria-label="Running balance of planned versus actual working hours over the month" role="img" />
</template>