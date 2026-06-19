<!-- src/components/charts/GrossEarningsChart.vue -->

<template>
    <ChartCard v-if="store.grossHourlyRate > 0" title="Gross Earnings by Week"
        :subtitle="`${store.currMonthLabel} · Privacy-masked`">
        <Bar :data="chartData" :options="options" />
    </ChartCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Tooltip, Legend
} from 'chart.js'

import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useChartTheme } from '@/composables/useChartTheme'
import { usePrivacy } from '@/composables/usePrivacy'
import ChartCard from './ChartCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = useZeitwerkStore()
const { colors, baseOptions } = useChartTheme()
const { mask } = usePrivacy()

const weekData = computed(() =>
    store.weekGroups.map(g => {
        const gross = (g.entries ?? []).reduce(
            (s, e) => s + store.grossEarnedForEntry(e), 0
        )
        return {
            kw: g.kw,
            gross: parseFloat(gross.toFixed(2)),
            actual: g.actual,
        }
    })
)

const chartData = computed(() => ({
    labels: weekData.value.map(w => `KW ${w.kw}`),
    datasets: [{
        label: 'Gross (€)',
        data: weekData.value.map(w => parseFloat((w.gross ?? 0).toFixed(2))),
        backgroundColor: colors.value.successHL,
        borderColor: colors.value.success,
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
                label: ctx => ` ${mask(new Intl.NumberFormat('de-DE', {
                    style: 'currency', currency: 'EUR', maximumFractionDigits: 2
                }).format(ctx.parsed.y))}`
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
                callback: v => mask(`${v}€`)
            }
        }
    }
}))
</script>
