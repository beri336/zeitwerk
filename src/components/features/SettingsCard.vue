<!-- src/components/features/SettingsCard.vue -->

<template>
    <main class="main">
        <div class="settings-card">
            <div class="settings-header">
                <div class="settings-title">Defaults</div>
                <div class="settings-sub">These values will be automatically applied to new entries.</div>
            </div>

            <div class="settings-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Working Hours / Day (Planned)</label>
                        <input class="form-input" type="number" step="0.5" min="1" max="12"
                            v-model.number="form.hoursPerDay" />
                        <span class="form-hint">e.g., 8 for 8h/Day</span>
                    </div>

                    <!-- Working hours per week -->
                    <div class="form-group">
                        <label class="form-label">Working Hours / Week (Planned)</label>
                        <input class="form-input" type="number" step="0.5" min="1" max="60"
                            v-model.number="form.hoursPerWeek" />
                        <span class="form-hint">e.g., 40 for 40h/Week</span>
                    </div>

                    <!-- Default Break -->
                    <div class="form-group">
                        <label class="form-label">Default break (min)</label>
                        <input class="form-input" type="number" step="5" min="0" max="120"
                            v-model.number="form.defaultBreak" />
                        <span class="form-hint">Will be automatically entered</span>
                    </div>

                    <!-- Working days per week -->
                    <div class="form-group">
                        <label class="form-label">Working Days / Week</label>
                        <input class="form-input" type="number" step="1" min="1" max="7"
                            v-model.number="form.workDays" />
                        <span class="form-hint">e.g., 5 for Mon–Fri</span>
                    </div>

                    <!-- State selection -->
                    <div class="form-group">
                        <label class="form-label">States</label>
                        <select class="form-input" v-model="form.state">
                            <option v-for="(name, code) in STATES" :key="code" :value="code">
                                {{ name }}
                            </option>
                        </select>
                        <span class="form-hint">For automatic holiday detection</span>
                    </div>

                    <!-- Vacation days -->
                    <div class="form-group">
                        <label class="form-label">Vacation Days / Year</label>
                        <input class="form-input" type="number" step="1" min="0" max="365"
                            v-model.number="form.vacationDaysPerYear" />
                        <span class="form-hint">e.g., 30 for 30 vacation days/year</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gross monthly salary (Brutto)</label>

                        <!-- Normal input — only if privacy is OFF -->
                        <input v-if="!privacyMode" class="form-input" type="number" step="1" min="1" max="10000"
                            v-model.number="form.grossMonthlySalary" />

                        <!-- Masked — if Privacy ON -->
                        <input v-else class="form-input" type="text" value="••••" disabled />

                        <span class="form-hint">e.g., 3000 for 3000€/Month</span>
                        <span class="form-hint">Used to calculate gross hourly and daily earnings</span>
                    </div>

                    <!-- SettingsCard Template -->
                    <div class="form-group">
                        <label class="form-label">Auto-stop after (h)</label>
                        <input class="form-input" type="number" step="0.5" min="1" max="16"
                            v-model.number="form.maxWorkHours" />
                        <span class="form-hint">Work session stops automatically</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Overtime warning after (h)</label>
                        <input class="form-input" type="number" step="0.5" min="1" max="16"
                            v-model.number="form.warnWorkHours" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Auto-pause after inactivity (min)</label>
                        <input class="form-input" type="number" step="5" min="5" max="120"
                            v-model.number="form.inactivityMinutes" />
                        <span class="form-hint">e.g., 30 = pause after 30 min no input</span>
                    </div>

                    <!-- Salary Preview -->
                    <div class="form-group full" v-if="previewGrossHourlyRate > 0">
                        <label class="form-label">Preview</label>
                        <div class="salary-preview">
                            <span>{{ mask(previewGrossHourlyRate.toFixed(2)) }} €/h gross</span>
                            <span>{{ mask(previewGrossDailyRate.toFixed(2)) }} €/day gross</span>
                        </div>
                        <span class="form-hint">
                            Hourly rate = monthly salary ÷ 4 weeks ÷ {{ form.workDays }} days ÷ {{ form.hoursPerDay }}h
                        </span>
                    </div>
                </div>

                <div class="privacy-row">
                    <div class="privacy-info">

                        <!-- Privacy is on -->
                        <span class="privacy-icon">
                            <svg v-if="privacyMode" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>

                            <!-- Privacy is off -->
                            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>

                        <!-- Privacy Info -->
                        <div>
                            <div class="privacy-label">Privacy Mode</div>
                            <div class="privacy-hint">
                                {{ privacyMode
                                    ? 'The salary is now masked and are hidden.'
                                    : 'All numbers are visible.' }}
                            </div>
                        </div>
                    </div>

                    <!-- Toggle for privacy mode -->
                    <button class="toggle-switch" :class="{ active: privacyMode }" @click="toggle"
                        :aria-label="privacyMode ? 'Privacy Mode deaktivieren' : 'Privacy Mode aktivieren'"
                        role="switch" :aria-checked="privacyMode">
                        <span class="toggle-thumb" />
                    </button>
                </div>
            </div>
            <div class="settings-actions">
                <button class="btn btn-primary" @click="save">Save</button>
                <button class="btn btn-secondary" @click="reset">Reset</button>
            </div>

            <div class="danger-zone">
                <div class="danger-zone__header">
                    <div class="danger-zone__title">Danger Zone</div>
                    <div class="danger-zone__sub">
                        Delete all stored entries permanently. This action cannot be undone.
                    </div>
                </div>

                <!-- Storage Usage -->
                <div class="storage-usage">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span>LocalStorage Usage: <strong>{{ formatted() }}</strong></span>
                    <span class="storage-bar-wrap">
                        <span class="storage-bar-fill"
                            :style="{ width: Math.min((bytes / (5 * 1024 * 1024)) * 100, 100) + '%' }" />
                    </span>
                    <span class="storage-limit">/ ~5 MB</span>
                </div>

                <div v-if="!showDeleteConfirm" class="danger-zone__actions">
                    <button class="btn btn-danger" @click="askDeleteAll">
                        Delete all entries
                    </button>
                </div>

                <div v-else class="danger-confirm">
                    <div class="danger-confirm__warning">
                        You are about to permanently remove all tracked entries, including work days, absences, and
                        imported holidays.
                    </div>

                    <label class="form-label" for="delete-confirm-input">
                        Type <strong>DELETE</strong> to confirm
                    </label>
                    <input id="delete-confirm-input" v-model="deleteConfirmText" class="form-input danger-input"
                        type="text" placeholder="DELETE" autocomplete="off" />

                    <div class="danger-confirm__actions">
                        <button class="btn btn-secondary" @click="cancelDeleteAll">
                            Cancel
                        </button>
                        <button class="btn btn-danger" :disabled="!canDeleteAll" @click="confirmDeleteAll">
                            Yes, delete everything
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Device Chip Extended Version -->
        <DeviceChipExt />
    </main>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { STATES } from '@/composables/useHolidays'
