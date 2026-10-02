<!-- src/components/features/WeekOverview.vue -->

<template>
  <main class="main">
    <section class="cal-toolbar" aria-label="Calendar navigation">
      <button class="cal-nav-btn" type="button" @click="shiftWeek(-1)" aria-label="Previous week">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="cal-week-label" aria-live="polite">{{ weekLabel }}</div>

      <button class="cal-nav-btn" type="button" @click="shiftWeek(1)" aria-label="Next week">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <button class="cal-today-chip" type="button" @click="goToToday" :disabled="isCurrentWeek"
        aria-label="Jump to current week">
        {{ $t("common.today") }}
      </button>
    </section>

    <p class="cal-hint">{{ $t("week.hint") }}</p>

    <section class="cal-header" aria-label="Week statistics">
      <div class="cal-stats">
        <div class="cal-stat">
          <span class="cal-stat-label">{{ $t("month.working_days") }}</span>
          <span class="cal-stat-value">{{ workdays }}</span>
        </div>
        <div class="cal-stat">
          <span class="cal-stat-label">{{ $t("common.entries") }}</span>
          <span class="cal-stat-value">{{ weekEntries.length }}</span>
        </div>
        <div class="cal-stat">
          <span class="cal-stat-label">{{ $t("month.actual") }}</span>
          <span class="cal-stat-value" :class="weekDiff >= 0 ? 'stat-ok' : 'stat-err'">
            {{ formatHours(weekActual) }}
          </span>
        </div>
        <div class="cal-stat">
          <span class="cal-stat-label">{{ $t("month.planned") }}</span>
          <span class="cal-stat-value">{{ formatHours(weekPlanned) }}</span>
        </div>
        <div class="cal-stat">
          <span class="cal-stat-label">{{ $t("month.diff") }}</span>
          <span class="cal-stat-value" :class="weekDiff >= 0 ? 'stat-ok' : 'stat-err'">
            {{ weekDiff >= 0 ? "+" : "" }}{{ formatHours(weekDiff) }}
          </span>
        </div>
      </div>
    </section>

    <section class="cal-grid-wrap" aria-label="Week calendar">
      <div class="cal-grid">
        <div v-for="(header, index) in dayHeaders" :key="header" class="cal-weekday"
          :class="{ 'cal-weekday--weekend': index > 4 }">
          {{ header }}
        </div>

        <CalendarDay v-for="day in weekDays" :key="day.date" :date="day.date" :is-today="day.date === todayStr"
          compact :flash-today="flashToday && day.date === todayStr" @click="onDayClick" />
      </div>
    </section>

    <EntryModal v-model="showModal" :edit-entry="editEntry" :prefill-date="clickedDate" />
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { formatHours } from "@/composables/useTime";
import CalendarDay from "@/components/CalendarDay.vue";
import EntryModal from "@/components/EntryModal.vue";

const store = useZeitwerkStore();
const { locale } = useI18n();
const route = useRoute();

const showModal = ref(false);
const editEntry = ref(null);
const clickedDate = ref(null);
const flashToday = ref(false);
const weekStart = ref(getMonday(new Date()));

const dayHeaders = computed(() =>
  weekDays.value.map(({ date }) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(locale.value, {
      weekday: "short",
    }),
  ),
);

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.value);
    date.setDate(date.getDate() + index);
    return { date: formatDate(date) };
  }),
);

const weekEntries = computed(() => {
  const dates = new Set(weekDays.value.map((day) => day.date));
  return store.entries.filter((entry) => dates.has(entry.date));
});

const weekActual = computed(() =>
  weekEntries.value.reduce(
    (total, entry) => total + store.effectiveActualHours(entry),
    0,
  ),
);

const weekPlanned = computed(() =>
  weekEntries.value.reduce(
    (total, entry) =>
      total + (entry.plannedHours ?? store.settings.hoursPerDay),
    0,
  ),
);

const weekDiff = computed(() => weekActual.value - weekPlanned.value);

const workdays = computed(() =>
  weekDays.value.filter(({ date }) => {
    const day = new Date(`${date}T00:00:00`).getDay();
    return day !== 0 && day !== 6;
  }).length,
);

const todayStr = computed(() => formatDate(new Date()));
const isCurrentWeek = computed(() => weekDays.value.some(({ date }) => date === todayStr.value));

const weekLabel = computed(() => {
  const start = new Date(`${weekDays.value[0].date}T00:00:00`);
  const end = new Date(`${weekDays.value[6].date}T00:00:00`);
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString(locale.value, options)} – ${end.toLocaleDateString(locale.value, options)}`;
});

function getMonday(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftWeek(amount) {
  const next = new Date(weekStart.value);
  next.setDate(next.getDate() + amount * 7);
  weekStart.value = next;
}

function goToToday() {
  weekStart.value = getMonday(new Date());
  flashToday.value = true;
  window.setTimeout(() => {
    flashToday.value = false;
  }, 1800);
}

function onDayClick(date) {
  clickedDate.value = date;
  editEntry.value = store.entries.find((entry) => entry.date === date) ?? null;
  showModal.value = true;
}

onMounted(() => {
  if (route.query.today) {
    goToToday();
  }
});
</script>

<style scoped>
.main {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cal-toolbar {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 36px auto;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.cal-week-label {
  text-align: center;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-nav-btn,
.cal-today-chip {
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
}

.cal-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
}

.cal-nav-btn:hover,
.cal-today-chip:hover {
  background: var(--color-surface-offset);
  color: var(--color-text);
}

.cal-today-chip {
  padding: 0 var(--space-2);
  color: var(--color-text);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}

.cal-today-chip:disabled {
  opacity: 0.55;
  cursor: default;
}

.cal-hint {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-top: calc(var(--space-2) * -1);
}

.cal-stats {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.cal-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 108px;
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.cal-stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.cal-stat-value {
  font-size: var(--text-base);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stat-ok {
  color: var(--color-success);
}

.stat-err {
  color: var(--color-error);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.cal-weekday {
  text-align: center;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: var(--space-2) 0;
}

.cal-weekday--weekend {
  color: var(--color-warning);
}

@media (max-width: 900px) {
  .cal-grid {
    gap: var(--space-1);
  }

  .cal-stats {
    gap: var(--space-4);
  }
}

@media (max-width: 767px) {
  .main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .cal-hint {
    margin-top: 0;
  }

  .cal-grid {
    gap: 3px;
  }

  .cal-weekday {
    font-size: 0.65rem;
    padding: var(--space-1) 0;
    letter-spacing: 0;
  }

  .cal-toolbar {
    grid-template-columns: 36px minmax(0, 1fr) 36px;
    grid-template-areas: "prev week next" "today today today";
  }

  .cal-toolbar>.cal-nav-btn:first-child {
    grid-area: prev;
  }

  .cal-toolbar>.cal-nav-btn:nth-of-type(2) {
    grid-area: next;
    justify-self: end;
  }

  .cal-week-label {
    grid-area: week;
  }

  .cal-today-chip {
    grid-area: today;
    width: 100%;
    margin-top: var(--space-1);
  }

  .cal-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    width: 100%;
  }

  .cal-stat {
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
  }

  .cal-grid {
    padding: var(--space-2);
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 420px) {
  .main {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .cal-grid {
    gap: 2px;
  }

  .cal-weekday {
    font-size: 0.6rem;
  }

  .cal-stats {
    gap: var(--space-2);
  }

  .cal-stat {
    padding: var(--space-1-5, 0.375rem) var(--space-2);
  }

  .cal-grid {
    padding: var(--space-1-5, 0.375rem);
  }
}
</style>
