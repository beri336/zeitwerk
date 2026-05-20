<!-- src/components/AppBottomNav.vue -->
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <nav class="bottom-nav">
        <RouterLink to="/tracking" class="bottom-nav__item" :class="{ active: route.path === '/tracking' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Month</span>
        </RouterLink>

        <RouterLink to="/calender" class="bottom-nav__item" :class="{ active: route.path === '/calender' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
                <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span>Cal</span>
        </RouterLink>

        <RouterLink to="/diagrams" class="bottom-nav__item" :class="{ active: route.path === '/diagrams' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Stats</span>
        </RouterLink>

        <RouterLink to="/settings" class="bottom-nav__item" :class="{ active: route.path === '/settings' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
            <span>Settings</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
/* Desktop: Bottom Nav komplett versteckt */
.bottom-nav {
    display: none;
}

/* Mobile: fixed am unteren Rand */
@media (max-width: 767px) {
    .bottom-nav {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        position: fixed;
        /* fixed, nicht sticky — bleibt immer sichtbar */
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 40;
        pointer-events: all;
        /* App.vue setzt pointer-events: none auf nth-child, hier überschreiben */
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        /* env(safe-area-inset-bottom) = Platz für iPhone Home-Indicator */
        padding: var(--space-2) var(--space-2) calc(var(--space-2) + env(safe-area-inset-bottom));
    }

    .bottom-nav__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 44px;
        /* Touch-Target Minimum */
        color: var(--color-text-muted);
        text-decoration: none;
        border-radius: var(--radius-md);
        font-size: 11px;
        transition: color var(--transition-interactive), background var(--transition-interactive);
    }

    .bottom-nav__item.active {
        color: var(--color-primary);
        background: var(--color-primary-highlight);
    }

    .bottom-nav__item:active {
        background: var(--color-surface-offset);
    }
}
</style>
