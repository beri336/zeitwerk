<!-- src/components/features/HabitTrackerCard.vue -->

<template>
  <div class="habit-wrapper">
    <!-- Header -->
    <header class="habit-header">
      <h1 class="habit-title">{{ $t("habits.title") }}</h1>
      <span class="habit-badge">{{
        $t("habits.today_count", {
          done: todayDoneCount,
          total: todayHabitCount,
        })
      }}</span>
      <button class="btn btn-primary btn-sm ml-auto" @click="openModal()">
        + {{ $t("habits.add_btn") }}
      </button>
    </header>

    <!-- Week Strip -->
    <div class="week-strip">
      <div
        v-for="day in weekStrip"
        :key="day.dateStr"
        class="week-day"
        :class="{
          'week-day--today': day.isToday,
          'week-day--selected': selectedDate === day.dateStr,
        }"
        @click="selectedDate = day.dateStr"
      >
        <span class="week-wd">{{ day.wd }}</span>
        <span class="week-num">{{ day.num }}</span>
        <span class="week-dot" :class="dayCompletionClass(day.dateStr)"></span>
      </div>
    </div>

    <!-- Date Label -->
    <div class="date-label">
      {{ selectedDateLabel }}
      <span v-if="selectedDate === todayStr" class="today-chip">{{
        $t("common.today")
      }}</span>
    </div>

    <!-- Habit List -->
    <TransitionGroup name="habit-list" tag="div" class="habit-list">
      <div
        v-for="habit in visibleHabits"
        :key="habit.id"
        class="habit-item"
        :class="{ 'habit-item--done': isDone(habit.id, selectedDate) }"
      >
        <!-- Check Button -->
        <button
          class="habit-check"
          :style="{ borderColor: habit.color }"
          :class="{ 'habit-check--done': isDone(habit.id, selectedDate) }"
          @click="toggleHabit(habit.id, selectedDate)"
        >
          <svg
            v-if="isDone(habit.id, selectedDate)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="13"
            height="13"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Content -->
        <div class="habit-content">
          <div class="habit-main-row">
            <span class="habit-icon">{{ habit.icon }}</span>
            <span class="habit-name">{{ habit.name }}</span>
            <span v-if="habit.goal" class="habit-goal">{{ habit.goal }}</span>
          </div>
          <!-- Streak + Last 7 Days -->
          <div class="habit-meta">
            <span
              class="streak-badge"
              :class="{ 'streak-badge--active': currentStreak(habit.id) > 0 }"
            >
              🔥
              {{
                $t(
                  currentStreak(habit.id) === 1
                    ? "habits.streak_one"
                    : "habits.streak_other",
                  { count: currentStreak(habit.id) },
                )
              }}
            </span>
            <div class="mini-calendar">
              <div
                v-for="d in last7(habit.id)"
                :key="d.dateStr"
                class="mini-dot"
                :class="d.done ? 'mini-dot--done' : 'mini-dot--miss'"
                :style="d.done ? { background: habit.color } : {}"
                :title="d.dateStr"
              ></div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="habit-actions">
          <button
            class="icon-btn"
            @click="openModal(habit.id)"
            :title="$t('common.edit')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="13"
              height="13"
            >
              <path
                d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"
              />
            </svg>
          </button>
          <button
            class="icon-btn icon-btn--danger"
            @click="removeHabit(habit.id)"
            :title="$t('common.delete')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="13"
              height="13"
            >
              <path
                fill-rule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Empty State -->
    <div v-if="visibleHabits.length === 0" class="habit-empty">
      <p>{{ $t("habits.empty") }}</p>
    </div>

    <!-- Stats Bar -->
    <div v-if="habits.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ totalCompletionsThisWeek }}</span>
        <span class="stat-label">{{ $t("habits.stats.this_week") }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ bestStreakOverall }}</span>
        <span class="stat-label">{{ $t("habits.stats.best_streak") }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ completionRateThisWeek }}%</span>
        <span class="stat-label">{{ $t("habits.stats.week_rate") }}</span>
      </div>
    </div>

    <!-- View Toggle -->
    <div v-if="habits.length > 0" class="view-toggle">
      <button
        v-for="v in historyViews"
        :key="v.key"
        class="freq-btn"
        :class="{ active: historyView === v.key }"
        @click="historyView = v.key"
      >
        {{ v.label }}
      </button>
    </div>

    <!-- Month View -->
    <div
      v-if="habits.length > 0 && historyView === 'month'"
      class="history-card"
    >
      <div class="history-header">
        <button class="icon-btn" @click="prevMonth">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="15"
            height="15"
          >
            <path
              fill-rule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <span class="history-title">{{ monthLabel }}</span>
        <button class="icon-btn" @click="nextMonth" :disabled="!canGoNextMonth">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="15"
            height="15"
          >
            <path
              fill-rule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Weekday Labels -->
      <div class="month-grid-header">
        <span v-for="day in monthWeekdays" :key="day" class="month-wd">{{
          day
        }}</span>
      </div>

      <!-- Day Grid -->
      <div class="month-grid">
        <div
          v-for="cell in monthCells"
          :key="cell.key"
          class="month-cell"
          :class="{
            'month-cell--outside': !cell.currentMonth,
            'month-cell--today': cell.dateStr === todayStr,
            'month-cell--selected': cell.dateStr === selectedDate,
          }"
          @click="cell.currentMonth && (selectedDate = cell.dateStr)"
        >
          <span class="month-day-num">{{ cell.day }}</span>
          <!-- Per-Habit dots -->
          <div class="month-cell-dots">
            <div
              v-for="habit in habits.filter((h) =>
                isValidDayForHabit(h.id, cell.dateStr),
              )"
              :key="habit.id"
              class="month-habit-dot"
              :style="
                isDone(habit.id, cell.dateStr)
                  ? { background: habit.color }
                  : { background: 'var(--color-border, #2d3148)' }
              "
              :title="habit.name"
            ></div>
          </div>

          <!-- Completion bar -->
          <div v-if="cell.currentMonth" class="month-cell-bar">
            <div
              class="month-cell-bar-fill"
              :style="{
                width: cellCompletionRate(cell.dateStr) + '%',
                background: cellCompletionColor(cell.dateStr),
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Month Legend -->
      <div class="month-legend">
        <div v-for="habit in habits" :key="habit.id" class="legend-item">
          <span class="legend-dot" :style="{ background: habit.color }"></span>
          <span class="legend-label">{{ habit.icon }} {{ habit.name }}</span>
        </div>
      </div>
    </div>

    <!-- Year View -->
    <div
      v-if="habits.length > 0 && historyView === 'year'"
      class="history-card"
    >
      <div class="history-header">
        <button class="icon-btn" @click="viewYear--">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="15"
            height="15"
          >
            <path
              fill-rule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <span class="history-title">{{ viewYear }}</span>
        <button
          class="icon-btn"
          @click="viewYear++"
          :disabled="viewYear >= today.getFullYear()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="15"
            height="15"
          >
            <path
              fill-rule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Habit selector -->
      <div class="year-habit-tabs">
        <button
          v-for="habit in habits"
          :key="habit.id"
          class="year-habit-tab"
          :class="{ active: yearHabitId === habit.id }"
          :style="
            yearHabitId === habit.id
              ? {
                  background: habit.color + '33',
                  borderColor: habit.color,
                  color: habit.color,
                }
              : {}
          "
          @click="yearHabitId = habit.id"
        >
          {{ habit.icon }} {{ habit.name }}
        </button>
      </div>

      <!-- GitHub-styled heatmap -->
      <div class="year-heatmap-scroll">
        <div class="year-heatmap">
          <div
            v-for="month in yearMonths"
            :key="month.label"
            class="year-month-col"
          >
            <div class="year-month-label">{{ month.label }}</div>
            <div class="year-month-days">
              <!-- spacer for monday alignment -->
              <div
                v-for="n in month.startOffset"
                :key="'offset-' + n"
                class="year-day year-day--empty"
              ></div>
              <div
                v-for="day in month.days"
                :key="day.dateStr"
                class="year-day"
                :class="{
                  'year-day--today': day.dateStr === todayStr,
                  'year-day--future': day.isFuture,
                }"
                :style="
                  isDone(yearHabitId, day.dateStr)
                    ? { background: selectedYearHabit?.color, opacity: 1 }
                    : {}
                "
                :title="day.dateStr"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Year Stats for selected habit -->
      <div class="year-stats" v-if="selectedYearHabit">
        <div class="year-stat">
          <span class="year-stat-val">{{ yearCompletions }}</span>
          <span class="year-stat-lbl">{{
            $t("habits.year.days_completed")
          }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="year-stat">
          <span class="year-stat-val">{{ yearRate }}%</span>
          <span class="year-stat-lbl">{{
            $t("habits.year.completion_rate")
          }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="year-stat">
          <span class="year-stat-val">{{ yearBestStreak }}</span>
          <span class="year-stat-lbl">{{ $t("habits.year.best_streak") }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modal.open"
          class="modal-backdrop"
          @mousedown.self="closeModal"
        >
          <div class="modal">
            <header class="modal-header">
              <h2 class="modal-title">
                {{
                  modal.editId
                    ? $t("habits.modal.title_edit")
                    : $t("habits.modal.title_new")
                }}
              </h2>
              <button class="icon-btn" @click="closeModal">✕</button>
            </header>

            <div class="modal-body">
              <!-- Icon + Name -->
              <div class="field-row">
                <div class="field field--icon">
                  <label class="field-label">{{
                    $t("habits.modal.icon")
                  }}</label>
                  <input
                    v-model="form.icon"
                    class="form-input icon-input"
                    type="text"
                    maxlength="2"
                    placeholder="🏃"
                  />
                </div>
                <div class="field">
                  <label class="field-label">{{
                    $t("habits.modal.name")
                  }}</label>
                  <input
                    v-model="form.name"
                    class="form-input"
                    type="text"
                    :placeholder="$t('habits.modal.name_hint')"
                  />
                </div>
              </div>

              <!-- Goal -->
              <div class="field">
                <label class="field-label">{{ $t("habits.modal.goal") }}</label>
                <input
                  v-model="form.goal"
                  class="form-input"
                  type="text"
                  :placeholder="$t('habits.modal.goal_hint')"
                />
              </div>

              <!-- Color -->
              <div class="field">
                <label class="field-label">{{
                  $t("habits.modal.color")
                }}</label>
                <div class="color-selector">
                  <button
                    v-for="color in colorOptions"
                    :key="color"
                    class="color-btn"
                    :style="{
                      background: color,
                      borderColor:
                        form.color === color ? '#fff' : 'transparent',
                    }"
                    @click="form.color = color"
                  >
                    <svg
                      v-if="form.color === color"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="white"
                      width="11"
                      height="11"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Frequency -->
              <div class="field">
                <label class="field-label">{{
                  $t("habits.modal.frequency")
                }}</label>
                <div class="freq-selector">
                  <button
                    v-for="freq in frequencies"
                    :key="freq.key"
                    class="freq-btn"
                    :class="{ active: form.frequency === freq.key }"
                    @click="form.frequency = freq.key"
                  >
                    {{ freq.label }}
                  </button>
                </div>
              </div>
            </div>

            <footer class="modal-footer">
              <button class="btn btn-ghost" @click="closeModal">
                {{ $t("common.cancel") }}
              </button>
              <button
                class="btn btn-primary"
                :disabled="!form.name.trim()"
                @click="saveModal"
              >
                {{ modal.editId ? $t("common.save") : $t("common.create") }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useHabitStore } from "@/composables/useHabitStore";

const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

// Helpers
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const today = new Date();
const todayStr = toDateStr(today);

// State
const habitStore = useHabitStore();
const { habits, completions } = storeToRefs(habitStore);

const storedHabits = localStorage.getItem("habits");

const selectedDate = ref(todayStr);

// Persist
function persistCompletions() {
  habitStore.persistCompletions();
}

// Constants
const colorOptions = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#a855f7",
  "#f97316",
];

const frequencies = computed(() => [
  { key: "daily", label: t("habits.freq.daily") },
  { key: "weekdays", label: t("habits.freq.weekdays") },
  { key: "weekend", label: t("habits.freq.weekend") },
]);

// Week Strip
const weekStrip = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);
    const dateStr = toDateStr(date);

    return {
      dateStr,
      wd: date.toLocaleDateString(currentLocale.value, { weekday: "short" }),
      num: date.getDate(),
      isToday: dateStr === todayStr,
    };
  });
});

