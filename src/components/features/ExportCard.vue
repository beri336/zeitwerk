<!-- src/components/features/ExportCard.vue -->

<template>
    <main class="main">

        <div class="export-header">
            <p class="export-sub">{{ $t('export.sub') }}</p>
        </div>

        <!-- Filters -->
        <section class="card">
            <div class="card-head">
                <h2>{{ $t('export.scope.title') }}</h2>
                <p>{{ $t('export.scope.sub') }}</p>
            </div>
            <div class="card-body">
                <div class="filter-row">

                    <div class="form-group">
                        <label class="form-label">{{ $t('export.scope.range') }}</label>
                        <select class="form-input" v-model="scope">
                            <option v-for="preset in PRESETS" :key="preset.value" :value="preset.value">
                                {{ preset.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Custom Range Picker -->
                    <Transition name="fade">
                        <div v-if="scope === 'custom'" class="custom-range">
                            <div class="form-group">
                                <label class="form-label">{{ $t('common.from') }}</label>
                                <select class="form-input" :value="`${customFrom.year}-${customFrom.month}`" @change="event => {
                                    const [year, month] = event.target.value.split('-').map(Number)
                                    customFrom = { year: year, month: month }
                                }">
                                    <option v-for="month in availableMonths" :key="`${month.year}-${month.month}`"
                                        :value="`${month.year}-${month.month}`">
                                        {{ month.label }}
                                    </option>
                                </select>
                            </div>

                            <span class="range-sep">→</span>

                            <div class="form-group">
                                <label class="form-label">{{ $t('common.to') }}</label>
                                <!-- To -->
                                <select class="form-input" :value="`${customTo.year}-${customTo.month}`" @change="event => {
                                    const [year, month] = event.target.value.split('-').map(Number)
                                    customTo = { year: year, month: month }
                                }">
                                    <option v-for="month in availableMonths" :key="`${month.year}-${month.month}`"
                                        :value="`${month.year}-${month.month}`">
                                        {{ month.label }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </Transition>

                    <div class="form-group">
                        <label class="form-label">{{ $t('export.scope.include') }}</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="include.entries" />
                                <span>{{ $t('export.include.entries') }}</span>
                            </label>

                            <label class="checkbox-item">
                                <input type="checkbox" v-model="include.absences" />
                                <span>{{ $t('export.include.absences') }}</span>
                            </label>

                            <label class="checkbox-item">
                                <input type="checkbox" v-model="include.summary" />
                                <span>{{ $t('export.include.summary') }}</span>
                            </label>

                            <label class="checkbox-item" v-if="store.grossHourlyRate > 0">
                                <input type="checkbox" v-model="include.gross" />
                                <span>{{ $t('export.include.gross') }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Preview -->
                <div class="preview-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>

                    <strong>{{ filteredEntries.length }}</strong> {{ $t('common.entries') }} ·
                    <strong>{{ formatHours(summary.actual) }}</strong> {{ $t('common.actual') }} ·

                    <span :style="{ color: summary.diff >= 0 ? 'var(--color-success)' : 'var(--color-error)' }">
                        {{ summary.diff >= 0 ? '+' : '' }}{{ formatHours(summary.diff) }}
                    </span>
                    {{ $t('common.diff') }} · {{ scopeLabel }}
                </div>
            </div>
        </section>

        <!-- Export Formats -->
        <section class="card">
            <div class="card-head">
                <h2>{{ $t('export.format.title') }}</h2>
                <p>{{ $t('export.format.sub') }}</p>
            </div>

            <div class="card-body">
                <div class="format-grid">

                    <!-- CSV -->
                    <div class="format-card">
                        <div class="format-icon format-icon--csv">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="16" y2="17" />
                            </svg>
                        </div>

                        <div class="format-info">
                            <div class="format-name">CSV</div>
                            <div class="format-desc">{{ $t('export.format.csv_desc') }}</div>
                        </div>
                        <button class="btn btn-secondary" @click="exportCSV">{{ $t('export.btn.export') }}</button>
                    </div>

                    <!-- JSON -->
                    <div class="format-card">
                        <div class="format-icon format-icon--json">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                            </svg>
                        </div>

                        <div class="format-info">
                            <div class="format-name">JSON</div>
                            <div class="format-desc">{{ $t('export.format.json_desc') }}</div>
                        </div>
                        <button class="btn btn-secondary" @click="exportJSON">{{ $t('export.btn.export') }}</button>
                    </div>

                    <!-- PDF -->
                    <div class="format-card">
                        <div class="format-icon format-icon--pdf">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M9 15v-4h3a2 2 0 0 1 0 4H9zM15 11v4" />
                            </svg>
                        </div>

                        <div class="format-info">
                            <div class="format-name">PDF</div>
                            <div class="format-desc">{{ $t('export.format.pdf_desc') }}</div>
                        </div>
                        <button class="btn btn-secondary" @click="exportPDF">{{ $t('export.btn.export') }}</button>
                    </div>

                    <!-- Clipboard -->
                    <div class="format-card">
                        <div class="format-icon format-icon--clip">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                            </svg>
                        </div>

                        <div class="format-info">
                            <div class="format-name">Clipboard</div>
                            <div class="format-desc">{{ $t('export.format.clip_desc') }}</div>
                        </div>

                        <button class="btn btn-secondary" @click="exportClipboard">
                            {{ copied ? $t('export.btn.copied') : $t('export.btn.copy') }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Toast -->
        <Transition name="toast">
            <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
        </Transition>

    </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, MONTH_NAMES } from '@/composables/useTime'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

import { useExport } from '@/composables/useExport'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { useHabitStore } from '@/composables/useHabitStore'
import { useTodoStore } from '@/composables/useTodoStore'
import { useProfileStore } from '@/composables/useProfileStore'

const store = useZeitwerkStore()
const { showToast } = useToast()
const { t, locale } = useI18n()

const scope = ref('month')
const customFrom = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const customTo = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })

