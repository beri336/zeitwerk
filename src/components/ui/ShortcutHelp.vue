<!-- src/components/ui/ShortcutHelp.vue -->

<template>
    <Teleport to="body">
        <div v-if="open" class="shortcut-backdrop" role="presentation" @click.self="close">
            <section class="shortcut-modal" role="dialog" aria-modal="true"
                aria-labelledby="shortcut-help-title">
                <header class="shortcut-header">
                    <div>
                        <h2 id="shortcut-help-title">{{ $t('shortcuts.title') }}</h2>
                        <p>{{ $t('shortcuts.subtitle') }}</p>
                    </div>
                    <button class="btn btn-ghost icon-btn" type="button" @click="close"
                        :aria-label="$t('common.cancel')">×</button>
                </header>

                <div class="shortcut-list">
                    <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-row">
                        <span>{{ $t(shortcut.label) }}</span>
                        <kbd>{{ shortcut.key }}</kbd>
                    </div>
                </div>
            </section>
        </div>
    </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const open = ref(false)
const shortcuts = [
    { key: '?', label: 'shortcuts.help' },
    { key: 'Esc', label: 'shortcuts.close' },
    { key: '⌘/Ctrl + S', label: 'shortcuts.save_entry' },
    { key: '⌘/Ctrl + Enter', label: 'shortcuts.confirm' },
    { key: '⌘/Ctrl + E', label: 'shortcuts.export_csv' },
    { key: '⌘/Ctrl + Shift + E', label: 'shortcuts.export_backup' },
]

function handleKeydown(event) {
    const target = event.target
    const isTyping = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement

    if (event.key === '?' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        open.value = !open.value
    } else if (event.key === 'Escape' && open.value) {
        close()
    }
}

function close() {
    open.value = false
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.shortcut-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1400;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: color-mix(in oklch, black 32%, transparent);
}

.shortcut-modal {
    width: min(100%, 480px);
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
}

.shortcut-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-5);
    border-bottom: 1px solid var(--color-border);
}

.shortcut-header h2,
.shortcut-header p {
    margin: 0;
}

.shortcut-header h2 {
    font-size: var(--text-base);
}

.shortcut-header p {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}

.shortcut-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-5);
}

.shortcut-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    color: var(--color-text);
    font-size: var(--text-sm);
}

kbd {
    padding: 0.2rem 0.45rem;
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-bottom-width: 2px;
    border-radius: var(--radius-sm);
    font: 0.72rem ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: nowrap;
}
</style>
