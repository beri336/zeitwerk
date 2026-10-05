<!-- src/components/features/DashboardCard.vue -->

<template>
  <main class="main">

    <!-- Device Chip -->
    <DeviceChip />

    <!-- Today's Summary -->
    <section class="today-summary" :class="`today-summary--${store.liveStatus}`">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="today-summary__header">
        <div>
          <span class="today-summary__eyebrow">{{ $t("dashboard.today.eyebrow") }}</span>
          <h2>{{ $t("dashboard.today.title") }}</h2>
        </div>
        <span class="today-summary__status">{{ todayStatusLabel }}</span>
      </div>

      <div class="today-summary__metrics">
        <div class="today-metric today-metric--main">
          <span>{{ $t("dashboard.today.worked") }}</span>
          <strong>{{ formatDuration(todayWorkedHours) }}</strong>
        </div>

        <div class="today-metric">
          <span>{{ $t("dashboard.today.expected") }}</span>
          <strong>{{ formatDuration(todayExpectedHours) }}</strong>
        </div>

        <div class="today-metric">
          <span>{{ $t("dashboard.today.difference") }}</span>
          <strong :class="differenceClass">{{ signedDuration(todayDifference) }}</strong>
        </div>

        <div class="today-metric">
          <span>{{ $t("dashboard.today.remaining") }}</span>
          <strong>{{ formatDuration(todayRemainingHours) }}</strong>
        </div>
      </div>

      <div class="today-summary__footer">
        <span>
          {{ $t("dashboard.today.break") }}:
          <strong>{{ breakStatusLabel }}</strong>
        </span>

        <span v-if="suggestedStopLabel">
          {{ $t("dashboard.today.suggested_stop", { time: suggestedStopLabel }) }}
        </span>
      </div>
    </section>

    <!-- Absence Legend -->
    <AbsenceLegend />

    <!-- ── Week Overview ── -->
    <h3>{{ $t("dashboard.week.title") }}</h3>
    <section class="kpi-section">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="kpi-grid">
        <KpiCard :label="$t('dashboard.week.actual')" :value="formatHours(currentWeekActual)"
          :sub="`${$t('common.planned')}: ${formatHours(currentWeekPlanned)}`"
          :variant="currentWeekDiff >= 0 ? 'ok' : 'err'" />
        <KpiCard :label="$t('dashboard.week.diff')"
          :value="`${currentWeekDiff >= 0 ? '+' : ''}${formatHours(currentWeekDiff)}`"
          :sub="currentWeekDiff >= 0 ? $t('dashboard.month.overtime') : $t('dashboard.month.missed-hours')"
          :variant="currentWeekDiff >= 0 ? 'ok' : 'err'" />
        <KpiCard :label="$t('common.entries')" :value="String(currentWeekEntries.length)"
          :sub="$t('dashboard.month.work_days')" />
        <KpiCard :label="$t('dashboard.week.days')" :value="String(currentWeekActiveDays)"
          :sub="$t('dashboard.month.active_sub')" />
      </div>
    </section>

    <!-- ── Month Overview ── -->
    <h3>{{ $t("dashboard.month.title") }}</h3>
    <section class="kpi-section">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="kpi-grid">
        <KpiCard :label="$t('dashboard.month.actual')" :value="formatHours(store.monthActual)"
          :sub="`${$t('common.planned')}: ${formatHours(store.monthPlanned)}`" :variant="monthActualVariant" />

        <KpiCard :label="$t('dashboard.month.diff')"
          :value="`${store.monthDiff >= 0 ? '+' : ''}${formatHours(store.monthDiff)}`" :sub="store.monthDiff >= 0
            ? $t('dashboard.month.overtime')
            : $t('dashboard.month.missed-hours')
            " :variant="monthDiffVariant" />

        <KpiCard :label="$t('dashboard.month.week_actual')" :value="formatHours(currentWeekActual)"
          :sub="`${$t('common.planned')}: ${formatHours(store.settings.hoursPerWeek)}`" />

        <KpiCard :label="$t('common.entries')" :value="String(store.entriesForMonth.length)"
          :sub="$t('dashboard.month.work_days')" />

        <KpiCard :label="$t('dashboard.month.avg_hours')" :value="formatHours(avgPerDay)"
          :sub="$t('dashboard.month.avg_sub')" />

        <KpiCard :label="$t('dashboard.month.active_days')" :value="String(activeDays)"
          :sub="$t('dashboard.month.active_sub')" />

        <KpiCard :label="$t('dashboard.month.vacation')" :value="String(monthTypeCounts.vacation)" />
        <KpiCard :label="$t('dashboard.month.sick')" :value="String(monthTypeCounts.sick)" />
        <KpiCard :label="$t('dashboard.month.homeoffice')" :value="String(monthTypeCounts.homeoffice)" />
        <KpiCard :label="$t('dashboard.month.office')" :value="String(monthTypeCounts['on-site'])" />
        <KpiCard :label="$t('dashboard.month.publicholiday')" :value="String(monthTypeCounts.publicholiday)" />
        <KpiCard :label="$t('dashboard.month.other')" :value="String(monthTypeCounts.other)" />

        <KpiCard v-if="longestDay" :label="$t('dashboard.month.longest')"
          :value="formatHours(calcActualHours(longestDay))" :sub="longestDay.date" />

        <KpiCard v-if="store.grossHourlyRate > 0" :label="$t('dashboard.month.gross')" :value="mask(monthGrossLabel)"
          :sub="$t('dashboard.month.gross_sub')" variant="ok" :private="true" />
      </div>
    </section>

    <!-- ── Year Overview ── -->
    <h3>{{ $t("dashboard.year.title") }}</h3>
    <section class="kpi-section" aria-label="Year summary">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="kpi-grid">
        <KpiCard :label="$t('dashboard.year.months')" :value="String(yearMonthsWithEntries)" />
        <KpiCard :label="$t('common.entries')" :value="String(yearEntries.length)" />
        <KpiCard :label="$t('common.actual')" :value="formatHours(yearActual)" />
        <KpiCard :label="$t('common.planned')" :value="formatHours(yearPlanned)" />

        <KpiCard :label="$t('dashboard.year.diff')" :value="`${yearDiff >= 0 ? '+' : ''}${formatHours(yearDiff)}`"
          :sub="yearDiff >= 0 ? $t('dashboard.year.overtime') : $t('dashboard.year.missed-hours')"
          :variant="yearDiff >= 0 ? 'ok' : 'err'" />

        <KpiCard :label="$t('dashboard.year.vacation')" :value="String(yearTypeCounts.vacation)" />
        <KpiCard :label="$t('dashboard.year.sick')" :value="String(yearTypeCounts.sick)" />
        <KpiCard :label="$t('dashboard.year.homeoffice')" :value="String(yearTypeCounts.homeoffice)" />
        <KpiCard :label="$t('dashboard.year.office')" :value="String(yearTypeCounts['on-site'])" />
        <KpiCard :label="$t('dashboard.year.publicholiday')" :value="String(yearTypeCounts.publicholiday)" />
        <KpiCard :label="$t('dashboard.year.other')" :value="String(yearTypeCounts.other)" />

        <KpiCard v-if="store.grossHourlyRate > 0" :label="$t('dashboard.year.gross')" :value="mask(yearGrossLabel)"
          :sub="$t('dashboard.year.gross_sub')" variant="ok" :private="true" />

        <KpiCard :label="$t('dashboard.year.vac_used')" :value="String(store.usedVacationDays)"
          :sub="$t('dashboard.year.vac_used_sub')" />

        <KpiCard :label="$t('dashboard.year.vac_left')" :value="String(store.remainingVacationDays)"
          :sub="store.remainingVacationDays === 1 ? $t('dashboard.year.vac_day_left_sub') : $t('dashboard.year.vac_days_left_sub')" />
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions" :aria-label="$t('dashboard.quick_actions.title')">
      <div class="quick-actions__heading">
        <h3>{{ $t("dashboard.quick_actions.title") }}</h3>
        <span>{{ $t("dashboard.quick_actions.subtitle") }}</span>
      </div>
      <div class="quick-actions__grid">
        <button class="quick-action quick-action--primary" @click="toggleTracking">
          <span class="quick-action__icon" aria-hidden="true">
            <svg v-if="store.liveStatus === 'idle' || store.liveStatus === 'break'" viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.29-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          </span>
          <span>{{ trackingLabel }}</span>
        </button>
        <button class="quick-action" @click="openAdd">
          <span class="quick-action__icon" aria-hidden="true">+</span>
          <span>{{ $t("dashboard.quick_actions.add_entry") }}</span>
        </button>
        <button class="quick-action" :disabled="store.liveStatus !== 'working'" @click="startBreak">
          <span class="quick-action__icon" aria-hidden="true">Ⅱ</span>
          <span>{{ $t("dashboard.quick_actions.add_break") }}</span>
        </button>
        <button class="quick-action" @click="openToday">
          <span class="quick-action__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v4M16 2v4M3 9h18" />
            </svg>
          </span>
          <span>{{ $t("dashboard.quick_actions.today") }}</span>
        </button>
      </div>
    </section>

    <!-- ── Add Bar Item ── -->
    <div class="add-bar">
      <button class="btn btn-primary" @click="openAdd">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ $t('dashboard.btn-add-entry') }}
      </button>
    </div>

    <!-- ── Month Table ── -->
    <MonthTable @edit="openEdit" />

    <!-- ── Modals to add entries ── -->
    <EntryModal v-model="showModal" :edit-entry="editEntry" />
    <HolidayImportModal v-model="showHolidayModal" />
    <button class="mobile-add-time" @click="openAdd">
      <span aria-hidden="true">+</span>
      {{ $t("dashboard.quick_actions.add_time") }}
    </button>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useToast } from "@/composables/useToast";