const selectedDateLabel = computed(() => {
  const d = new Date(selectedDate.value + "T00:00");
  return d.toLocaleDateString(currentLocale.value, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});

// Completion Logic
function isValidDayForHabit(habitId, dateStr) {
  const habit = habits.value.find((h) => h.id === habitId);

  if (!habit) return false;

  const date = new Date(dateStr + "T00:00");
  const dow = date.getDay();

  switch (habit.frequency) {
    case "daily":
      return true;

    case "weekdays":
      return dow >= 1 && dow <= 5;

    case "weekend":
      return dow === 0 || dow === 6;

    default:
      return false;
  }
}

const monthWeekdays = computed(() => {
  const base = new Date(2023, 0, 2); // Montag
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toLocaleDateString(currentLocale.value, { weekday: "short" });
  });
});

function habitsForDate(dateStr) {
  return habits.value.filter((h) => isValidDayForHabit(h.id, dateStr));
}

function isDone(habitId, dateStr) {
  const isCompleted = completions.value[habitId]?.has(dateStr) ?? false;
  return isCompleted && isValidDayForHabit(habitId, dateStr);
}

function toggleHabit(habitId, dateStr) {
  if (!isValidDayForHabit(habitId, dateStr)) return;

  if (!completions.value[habitId]) {
    completions.value[habitId] = new Set();
  }

  if (completions.value[habitId].has(dateStr)) {
    completions.value[habitId].delete(dateStr);
  } else {
    completions.value[habitId].add(dateStr);
  }

  persistCompletions();
}

