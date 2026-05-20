<!-- src/components/LiveTrackerCard.vue -->

<script setup>
import { computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { formatHours } from '@/composables/useTime'

const store = useZeitwerkStore()
const { showToast } = useToast()

const statusMeta = computed(() => {
    switch (store.liveStatus) {
        case 'working':
            return {
                label: 'Working',
                className: 'is-working',
                hint: 'Your work session is currently running.'
            }
        case 'break':
            return {
                label: 'On break',
                className: 'is-break',
                hint: 'Your work is paused right now.'
            }
        default:
            return {
                label: 'Not started',
                className: 'is-idle',
                hint: 'Start your day with one click.'
            }
    }
})

const sessionBlocks = computed(() => store.todayEntry?.timeEntries ?? [])

const grossToday = computed(() => {
    if (!store.todayEntry || store.grossHourlyRate <= 0)
        return 0

    return store.grossEarnedForEntry(store.todayEntry)
})

function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
    }).format(value)
}

function onStartWork() {
    store.startWork()
    showToast('Work started.', 'ok')
}

function onStartBreak() {
    store.startBreak()
    showToast('Break started.', 'ok')
}

function onResumeWork() {
    store.resumeWork()
    showToast('Work resumed.', 'ok')
}

function onFinishWorkDay() {
    store.finishWorkDay()
    showToast('Work day finished.', 'ok')
}
</script>

<template>
    <section class="live-card" :class="statusMeta.className">
        <div class="live-card__main">
            <div class="live-card__eyebrow">Today</div>
            <div class="live-card__header">
                <h2 class="live-card__title">Live tracking</h2>
                <span class="live-card__status">{{ statusMeta.label }}</span>
            </div>

            <p class="live-card__hint">{{ statusMeta.hint }}</p>

            <div class="live-card__metrics">
                <div class="live-metric">
                    <span class="live-metric__label">Worked today</span>
                    <span class="live-metric__value">
                        {{ formatHours(store.liveWorkedHours) }}
                    </span>
                </div>

                <div class="live-metric" v-if="store.grossHourlyRate > 0">
                    <span class="live-metric__label">Gross today</span>
                    <span class="live-metric__value">
                        {{ formatCurrency(grossToday) }}
                    </span>
                </div>
            </div>

            <div class="live-card__actions">
                <button v-if="store.liveStatus === 'idle'" class="btn btn-primary live-btn live-btn--primary"
                    @click="onStartWork">
                    Start work
                </button>

                <template v-else-if="store.liveStatus === 'working'">
                    <button class="btn btn-primary live-btn live-btn--primary" @click="onStartBreak">
                        Start break
                    </button>
                    <button class="btn btn-secondary live-btn" @click="onFinishWorkDay">
                        Finish day
                    </button>
                </template>

                <template v-else-if="store.liveStatus === 'break'">
                    <button class="btn btn-primary live-btn live-btn--primary" @click="onResumeWork">
                        Resume work
                    </button>
                    <button class="btn btn-secondary live-btn" @click="onFinishWorkDay">
                        Finish day
                    </button>
                </template>
            </div>
        </div>

        <div class="live-card__side">
            <div class="live-card__side-title">Today’s blocks</div>

            <div v-if="sessionBlocks.length" class="live-blocks">
                <div v-for="(block, index) in sessionBlocks" :key="index" class="live-block">
                    <span class="live-block__time">
                        {{ block.start || '—' }} – {{ block.end || 'running' }}
                    </span>
                    <span v-if="block.pause" class="live-block__pause">
                        Pause {{ block.pause }} min
                    </span>
                </div>
            </div>

            <div v-else class="live-empty">
                No sessions yet for today.
            </div>
        </div>
    </section>
</template>

<style scoped>
.live-card {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: var(--space-6);
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--space-5);
}

.live-card.is-working {
    border-color: color-mix(in oklch, var(--color-success) 35%, var(--color-border));
    background: color-mix(in oklch, var(--color-success-highlight) 30%, var(--color-surface));
}

.live-card.is-break {
    border-color: color-mix(in oklch, var(--color-warning) 35%, var(--color-border));
    background: color-mix(in oklch, var(--color-warning-highlight) 24%, var(--color-surface));
}

.live-card__main {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.live-card__eyebrow {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-faint);
    font-weight: 700;
}

.live-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.live-card__title {
    font-size: var(--text-lg);
    font-weight: 700;
}

.live-card__status {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-full);
    background: var(--color-surface-offset);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
}

.live-card.is-working .live-card__status {
    background: var(--color-success-highlight);
    color: var(--color-success);
}

.live-card.is-break .live-card__status {
    background: var(--color-warning-highlight);
    color: var(--color-warning);
}

.live-card__hint {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    max-width: 48ch;
}

.live-card__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
}

.live-metric {
    min-width: 160px;
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-surface-2);
    border: 1px solid var(--color-divider);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.live-metric__label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-faint);
    font-weight: 700;
}

.live-metric__value {
    font-size: var(--text-lg);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.live-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-2);
}

.live-btn {
    min-height: 44px;
    padding-inline: var(--space-5);
    border-radius: var(--radius-full);
}

.live-btn--primary {
    min-width: 180px;
}

.live-card__side {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-surface-2);
    border: 1px solid var(--color-divider);
}

.live-card__side-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
}

.live-blocks {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.live-block {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-divider);
}

.live-block__time,
.live-block__pause {
    font-size: var(--text-sm);
    font-variant-numeric: tabular-nums;
}

.live-block__pause {
    color: var(--color-text-muted);
}

.live-empty {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}

@media (max-width: 900px) {
    .live-card {
        grid-template-columns: 1fr;
        gap: var(--space-4);
        padding: var(--space-4);
    }

    .live-btn,
    .live-btn--primary {
        width: 100%;
        min-width: 0;
    }
}
</style>
