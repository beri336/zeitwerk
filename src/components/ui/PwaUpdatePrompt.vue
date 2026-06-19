<!-- src/components/ui/PwaUpdatePrompt.vue -->

<template>
    <Teleport to="body">
        <div v-if="needRefresh" class="pwa-banner">
            <div class="pwa-banner__text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                New version available
            </div>
            <div class="pwa-banner__actions">
                <button class="btn btn-primary btn-sm" @click="update">
                    Update now
                </button>
                <button class="btn btn-ghost btn-sm" @click="needRefresh = false">
                    Later
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useToast } from '@/composables/useToast'

const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(registration) {
        console.log('[Zeitwerk] SW registered:', registration)
    },
    onRegisterError(error) {
        console.error('[Zeitwerk] SW error:', error)
    }
})

function update() { updateServiceWorker(true) }
</script>

<style scoped>
/* PWA Install Banner */
.pwa-banner {
    position: fixed;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    white-space: nowrap;
    animation: slideUp 0.25s ease;
}

.pwa-banner__text {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
}

.pwa-banner__actions {
    display: flex;
    gap: var(--space-2);
}

/* Animation */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}
</style>
