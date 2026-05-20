<!-- src/components/charts/WeeklyComparisonChart.vue -->
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

const chartData = computed(() => ({
    labels: store.weekGroups.map(g => `KW ${g.kw}`),
    datasets: [
        {
            label: 'Planned',
            data: store.weekGroups.map(g => Number(g.planned.toFixed(2))),
            backgroundColor: 'rgba(0, 100, 148, 0.72)',
            borderRadius: 8,
            maxBarThickness: 28
        },
        {
            label: 'Actual',
            data: store.weekGroups.map(g => Number(g.actual.toFixed(2))),
            backgroundColor: 'rgba(1, 105, 111, 0.82)',
            borderRadius: 8,
            maxBarThickness: 28
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: {
            position: 'top',
            labels: { usePointStyle: true, boxWidth: 10, color: getComputedStyle(document.documentElement).getPropertyValue('--color-text') }
        },
        tooltip: {
            callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} h`
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted') }
        },
        y: {
            beginAtZero: true,
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
    <Bar :data="chartData" :options="chartOptions" aria-label="Weekly comparison of planned and actual hours"
        role="img" />
</template>