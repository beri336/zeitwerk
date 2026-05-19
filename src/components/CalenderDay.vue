<!-- src/components/CalenderDay.vue -->

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours } from '@/composables/useTime'
import { getAbsenceType } from '@/composables/useAbsence'

const props = defineProps({
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    isToday: { type: Boolean, default: false },
    isOutside: { type: Boolean, default: false }, // other month
})

const emit = defineEmits(['click'])

const store = useZeitwerkStore()

const entry = computed(() =>
    store.entries.find(e => e.date === props.date) ?? null
)

const type = computed(() =>
    entry.value ? getAbsenceType(entry.value.typ ?? 'work') : null
)

const actual = computed(() =>
    entry.value ? store.effectiveActualHours(entry.value) : 0
)

const planned = computed(() =>
    entry.value ? (entry.value.plannedHours ?? store.settings.hoursPerDay) : store.settings.hoursPerDay
)

// Prozentualer Fortschritt für den Balken (max 100%)
const progress = computed(() =>
    planned.value > 0 ? Math.min(100, (actual.value / planned.value) * 100) : 0
)

const progressColor = computed(() => {
    if (!entry.value) return 'var(--color-border)'
    if (!type.value?.counter) return type.value?.color ?? 'var(--color-border)'
    if (progress.value >= 100) return 'var(--color-success)'
    if (progress.value >= 60) return 'var(--color-warning)'
    return 'var(--color-error)'
})

const dayNum = computed(() => new Date(props.date + 'T00:00:00').getDate())
</script>

<template>
    <div class="cal-day" :class="{
        'cal-day--today': isToday,
        'cal-day--outside': isOutside,
        'cal-day--entry': !!entry,
        'cal-day--absence': entry && entry.typ && entry.typ !== 'work'
    }" :style="entry && entry.typ && entry.typ !== 'work'
        ? `--day-accent:${type.color};--day-bg:${type.highlight}`
        : ''" @click="emit('click', date)">
        <div class="cal-day__header">
            <span class="cal-day__num">{{ dayNum }}</span>
            <span v-if="entry?.typ && entry.typ !== 'work'" class="cal-day__icon">
                {{ type.icon }}
            </span>
        </div>

        <div v-if="entry" class="cal-day__body">
            <div class="cal-day__ist">{{ formatHours(actual) }}</div>
            <div v-if="entry.start" class="cal-day__time">
                {{ entry.start }}–{{ entry.end }}
            </div>
            <div v-if="entry.notes" class="cal-day__note">
                {{ entry.notes }}
            </div>
        </div>

        <!-- Progress bar -->
        <div class="cal-day__bar-track">
            <div class="cal-day__bar-fill" :style="`width:${entry ? progress : 0}%;background:${progressColor}`" />
        </div>
    </div>
</template>

<style scoped>
.cal-day {
    position: relative;
    min-height: 88px;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-divider);
    background: var(--color-surface);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: background var(--transition), border-color var(--transition), box-shadow var(--transition);
    overflow: hidden;
}

.cal-day:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}

.cal-day--today {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-highlight);
}

.cal-day--today .cal-day__num {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-radius: var(--radius-full);
}

.cal-day--outside {
    background: var(--color-surface-offset);
    opacity: 0.45;
    pointer-events: none;
}

.cal-day--absence {
    background: var(--day-bg, var(--color-surface));
    border-color: var(--day-accent, var(--color-border));
}

/* Header */
.cal-day__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.cal-day__num {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cal-day--today .cal-day__num {
    color: var(--color-text-inverse);
}

.cal-day__icon {
    font-size: 13px;
    line-height: 1;
}

/* Body */
.cal-day__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.cal-day__ist {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
}

.cal-day__time {
    font-size: 10px;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
}

.cal-day__note {
    font-size: 10px;
    color: var(--color-text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Fortschrittsbalken */
.cal-day__bar-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-divider);
}

.cal-day__bar-fill {
    height: 100%;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    transition: width 0.4s ease;
}
</style>
