<!-- src/components/layout/AppTopbar.vue -->

<template>
    <header class="topbar">
        <!-- Logo: visible only on mobile; desktop displays the sidebar logo -->
        <span class="topbar-logo">Zeitwerk</span>

        <div class="topbar-title">{{ titles[route.path] ?? 'Zeitwerk' }}</div>

        <div class="topbar-actions">
            <template v-if="route.path === '/diagrams'">
                <button class="btn btn-secondary btn-sm topbar-action-btn" @click="$emit('toggle-diagram-type')"
                    title="Switch view">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span class="topbar-action-label">Switch Views</span>
                </button>

                <!-- Export Dropdown -->
                <div class="export-dropdown" ref="exportDropRef">
                    <button class="btn btn-secondary btn-sm topbar-action-btn" @click="showExportMenu = !showExportMenu"
                        title="Export charts">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span class="topbar-action-label">Export</span>
                    </button>

                    <Transition name="dropdown">
                        <div v-if="showExportMenu" class="export-menu">
                            <button @click="triggerExport('png')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                Export as PNG
                            </button>
                            <button @click="triggerExport('jpg')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                Export as JPG
                            </button>
                        </div>
                    </Transition>
                </div>
            </template>

            <template v-if="route.path === '/dashboard'">
                <button class="btn btn-secondary btn-sm topbar-action-btn" @click="handleImport" title="Import JSON"
                    aria-label="Import JSON">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span class="topbar-action-label">Import</span>
                </button>

                <button class="btn btn-secondary btn-sm topbar-action-btn" @click="handleExport" title="Export JSON"
                    aria-label="Export JSON">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span class="topbar-action-label">Export</span>
                </button>

                <button class="btn btn-secondary btn-sm topbar-action-btn" @click="handleCSV" title="Export CSV"
                    aria-label="Export CSV">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span class="topbar-action-label">CSV</span>
                </button>
            </template>

            <button class="theme-btn" @click="emit('toggle-theme')" :title="isDark ? 'Light mode' : 'Dark mode'">
                <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <circle cx="12" cy="12" r="5" />
                    <path
                        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>

            <!-- Privacy Toggle -->
            <button class="btn btn-ghost icon-btn" :title="privacyMode ? 'Zahlen anzeigen' : 'Zahlen ausblenden'"
                @click="toggle">
                <!-- Eye open -->
                <svg v-if="!privacyMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <!-- Eye crossed out (closed) -->
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            </button>
        </div>

        <input type="file" id="importFileInput" accept=".json" style="display:none" @change="onFileChange" />
    </header>

    <ExportCsvModal v-model="showCsvModal" @confirm="handleCsvConfirm" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useZeitwerkStore, chartExportTrigger } from '@/stores/zeitwerk'

import { useToast } from '@/composables/useToast'
import ExportCsvModal from '@/components/ExportCsvModal.vue'
import { usePrivacy } from '@/composables/usePrivacy'
import { useExport } from '@/composables/useExport'

const { privacyMode, toggle } = usePrivacy()

const props = defineProps({ isDark: Boolean })
const emit = defineEmits(['toggle-theme', 'toggle-diagram-type'])

const route = useRoute()
const store = useZeitwerkStore()
const { showToast } = useToast()
const showCsvModal = ref(false)

const { importJSON, exportJSON: exportFullJSON } = useExport()

const showExportMenu = ref(false)
const exportDropRef = ref(null)

const titles = {
    '/dashboard': 'Zeitwerk',
    '/livetracking': 'Live Tracking',
    '/month-overview': 'Month Overview',
    '/calender': 'Calender',
    '/todo': 'To-Do List',
    '/year-overview': 'Year Overview',
    '/diagrams': 'Diagrams & Stats',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/habit-tracker': 'Habit Tracker',
    '/exports': 'Export',
}

function handleExport() {
    try {
        exportFullJSON()
        showToast('Export successful.', 'ok')
    } catch {
        showToast('Export failed.', 'err')
    }
}

function handleCSV() {
    showCsvModal.value = true
}

function handleCsvConfirm({ from, to }) {
    try {
        const [fromYear, fromMonth] = from.split('-').map(Number)
        const [toYear, toMonth] = to.split('-').map(Number)

        const ok = store.exportCSV({
            fromYear,
            fromMonth: fromMonth - 1,
            toYear,
            toMonth: toMonth - 1
        })

        showToast(ok ? 'CSV export successful.' : 'CSV export failed.', ok ? 'ok' : 'err')
    } catch (error) {
        console.error(error)
        showToast('CSV export failed.', 'err')
    }
}

function handleImport() { document.getElementById('importFileInput').click() }

function onFileChange(event) {
    const file = event.target.files[0]
    if (!file) return

    importJSON(file)
        .then(() => showToast('Import successful.', 'ok'))
        .catch(() => showToast('Error during import.', 'err'))

    event.target.value = ''
}

// Close when clicked outside of export menu
onMounted(() => {
    document.addEventListener('click', e => {
        if (exportDropRef.value && !exportDropRef.value.contains(e.target))
            showExportMenu.value = false
    })
})

function triggerExport(format) {
    showExportMenu.value = false
    chartExportTrigger.value = format
    // Reset after a short time
    setTimeout(() => chartExportTrigger.value = null, 100)
}
</script>

<style scoped>
/* Topbar */
.topbar {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    gap: var(--space-4);
    position: sticky;
    top: 0;
    z-index: 10;
    min-height: 52px;
}

.topbar-title {
    font-size: var(--text-base);
    font-weight: 600;
    flex: 1;
}

.topbar-logo {
    display: none;
    /* Desktop: Logo comes from the sidebar */
}

/* Actions */
.topbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.topbar-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 36px;
    white-space: nowrap;
}

.topbar-action-label {
    display: inline;
}

.btn-icon {
    padding: var(--space-2);
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
}

.theme-btn:hover {
    background: var(--color-surface-offset);
    color: var(--color-text);
}

/* Export Dropdown */
.export-dropdown {
    position: relative;
}

.export-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-1);
    min-width: 160px;
    z-index: 100;
}

.export-menu button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    color: var(--color-text);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
}

.export-menu button:hover {
    background: var(--color-surface-offset);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Mobile */
@media (max-width: 767px) {
    .topbar {
        padding: 0 var(--space-3);
    }

    .topbar-logo {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-weight: 700;
        color: var(--color-primary);
        font-size: var(--text-sm);
        white-space: nowrap;
    }

    .topbar-action-btn {
        width: 36px;
        height: 36px;
        padding: var(--space-2);
    }

    .topbar-action-label {
        display: none;
    }
}
</style>
