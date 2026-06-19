<!-- src/components/charts/YearlyGrossChart.vue -->

<template>
    <ChartCard v-if="store.grossHourlyRate > 0" title="Yearly Gross Earnings"
        :subtitle="`${store.currYear} · Total: ${mask(formatEur(totalGross))}`" wide>
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
import { usePrivacy } from '@/composables/usePrivacy'
import { MONTH_NAMES } from '@/composables/useTime'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()
const { mask } = usePrivacy()

const monthlyGross = computed(() =>
    Array.from({ length: 12 }, (_, i) => {
        const entries = store.entries.filter(e => {
            const date = new Date(e.date)

            return date.getFullYear() === store.currYear && date.getMonth() === i
        })

        const gross = entries.reduce((s, e) => s + store.grossEarnedForEntry(e), 0)
        return {
            label: MONTH_NAMES[i].slice(0, 3),
            gross: parseFloat(gross.toFixed(2)),
            hasData: entries.length > 0
        }
    }).filter((_, i) => i <= store.currMonth)
)

const totalGross = computed(() =>
    monthlyGross.value.reduce((s, m) => s + m.gross, 0)
)

function formatEur(v) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(v)
}

const chartData = computed(() => ({
    labels: monthlyGross.value.map(m => m.label),
    datasets: [
        {
            type: 'bar',
            label: 'Gross (€)',
            data: monthlyGross.value.map(m => m.gross),
            backgroundColor: colors.value.successHL,
            borderColor: colors.value.success,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            order: 2,
        },
        {
            type: 'line',
            label: 'Trend',
            data: monthlyGross.value.map(m => m.gross),
            borderColor: colors.value.warning,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: false,
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
                label: ctx =>
                    ctx.dataset.label === 'Trend'
                        ? null
                        : ` ${mask(formatEur(ctx.parsed.y))}`
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
                callback: v => mask(formatEur(v))
            }
        }
    }
}))
</script>
