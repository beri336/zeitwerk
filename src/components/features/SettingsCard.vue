<!-- src/components/features/SettingsCard.vue -->

<template>
  <main class="main">



    <p class="settings-sub">{{ $t("settings.sub") }}</p>

    <section class="card" aria-labelledby="employments-title">
      <div class="card-head card-head--row">
        <div>
          <h2 id="employments-title">{{ $t("settings.employments.title") }}</h2>
          <p>{{ $t("settings.employments.sub") }}</p>
        </div>
        <div class="head-actions">
          <button class="btn btn-secondary" type="button" @click="addEmployment">
            {{ $t("settings.employments.add") }}
          </button>
          <button v-if="store.employments.length > 1" class="btn btn-danger" type="button" @click="removeEmployment">
            {{ $t("settings.employments.remove") }}
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="employment-list">
          <button v-for="job in orderedEmployments" :key="job.id" type="button" class="employment-item"
            :class="{ active: job.id === selectedEmploymentId }" @click="loadEmployment(job.id)">
            <strong>{{ job.name || $t("settings.employments.untitled") }}</strong>
            <span>{{ employmentRange(job) }}</span>
          </button>
        </div>


        <!-- Settings -->
        <div class="form-grid">
          <!-- Employment Details -->
          <div class="form-group">
            <label class="form-label">{{ $t("settings.employments.name") }}</label>
            <input class="form-input" type="text" maxlength="80" v-model="form.employmentName" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t("settings.employments.start") }}</label>
            <input class="form-input" type="date" v-model="form.employmentStart" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t("settings.employments.end") }}</label>
            <input class="form-input" type="date" v-model="form.employmentEnd" />
            <span class="form-hint">{{ $t("settings.employments.end_hint") }}</span>
          </div>
        </div>
      </div>
    </section>


    <!-- Working hours per day -->
    <section class="card" aria-labelledby="work-title">
      <div class="card-head">
        <h2 id="work-title">{{ $t("settings.sections.work") }}</h2>
        <p>{{ $t("settings.sections.work_sub") }}</p>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.hours_day")
              }}</label>
            <input class="form-input" type="number" step="0.5" min="1" max="12" v-model.number="form.hoursPerDay" />
            <span class="form-hint">{{ $t("settings.hints.hours_day") }}</span>
          </div>

          <!-- Working hours per week -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.hours_week")
              }}</label>
            <input class="form-input" type="number" step="0.5" min="1" max="60" v-model.number="form.hoursPerWeek" />
            <span class="form-hint">{{ $t("settings.hints.hours_week") }}</span>
          </div>

          <!-- Default Break -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.default_break")
              }}</label>
            <input class="form-input" type="number" step="5" min="0" max="120" v-model.number="form.defaultBreak" />
            <span class="form-hint">{{
              $t("settings.hints.default_break")
              }}</span>
          </div>

          <!-- Working days per week -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.work_days")
              }}</label>
            <input class="form-input" type="number" step="1" min="1" max="7" v-model.number="form.workDays" />
            <span class="form-hint">{{ $t("settings.hints.work_days") }}</span>
          </div>

          <!-- State selection -->
          <div class="form-group">
            <label class="form-label">{{ $t("settings.fields.state") }}</label>
            <select class="form-input" v-model="form.state">
              <option v-for="(name, code) in STATES" :key="code" :value="code">
                {{ name }}
              </option>
            </select>
            <span class="form-hint">{{ $t("settings.hints.state") }}</span>
          </div>

          <!-- Default workplace -->
          <div class="form-group">
            <label class="form-label">{{ $t("settings.fields.default_workplace") }}</label>
            <select class="form-input" v-model="form.defaultWorkplace">
              <option value="on-site">{{ $t("absence.on-site") }}</option>
              <option value="homeoffice">{{ $t("absence.homeoffice") }}</option>
            </select>
            <span class="form-hint">{{ $t("settings.hints.default_workplace") }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="vacation-title">
      <div class="card-head">
        <h2 id="vacation-title">{{ $t("settings.sections.vacation") }}</h2>
        <p>{{ $t("settings.sections.vacation_sub") }}</p>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <!-- Vacation days -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.vacation_days")
            }}</label>
            <input class="form-input" type="number" step="1" min="0" max="365"
              v-model.number="form.vacationDaysPerYear" />
            <span class="form-hint">{{
              $t("settings.hints.vacation_days")
            }}</span>
          </div>

          <!-- Extra Vacation Days -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.extra_vacation_days")
            }}</label>
            <input class="form-input" type="number" step="1" min="0" max="365"
              v-model.number="form.extraVacationDays" />
            <span class="form-hint">{{
              $t("settings.hints.extra_vacation_days")
            }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.extra_vacation_deadline")
            }}</label>
            <input class="form-input" type="date" v-model="form.extraVacationDeadline" />
            <span class="form-hint">{{
              $t("settings.hints.extra_vacation_deadline")
            }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.extra_vacation_notice")
            }}</label>
            <input class="form-input" type="number" step="1" min="0" max="365"
              v-model.number="form.extraVacationNoticeDays" />
            <span class="form-hint">{{
              $t("settings.hints.extra_vacation_notice")
            }}</span>
          </div>

          <div v-if="extraVacationBalance" class="form-group full">
            <span class="form-hint">{{ extraVacationBalance }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="pay-title">
      <div class="card-head">
        <h2 id="pay-title">{{ $t("settings.sections.pay") }}</h2>
        <p>{{ $t("settings.sections.pay_sub") }}</p>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <!-- Salary -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.gross_salary")
              }}</label>

            <!-- Normal input — only if privacy is OFF -->
            <input v-if="!privacyMode" class="form-input" type="number" step="1" min="1" max="10000"
              v-model.number="form.grossMonthlySalary" />

            <!-- Masked — if Privacy ON -->
            <input v-else class="form-input" type="text" value="••••" disabled />

            <span class="form-hint">{{
              $t("settings.hints.gross_salary")
              }}</span>
            <span class="form-hint">{{
              $t("settings.hints.gross_salary_sub")
              }}</span>
          </div>
          <div class="form-group full" v-if="previewGrossHourlyRate > 0">
            <label class="form-label">{{ $t("settings.fields.preview") }}</label>
            <div class="salary-preview">
              <span>{{ $t("settings.preview_hourly", { val: mask(previewGrossHourlyRate.toFixed(2)) }) }}</span>
              <span>{{ $t("settings.preview_daily", { val: mask(previewGrossDailyRate.toFixed(2)) }) }}</span>
            </div>
            <span class="form-hint">
              {{ $t("settings.hints.preview", { days: form.workDays, hours: form.hoursPerDay }) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="tracking-title">
      <div class="card-head">
        <h2 id="tracking-title">{{ $t("settings.sections.tracking") }}</h2>
        <p>{{ $t("settings.sections.tracking_sub") }}</p>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <!-- SettingsCard Template -->
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.autostop")
            }}</label>
            <input class="form-input" type="number" step="0.5" min="1" max="16" v-model.number="form.maxWorkHours" />
            <span class="form-hint">{{ $t("settings.hints.autostop") }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.overtime_warn")
            }}</label>
            <input class="form-input" type="number" step="0.5" min="1" max="16" v-model.number="form.warnWorkHours" />
          </div>
          <div class="form-group">
            <label class="form-label">{{
              $t("settings.fields.inactivity")
            }}</label>
            <input class="form-input" type="number" step="5" min="5" max="120"
              v-model.number="form.inactivityMinutes" />
            <span class="form-hint">{{ $t("settings.hints.inactivity") }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="appearance-title">
      <div class="card-head">
        <h2 id="appearance-title">{{ $t("settings.sections.appearance") }}</h2>
        <p>{{ $t("settings.sections.appearance_sub") }}</p>
      </div>
      <div class="card-body">
        <div class="appearance-row">
          <div class="settings-locale">
            <span class="settings-locale-label">{{ $t("settings.fields.language") }}</span>
            <span class="settings-locale-value">{{ currentLocaleLabel }}</span>
          </div>
          <div class="privacy-row">
            <div class="privacy-info">
              <span class="privacy-icon">
                <svg v-if="privacyMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div>
                <div class="privacy-label">{{ $t("settings.privacy.label") }}</div>
                <div class="privacy-hint">{{ privacyMode ? $t("settings.privacy.on") : $t("settings.privacy.off") }}
                </div>
              </div>
            </div>
            <button class="toggle-switch" :class="{ active: privacyMode }" @click="toggle" :aria-label="privacyMode
              ? $t('settings.privacy.disable')
              : $t('settings.privacy.enable')
              " role="switch" :aria-checked="privacyMode">
              <span class="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="shortcut-settings-title">
      <div class="card-head">
        <h2 id="shortcut-settings-title">{{ $t("shortcuts.settings_title") }}</h2>
        <p>{{ $t("shortcuts.settings_subtitle") }}</p>
      </div>
      <div class="card-body">
        <div class="shortcut-settings-list">
          <div v-for="shortcut in shortcutList" :key="shortcut.key" class="shortcut-settings-row">
            <span>{{ $t(shortcut.label) }}</span>
            <kbd>{{ shortcut.key }}</kbd>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="recovery-title">
      <div class="card-head card-head--row">
        <div>
          <h2 id="recovery-title">{{ $t("settings.recovery.title") }}</h2>
          <p>{{ $t("settings.recovery.sub") }}</p>
        </div>
        <button class="toggle-switch" :class="{ active: form.recoveryEnabled }"
          @click="form.recoveryEnabled = !form.recoveryEnabled" role="switch" :aria-checked="form.recoveryEnabled"
          :aria-label="$t('settings.recovery.toggle')">
          <span class="toggle-thumb" />
        </button>
      </div>

      <div v-if="form.recoveryEnabled || snapshots.length" class="card-body">
        <div v-if="form.recoveryEnabled" class="form-group">
          <label class="form-label">{{ $t("settings.recovery.frequency_label") }}</label>
          <select class="form-input" v-model="form.recoveryFrequency">
            <option value="daily">{{ $t("settings.recovery.frequency.daily") }}</option>
            <option value="weekly">{{ $t("settings.recovery.frequency.weekly") }}</option>
            <option value="biweekly">{{ $t("settings.recovery.frequency.biweekly") }}</option>
            <option value="monthly">{{ $t("settings.recovery.frequency.monthly") }}</option>
          </select>
        </div>

        <div v-if="snapshots.length" class="recovery-list">
          <div v-for="snapshot in snapshots" :key="snapshot.id" class="recovery-item">
            <div class="recovery-item__info">
              <strong>{{ formatRecoveryDate(snapshot.createdAt) }}</strong>
              <span>{{ recoverySummary(snapshot) }}</span>
            </div>
            <div class="recovery-item__actions">
              <button class="btn btn-secondary btn-sm" @click="confirmRestore(snapshot)">
                {{ $t("settings.recovery.restore") }}
              </button>
              <button class="btn btn-secondary btn-sm" @click="exportRecovery(snapshot)">
                {{ $t("settings.recovery.export") }}
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteRecovery(snapshot)">
                {{ $t("settings.recovery.delete") }}
              </button>
            </div>
          </div>
        </div>
        <span v-else class="form-hint">{{ $t("settings.recovery.empty") }}</span>
      </div>
    </section>

    <section class="card" aria-labelledby="app-title">
      <div class="card-head">
        <h2 id="app-title">{{ $t("settings.sections.app") }}</h2>
        <p>{{ $t("settings.sections.app_sub") }}</p>
      </div>
      <div class="card-body card-actions">
        <button class="btn btn-secondary" @click="reset">
          {{ $t("common.reset") }}
        </button>
        <button class="btn btn-secondary" :disabled="checkingForUpdates" @click="checkForUpdates">
          {{ checkingForUpdates ? $t("pwa.checking") : $t("pwa.check_updates") }}
        </button>
      </div>
    </section>

    <!-- Notification Settings -->
    <SettingsNotification />

    <section class="card" aria-labelledby="danger-title">
      <div class="card-head">
        <h2 id="danger-title" class="is-danger">{{ $t("settings.danger.title") }}</h2>
        <p>{{ $t("settings.danger.sub") }}</p>
      </div>
      <div class="card-body">
        <div class="storage-usage">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <span>{{ $t("settings.storage_usage") }}:
            <strong>{{ formatted() }}</strong></span>
          <span class="storage-bar-wrap">
            <span class="storage-bar-fill" :style="{
              width: Math.min((bytes / (5 * 1024 * 1024)) * 100, 100) + '%',
            }" />
          </span>
          <span class="storage-limit">/ ~5 MB</span>
        </div>

        <div v-if="!showDeleteConfirm" class="danger-zone__actions">
          <button class="btn btn-danger" @click="askDeleteAll">
            {{ $t("settings.danger.delete_btn") }}
          </button>
        </div>

        <div v-else class="danger-confirm">
          <div class="danger-confirm__warning">
            {{ $t("settings.danger.warning") }}
          </div>

          <label class="form-label" for="delete-confirm-input">
            {{ $t("settings.danger.confirm_label") }} <strong>DELETE</strong>
          </label>
          <input id="delete-confirm-input" v-model="deleteConfirmText" class="form-input danger-input" type="text"
            placeholder="DELETE" autocomplete="off" />

          <div class="danger-confirm__actions">
            <button class="btn btn-secondary" @click="cancelDeleteAll">
              {{ $t("common.cancel") }}
            </button>
            <button class="btn btn-danger" :disabled="!canDeleteAll" @click="confirmDeleteAll">
              {{ $t("settings.danger.confirm_btn") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="device-title">
      <div class="card-head">
        <h2 id="device-title">{{ $t("settings.sections.device") }}</h2>
        <p>{{ $t("settings.sections.device_sub") }}</p>
      </div>
      <div class="card-body">
        <DeviceChipExt />
      </div>
    </section>

  </main>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { contractFrom, todayIso, vacationBalance } from "@/composables/employments";
import { useToast } from "@/composables/useToast";
import { STATES } from "@/composables/useHolidays";
import { usePrivacy } from "@/composables/usePrivacy";
import { useStorageSize } from "@/composables/useStorageSize";
import { usePwaUpdate } from "@/composables/usePwaUpdate";
import { useRecovery } from "@/composables/useRecovery";

import { useTodoStore } from "@/composables/useTodoStore";
import { useCalendarStore } from "@/composables/useCalendarStore";
import { useProfileStore } from "@/composables/useProfileStore";
import DeviceChipExt from "@/components/ui/DeviceChipExt.vue";
import SettingsNotification from "@/components/ui/NotificationSettings.vue";

const shortcutList = [
  { key: "?", label: "shortcuts.help" },
  { key: "Esc", label: "shortcuts.close" },
  { key: "⌘/Ctrl + S", label: "shortcuts.save_entry" },
  { key: "⌘/Ctrl + Enter", label: "shortcuts.confirm" },
  { key: "⌘/Ctrl + E", label: "shortcuts.export_csv" },
  { key: "⌘/Ctrl + Shift + E", label: "shortcuts.export_backup" },
];

const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

const currentLocaleLabel = computed(() =>
  currentLocale.value === "de" ? "Deutsch" : "English",
);

const { privacyMode, toggle, mask, toggleOffIfOn } = usePrivacy();
const store = useZeitwerkStore();
const { showToast } = useToast();
const { needRefresh, checkForUpdates: requestUpdateCheck } = usePwaUpdate();
const checkingForUpdates = ref(false);
const todoStore = useTodoStore();
const calendarStore = useCalendarStore();
const profileStore = useProfileStore();
const { snapshots, restoreSnapshot, deleteSnapshot, exportSnapshot } = useRecovery();

const form = reactive({
  ...store.settings,
  employmentName: "",
  employmentStart: "",
  employmentEnd: "",
});
const selectedEmploymentId = ref(store.employments[0]?.id ?? null);
let syncingEmployment = false;

const { bytes, formatted, calculate } = useStorageSize();
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref("");

const canDeleteAll = computed(
  () => deleteConfirmText.value.trim().toUpperCase() === "DELETE",
);

const orderedEmployments = computed(() =>
  [...store.employments].sort((first, second) =>
    (first.start || "9999-12-31").localeCompare(second.start || "9999-12-31"),
  ),
);

function employmentRange(job) {
  if (!job.start && !job.end) return t("settings.employments.unbounded");
  const end = job.end || t("settings.employments.open_ended");
  return job.start ? `${job.start} – ${end}` : end;
}

function loadEmployment(id) {
  const job = store.employments.find((item) => item.id === id) ?? store.employments[0];
  if (!job) return;
  syncingEmployment = true;
  selectedEmploymentId.value = job.id;
  Object.assign(form, contractFrom(job), {
    employmentName: job.name,
    employmentStart: job.start,
    employmentEnd: job.end,
  });
  syncingEmployment = false;
}

function addEmployment() {
  const created = store.addEmployment();
  loadEmployment(created.id);
}

function removeEmployment() {
  const nextId = store.removeEmployment(selectedEmploymentId.value);
  if (!nextId) {
    showToast(t("settings.employments.kept_one"), "ok");
    return;
  }
  loadEmployment(nextId);
  showToast(t("settings.employments.removed"), "ok");
}

loadEmployment(
  store.employmentForDate(todayIso())?.id || store.employments[0]?.id,
);

const GLOBAL_SETTING_KEYS = [
  "maxWorkHours",
  "warnWorkHours",
  "inactivityMinutes",
  "recoveryEnabled",
  "recoveryFrequency",
];

// Save every setting change immediately.
watch(form,
  () => {
    if (syncingEmployment) return;

    store.saveSettings(Object.fromEntries(
      GLOBAL_SETTING_KEYS.map((key) => [key, form[key]]),
    ));

    const result = store.updateEmployment(selectedEmploymentId.value, {
      name: form.employmentName,
      start: form.employmentStart,
      end: form.employmentEnd,
      ...contractFrom(form),
    });
    if (!result.ok) {
      showToast(t(`settings.employments.${result.reason}`), "error");
      loadEmployment(selectedEmploymentId.value);
    }
  },
  { deep: true },
);

// State changes also resync public holidays and show a specific notification
watch(
  () => form.state,
  (newVal, oldVal) => {
    if (!oldVal || newVal === oldVal) return;

    showToast(t("settings.toast_state", { state: STATES[newVal] }), "ok");
  },
);

async function checkForUpdates() {
  checkingForUpdates.value = true
  try {
    const updateAvailable = await requestUpdateCheck()
    if (!updateAvailable && !needRefresh.value)
      showToast(t("pwa.no_updates"), "ok")
  } catch (error) {
    console.error("[Zeitwerk] Update check failed:", error)
    showToast(t("pwa.check_failed"), "error")
  } finally {
    checkingForUpdates.value = false
  }
}

function reset() {
  Object.assign(form, {
    hoursPerDay: 8,
    hoursPerWeek: 40,
    defaultBreak: 30,
    workDays: 5,
    defaultWorkplace: "on-site",
    recoveryEnabled: true,
    recoveryFrequency: "weekly",
    state: "BW",
    grossHourlyRate: 0,
    grossMonthlySalary: 0,
    vacationDaysPerYear: 30,
    extraVacationDays: 0,
    extraVacationDeadline: "",
    extraVacationNoticeDays: 30,
    maxWorkHours: 9,
    warnWorkHours: 8,
    inactivityMinutes: 30,
  });
  store.saveSettings({ ...form });
  showToast(t("settings.toast_reset"), "ok");

  // deactivate privacy mode when resetting settings
  toggleOffIfOn();
}

// format recovery date for display
function formatRecoveryDate(date) {
  return new Date(date).toLocaleString(locale.value === "de" ? "de-DE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// confirm restore recovery snapshot
function confirmRestore(snapshot) {
  if (!window.confirm(t("settings.recovery.confirm_restore"))) return;

  restoreRecovery(snapshot);
}

// restore recovery snapshot
function restoreRecovery(snapshot) {
  restoreSnapshot(snapshot);
  Object.assign(form, { ...store.settings });
  showToast(t("settings.recovery.restored"), "ok");
}

// generate recovery summary for display
function recoverySummary(snapshot) {
  const stats = snapshot.stats ?? {
    entries: snapshot.data?.zeitwerk?.entries?.length ?? 0,
    events: snapshot.data?.calendar?.events?.length ?? 0,
    todos: snapshot.data?.todos?.todos?.length ?? 0,
    bytes: new Blob([JSON.stringify(snapshot.data)]).size,
  };

  const size = stats.bytes < 1024
    ? `${stats.bytes} B`
    : `${(stats.bytes / 1024).toFixed(1)} KB`;

  return t("settings.recovery.summary", {
    entries: stats.entries,
    events: stats.events,
    todos: stats.todos,
    size,
  });
}

// delete recovery snapshot
function deleteRecovery(snapshot) {
  deleteSnapshot(snapshot.id);
  showToast(t("settings.recovery.deleted"), "ok");
}

// export recovery snapshot
function exportRecovery(snapshot) {
  exportSnapshot(snapshot);
  showToast(t("settings.recovery.exported"), "ok");
}

// Delete
function askDeleteAll() {
  showDeleteConfirm.value = true;
  deleteConfirmText.value = "";
}

function cancelDeleteAll() {
  showDeleteConfirm.value = false;
  deleteConfirmText.value = "";
}

function confirmDeleteAll() {
  if (!canDeleteAll.value) return;

  store.deleteAllEntries(); // Zeitwerk
  todoStore.deleteAllEntries(); // Todos
  calendarStore.deleteAllEntries(); // Calendar Events
  profileStore.resetProfile(); // Profile

  reset(); // call to also reset settings to default values
  calculate(); // update size

  showDeleteConfirm.value = false;
  deleteConfirmText.value = "";
  showToast(t("settings.toast_deleted"), "ok");
}

// calculate gross locally
// daily salary: monthly salary / 4 weeks / workDays / hoursPerDay
const extraVacationBalance = computed(() => {
  const job = store.employments.find((item) => item.id === selectedEmploymentId.value);
  const year = Number(todayIso().slice(0, 4));

  const balance = vacationBalance(
    job,
    store.countVacationDays(year, job),
    year,
  );

  if (balance.extra <= 0) return "";

  return t("settings.hints.extra_vacation_balance", {
    remaining: balance.remainingExtra,
    total: balance.extra,
    regular: balance.remainingRegular,
  });
});

const previewGrossHourlyRate = computed(() => {
  const monthly = Number(form.grossMonthlySalary || 0);
  const workDays = Number(form.workDays || 5);
  const hoursDay = Number(form.hoursPerDay || 8);

  if (!monthly || !workDays || !hoursDay) return 0;

  return monthly / 4 / workDays / hoursDay;
});

// daily salary: monthly salary / 4 weeks / workDays
const previewGrossDailyRate = computed(() => {
  const monthly = Number(form.grossMonthlySalary || 0);
  const workDays = Number(form.workDays || 5);

  if (!monthly || !workDays) return 0;

  return monthly / 4 / workDays;
});
</script>

<style scoped>
/* Main Layout */
.main {
  overscroll-behavior: contain;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Salary Preview */
.salary-preview {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Settings Card */
.settings-sub {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-head {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.card-head--row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.card-head--row>div:first-child {
  flex: 1;
  min-width: 0;
}

.card-head h2 {
  margin: 0 0 2px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.card-head p {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.card-head h2.is-danger {
  color: var(--color-error);
}

.head-actions,
.card-actions,
.danger-zone__actions,
.danger-confirm__actions,
.recovery-item__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.head-actions .btn {
  white-space: nowrap;
}

.card-body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-body.card-actions {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.card-body>.form-group {
  max-width: 360px;
}

.card-body .btn,
.head-actions .btn {
  width: fit-content;
}

.btn-danger {
  background: #dc262622;
  color: #ef4444;
  border: 1px solid #ef444444;
}

.btn-danger:hover {
  background: #dc262644;
}

.recovery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.recovery-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

/* Employment List */
.employment-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.employment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: auto;
  min-width: 220px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}

.employment-item.active {
  border-color: var(--color-primary);
}

.employment-item span {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4) var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.shortcut-settings-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2) var(--space-5);
}

.appearance-row {
  display: grid;
  grid-template-columns: minmax(180px, 280px) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: center;
}

.shortcut-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.shortcut-settings-row kbd {
  padding: 0.15rem 0.35rem;
  color: var(--color-text-faint);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 0.65rem ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
}

/* Form Input */
.form-input {
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text);
  font: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

select.form-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-input:disabled {
  letter-spacing: 2px;
  color: var(--color-text-muted);
}

/* Privacy Row */
.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 42px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.privacy-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.privacy-icon {
  font-size: 1.5rem;
}

.privacy-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-top: 1px;
}

.privacy-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 1px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background var(--transition);
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(18px);
}

/* Storage Usage */
.storage-usage {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.storage-bar-wrap {
  width: 80px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}

.storage-bar-fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  transition: width 0.4s ease;
}

.storage-limit {
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Danger Zone */
.danger-confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid color-mix(in oklch, var(--color-error) 25%, var(--color-border));
  background: color-mix(in oklch,
      var(--color-error-highlight) 45%,
      var(--color-surface));
  border-radius: var(--radius-md);
}

.danger-confirm__warning {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.5;
}

.danger-confirm__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.danger-input {
  border-color: color-mix(in oklch,
      var(--color-error) 35%,
      var(--color-border));
}

.danger-input:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--color-error-highlight) 80%, white);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Settings */
.settings-locale {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 42px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media (max-width: 1100px) {

  .form-grid,
  .shortcut-settings-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.settings-locale-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.settings-locale-value {
  font-weight: 600;
  color: var(--color-text);
}

/* Mobile */
@media (max-width: 767px) {
  .main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .card-head,
  .card-body {
    padding: var(--space-4);
  }

  .card-head--row {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid,
  .shortcut-settings-list,
  .appearance-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .privacy-row {
    gap: var(--space-3);
  }

  .danger-confirm__actions {
    flex-direction: column;
  }

  .danger-confirm__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .storage-usage {
    gap: var(--space-1);
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .main {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .form-input {
    height: 40px;
  }

  /* iOS zoom prevention - inputs under 16px trigger auto-zoom */
  .form-input,
  input[type="date"],
  input[type="time"],
  input[type="number"],
  input[type="text"],
  textarea.form-input {
    font-size: 16px !important;
  }

  .form-input,
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}
</style>
