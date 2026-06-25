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
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
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

function openAdd() {
  editEntry.value = null;
  showModal.value = true;
}
function openEdit(entry) {
  editEntry.value = entry;
  showModal.value = true;
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
}

/* Small Mobile */
@media (max-width: 420px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
