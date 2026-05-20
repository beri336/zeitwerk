<!-- src/components/KpiCard.vue -->

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import GrossEarningsChart from '@/components/charts/GrossEarningsChart.vue'

const store = useZeitwerkStore()

defineProps({
    label: { type: String, required: true },
    value: { type: String, required: true },
    sub: { type: String, default: '' },
    variant: { type: String, default: '' } // 'ok' | 'warn' | 'err' | ''
})

const monthGrossLabel = computed(() =>
    new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
    }).format(store.monthGross)
)
</script>

<template>
    <div class="kpi-card">
        <div class="kpi-label">{{ label }}</div>
        <div class="kpi-value" :class="`kpi-${variant}`">{{ value }}</div>
        <div v-if="sub" class="kpi-sub">{{ sub }}</div>
    </div>
    <div v-if="store.grossHourlyRate > 0" class="stat-card">
        <span class="stat-card__label">Month Gross</span>
        <span class="stat-card__value">{{ monthGrossLabel }}</span>
    </div>
</template>

<style scoped>
.kpi-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    box-shadow: var(--shadow-sm);
}

.kpi-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: var(--space-2);
}

.kpi-value {
    font-size: var(--text-lg);
    font-weight: 600;
    font-variant-numeric: tabular-nums lining-nums;
}

.kpi-sub {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    margin-top: var(--space-1);
}

.kpi-ok {
    color: var(--color-success);
}

.kpi-warn {
    color: var(--color-warning);
}

.kpi-err {
    color: var(--color-error);
}
</style>
