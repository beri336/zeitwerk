<!-- src/components/AppSidebar.vue -->

<script setup>
import { useRoute } from 'vue-router'
import { useZeitwerkStore } from '@/stores/zeitwerk'

const route = useRoute()
const store = useZeitwerkStore()
</script>

<template>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" class="sidebar-logo-icon">
                <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor" opacity="0.15" />
                <circle cx="14" cy="14" r="8" stroke="currentColor" stroke-width="2" fill="none" />
                <path d="M14 9v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <circle cx="14" cy="14" r="1.5" fill="currentColor" />
            </svg>
            <span class="sidebar-logo-text">Zeitwerk</span>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-section">
            <div class="sidebar-section-label">Navigation</div>
            <RouterLink to="/tracking" class="sidebar-item" :class="{ active: route.path === '/tracking' }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Month Overview</span>
            </RouterLink>
            <RouterLink to="/settings" class="sidebar-item" :class="{ active: route.path === '/settings' }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
                <span>Settings</span>
            </RouterLink>
            <RouterLink to="/diagrams" class="sidebar-item" :class="{ active: route.path === '/diagrams' }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>Diagrams</span>
            </RouterLink>
        </nav>

        <!-- Month Navigation -->
        <div class="sidebar-month">
            <div class="sidebar-month-label">Month</div>
            <div class="month-nav">
                <button class="month-nav-btn" @click="store.prevMonth()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div class="month-nav-text">{{ store.currMonthLabel }}</div>
                <button class="month-nav-btn" @click="store.nextMonth()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    grid-row: 1 / -1;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.sidebar-logo {
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-border);
}

.sidebar-logo-icon {
    color: var(--color-primary);
    flex-shrink: 0;
}

.sidebar-logo-text {
    font-size: var(--text-sm);
    font-weight: 600;
}

.sidebar-section {
    padding: var(--space-4) var(--space-3);
}

.sidebar-section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 var(--space-2) var(--space-2);
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    text-decoration: none;
    width: 100%;
    transition: background var(--transition), color var(--transition);
}

.sidebar-item:hover {
    background: var(--color-surface-offset);
    color: var(--color-text);
}

.sidebar-item.active {
    background: var(--color-primary-highlight);
    color: var(--color-primary);
    font-weight: 500;
}

.sidebar-month {
    padding: var(--space-4) var(--space-5);
    margin-top: auto;
    border-top: 1px solid var(--color-border);
}

.sidebar-month-label {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.month-nav {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.month-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
}

.month-nav-btn:hover {
    background: var(--color-surface-offset);
    color: var(--color-text);
}

.month-nav-text {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: 500;
    text-align: center;
}
</style>