// Streak
function currentStreak(habitId) {
  let date = new Date(today);

  // Find most recent scheduled occurrence
  while (!isValidDayForHabit(habitId, toDateStr(date))) {
    date.setDate(date.getDate() - 1);
  }

  let streak = 0;

  while (true) {
    const dateStr = toDateStr(date);

    if (!isDone(habitId, dateStr)) break;

    streak++;

    const prev = previousScheduledDate(habitId, date);

    if (!prev) break;

    date = prev;
  }

  return streak;
}

function previousScheduledDate(habitId, date) {
  const d = new Date(date);

  for (let i = 0; i < 370; i++) {
    d.setDate(d.getDate() - 1);

    if (isValidDayForHabit(habitId, toDateStr(d))) return new Date(d);
  }

  return null;
}

function bestStreak(habitId) {
  const completedDates = [...(completions.value[habitId] ?? [])]
    .filter((date) => isDone(habitId, date))
    .sort();

  if (!completedDates.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const prevCompleted = completedDates[i - 1];
    const currentCompleted = completedDates[i];

    const expectedPrevious = toDateStr(
      previousScheduledDate(habitId, new Date(currentCompleted + "T00:00")),
    );

    if (prevCompleted === expectedPrevious) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

// Last 7 Mini Dots
function last7(habitId) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const dateStr = toDateStr(date);

    return {
      dateStr,
      done: isDone(habitId, dateStr),
    };
  });
}