import {
  formatHours,
  calcActualHours,
} from "@/composables/useTime";
import { usePrivacy } from "@/composables/usePrivacy";

import KpiCard from "@/components/ui/KpiCard.vue";
import MonthTable from "@/components/MonthTable.vue";
import AbsenceLegend from "@/components/AbsenceLegend.vue";
import EntryModal from "@/components/EntryModal.vue";
import HolidayImportModal from "@/components/HolidayImportModal.vue";
import DeviceChip from "@/components/ui/DeviceChip.vue";

const { t, locale } = useI18n();
const store = useZeitwerkStore();
const router = useRouter();
const { mask } = usePrivacy();
const { showToast } = useToast();
const nowTick = ref(Date.now());
let todayTimer = null;

const todayWorkedHours = computed(() => {
  const entry = store.todayEntry;
  const base = entry ? store.effectiveActualHours(entry) : 0;

  if (store.liveStatus !== "working" || !store.activeSession?.lastResumedAt) {
    return base;
  }

  const extraMs = Math.max(
    0,
    nowTick.value - new Date(store.activeSession.lastResumedAt).getTime(),
  );

  return base + extraMs / 3_600_000;
});

const todayExpectedHours = computed(
  () => store.todayEntry?.plannedHours || store.settings.hoursPerDay || 0,
);
const todayDifference = computed(
  () => todayWorkedHours.value - todayExpectedHours.value,
);
const todayRemainingHours = computed(() =>
  Math.max(0, todayExpectedHours.value - todayWorkedHours.value),
);
const differenceClass = computed(() =>
  todayDifference.value >= 0 ? "today-value--positive" : "today-value--negative",
);

