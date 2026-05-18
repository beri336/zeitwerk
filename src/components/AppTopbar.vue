<!-- src/components/AppTopbar.vue -->

<script setup>
import { useRoute } from 'vue-router'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'

const props = defineProps({ isDark: Boolean })
const emit = defineEmits(['toggle-theme'])

const route = useRoute()
const store = useZeitwerkStore()
const { showToast } = useToast()

const titles = {
    '/tracking': 'Month Overview',
    '/settings': 'Settings'
}

function handleExport() {
    store.exportJSON()
    showToast('Export successful.', 'ok')
}

function handleImport() {
    document.getElementById('importFileInput').click()
}

function onFileChange(event) {
    const file = event.target.files[0]

    if (!file)
        return
    
    const reader = new FileReader()
    
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result)
            const count = store.importJSON(data)
            showToast(`${count} entries imported.`, 'ok')
        } catch {
            showToast('Error during import.', 'err')
        }
    }
    reader.readAsText(file)
    event.target.value = ''
}
</script>

<template>
    <header class="topbar">
        <!-- Topbar Title -->
        <div class="topbar-title">{{ titles[route.path] ?? 'Zeitwerk' }}</div>
        <!-- Topbar Actions -->
        <div class="topbar-actions">
            <template v-if="route.path === '/tracking'">
                <button class="btn btn-secondary btn-sm" @click="handleImport">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Import
                </button>
                <button class="btn btn-secondary btn-sm" @click="handleExport">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                </button>
            </template>
            <button class="theme-btn" @click="emit('toggle-theme')">
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
        </div>
        <!-- Import File Input -->
        <input type="file" id="importFileInput" accept=".json" style="display:none" @change="onFileChange" />
    </header>
</template>

<style scoped>
.topbar {
    grid-column: 2;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    gap: var(--space-4);
    position: sticky;
    top: 0;
    z-index: 10;
}

.topbar-title {
    font-size: var(--text-base);
    font-weight: 600;
    flex: 1;
}

.topbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
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
</style>