const PRESETS = computed(() => [
    { value: 'month', label: t('export.scope.presets.month') },
    { value: 'lastmonth', label: t('export.scope.presets.lastmonth') },
    { value: '3months', label: t('export.scope.presets.3months') },
    { value: '6months', label: t('export.scope.presets.6months') },
    { value: 'year', label: t('export.scope.presets.year') },
    { value: 'lastyear', label: t('export.scope.presets.lastyear') },
    { value: 'all', label: t('export.scope.presets.all') },
    { value: 'custom', label: t('export.scope.presets.custom') },
])

const { exportJSON: exportFullJSON } = useExport()
const calendar = useCalendarStore()
const habits = useHabitStore()
const todos = useTodoStore()
const profile = useProfileStore()

// derive all available months from the entries
const availableMonths = computed(() => {
    const seen = new Set()
    store.entries.forEach(e => {
        const date = new Date(e.date)
        seen.add(`${date.getFullYear()}-${date.getMonth()}`)
    })

    return Array.from(seen)
        .map(s => {
            const [y, m] = s.split('-').map(Number)
            return { year: y, month: m, label: `${MONTH_NAMES[m]} ${y}` }
        })
        .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
})

const scopeLabel = computed(() => {
    const preset = PRESETS.value.find(p => p.value === scope.value)

    if (scope.value === 'custom') {
        const from = `${MONTH_NAMES[customFrom.value.month].slice(0, 3)} ${customFrom.value.year}`
        const to = `${MONTH_NAMES[customTo.value.month].slice(0, 3)} ${customTo.value.year}`

        return from === to
            ? from
            : `${from} – ${to}`
    }

    return preset?.label ?? ''
})

