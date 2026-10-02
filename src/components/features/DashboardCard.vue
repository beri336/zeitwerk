<!-- src/components/features/DashboardCard.vue -->

<template>
  <main class="main">

    <!-- Device Chip -->
    <DeviceChip />

    <!-- Absence Legend -->
    <AbsenceLegend />

    <!-- ── Month Overview ── -->
    <h3>{{ $t("dashboard.month.title") }}</h3>
    <section class="kpi-section">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="kpi-grid">
        <KpiCard
          :label="$t('dashboard.month.actual')"
          :value="formatHours(store.monthActual)"
          :sub="`${$t('common.planned')}: ${formatHours(store.monthPlanned)}`"
          :variant="monthActualVariant"
        />

        <KpiCard
          :label="$t('dashboard.month.diff')"
          :value="`${store.monthDiff >= 0 ? '+' : ''}${formatHours(store.monthDiff)}`"
          :sub="
            store.monthDiff >= 0
              ? $t('dashboard.month.overtime')
              : $t('dashboard.month.missed-hours')
          "
          :variant="monthDiffVariant"
        />

        <KpiCard
          :label="$t('dashboard.month.week_actual')"
          :value="formatHours(currentWeekActual)"
          :sub="`${$t('common.planned')}: ${formatHours(store.settings.hoursPerWeek)}`"
        />

        <KpiCard
          :label="$t('common.entries')"
          :value="String(store.entriesForMonth.length)"
          :sub="$t('dashboard.month.work_days')"
        />
        <KpiCard
          :label="$t('dashboard.month.avg_hours')"
          :value="formatHours(avgPerDay)"
          :sub="$t('dashboard.month.avg_sub')"
        />
        <KpiCard
          :label="$t('dashboard.month.active_days')"
          :value="String(activeDays)"
          :sub="$t('dashboard.month.active_sub')"
        />

        <KpiCard
          v-if="longestDay"
          :label="$t('dashboard.month.longest')"
          :value="formatHours(calcActualHours(longestDay))"
          :sub="longestDay.date"
        />

        <KpiCard
          v-if="store.grossHourlyRate > 0"
          :label="$t('dashboard.month.gross')"
          :value="mask(monthGrossLabel)"
          :sub="$t('dashboard.month.gross_sub')"
          variant="ok"
          :private="true"
        />
      </div>
    </section>

    <!-- ── Year Overview ── -->
    <h3>{{ $t("dashboard.year.title") }}</h3>
    <section class="kpi-section" aria-label="Year summary">
      <div class="corner-frame" aria-hidden="true"></div>
      <div class="kpi-grid">
        <KpiCard
          :label="$t('dashboard.year.months')"
          :value="String(yearMonthsWithEntries)"
        />
        <KpiCard :label="$t('common.entries')" :value="String(yearEntries.length)" />
        <KpiCard :label="$t('common.actual')" :value="formatHours(yearActual)" />
        <KpiCard :label="$t('common.planned')" :value="formatHours(yearPlanned)" />

        <KpiCard
          :label="$t('dashboard.year.diff')"
          :value="`${yearDiff >= 0 ? '+' : ''}${formatHours(yearDiff)}`"
          :sub="yearDiff >= 0 ? $t('dashboard.year.overtime') : $t('dashboard.year.missed-hours')"
          :variant="yearDiff >= 0 ? 'ok' : 'err'"
        />

        <KpiCard
          v-if="store.grossHourlyRate > 0"
          :label="$t('dashboard.year.gross')"
          :value="mask(yearGrossLabel)"
          :sub="$t('dashboard.year.gross_sub')"
          variant="ok"
          :private="true"
        />

        <KpiCard
          :label="$t('dashboard.year.vac_used')"
          :value="String(store.usedVacationDays)"
          :sub="$t('dashboard.year.vac_used_sub')"
        />

        <KpiCard
          :label="$t('dashboard.year.vac_left')" 
          :value="String(store.remainingVacationDays)"
          :sub="store.remainingVacationDays === 1 ? $t('dashboard.year.vac_day_left_sub') : $t('dashboard.year.vac_days_left_sub')"
        />
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
            <svg v-if="store.liveStatus === 'idle' || store.liveStatus === 'break'" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.29-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/></svg>
          </span>
          <span>{{ $t("dashboard.quick_actions.today") }}</span>
        </button>
      </div>
    </section>

    <!-- ── Add Bar Item ── -->
    <div class="add-bar">
      <button class="btn btn-primary" @click="openAdd">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
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
import { ref, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useToast } from "@/composables/useToast";
import {
  formatHours,
  getKW,
  today,
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
const { mask } = usePrivacy();
const { showToast } = useToast();

// Month KPIs
const currentWeekKW = computed(() => getKW(today()));

const currentWeekActual = computed(() => {
  const group = store.weekGroups.find((g) => g.kw === currentWeekKW.value);

  return group ? group.actual : 0;
});

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

async function openToday() {
  await nextTick();
  document.querySelector(".month-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

/* KPI Section with Corner Frame */
.kpi-section {
  position: relative;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(
    in oklch,
    var(--color-primary, #6366f1) 3%,
    transparent
  );
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