// Day Completion Dot Color
function dayCompletionClass(dateStr) {
  const validHabits = habitsForDate(dateStr);

  if (!validHabits.length) return "";

  const done = validHabits.filter((h) => isDone(h.id, dateStr)).length;

  if (done === 0) return "dot--none";

  if (done === validHabits.length) return "dot--full";

  return "dot--partial";
}

// Stats
const todayDoneCount = computed(() => {
  return habits.value.filter(
    (h) => isValidDayForHabit(h.id, todayStr) && isDone(h.id, todayStr),
  ).length;
});

const todayHabitCount = computed(
  () => habits.value.filter((h) => isValidDayForHabit(h.id, todayStr)).length,
);

const totalCompletionsThisWeek = computed(() => {
  const dates = weekStrip.value.map((d) => d.dateStr);

  return habits.value.reduce(
    (sum, h) => sum + dates.filter((d) => isDone(h.id, d)).length,
    0,
  );
});

const completionRateThisWeek = computed(() => {
  if (!habits.value.length) return 0;

  let possible = 0;
  habits.value.forEach((h) => {
    weekStrip.value.forEach((d) => {
      if (isValidDayForHabit(h.id, d.dateStr)) possible++;
    });
  });

  return possible === 0
    ? 0
    : Math.round((totalCompletionsThisWeek.value / possible) * 100);
});