const filteredEntries = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    function startOf(y, m) { return new Date(y, m, 1) }
    function endOf(y, m) { return new Date(y, m + 1, 0) }

    let from, to

    if (scope.value === 'month') {
        from = startOf(store.currYear, store.currMonth)
        to = endOf(store.currYear, store.currMonth)
    } else if (scope.value === 'lastmonth') {
        const d = new Date(year, month - 1, 1)
        from = startOf(d.getFullYear(), d.getMonth())
        to = endOf(d.getFullYear(), d.getMonth())
    } else if (scope.value === '3months') {
        const d = new Date(year, month - 2, 1)
        from = startOf(d.getFullYear(), d.getMonth())
        to = endOf(year, month)
    } else if (scope.value === '6months') {
        const d = new Date(year, month - 5, 1)
        from = startOf(d.getFullYear(), d.getMonth())
        to = endOf(year, month)
    } else if (scope.value === 'year') {
        from = startOf(store.currYear, 0)
        to = endOf(store.currYear, 11)
    } else if (scope.value === 'lastyear') {
        from = startOf(year - 1, 0)
        to = endOf(year - 1, 11)
    } else if (scope.value === 'all') {
        return store.entries
    } else if (scope.value === 'custom') {
        // ensure that -> from <= to
        const f = new Date(customFrom.value.year, customFrom.value.month, 1)
        const t = new Date(customTo.value.year, customTo.value.month, 1)

        if (f > t) {
            from = startOf(customTo.value.year, customTo.value.month)
            to = endOf(customFrom.value.year, customFrom.value.month)
        } else {
            from = startOf(customFrom.value.year, customFrom.value.month)
            to = endOf(customTo.value.year, customTo.value.month)
        }
    }

    return store.entries.filter(entry => {
        const d = new Date(entry.date)

        return d >= from && d <= to
    })
})

const include = ref({
    entries: true,
    absences: true,
    summary: true,
    gross: false
})

const exportEntries = computed(() => {
    let rows = [...filteredEntries.value]

    if (!include.value.absences)
        rows = rows.filter(entry => !entry.typ || entry.typ === 'on-site' || entry.typ === 'remote')

    return rows.sort((a, b) => a.date.localeCompare(b.date))
})

// Summary
const summary = computed(() => {
    const entries = exportEntries.value
    const actual = entries.reduce((s, entry) => s + store.effectiveActualHours(entry), 0)
    const planned = entries.reduce((s, entry) => s + (entry.plannedHours || store.settings.hoursPerDay), 0)
    const gross = entries.reduce((s, entry) => s + store.grossEarnedForEntry(entry), 0)

    return {
        actual,
        planned,
        diff: actual - planned,
        gross,
        count: entries.length
    }
})

