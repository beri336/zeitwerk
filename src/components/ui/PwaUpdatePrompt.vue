<!-- src/components/ui/PwaUpdatePrompt.vue -->

<template>

    <Teleport to="body">
        <div v-if="needRefresh" class="pwa-banner">
            <div class="pwa-banner__text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {{ $t('pwa.new_version') }}
            </div>
            <div class="pwa-banner__actions">
                <button class="btn btn-primary btn-sm" @click="update">
                    {{ $t('pwa.update_now') }}
                </button>
                <button class="btn btn-ghost btn-sm" @click="needRefresh = false">
                    {{ $t('pwa.later') }}
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
        console.log('[Zeitwerk] SW registered:', r)
    },

    onRegisterError(error) {
        console.error('[Zeitwerk] SW error:', error)
    }
})

function update() { updateServiceWorker(true) }
</script>

<style scoped>
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
    max-width: calc(100vw - var(--space-6) * 2);
}

.pwa-banner__text {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
}

.pwa-banner__actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
}

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

/* Mobile */
@media (max-width: 767px) {
    .pwa-banner {
        bottom: calc(64px + env(safe-area-inset-bottom) + var(--space-3));
        left: var(--space-3);
        right: var(--space-3);
        transform: none;
        white-space: normal;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        max-width: none;
    }

    .pwa-banner__actions {
        width: 100%;
    }

    .pwa-banner__actions .btn {
        flex: 1;
        justify-content: center;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(12px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
}
</style>
