<!-- src/components/charts/ChartCard.vue -->
<script setup>
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    large: { type: Boolean, default: false },
    wide: { type: Boolean, default: false }
})
</script>

<template>
    <section class="chart-card" :class="{
        'chart-card--large': large,
        'chart-card--wide': wide
    }">
        <header class="chart-card__head">
            <div>
                <h3 class="chart-card__title">{{ title }}</h3>
                <p v-if="subtitle" class="chart-card__subtitle">{{ subtitle }}</p>
            </div>
            <slot name="actions" />
        </header>

        <div class="chart-card__body">
            <slot />
        </div>
    </section>
</template>

<style scoped>
.chart-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
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
    border-bottom: 1px solid var(--color-divider);
}

.chart-card__title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text);
}

.chart-card__subtitle {
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
}

.chart-card__body {
    padding: var(--space-4);
    min-height: 280px;
}

.chart-card--large .chart-card__body {
    min-height: 340px;
}

/* Noch größer für breite Hauptcharts */
.chart-card--wide .chart-card__body {
    min-height: 360px;
}

.chart-card--wide.chart-card--large .chart-card__body {
    min-height: 420px;
}

@media (max-width: 767px) {
    .chart-card__head {
        padding: var(--space-4);
    }

    .chart-card__body {
        padding: var(--space-3);
        min-height: 240px;
    }

    .chart-card--large .chart-card__body,
    .chart-card--wide .chart-card__body,
    .chart-card--wide.chart-card--large .chart-card__body {
        min-height: 280px;
    }

    .chart-card--wide {
        grid-column: auto;
    }
}
</style>