const bestStreakOverall = computed(() =>
  habits.value.length
    ? Math.max(...habits.value.map((h) => bestStreak(h.id)))
    : 0,
);

// Modal
const modal = reactive({ open: false, editId: null });

const defaultForm = () => ({
  name: "",
  icon: "✅",
  goal: "",
  color: "#6366f1",
  frequency: "daily",
});

const form = reactive(defaultForm());

function openModal(editId = null) {
  Object.assign(form, defaultForm());
  modal.editId = editId;

  if (editId) {
    const habit = habits.value.find((h) => h.id === editId);

    if (habit) Object.assign(form, { ...habit });
  }
  modal.open = true;
}

function closeModal() {
  modal.open = false;
}

function saveModal() {
  if (!form.name.trim()) return;

  if (modal.editId) {
    const habit = habits.value.find((h) => h.id === modal.editId);
    if (habit) Object.assign(habit, { ...form });
  } else {
    habits.value.push({
      id: habitStore.getNextId(),
      name: form.name.trim(),
      icon: form.icon || "✅",
      goal: form.goal,
      color: form.color,
      frequency: form.frequency,
      createdAt: Date.now(),
    });
  }
  closeModal();
}

function removeHabit(id) {
  habits.value = habits.value.filter((h) => h.id !== id);
  delete completions.value[id];
  persistCompletions();
}

const visibleHabits = computed(() =>
  habits.value.filter((h) => isValidDayForHabit(h.id, selectedDate.value)),
);

// Month and Year view state and logic
// History Views
const historyView = ref("month");
const historyViews = computed(() => [
  { key: "month", label: t("calendar.views.month") },
  { key: "year", label: t("calendar.views.year") },
]);

// Month View State
const viewMonth = ref(today.getMonth()); // 0-indexed
const viewMonthYear = ref(today.getFullYear());

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewMonthYear.value--;
  } else {
    viewMonth.value--;
  }
}
function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewMonthYear.value++;
  } else {
    viewMonth.value++;
  }
}

const canGoNextMonth = computed(() => {
  if (viewMonthYear.value < today.getFullYear()) return true;

  return viewMonth.value < today.getMonth();
});

const monthLabel = computed(() =>
  new Date(viewMonthYear.value, viewMonth.value, 1).toLocaleDateString(
    currentLocale.value,
    { month: "long", year: "numeric" },
  ),
);

