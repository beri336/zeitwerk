<!-- src/components/LiveTrackerCard.vue -->

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { formatHours } from '@/composables/useTime'

const store = useZeitwerkStore()
const { showToast } = useToast()

const nowTick = ref(Date.now())
let timerId = null

onMounted(() => {
    store.recoverActiveSession()

    timerId = window.setInterval(() => {
        nowTick.value = Date.now()
    }, 1000)
})

onUnmounted(() => {
    if (timerId) {
        clearInterval(timerId)
        timerId = null
    }
})

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

const startedAtLabel = computed(() => {
    const iso = store.activeSession?.startedAt
    if (!iso)
        return null

    return new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(iso))
})

const liveWorkHours = computed(() => {
    const base = store.todayEntry ? store.effectiveActualHours(store.todayEntry) : 0

    if (store.liveStatus !== 'working')
        return base

    const resumedAt = store.activeSession?.lastResumedAt
    if (!resumedAt)
        return base

    const extraMs = Math.max(0, nowTick.value - new Date(resumedAt).getTime())
    return base + (extraMs / 3600000)
})

const liveBreakMinutes = computed(() => {
    if (store.liveStatus !== 'break')
        return 0

    const breakStartedAt = store.activeSession?.breakStartedAt
    if (!breakStartedAt)
        return 0

    const diffMs = Math.max(0, nowTick.value - new Date(breakStartedAt).getTime())
    return Math.floor(diffMs / 60000)
})

function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
    }).format(value)
}

function formatLiveDuration(hours) {
    const totalSeconds = Math.max(0, Math.floor(hours * 3600))
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const ss = String(totalSeconds % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
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

            <div class="live-card__hero">
                <div class="live-card__clock">
                    {{ formatLiveDuration(liveWorkHours) }}
                </div>

                <div class="live-card__meta">
                    <span v-if="startedAtLabel" class="live-meta-chip">
                        Started at {{ startedAtLabel }}
                    </span>

                    <span v-if="store.liveStatus === 'break'" class="live-meta-chip live-meta-chip--break">
                        Break for {{ liveBreakMinutes }} min
                    </span>

                    <span v-if="store.grossHourlyRate > 0" class="live-meta-chip">
                        {{ formatCurrency(grossToday) }} gross today
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
    grid-template-columns: 1.45fr 1fr;
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

.live-card__hero {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    background: color-mix(in oklch, var(--color-surface-2) 82%, var(--color-bg));
    border: 1px solid var(--color-divider);
}

.live-card__clock {
    font-size: clamp(2rem, 5vw, 3.5rem);
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
}

.live-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.live-meta-chip {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    border: 1px solid var(--color-divider);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
}

.live-meta-chip--break {
    color: var(--color-warning);
    background: var(--color-warning-highlight);
    border-color: color-mix(in oklch, var(--color-warning) 20%, var(--color-divider));
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