import { usePrivacy } from '@/composables/usePrivacy'
import { useStorageSize } from '@/composables/useStorageSize'

import { useTodoStore } from '@/composables/useTodoStore'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useProfileStore } from '@/composables/useProfileStore'
import { useHabitStore } from '@/composables/useHabitStore'
import DeviceChipExt from '@/components/ui/DeviceChipExt.vue';

const { privacyMode, toggle, mask, toggleOffIfOn } = usePrivacy()
const store = useZeitwerkStore()
const { showToast } = useToast()
const todoStore = useTodoStore()
const calendarStore = useCalendarStore()
const profileStore = useProfileStore()
const habitStore = useHabitStore()

const form = reactive({ ...store.settings })
const { bytes, formatted, calculate } = useStorageSize()
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')

const canDeleteAll = computed(() =>
    deleteConfirmText.value.trim().toUpperCase() === 'DELETE'
)

// Save state change immediately + Toast
watch(
    () => form.state,
    (newVal, oldVal) => {
        if (!oldVal || newVal === oldVal)
            return

        store.saveSettings({ state: newVal })
        showToast(
            `State changed to  ${STATES[newVal]} - Holidays updated.`,
            'ok'
        )
    }
)

function save() {
    store.saveSettings({ ...form })
    showToast('Settings saved.', 'ok')
}