const monthCells = computed(() => {
  const year = viewMonthYear.value;
  const month = viewMonth.value;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7; // Monday = 0
  const cells = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const dateStr = toDateStr(d);
    cells.push({
      key: "pre-" + dateStr,
      day: d.getDate(),
      dateStr,
      currentMonth: false,
    });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = toDateStr(date);
    cells.push({ key: dateStr, day: d, dateStr, currentMonth: true });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = toDateStr(d);
    cells.push({
      key: "post-" + dateStr,
      day: d.getDate(),
      dateStr,
      currentMonth: false,
    });
  }
  return cells;
});

function cellCompletionRate(dateStr) {
  const validHabits = habits.value.filter((h) =>
    isValidDayForHabit(h.id, dateStr),
  );

  if (!validHabits.length) return 0;

  const done = validHabits.filter((h) => isDone(h.id, dateStr)).length;

  return Math.round((done / validHabits.length) * 100);
}

function cellCompletionColor(dateStr) {
  const rate = cellCompletionRate(dateStr);

  if (rate === 0) return "var(--color-border, #2d3148)";

  if (rate === 100) return "#22c55e";

  if (rate >= 50) return "#f59e0b";

  return "#ef444488";
}

// Year View State
const viewYear = ref(today.getFullYear());
const yearHabitId = ref(habits.value[0]?.id ?? null);

// When new habits are added and none have been selected yet
watch(
  habits,
  (val) => {
    if (!yearHabitId.value && val.length) yearHabitId.value = val[0].id;
  },
  { immediate: true },
);

const selectedYearHabit = computed(
  () => habits.value.find((h) => h.id === yearHabitId.value) ?? null,
);

const yearMonths = computed(() => {
  const year = viewYear.value;

  return Array.from({ length: 12 }, (_, m) => {
    const lang = currentLocale.value;
    const label = new Date(year, m, 1).toLocaleDateString(lang, {
      month: "short",
    });
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const firstDow = (new Date(year, m, 1).getDay() + 6) % 7; // Mon = 0

    const days = Array.from({ length: daysInMonth }, (_, d) => {
      const date = new Date(year, m, d + 1);
      const dateStr = toDateStr(date);

      return {
        dateStr,
        isFuture: date > today,
      };
    });
    return {
      label,
      startOffset: firstDow,
      days,
    };
  });
});

const yearCompletions = computed(() => {
  if (!yearHabitId.value) return 0;

  const year = viewYear.value;

  return [...(completions.value[yearHabitId.value] ?? [])].filter(
    (d) => d.startsWith(String(year)) && isDone(yearHabitId.value, d),
  ).length;
});

const yearRate = computed(() => {
  if (!yearHabitId.value) return 0;

  const year = viewYear.value;
  const lastDay =
    viewYear.value < today.getFullYear() ? new Date(year, 11, 31) : today;

  let validDays = 0;
  const checkDate = new Date(year, 0, 1);
  while (checkDate <= lastDay) {
    if (isValidDayForHabit(yearHabitId.value, toDateStr(checkDate)))
      validDays++;
    checkDate.setDate(checkDate.getDate() + 1);
  }

  if (!validDays) return 0;

  return Math.round((yearCompletions.value / validDays) * 100);
});

const yearBestStreak = computed(() => {
  if (!yearHabitId.value) return 0;

  return bestStreak(yearHabitId.value);
});
</script>

<style scoped>
/* Wrapper */
.habit-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.ml-auto {
  margin-left: auto;
}

/* Header */
.habit-header {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
}

.habit-title {
  font-size: var(--font-size-xl, 1.5rem);
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
  margin: 0;
}

