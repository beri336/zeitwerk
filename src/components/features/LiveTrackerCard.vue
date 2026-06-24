<!-- src/components/features/LiveTrackerCard.vue -->

<template>

  <section
    class="live-card"
    :class="[statusMeta.className, { 'is-critical': isCritical }]"
  >
    <!-- LEFT: Main panel -->
    <div class="live-card__main">
      <div class="live-card__eyebrow">
        <span>{{ $t("common.today") }}</span>
        <span
          v-if="store.liveStatus === 'working'"
          class="pulse-dot"
          aria-hidden="true"
        />
      </div>

      <div class="live-card__header">
        <h2 class="live-card__title">{{ $t("live.title") }}</h2>
        <span class="live-card__status">
          <span v-if="store.liveStatus !== 'idle'" class="status-dot" />
          {{ statusMeta.label }}
        </span>
      </div>

      <p class="live-card__hint">{{ statusMeta.hint }}</p>

      <!-- Clock hero -->
      <div
        class="live-card__hero"
        :class="{ 'hero--overtime': isOvertime, 'hero--critical': isCritical }"
      >
        <div
          class="live-card__clock"
          :class="{ 'clock--critical': isCritical }"
        >
          {{ formatLiveDuration(liveWorkHours) }}
        </div>

        <!-- Progress bar -->
        <div
          class="live-progress"
          :title="`${Math.round(progressPercent)}% ${$t('live.progress_title', { hours: TARGET_HOURS.value })}`"
        >
          <div
            class="live-progress__fill"
            :class="{
              'fill--overtime': isOvertime,
              'fill--critical': isCritical,
            }"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>

        <!-- Meta chips -->
        <div class="live-card__meta">
          <span v-if="startedAtLabel" class="live-meta-chip">
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M8 5v3.5l2 2"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            {{ $t("live.started_at", { time: startedAtLabel }) }}
          </span>

          <span
            v-if="store.liveStatus === 'break'"
            class="live-meta-chip live-meta-chip--break"
          >
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4v8M10 4v8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            {{
              $t("live.break_duration", {
                val: formatBreakDuration(liveBreakSeconds),
              })
            }}
          </span>

          <span
            v-if="store.liveStatus !== 'idle'"
            class="live-meta-chip"
            :class="{ 'live-meta-chip--goal': isOvertime }"
          >
            {{ formatRemainingHours(remainingHours) }}
          </span>

          <span
            v-if="store.grossHourlyRate > 0"
            class="live-meta-chip live-meta-chip--earnings"
          >
            {{
              $t("live.tracked_today", {
                val: mask(formatCurrency(grossToday)),
              })
            }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="live-card__actions">
        <button
          v-if="store.liveStatus === 'idle'"
          class="btn live-btn live-btn--primary"
          @click="onStartWork"
        >
          <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
            <polygon points="5,3 13,8 5,13" fill="currentColor" />
          </svg>
          {{ $t("live.start_work") }}
        </button>

        <template v-else-if="store.liveStatus === 'working'">
          <button
            class="btn live-btn live-btn--secondary"
            @click="onStartBreak"
          >
            <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
              <path
                d="M5 4v8M11 4v8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ $t("live.start_break") }}
          </button>
          <button class="btn live-btn live-btn--ghost" @click="onFinishWorkDay">
            <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ $t("live.finish_day") }}
          </button>
        </template>

        <template v-else-if="store.liveStatus === 'break'">
          <button class="btn live-btn live-btn--primary" @click="onResumeWork">
            <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
              <polygon points="5,3 13,8 5,13" fill="currentColor" />
            </svg>
            {{ $t("live.resume") }}
          </button>
          <button class="btn live-btn live-btn--ghost" @click="onFinishWorkDay">
            <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ $t("live.finish_day") }}
          </button>
        </template>
      </div>
    </div>

    <!-- RIGHT: Session blocks -->
    <div class="live-card__side">
      <div class="live-card__side-header">
        <span class="live-card__side-title">{{ $t("live.blocks_title") }}</span>
        <span v-if="sessionBlocks.length" class="side-count">{{
          sessionBlocks.length
        }}</span>
      </div>

      <div v-if="sessionBlocks.length" class="live-blocks">
        <div
          v-for="(block, index) in sessionBlocks"
          :key="index"
          class="live-block"
          :class="{ 'live-block--active': !block.end }"
        >
          <div class="live-block__index">{{ index + 1 }}</div>
          <div class="live-block__content">
            <span class="live-block__time">
              {{ block.start || "—" }}
              <span class="block-separator">→</span>
              <span :class="{ 'block-running': !block.end }">{{
                block.end || "running"
              }}</span>
            </span>
            <span v-if="block.pause" class="live-block__pause">{{
              $t("live.block_pause", { val: block.pause })
            }}</span>
          </div>
          <span v-if="!block.end" class="block-live-dot" />
        </div>
      </div>

      <div v-else class="live-empty">
        <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M12 7v5.5l3 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        {{ $t("live.no_sessions") }}
      </div>

      <!-- Daily summary if any work done -->
      <div v-if="sessionBlocks.length" class="live-side-summary">
        <span>{{ $t("live.total_tracked") }}</span>
        <strong>{{ formatLiveDuration(liveWorkHours) }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useToast } from "@/composables/useToast";