// CSV
function buildCSVRows() {
    const headers = [
        'Date',
        'Day',
        'Type',
        'Start',
        'End',
        'Break (min)',
        'Actual (h)',
        'Planned (h)',
        'Diff (h)',
        'Note'
    ]

    if (include.value.gross) headers.push('Gross (€)')

    const rows = exportEntries.value.map(entry => {
        const actual = store.effectiveActualHours(entry)
        const planned = entry.plannedHours || store.settings.hoursPerDay
        const day = new Date(entry.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short' })

        const row = [
            entry.date, day,
            entry.typ || 'on-site',
            entry.start || '',
            entry.end || '',
            entry.breakMin ?? store.settings.defaultBreak,
            actual.toFixed(2),
            planned.toFixed(2),
            (actual - planned).toFixed(2),
            entry.note || ''
        ]

        if (include.value.gross)
            row.push(store.grossEarnedForEntry(entry).toFixed(2))

        return row
    })

    if (include.value.summary) {
        rows.push([])
        rows.push(
            ['SUMMARY',
                '',
                '',
                '', '',
                '',
                summary.value.actual.toFixed(2),
                summary.value.planned.toFixed(2),
                summary.value.diff.toFixed(2),
                '']
        )

        if (include.value.gross)
            rows[rows.length - 1].push(summary.value.gross.toFixed(2))
    }

    return [headers, ...rows]
        .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n')
}

function exportCSV() {
    download(`zeitwerk-${scopeLabel.value}.csv`, buildCSVRows(), 'text/csv')
    showToast(t('export.toast.csv'))
}

// JSON
function collectOtherStores() {
    return {
        calendar: { events: calendar.events },
        habits: {
            habits: habits.habits,
            completions: Object.fromEntries(
                Object.entries(habits.completions).map(([k, v]) => [k, [...v]])
            ),
        },
        todos: { todos: todos.todos },
        profile: { ...profile.profile },
    }
}

function exportJSON() {
    // continue to take time entries into account
    const payload = {
        exported: new Date().toISOString(),
        scope: scopeLabel.value,
        ...(include.value.summary ? { summary: summary.value } : {}),
        // zeitwerk entries filtered by scope
        zeitwerk: {
            entries: exportEntries.value,
            settings: store.settings,
        },
        // all other data is complete
        ...collectOtherStores(),
    }

    download(
        `zeitwerk-${scopeLabel.value}.json`,
        JSON.stringify(payload, null, 2),
        'application/json'
    )
    showToast(t('export.toast.json'))
}

// PDF
// Exports a formatted HTML file - open in browser and print (Ctrl+P -> Save as PDF)
function exportPDF() {
    const rows = exportEntries.value
    const gross = include.value.gross && store.grossHourlyRate > 0

    const tableRows = rows.map(entry => {
        const actual = store.effectiveActualHours(entry).toFixed(2)
        const planned = (entry.plannedHours || store.settings.hoursPerDay).toFixed(2)
        const diff = (store.effectiveActualHours(entry) - (entry.plannedHours || store.settings.hoursPerDay)).toFixed(2)
        const diffColor = Number(diff) >= 0 ? '#22c55e' : '#ef4444'

        return `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.typ || 'on-site'}</td>
        <td>${entry.start || '–'}</td>
        <td>${entry.end || '–'}</td>
        <td>${entry.breakMin ?? store.settings.defaultBreak} min</td>
        <td>${actual}h</td>
        <td>${planned}h</td>
        <td style="color:${diffColor}">${Number(diff) >= 0 ? '+' : ''}${diff}h</td>
        ${gross ? `<td>${store.grossEarnedForEntry(entry).toFixed(2)} €</td>` : ''}
        <td>${entry.note || ''}</td>
      </tr>`
    }).join('')

    const summaryRow = include.value.summary ? `
    <tr class="summary-row">
      <td colspan="5"><strong>Total</strong></td>
      <td><strong>${summary.value.actual.toFixed(2)}h</strong></td>
      <td><strong>${summary.value.planned.toFixed(2)}h</strong></td>
      <td style="color:${summary.value.diff >= 0 ? '#22c55e' : '#ef4444'}">
        <strong>${summary.value.diff >= 0 ? '+' : ''}${summary.value.diff.toFixed(2)}h</strong>
      </td>
      ${gross ? `<td><strong>${summary.value.gross.toFixed(2)} €</strong></td>` : ''}
      <td></td>
    </tr>` : ''

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Zeitwerk – ${scopeLabel.value}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; padding: 32px; }
  .header { margin-bottom: 24px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px;
       text-transform: uppercase; letter-spacing: .05em; color: #64748b;
       border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  .summary-row td { background: #f1f5f9; border-top: 2px solid #e2e8f0; }
  .print-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; background: #6366f1; color: white;
    border: none; border-radius: 8px; font-size: 14px;
    font-weight: 600; cursor: pointer; margin-bottom: 24px;
  }
  .print-btn:hover { background: #4f46e5; }
  @media print {
    .print-btn { display: none; }
    body { padding: 0; }
  }
</style>
</head><body>
<div class="header">
  <h1>Zeitwerk Export</h1>
  <div class="meta">${scopeLabel.value} · ${rows.length} entries · ${new Date().toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-GB')}</div>
</div>
<button class="print-btn" onclick="window.print()">
  🖨️ Print / Save as PDF
</button>
<table>
  <thead><tr>
    <th>Date</th><th>Type</th><th>Start</th><th>End</th><th>Break</th>
    <th>Actual</th><th>Planned</th><th>Diff</th>
    ${gross ? '<th>Gross</th>' : ''}
    <th>Note</th>
  </tr></thead>
  <tbody>${tableRows}${summaryRow}</tbody>
</table>
</body></html>`

    // Download as .html - The user opens it and presses Ctrl+P -> Save as PDF
    download(
        `zeitwerk-${scopeLabel.value.replace(/\s/g, '-')}.html`,
        html,
        'text/html'
    )

    showToast(t('export.toast.pdf'))
}

// Clipboard
const copied = ref(false)

async function exportClipboard() {
    const header = [
        'Date',
        'Type',
        'Start',
        'End',
        'Break',
        'Actual',
        'Planned',
        'Diff',
        'Note']
        .join('\t')

    const rows = exportEntries.value.map(entry => {
        const actual = store.effectiveActualHours(entry).toFixed(2)
        const planned = (entry.plannedHours || store.settings.hoursPerDay).toFixed(2)
        const diff = (store.effectiveActualHours(entry) - (entry.plannedHours || store.settings.hoursPerDay)).toFixed(2)

        return [
            entry.date,
            entry.typ || 'on-site',
            entry.start || '',
            entry.end || '',
            entry.breakMin ?? store.settings.defaultBreak,
            `${actual}h`,
            `${planned}h`,
            `${Number(diff) >= 0 ? '+' : ''}${diff}h`,
            entry.note || '']
            .join('\t')
    })

    await navigator.clipboard.writeText([header, ...rows].join('\n'))

    copied.value = true
    setTimeout(() => copied.value = false, 2000)
    showToast(t('export.toast.clipboard'))
}

// Helpers
function download(filename, content, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: filename })
    a.click()

    URL.revokeObjectURL(url)
}

const toastMsg = ref('')
let toastTimer = null

function toast(msg) {
    toastMsg.value = msg
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastMsg.value = '', 2500)
}
</script>

<style scoped>
/* Main Layout */
.main {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

/* Export Header */
.export-header h1 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 4px;
    letter-spacing: -0.02em;
}

.export-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
}

/* Card */
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

.card-head h2 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 2px;
}

.card-head p {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
}

.card-body {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

/* Filters */
.filter-row {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-5);
    align-items: start;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.form-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-input {
    height: 38px;
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-2);
    color: var(--color-text);
    font: inherit;
    font-size: var(--text-sm);
    appearance: none;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text);
    cursor: pointer;
    user-select: none;
}

.checkbox-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary);
    cursor: pointer;
}

.preview-hint {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
}

.preview-hint strong {
    color: var(--color-text);
    font-weight: 600;
}

/* Custom Range */
.custom-range {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);
    grid-column: 1 / -1;
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
}

.range-sep {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    padding-bottom: 6px;
    flex-shrink: 0;
}

/* Format Grid */
.format-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.format-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-offset);
    transition: border-color 0.15s ease;
}

.format-card:hover {
    border-color: var(--color-primary);
}

.format-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.format-icon--csv {
    background: color-mix(in oklch, #22c55e 15%, transparent);
    color: #22c55e;
}

.format-icon--json {
    background: color-mix(in oklch, #f59e0b 15%, transparent);
    color: #f59e0b;
}

.format-icon--pdf {
    background: color-mix(in oklch, #ef4444 15%, transparent);
    color: #ef4444;
}

.format-icon--clip {
    background: color-mix(in oklch, #6366f1 15%, transparent);
    color: #6366f1;
}

.format-info {
    flex: 1;
    min-width: 0;
}

.format-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
}

.format-desc {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: 2px;
}

/* Toast */
.toast {
    position: fixed;
    bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-5);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    box-shadow: var(--shadow-md);
    z-index: 999;
    pointer-events: none;
    white-space: nowrap;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Mobile */
@media (max-width: 767px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }

    .card-body {
        padding: var(--space-4);
    }

    .filter-row {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }

    .custom-range {
        flex-direction: column;
        align-items: stretch;
    }

    .range-sep {
        display: none;
    }

    .format-card {
        gap: var(--space-3);
        padding: var(--space-3);
    }

    .format-desc {
        display: none;
    }

    .checkbox-item input[type="checkbox"] {
        width: 20px;
        height: 20px;
    }

    .toast {
        bottom: calc(80px + env(safe-area-inset-bottom));
        width: calc(100% - var(--space-6));
        text-align: center;
    }
}

/* Small Mobile */
@media (max-width: 420px) {
    .main {
        padding: var(--space-2);
        gap: var(--space-2);
    }

    .card-body {
        padding: var(--space-3);
    }

    .format-icon {
        width: 34px;
        height: 34px;
    }
}
</style>