const todayStatusLabel = computed(() => {
  const key = store.liveStatus === "working"
    ? "live.status_working"
    : store.liveStatus === "break"
      ? "live.on_break"
      : "live.not_started";

  return t(key);
});

const breakStatusLabel = computed(() => {
  if (store.liveStatus !== "break") return t("dashboard.today.no_break");

  const startedAt = store.activeSession?.breakStartedAt;
  if (!startedAt) return t("live.on_break");

  const minutes = Math.max(
    0,
    Math.floor((nowTick.value - new Date(startedAt).getTime()) / 60_000),
  );

  return t("dashboard.today.break_duration", { minutes });
});

const suggestedStopLabel = computed(() => {
  if (store.liveStatus === "idle" || todayRemainingHours.value <= 0) return "";

  return new Intl.DateTimeFormat(locale.value === "de" ? "de-DE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(nowTick.value + todayRemainingHours.value * 3_600_000));
});

function formatDuration(hours) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m`;
}

function signedDuration(hours) {
  return `${hours >= 0 ? "+" : "-"}${formatDuration(Math.abs(hours))}`;
}

onMounted(() => {
  todayTimer = window.setInterval(() => {
    nowTick.value = Date.now();
  }, 1_000);
});

onUnmounted(() => {
  if (todayTimer) window.clearInterval(todayTimer);
});

// Month KPIs
const currentWeekEntries = computed(() => {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  return store.entries.filter((entry) => {
    const date = new Date(`${entry.date}T00:00:00`);
    return date >= monday && date < nextMonday;
  });
});
const currentWeekActual = computed(() =>
  currentWeekEntries.value.reduce(
    (total, entry) => total + store.effectiveActualHours(entry),
    0,
  ),
);
const currentWeekPlanned = computed(() =>
  currentWeekEntries.value.reduce(
    (total, entry) =>
      total + (entry.plannedHours ?? store.settings.hoursPerDay),
    0,
  ),
);
const currentWeekDiff = computed(
  () => currentWeekActual.value - currentWeekPlanned.value,
);
const currentWeekActiveDays = computed(
  () =>
    currentWeekEntries.value.filter(
      (entry) => store.effectiveActualHours(entry) > 0,
    ).length,
);

const monthDiffVariant = computed(() => {
  if (store.monthDiff > 0.25) return "ok";

  if (store.monthDiff < -0.25) return "err";

  return "";
});

const monthActualVariant = computed(() => monthDiffVariant.value);

const monthGrossLabel = computed(() => {
  if (!store.grossHourlyRate) return "N/A";

  return new Intl.NumberFormat(locale.value === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(store.monthGross);
});

const avgPerDay = computed(() =>
  store.entriesForMonth.length
    ? store.monthActual / store.entriesForMonth.length
    : 0,
);

const activeDays = computed(
  () =>
    store.entriesForMonth.filter((e) => store.effectiveActualHours(e) > 0)
      .length,
);

function countByType(entries, type) {
  return entries.filter((entry) => (entry.typ ?? "on-site") === type).length;
}

const monthTypeCounts = computed(() => ({
  vacation: countByType(store.entriesForMonth, "vacation"),
  sick: countByType(store.entriesForMonth, "sick"),
  homeoffice: countByType(store.entriesForMonth, "homeoffice"),
  "on-site": countByType(store.entriesForMonth, "on-site"),
  publicholiday: countByType(store.entriesForMonth, "publicholiday"),
  other: countByType(store.entriesForMonth, "other"),
}));

const longestDay = computed(() =>
  store.entriesForMonth.reduce(
    (max, e) => (!max || calcActualHours(e) > calcActualHours(max) ? e : max),
    null,
  ),
);

// Year KPIs
const yearEntries = computed(() =>
  store.entries.filter(
    (e) => new Date(e.date).getFullYear() === store.currYear,
  ),
);

const yearActual = computed(() =>
  yearEntries.value.reduce((s, e) => s + store.effectiveActualHours(e), 0),
);

const yearPlanned = computed(() =>
  yearEntries.value.reduce(
    (s, e) => s + (e.plannedHours || store.settings.hoursPerDay),
    0,
  ),
);

const yearDiff = computed(() =>
  parseFloat((yearActual.value - yearPlanned.value).toFixed(2)),
);

const yearGrossLabel = computed(() => {
  if (!store.grossHourlyRate) return "";

  const total = yearEntries.value.reduce(
    (s, e) => s + store.grossEarnedForEntry(e),
    0,
  );

  return new Intl.NumberFormat(locale.value === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(total);
});

const yearMonthsWithEntries = computed(
  () => new Set(yearEntries.value.map((e) => new Date(e.date).getMonth())).size,
);

const yearTypeCounts = computed(() => ({
  vacation: countByType(yearEntries.value, "vacation"),
  sick: countByType(yearEntries.value, "sick"),
  homeoffice: countByType(yearEntries.value, "homeoffice"),
  "on-site": countByType(yearEntries.value, "on-site"),
  publicholiday: countByType(yearEntries.value, "publicholiday"),
  other: countByType(yearEntries.value, "other"),
}));

// Modals
const showModal = ref(false);
const showHolidayModal = ref(false);
const editEntry = ref(null);

const trackingLabel = computed(() => {
  if (store.liveStatus === "working") return t("dashboard.quick_actions.stop");
  if (store.liveStatus === "break") return t("dashboard.quick_actions.resume");
  return t("dashboard.quick_actions.start");
});

function openAdd() {
  editEntry.value = null;
  showModal.value = true;
}
function openEdit(entry) {
  editEntry.value = entry;
  showModal.value = true;
}

function toggleTracking() {
  if (store.liveStatus === "working") {
    store.finishWorkDay();
    showToast(t("live.toast_finished"), "ok");
  } else if (store.liveStatus === "break") {
    store.resumeWork();
    showToast(t("live.toast_resumed"), "ok");
  } else {
    store.startWork();
    showToast(t("live.toast_started"), "ok");
  }
}

function startBreak() {
  store.startBreak();
  showToast(t("live.toast_break"), "ok");
}

function openToday() {
  router.push({ path: "/overview/week", query: { today: String(Date.now()) } });
}
</script>

<style scoped>
/* Main Layout */
.main {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

.main h3 {
  font-size: var(--text-xs, 0.75rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.main h3::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
}

.today-summary {
  position: relative;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch,
      var(--color-primary, #6366f1) 3%,
      transparent);
}

.today-summary--working {
  background: color-mix(in oklch,
      var(--color-primary, #6366f1) 3%,
      transparent);
}

.today-summary--break {
  background: color-mix(in oklch,
      var(--color-gold, #d4a72c) 4%,
      transparent);
}

.today-summary>*:not(.corner-frame) {
  position: relative;
  z-index: 1;
}

.today-summary::before,
.today-summary::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 28px;
  height: 28px;
  border-bottom: 1.5px solid var(--color-primary, #6366f1);
  opacity: 0.65;
  pointer-events: none;
}

.today-summary::before {
  left: 0;
  border-left: 1.5px solid var(--color-primary, #6366f1);
  border-radius: 0 0 0 var(--radius-lg);
}

.today-summary::after {
  right: 0;
  border-right: 1.5px solid var(--color-primary, #6366f1);
  border-radius: 0 0 var(--radius-lg) 0;
}

.today-summary__header,
.today-summary__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.today-summary__eyebrow {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.today-summary h2 {
  margin: var(--space-1) 0 0;
  font-size: var(--text-lg);
}

.today-summary__status {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
}

.today-summary__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.today-metric {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.today-metric span,
.today-summary__footer {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.today-metric strong {
  color: var(--color-text);
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
}

.today-metric--main strong {
  color: var(--color-primary);
}

.today-value--positive {
  color: var(--color-success, #16803c) !important;
}

.today-value--negative {
  color: var(--color-danger, #c0392b) !important;
}

.today-summary__footer {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.today-summary__footer strong {
  color: var(--color-text);
}

/* Add Bar */
.add-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-4);
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.quick-actions__heading {
  min-width: 160px;
}

.quick-actions__heading h3 {
  margin: 0 0 var(--space-1);
}

.quick-actions__heading span {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.quick-actions__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
  flex: 1;
}

.quick-action {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.quick-action:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.quick-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.quick-action--primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
}

.quick-action__icon {
  width: 17px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  line-height: 1;
}

.quick-action__icon svg {
  width: 16px;
  height: 16px;
}

.mobile-add-time {
  display: none;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.today-summary {
  padding: var(--space-3);
}

.today-summary__metrics {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3) var(--space-2);
}

.today-metric strong {
  font-size: var(--text-base);
}

.today-summary__footer {
  align-items: flex-start;
  flex-direction: column;
  gap: var(--space-1);
}

/* KPI Section with Corner Frame */
.kpi-section {
  position: relative;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch,
      var(--color-primary, #6366f1) 3%,
      transparent);
}

.corner-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.corner-frame::before,
.corner-frame::after {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  pointer-events: none;
  opacity: 0.65;
}

.corner-frame::before {
  top: 0;
  left: 0;
  border-top: 1.5px solid var(--color-primary, #6366f1);
  border-left: 1.5px solid var(--color-primary, #6366f1);
  border-radius: var(--radius-lg) 0 0 0;
}

.corner-frame::after {
  top: 0;
  right: 0;
  border-top: 1.5px solid var(--color-primary, #6366f1);
  border-right: 1.5px solid var(--color-primary, #6366f1);
  border-radius: 0 var(--radius-lg) 0 0;
}

.kpi-section::before {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  bottom: 0;
  left: 0;
  border-bottom: 1.5px solid var(--color-primary, #6366f1);
  border-left: 1.5px solid var(--color-primary, #6366f1);
  border-radius: 0 0 0 var(--radius-lg);
  opacity: 0.65;
  pointer-events: none;
  z-index: 0;
}

.kpi-section::after {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  bottom: 0;
  right: 0;
  border-bottom: 1.5px solid var(--color-primary, #6366f1);
  border-right: 1.5px solid var(--color-primary, #6366f1);
  border-radius: 0 0 var(--radius-lg) 0;
  opacity: 0.65;
  pointer-events: none;
  z-index: 0;
}

/* Laptop */
@media (max-width: 1024px) {
  .main {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mobile */
@media (max-width: 767px) {
  .main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .add-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .add-bar .btn {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }

  .quick-actions {
    display: block;
    padding: var(--space-2);
  }

  .quick-actions__heading {
    margin-bottom: var(--space-2);
  }

  .quick-actions__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-action {
    min-height: 48px;
    flex-direction: column;
    gap: var(--space-1);
    font-size: 0.7rem;
  }

  .mobile-add-time {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    position: fixed;
    right: var(--space-4);
    bottom: calc(76px + env(safe-area-inset-bottom));
    z-index: 20;
    min-height: 42px;
    padding: 0 var(--space-3);
    border: 0;
    border-radius: 999px;
    background: var(--color-primary);
    color: var(--color-on-primary, #fff);
    box-shadow: var(--shadow-lg);
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .mobile-add-time span {
    font-size: 1.2rem;
    line-height: 1;
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