import { usePrivacy } from "@/composables/usePrivacy";
import { useI18n } from "vue-i18n";

const store = useZeitwerkStore();
const { showToast } = useToast();
const { mask } = usePrivacy();
const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

// Configs
const TARGET_HOURS = computed(() => store.settings.hoursPerDay ?? 8); // Auto-stop threshold
const WARN_WORK_HOURS = computed(() => TARGET_HOURS.value); // Overtime warning threshold
const MAX_WORK_HOURS = computed(() => TARGET_HOURS.value + 1); // Daily goal for progress bar
const INACTIVITY_MINUTES = computed(
  () => store.settings.inactivityMinutes ?? 30,
);

// reactive tick (RAF-based, only while working)
const nowTick = ref(Date.now());
const hasWarned = ref(false);
const autoStopped = ref(false);

let rafId = null;
let inactivityTimer = null;

function tick() {
  nowTick.value = Date.now();
  checkLimits();

  if (store.liveStatus === "working") {
    rafId = requestAnimationFrame(tick);
  }
}

function startTick() {
  if (rafId) return;

  rafId = requestAnimationFrame(tick);
}

function stopTick() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

watch(
  () => store.liveStatus,
  (status) => {
    if (status === "working") {
      startTick();
      startInactivityTracking();
    } else {
      stopTick();
      stopInactivityTracking();
      // still update nowTick once for break/idle display
      nowTick.value = Date.now();
    }
  },
);

// Inactivity Auto-Pause
const INACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

function resetInactivityTimer() {
  if (store.liveStatus !== "working") return;

  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(
    () => {
      store.startBreak();
      showToast(
        t("live.toast_inactivity", { val: INACTIVITY_MINUTES.value }),
        "warning",
      );
      sendNotification(
        t("live.notif_inactivity_title"),
        t("live.notif_inactivity_body", { val: INACTIVITY_MINUTES.value }),
      );
    },
    INACTIVITY_MINUTES.value * 60 * 1000,
  );
}

function clearInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
}

function startInactivityTracking() {
  INACTIVITY_EVENTS.forEach((event) =>
    window.addEventListener(event, resetInactivityTimer, { passive: true }),
  );
  resetInactivityTimer();
}

function stopInactivityTracking() {
  INACTIVITY_EVENTS.forEach((event) =>
    window.removeEventListener(event, resetInactivityTimer),
  );
  clearInactivityTimer();
}

