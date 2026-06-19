<!-- src/components/charts/ChartCard.vue -->

<template>
    <section class="chart-card" :class="{ 'chart-card--wide': wide, 'chart-card--tall': tall }">
        <header class="chart-card__head">
            <div>
                <h3 class="chart-card__title">{{ title }}</h3>
                <p v-if="subtitle" class="chart-card__sub">{{ subtitle }}</p>
            </div>
            <slot name="actions" />
        </header>

        <div class="chart-card__body">
            <slot />
        </div>
    </section>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    wide: { type: Boolean, default: false },
    tall: { type: Boolean, default: false },
})
</script>

<style scoped>
/* Chart Card */
.chart-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chart-card--wide {
    grid-column: 1 / -1;
}

.chart-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
}

.chart-card__title {
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.chart-card__sub {
    margin-top: 2px;
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-text-muted);
}

/* Body heights */
.chart-card__body {
    padding: var(--space-4);
    flex: 1;
    min-height: 260px;
}

.chart-card--tall .chart-card__body {
    min-height: 340px;
}

.chart-card--wide .chart-card__body {
    min-height: 300px;
}

.chart-card--wide.chart-card--tall .chart-card__body {
    min-height: 380px;
}

/* Mobile */
@media (max-width: 767px) {

    .chart-card__body,
    .chart-card--tall .chart-card__body,
    .chart-card--wide .chart-card__body,
    .chart-card--wide.chart-card--tall .chart-card__body {
        min-height: 240px;
    }

    .chart-card--wide {
        grid-column: auto;
    }
}
</style>