.habit-badge {
  background: var(--color-primary, #6366f1);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

/* Week Strip */
.week-strip {
  display: flex;
  gap: 6px;
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 0.75rem;
  justify-content: space-between;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  cursor: pointer;
  transition: background 0.15s;
  flex: 1;
}

.week-day:hover {
  background: var(--color-surface-hover, #252840);
}

.week-day--today {
  background: color-mix(
    in srgb,
    var(--color-primary, #6366f1) 12%,
    transparent
  );
}

.week-day--selected {
  background: var(--color-primary, #6366f1) !important;
}

.week-day--selected .week-wd,
.week-day--selected .week-num {
  color: #fff;
}

.week-wd {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted, #94a3b8);
  letter-spacing: 0.05em;
}

.week-num {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text, #e2e8f0);
}

.week-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s;
}

.dot--none {
  background: var(--color-border, #2d3148);
}

.dot--partial {
  background: #f59e0b;
}

.dot--full {
  background: #22c55e;
}

/* Date Label */
.date-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted, #94a3b8);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.today-chip {
  background: color-mix(
    in srgb,
    var(--color-primary, #6366f1) 20%,
    transparent
  );
  color: var(--color-primary, #6366f1);
  font-size: 0.7rem;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid
    color-mix(in srgb, var(--color-primary, #6366f1) 40%, transparent);
}

/* Habit List */
.habit-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 0.75rem 0.875rem;
  transition:
    border-color 0.2s,
    opacity 0.2s;
}

.habit-item:hover {
  border-color: var(--color-primary, #6366f1);
}

.habit-item--done {
  opacity: 0.65;
}

/* Check Button */
.habit-check {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border, #2d3148);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  color: #fff;
}

.habit-check--done {
  background: v-bind('habits.find ? "currentColor" : "#6366f1"');
}

/* Content */
.habit-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.habit-main-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.habit-icon {
  font-size: 1rem;
  line-height: 1;
}

.habit-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text, #e2e8f0);
}

.habit-item--done .habit-name {
  text-decoration: line-through;
  color: var(--color-text-muted, #94a3b8);
}

.habit-goal {
  font-size: 0.72rem;
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-surface-hover, #252840);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: 999px;
  padding: 1px 7px;
}

/* Meta: Streak + Mini Dots */
.habit-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.streak-badge {
  font-size: 0.72rem;
  color: var(--color-text-muted, #94a3b8);
}

.streak-badge--active {
  color: #f59e0b;
}

.mini-calendar {
  display: flex;
  gap: 3px;
  align-items: center;
}

.mini-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transition: background 0.2s;
}

.mini-dot--miss {
  background: var(--color-border, #2d3148);
}

/* Actions */
.habit-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.habit-item:hover .habit-actions {
  opacity: 1;
}

/* Empty */
.habit-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  padding: var(--space-6, 2rem) 0;
  font-size: 0.9rem;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 0.9rem 1rem;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary, #6366f1);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #94a3b8);
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border, #2d3148);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: calc(var(--radius, 0.5rem) * 1.5);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border, #2d3148);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 65vh;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border, #2d3148);
}

/* Form Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.field--icon {
  flex: 0 0 72px;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted, #94a3b8);
}

.form-input {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  color: var(--color-text, #e2e8f0);
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--color-primary, #6366f1);
}

.icon-input {
  text-align: center;
  font-size: 1.2rem;
}

/* Color Selector */
.color-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.15s,
    transform 0.15s;
}

.color-btn:hover {
  transform: scale(1.15);
}

/* Frequency Selector */
.freq-selector {
  display: flex;
  gap: 4px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 4px;
}

.freq-btn {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  min-height: 36px;
}

.freq-btn.active {
  background: var(--color-primary, #6366f1);
  color: #fff;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: var(--radius, 0.5rem);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary, #6366f1);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #4f46e5);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  border: 1px solid var(--color-border, #2d3148);
}

.btn-ghost:hover {
  background: var(--color-surface-hover, #252840);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.icon-btn:hover {
  background: var(--color-surface-hover, #252840);
  color: var(--color-text, #e2e8f0);
}

.icon-btn--danger:hover {
  color: #f87171;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 4px;
  width: fit-content;
}

/* History Card */
.history-card {
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.history-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #e2e8f0);
}

/* Month Grid */
.month-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.month-wd {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 0;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.month-cell {
  min-height: 62px;
  background: var(--color-surface-hover, #252840);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  padding: 5px;
  cursor: pointer;
  transition: border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

.month-cell:hover {
  border-color: var(--color-primary, #6366f1);
}

.month-cell--outside {
  opacity: 0.25;
  pointer-events: none;
}

.month-cell--today {
  border-color: var(--color-primary, #6366f1);
}

.month-cell--selected {
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 2px var(--color-primary, #6366f1);
}

.month-day-num {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted, #94a3b8);
  line-height: 1;
}

.month-cell--today .month-day-num {
  background: var(--color-primary, #6366f1);
  color: #fff;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}

.month-cell-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.month-habit-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transition: background 0.2s;
}

.month-cell-bar {
  margin-top: auto;
  height: 3px;
  background: var(--color-border, #2d3148);
  border-radius: 999px;
  overflow: hidden;
}

.month-cell-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.3s ease,
    background 0.3s ease;
}

/* Month Legend */
.month-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 0.4rem;
  border-top: 1px solid var(--color-border, #2d3148);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--color-text-muted, #94a3b8);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  white-space: nowrap;
}

/* Year Habit Tabs */
.year-habit-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.year-habit-tab {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #2d3148);
  background: var(--color-surface-hover, #252840);
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 32px;
}

.year-habit-tab:hover {
  border-color: var(--color-primary, #6366f1);
}

/* Year Heatmap */
.year-heatmap-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.year-heatmap {
  display: flex;
  gap: 6px;
  min-width: max-content;
}

.year-month-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.year-month-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #94a3b8);
  text-align: center;
}

.year-month-days {
  display: grid;
  grid-template-columns: repeat(7, 10px);
  gap: 2px;
}

.year-day {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--color-border, #2d3148);
  transition: background 0.2s;
  cursor: default;
}

.year-day--empty {
  background: transparent;
}

.year-day--future {
  opacity: 0.25;
}

.year-day--today {
  outline: 1px solid var(--color-primary, #6366f1);
}

/* Year Stats */
.year-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border, #2d3148);
  gap: 0.5rem;
}

.year-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.year-stat-val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary, #6366f1);
}

.year-stat-lbl {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #94a3b8);
  font-weight: 600;
  text-align: center;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.habit-list-enter-active,
.habit-list-leave-active {
  transition: all 0.25s ease;
}

.habit-list-enter-from,
.habit-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Mobile */
@media (max-width: 767px) {
  .habit-wrapper {
    gap: var(--space-3, 0.75rem);
  }

  .habit-header {
    gap: var(--space-2);
  }

  .habit-title {
    font-size: 1.1rem;
  }

  .week-strip {
    padding: 0.5rem;
    gap: 3px;
  }

  .week-day {
    padding: 5px 4px;
  }

  .week-num {
    font-size: 0.8rem;
  }

  .habit-check {
    width: 32px;
    height: 32px;
  }

  .habit-actions {
    opacity: 1;
  }

  .month-cell {
    min-height: 44px;
    padding: 3px;
  }

  .history-card {
    padding: 0.75rem;
  }

  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    border-radius: calc(var(--radius, 0.5rem) * 1.5)
      calc(var(--radius, 0.5rem) * 1.5) 0 0;
    max-height: 92dvh;
  }

  .modal-body {
    max-height: 55vh;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .week-day {
    padding: 4px 2px;
    gap: 3px;
  }

  .week-wd {
    font-size: 0.6rem;
  }

  .week-num {
    font-size: 0.72rem;
  }

  .habit-item {
    padding: 0.6rem 0.65rem;
    gap: 0.6rem;
  }

  .month-cell {
    min-height: 36px;
  }
}
</style>
