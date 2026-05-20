<!-- src/views/SettingsView.vue -->

<script setup>
import { reactive, watch } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { STATES } from '@/composables/useHolidays'

const store = useZeitwerkStore()

const { showToast } = useToast()

const form = reactive({ ...store.settings })

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
    Object.assign(form, { hoursPerDay: 8, hoursPerWeek: 40, defaultBreak: 30, workDays: 5, state: 'BW' })
    store.saveSettings({ ...form })
    showToast('Settings reset.', 'ok')
}
</script>

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
                    <div class="form-group">
                        <label class="form-label">Working Hours / Week (Planned)</label>
                        <input class="form-input" type="number" step="0.5" min="1" max="60"
                            v-model.number="form.hoursPerWeek" />
                        <span class="form-hint">e.g., 40 for 40h/Week</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Default break (min)</label>
                        <input class="form-input" type="number" step="5" min="0" max="120"
                            v-model.number="form.defaultBreak" />
                        <span class="form-hint">Will be automatically entered</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Working Days / Week</label>
                        <input class="form-input" type="number" step="1" min="1" max="7"
                            v-model.number="form.workDays" />
                        <span class="form-hint">e.g., 5 for Mon–Fri</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">States</label>
                        <select class="form-input" v-model="form.state">
                            <option v-for="(name, code) in STATES" :key="code" :value="code">
                                {{ name }}
                            </option>
                        </select>
                        <span class="form-hint">For automatic holiday detection</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gross monthly salary (Brutto)</label>
                        <input class="form-input" type="number" step="1" min="1" max="10000"
                            v-model.number="form.grossMonthlySalary" />
                        <span class="form-hint">e.g., 3000 for 3000€/Month</span>
                        <span class="form-hint">Used to calculate gross hourly and daily earnings</span>
                    </div>
                    <div class="form-group full" v-if="store.grossHourlyRate > 0">
                        <label class="form-label">Preview</label>
                        <div class="salary-preview">
                            <span>{{ store.grossHourlyRate.toFixed(2) }} €/h gross</span>
                            <span>{{ store.grossDailyRate.toFixed(2) }} €/day gross</span>
                        </div>
                    </div>
                </div>
                <div class="settings-actions">
                    <button class="btn btn-primary" @click="save">Save</button>
                    <button class="btn btn-secondary" @click="reset">Reset</button>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.main {
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    /* kein grid-column, kein overflow-y — App.vue steuert das */
}

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

.settings-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    max-width: 520px;
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
    margin-top: var(--space-6);
    display: flex;
    gap: var(--space-3);
}

@media (max-width: 767px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }
}
</style>