// Auto-stop & overtime logic
function checkLimits() {
  if (store.liveStatus !== "working") return;

  const hours = liveWorkHours.value;

  if (!hasWarned.value && hours >= WARN_WORK_HOURS.value) {
    hasWarned.value = true;
    showToast(
      t("live.toast_overtime_warn", { val: WARN_WORK_HOURS.value }),
      "warning",
    );

    sendNotification(
      t("live.notif_overtime_title"),
      t("live.notif_overtime_body", { val: WARN_WORK_HOURS.value }),
    );
  }

  if (!autoStopped.value && hours >= MAX_WORK_HOURS.value) {
    autoStopped.value = true;
    store.finishWorkDay();
    showToast(
      t("live.toast_autostop", { val: MAX_WORK_HOURS.value }),
      "warning",
    );

    sendNotification(
      t("live.notif_autostop_title"),
      t("live.notif_autostop_body", { val: MAX_WORK_HOURS.value }),
    );
  }
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

// Lifecycle
onMounted(async () => {
  store.recoverActiveSession();
  await requestNotificationPermission();

  // reset warning flags if coming back to a fresh day
  hasWarned.value = false;
  autoStopped.value = false;

  if (store.liveStatus === "working") {
    startTick();
    startInactivityTracking();
  }
});

onUnmounted(() => {
  stopTick();
  stopInactivityTracking();
});

// Status meta
const statusMeta = computed(() => {
  switch (store.liveStatus) {
    case "working":
      return {
        label: t("live.status_working"),
        className: "is-working",
        hint: t("live.on_working_session"),
      };
    case "break":
      return {
        label: t("live.on_break"),
        className: "is-break",
        hint: t("live.on_break_session"),
      };
    default:
      return {
        label: t("live.not_started"),
        className: "is-idle",
        hint: t("live.not_started_session"),
      };
  }
});

// Computed: Time
const sessionBlocks = computed(() => store.todayEntry?.timeEntries ?? []);

const liveWorkHours = computed(() => {
  const base = store.todayEntry
    ? store.effectiveActualHours(store.todayEntry)
    : 0;

  if (store.liveStatus !== "working") return base;

  const resumedAt = store.activeSession?.lastResumedAt;
  if (!resumedAt) return base;

  const extraMs = Math.max(0, nowTick.value - new Date(resumedAt).getTime());

  return base + extraMs / 3_600_000;
});

const liveBreakSeconds = computed(() => {
  if (store.liveStatus !== "break") return 0;

  const breakStartedAt = store.activeSession?.breakStartedAt;
  if (!breakStartedAt) return 0;

  return Math.max(
    0,
    Math.floor((nowTick.value - new Date(breakStartedAt).getTime()) / 1000),
  );
});

const progressPercent = computed(() =>
  Math.min(100, (liveWorkHours.value / TARGET_HOURS.value) * 100),
);

const isOvertime = computed(() => liveWorkHours.value >= TARGET_HOURS.value);
const isCritical = computed(
  () => liveWorkHours.value >= MAX_WORK_HOURS.value - 0.25,
); // last 15 min

const remainingHours = computed(() =>
  Math.max(0, TARGET_HOURS.value - liveWorkHours.value),
);

// Earnings
const grossToday = computed(() => {
  if (!store.todayEntry || store.grossHourlyRate <= 0) return 0;

  return store.grossEarnedForEntry(store.todayEntry);
});

const startedAtLabel = computed(() => {
  const iso = store.activeSession?.startedAt;
  if (!iso) return null;

  return new Intl.DateTimeFormat(
    currentLocale.value === "de" ? "de-DE" : "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  ).format(new Date(iso));
});

// Formatters
function formatLiveDuration(hours) {
  const total = Math.max(0, Math.floor(hours * 3600));
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

function formatBreakDuration(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  return `${mm}:${ss}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    currentLocale.value === "de" ? "de-DE" : "en-GB",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatRemainingHours(hours) {
  const totalMin = Math.round(hours * 60);
  if (totalMin <= 0) return t("live.goal_reached");
  if (totalMin < 60) return t("live.left_time", { time: totalMin });
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0
    ? t("live.left_time_hm", { h, m })
    : t("live.left_time_h", { h });
}

// Actions
function onStartWork() {
  hasWarned.value = false;
  autoStopped.value = false;
  store.startWork();
  showToast(t("live.toast_started"), "ok");
  // startInactivityTracking continues automatically over the watch
}

function onStartBreak() {
  store.startBreak();
  showToast(t("live.toast_break"), "ok");
}
function onResumeWork() {
  store.resumeWork();
  showToast(t("live.toast_resumed"), "ok");
}
function onFinishWorkDay() {
  store.finishWorkDay();
  showToast(t("live.toast_finished"), "ok");
}
</script>

<style scoped>
/* Layout */
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
  transition:
    border-color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
}

/* State Variants */
.live-card.is-working {
  border-color: color-mix(
    in oklch,
    var(--color-success) 40%,
    var(--color-border)
  );
  background: color-mix(
    in oklch,
    var(--color-success-highlight) 25%,
    var(--color-surface)
  );
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px color-mix(in oklch, var(--color-success) 15%, transparent);
}

.live-card.is-break {
  border-color: color-mix(
    in oklch,
    var(--color-warning) 40%,
    var(--color-border)
  );
  background: color-mix(
    in oklch,
    var(--color-warning-highlight) 20%,
    var(--color-surface)
  );
}

.live-card.is-critical {
  border-color: color-mix(
    in oklch,
    var(--color-error) 45%,
    var(--color-border)
  );
  background: color-mix(
    in oklch,
    var(--color-error-highlight, #fef2f2) 20%,
    var(--color-surface)
  );
}

/* Eyebrow */
.live-card__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-faint);
  font-weight: 700;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 1.8s ease-in-out infinite;
}

/* Main Panel */
.live-card__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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

.live-card__hint {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  max-width: 48ch;
}

/* Status Badge */
.live-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
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

.live-card.is-critical .live-card__status {
  background: var(--color-error-highlight, #fef2f2);
  color: var(--color-error, #ef4444);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.8s ease-in-out infinite;
}

/* Hero */
.live-card__hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--color-surface-2) 82%, var(--color-bg));
  border: 1px solid var(--color-divider);
  transition: border-color 0.3s ease;
}

.hero--overtime {
  border-color: color-mix(
    in oklch,
    var(--color-warning) 30%,
    var(--color-divider)
  );
}

.hero--critical {
  border-color: color-mix(
    in oklch,
    var(--color-error, #ef4444) 30%,
    var(--color-divider)
  );
}

.live-card__clock {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.clock--critical {
  color: var(--color-error, #ef4444);
}

/* Progress Bar */
.live-progress {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-surface-offset);
  overflow: hidden;
}

.live-progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-success);
  transition:
    width 0.5s ease,
    background 0.3s ease;
}

.fill--overtime {
  background: var(--color-warning);
}

.fill--critical {
  background: var(--color-error, #ef4444);
}

/* Meta Chips */
.live-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.live-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
}

.chip-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.live-meta-chip--break {
  color: var(--color-warning);
  background: var(--color-warning-highlight);
  border-color: color-mix(
    in oklch,
    var(--color-warning) 20%,
    var(--color-divider)
  );
}

.live-meta-chip--goal {
  color: var(--color-success);
  background: var(--color-success-highlight);
}

.live-meta-chip--earnings {
  color: var(--color-text);
}

/* Actions */
.live-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.live-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding-inline: var(--space-5);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
  transition:
    opacity 0.15s,
    transform 0.1s;
}

.live-btn:hover {
  opacity: 0.88;
}

.live-btn:active {
  transform: scale(0.97);
}

.live-btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-fg, #fff);
  min-width: 160px;
}

.live-btn--secondary {
  background: var(--color-surface-offset);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.live-btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-divider);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Side Panel */
.live-card__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-divider);
  min-height: 0;
}

.live-card__side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.live-card__side-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
}

.side-count {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-offset);
  color: var(--color-text-muted);
}

/* Time Blocks */
.live-blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow-y: auto;
  max-height: 280px;
  -webkit-overflow-scrolling: touch;
}

.live-block {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  transition: border-color 0.2s;
}

.live-block--active {
  border-color: color-mix(
    in oklch,
    var(--color-success) 35%,
    var(--color-divider)
  );
}

.live-block__index {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-faint);
  min-width: 18px;
  text-align: center;
}

.live-block__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.live-block__time {
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 4px;
}

.block-separator {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.block-running {
  color: var(--color-success);
  font-weight: 600;
}

.live-block__pause {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.block-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
  animation: pulse 1.8s ease-in-out infinite;
}

/* Side Summary */
.live-side-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-divider);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: auto;
}

.live-side-summary strong {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

/* Empty State */
.live-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
}

.empty-icon {
  width: 32px;
  height: 32px;
  opacity: 0.4;
}

/* Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.75);
  }
}

/* Tablet */
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
    justify-content: center;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .live-card {
    padding: var(--space-3);
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  .live-card__hero {
    padding: var(--space-4);
    gap: var(--space-2);
  }

  .live-card__clock {
    font-size: clamp(2.2rem, 12vw, 3rem);
  }

  .live-card__hint {
    display: none;
  }

  .live-blocks {
    max-height: 200px;
  }

  .live-card__side {
    padding: var(--space-3);
  }

  .live-card__actions {
    gap: var(--space-2);
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .live-card {
    padding: var(--space-2);
    border-radius: var(--radius-md);
  }

  .live-meta-chip {
    font-size: 0.65rem;
    padding: 0 var(--space-2);
    min-height: 26px;
  }

  .live-card__hero {
    padding: var(--space-3);
  }
}
</style>
