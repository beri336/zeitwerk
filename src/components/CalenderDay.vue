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
    flashToday: { type: Boolean, default: false },
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
    <button class="cal-day" :class="{
        'cal-day--today': isToday,
        'cal-day--outside': isOutside,
        'cal-day--entry': !!entry,
        'cal-day--absence': entry && entry.typ && entry.typ !== 'work',
        'cal-day--flash': flashToday
    }" :style="entry && entry.typ && entry.typ !== 'work'
            ? `--day-accent:${type.color};--day-bg:${type.highlight}`
            : ''" :data-cal-date="date" type="button" @click="emit('click', date)">
        <div class="cal-day__header">
            <span class="cal-day__num">{{ dayNum }}</span>
            <span v-if="entry?.typ && entry.typ !== 'work'" class="cal-day__icon">
                {{ type.icon }}
            </span>
        </div>

        <div v-if="entry" class="cal-day__body">
            <div class="cal-day__ist">{{ formatHours(actual) }}</div>

            <div v-if="entry?.timeEntries?.length" class="cal-day__time">
                {{ entry.timeEntries[0].start }}–{{ entry.timeEntries[entry.timeEntries.length - 1].end }}
            </div>

            <div v-if="entry.notes" class="cal-day__note">
                {{ entry.notes }}
            </div>
        </div>

        <div class="cal-day__bar-track">
            <div class="cal-day__bar-fill" :style="`width:${entry ? progress : 0}%;background:${progressColor}`" />
        </div>
    </button>
</template>

<style scoped>
.cal-day {
    position: relative;
    min-height: 96px;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    transition:
        background var(--transition),
        border-color var(--transition),
        box-shadow var(--transition),
        transform var(--transition);
    overflow: hidden;
    min-width: 44px;
    text-align: left;
}

.cal-day:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
}

.cal-day:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 3px var(--color-primary-highlight);
}

.cal-day--today {
    box-shadow: inset 0 0 0 2px var(--color-gold);
}

.cal-day--flash {
    box-shadow:
        inset 0 0 0 2px var(--color-gold),
        0 0 0 4px color-mix(in oklch, var(--color-gold) 22%, transparent);
    animation: todayPulse 1.4s ease;
}

@keyframes todayPulse {
    0% {
        transform: scale(1);
        box-shadow:
            inset 0 0 0 2px var(--color-gold),
            0 0 0 0 color-mix(in oklch, var(--color-gold) 30%, transparent);
    }

    35% {
        transform: scale(1.015);
        box-shadow:
            inset 0 0 0 2px var(--color-gold),
            0 0 0 6px color-mix(in oklch, var(--color-gold) 22%, transparent);
    }

    100% {
        transform: scale(1);
        box-shadow:
            inset 0 0 0 2px var(--color-gold),
            0 0 0 0 color-mix(in oklch, var(--color-gold) 0%, transparent);
    }
}

.cal-day--today .cal-day__num {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-radius: var(--radius-full);
}

.cal-day--outside {
    background: var(--color-surface-offset);
    opacity: 0.5;
}

.cal-day--outside .cal-day__body,
.cal-day--outside .cal-day__bar-track {
    opacity: 0.6;
}

.cal-day--absence {
    background: var(--day-bg, var(--color-surface));
    border-color: var(--day-accent, var(--color-border));
}

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

.cal-day__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.cal-day__ist {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
}

.cal-day__time {
    font-size: 12px;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
}

.cal-day__note {
    font-size: 12px;
    color: var(--color-text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

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

@media (max-width: 768px) {
    .cal-day {
        min-height: 72px;
        padding: var(--space-2);
    }

    .cal-day__time,
    .cal-day__note {
        display: none;
    }

    .cal-day__ist {
        font-size: 12px;
    }

    .cal-day__num {
        width: 24px;
        height: 24px;
    }
}
</style>
