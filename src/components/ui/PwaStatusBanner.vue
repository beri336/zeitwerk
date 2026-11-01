<!-- src/components/ui/PwaStatusBanner.vue -->

<template>
    <div class="pwa-status-stack">
        <div class="pwa-status-banner" :class="{ 'pwa-status-banner--offline': !isOnline }"
            role="status" aria-live="polite">
            <div class="pwa-status__text">
                <span class="pwa-status__dot" aria-hidden="true"></span>
                <span>{{ isOnline ? $t('pwa.online') : $t('pwa.offline') }}</span>
                <span class="pwa-status__hint">
                    {{ isOnline ? $t('pwa.online_hint') : $t('pwa.offline_hint') }}
                </span>
            </div>
            <button v-if="!isOnline" class="btn btn-ghost btn-sm" type="button" @click="checkConnection">
                {{ $t('pwa.check_connection') }}
            </button>
        </div>

        <div v-if="needRefresh" class="pwa-status-banner pwa-update-banner" role="status" aria-live="polite">
            <div class="pwa-status__text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>{{ $t('pwa.new_version') }}</span>
                <span class="pwa-status__hint">
                    {{ isOnline ? $t('pwa.update_ready') : $t('pwa.update_waiting_online') }}
                </span>
            </div>
            <div class="pwa-status__actions">
                <button class="btn btn-primary btn-sm" type="button" :disabled="!isOnline || updating" @click="update">
                    {{ updating ? $t('pwa.updating') : $t('pwa.update_now') }}
                </button>
                <button class="btn btn-ghost btn-sm" type="button" @click="dismissUpdate">
                    {{ $t('pwa.later') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

const { isOnline } = useOnlineStatus()
const { needRefresh, updating, update, checkForUpdates, dismissUpdate } = usePwaUpdate()

async function checkConnection() {
    if (navigator.onLine) {
        isOnline.value = true
        await checkForUpdates()
        return
    }

    try {
        await fetch(`${window.location.origin}/manifest.webmanifest`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        })
        isOnline.value = true
        await checkForUpdates()
    } catch (error) {
        console.warn('[Zeitwerk] Connection check failed:', error)
        isOnline.value = false
    }
}
</script>

<style scoped>
.pwa-status-stack {
    position: fixed;
    right: var(--space-4);
    bottom: var(--space-4);
    z-index: 300;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: min(620px, calc(100vw - var(--space-6) * 2));
}

.pwa-status-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
}

.pwa-status-banner--offline {
    border-color: color-mix(in oklch, var(--color-gold) 35%, var(--color-border));
}

.pwa-status__text,
.pwa-status__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.pwa-status__text {
    min-width: 0;
    color: var(--color-text);
    font-size: var(--text-sm);
    font-weight: 600;
}

.pwa-status__hint {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 400;
}

.pwa-status__dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-success);
}

.pwa-status-banner--offline .pwa-status__dot {
    background: var(--color-gold);
}

.pwa-update-banner {
    flex-wrap: wrap;
}

@media (max-width: 767px) {
    .pwa-status-stack {
        right: var(--space-3);
        bottom: calc(64px + env(safe-area-inset-bottom) + var(--space-3));
        left: var(--space-3);
        max-width: none;
    }

    .pwa-status-banner {
        align-items: flex-start;
        flex-direction: column;
        gap: var(--space-3);
    }

    .pwa-status__actions {
        width: 100%;
    }

    .pwa-status__actions .btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
