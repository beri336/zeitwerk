<!-- src/components/AbsenceLegend.vue -->

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { ABSENCE_TYPES } from '@/composables/useAbsence'

const store = useZeitwerkStore()

const stats = computed(() => {
    const counts = {}

    store.entriesForMonth.forEach(entry => {
        const type = entry.typ ?? 'on-site'
        counts[type] = (counts[type] ?? 0) + 1
    })

    return Object.entries(ABSENCE_TYPES)
        .filter(([key]) => counts[key])
        .map(([key, type]) => ({ key, ...type, count: counts[key] }))
})
</script>

<template>
    <div v-if="stats.length" class="legend">
        <div v-for="s in stats" :key="s.key" class="legend-item"
            :style="`background:${s.highlight};color:${s.color};border-color:${s.color}40`">
            <span>{{ s.icon }}</span>
            <span class="legend-label">{{ s.label }}</span>
            <span class="legend-count">{{ s.count }}x</span>
        </div>
    </div>
</template>

<style scoped>
.legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid;
    font-size: var(--text-xs);
    font-weight: 500;
}

.legend-count {
    background: oklch(0 0 0 / 0.08);
    padding: 1px 6px;
    border-radius: var(--radius-full);
    font-weight: 600;
}
</style>