function reset() {
    Object.assign(form, { hoursPerDay: 8, hoursPerWeek: 40, defaultBreak: 30, workDays: 5, state: 'BW', grossHourlyRate: 0, grossMonthlySalary: 0, vacationDaysPerYear: 30, maxWorkHours: 9, warnWorkHours: 8, inactivityMinutes: 30 })
    store.saveSettings({ ...form })
    showToast('Settings reset.', 'ok')

    // deactivate privacy mode when resetting settings
    toggleOffIfOn()
}

// Delete
function askDeleteAll() {
    showDeleteConfirm.value = true
    deleteConfirmText.value = ''
}

function cancelDeleteAll() {
    showDeleteConfirm.value = false
    deleteConfirmText.value = ''
}

function confirmDeleteAll() {
    if (!canDeleteAll.value) return

    store.deleteAllEntries()           // Zeitwerk
    todoStore.deleteAllEntries()       // Todos
    calendarStore.deleteAllEntries()   // Calendar Events
    profileStore.resetProfile()        // Profile
    habitStore.deleteAllEntries()      // Habits

    reset() // call to also reset settings to default values
    calculate() // update size

    showDeleteConfirm.value = false
    deleteConfirmText.value = ''
    showToast('All entries deleted.', 'ok')
}

// calculate gross locally
// Stundenlohn: Monatslohn / 4 Wochen / workDays / hoursPerDay
const previewGrossHourlyRate = computed(() => {
    const monthly = Number(form.grossMonthlySalary || 0)
    const workDays = Number(form.workDays || 5)
    const hoursDay = Number(form.hoursPerDay || 8)

    if (!monthly || !workDays || !hoursDay)
        return 0

    return monthly / 4 / workDays / hoursDay
})

// Tageslohn: Monatslohn / 4 Wochen / workDays
const previewGrossDailyRate = computed(() => {
    const monthly = Number(form.grossMonthlySalary || 0)
    const workDays = Number(form.workDays || 5)

    if (!monthly || !workDays)
        return 0

    return monthly / 4 / workDays
})
</script>

<style scoped>
/* Main Layout */
.main {
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    /* scroll behavior is controlled by App.vue */
}

.btn-primary {
    margin-left: var(--space-6);
}

.btn-secondary {
    margin-left: var(--space-1);
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
.settings-card {
    width: 100%;
    max-width: var(--content-form);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.settings-header {
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-divider);
}

.settings-title {
    font-size: var(--text-base);
    font-weight: 600;
}

.settings-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-top: var(--space-1);
}

.settings-body {
    padding: var(--space-6);
}

.settings-actions {
    margin-top: var(--space-4);
    margin-left: var(--space-6);
    margin-bottom: var(--space-2);
    display: flex;
    gap: var(--space-3);
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
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-divider);
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
.danger-zone {
    margin: var(--space-6);
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    padding-bottom: var(--space-6);
    border-top: 1px solid var(--color-divider);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.danger-zone__header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.danger-zone__title {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-error);
}

.danger-zone__sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    max-width: 42ch;
}

.danger-zone__actions {
    display: flex;
    align-items: flex-start;
}

.danger-confirm {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid color-mix(in oklch, var(--color-error) 25%, var(--color-border));
    background: color-mix(in oklch, var(--color-error-highlight) 45%, var(--color-surface));
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
    border-color: color-mix(in oklch, var(--color-error) 35%, var(--color-border));
}

.danger-input:focus {
    border-color: var(--color-error);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--color-error-highlight) 80%, white);
}

.btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Mobile */
@media (max-width: 767px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }
}
</style>
