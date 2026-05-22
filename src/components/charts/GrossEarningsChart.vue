<!-- src/components/charts/GrossEarningsChart.vue -->

<script setup>
import { computed } from 'vue'
import { usePrivacy } from '@/composables/usePrivacy'

const { mask } = usePrivacy()

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: 'Gross earnings by week'
    }
})

const maxValue = computed(() => {
    const values = props.items.map(item => item.gross || 0)
    return Math.max(...values, 0)
})

function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value)
}

function barWidth(value) {
    if (!maxValue.value)
        return '0%'

    return `${(value / maxValue.value) * 100}%`
}
</script>

<template>
    <section class="chart-card">
        <div class="chart-card__header">
            <h3 class="chart-card__title">{{ title }}</h3>
            <span class="chart-card__sub">{{ items.length }} weeks</span>
        </div>

        <div v-if="items.length" class="gross-chart">
            <div v-for="item in items" :key="item.kw" class="gross-row">
                <div class="gross-row__top">
                    <span class="gross-row__label">KW {{ item.kw }}</span>
                    <span class="gross-row__value">{{ mask(formatCurrency(item.gross)) }}</span>
                </div>

                <div class="gross-row__track">
                    <div class="gross-row__bar" :style="{ width: barWidth(item.gross) }" />
                </div>
            </div>
        </div>

        <div v-else class="chart-empty">
            No gross earnings data available for this month.
        </div>
    </section>
</template>

<style scoped>
.chart-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.chart-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.chart-card__title {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-text);
}

.chart-card__sub {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
}

.gross-chart {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.gross-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.gross-row__top {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: baseline;
}

.gross-row__label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: 600;
}

.gross-row__value {
    font-size: var(--text-sm);
    color: var(--color-text);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.gross-row__track {
    width: 100%;
    height: 12px;
    border-radius: var(--radius-full);
    background: var(--color-surface-offset);
    overflow: hidden;
    border: 1px solid var(--color-divider);
}

.gross-row__bar {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg,
            color-mix(in oklch, var(--color-success) 88%, white),
            color-mix(in oklch, var(--color-primary) 65%, var(--color-success)));
    transition: width var(--transition-interactive);
}

.chart-empty {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    padding: var(--space-4) 0;
}
</style>
