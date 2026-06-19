<!-- src/components/layout/AppBottomNav.vue -->

<template>
    <!--- Bottom Nav (mobile only) --->
    <nav class="bottom-nav">
        <!-- Primary Tabs -->
        <RouterLink v-for="item in primaryRoutes" :key="item.path" :to="item.path" class="bottom-nav__item"
            :class="{ active: route.path === item.path }">
            <span v-html="item.icon"></span>
            <span>{{ item.label }}</span>
        </RouterLink>

        <!-- Hamburger Button -->
        <button class="bottom-nav__item bottom-nav__menu-btn" :class="{ active: drawerOpen }"
            @click="drawerOpen = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>More</span>
        </button>
    </nav>

    <!--- Drawer Backdrop --->
    <Transition name="backdrop">
        <div v-if="drawerOpen" class="drawer-backdrop" @click="closeDrawer"></div>
    </Transition>

    <!--- Slide-in Drawer --->
    <Transition name="drawer">
        <div v-if="drawerOpen" class="drawer">
            <div class="drawer-header">
                <span class="drawer-title">Navigation</span>
                <button class="drawer-close" @click="closeDrawer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div class="drawer-body">
                <RouterLink v-for="item in allRoutes" :key="item.path" :to="item.path" class="drawer-item"
                    :class="{ active: route.path === item.path }" @click="closeDrawer">
                    <span class="drawer-item-icon" v-html="item.icon"></span>
                    <span class="drawer-item-label">{{ item.label }}</span>
                    <svg v-if="route.path === item.path" class="drawer-item-check" width="14" height="14"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clip-rule="evenodd" />
                    </svg>
                </RouterLink>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const drawerOpen = ref(false)

const allRoutes = [
    {
        path: '/calender',
        label: 'Calendar',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>`,
    },
    {
        path: '/month-overview',
        label: 'Month',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="13" y2="18"/>
              </svg>`,
    },
    {
        path: '/year-overview',
        label: 'Year',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/>
              </svg>`,
    },
    {
        path: '/diagrams',
        label: 'Stats',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>`,
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0"/>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>`,
    },
]

// the 4 most important tabs at the bottom, rest goes into the drawer
const primaryTabs = ['/dashboard', '/month-overview', '/year-overview', '/settings']
const primaryRoutes = allRoutes.filter(r => primaryTabs.includes(r.path))

function closeDrawer() { drawerOpen.value = false }
</script>

<style scoped>
/* Desktop: hide everything */
.bottom-nav,
.drawer-backdrop,
.drawer {
    display: none;
}

/* Mobile */
@media (max-width: 767px) {
    /* Bottom Nav */
    .bottom-nav {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 40;
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        padding: var(--space-2) var(--space-2) calc(var(--space-2) + env(safe-area-inset-bottom));
    }

    .bottom-nav__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 44px;
        color: var(--color-text-muted);
        text-decoration: none;
        border-radius: var(--radius-md);
        font-size: 11px;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.15s, background 0.15s;
    }

    .bottom-nav__item.active {
        color: var(--color-primary);
        background: var(--color-primary-highlight);
    }

    .bottom-nav__item:active {
        background: var(--color-surface-offset);
    }

    /* Backdrop */
    .drawer-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(2px);
        z-index: 50;
    }

    /* Drawer */
    .drawer {
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 51;
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        border-radius: 1.25rem 1.25rem 0 0;
        max-height: 80vh;
        padding-bottom: env(safe-area-inset-bottom);
        box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.4);
    }

    .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem 0.75rem;
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
    }

    /* Drag Handle: Pill (Top) */
    .drawer-header::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 36px;
        height: 4px;
        border-radius: 999px;
        background: var(--color-border);
    }

    .drawer-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text);
    }

    .drawer-close {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: var(--color-surface-hover, #252840);
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .drawer-body {
        overflow-y: auto;
        padding: 0.5rem 0.75rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .drawer-item {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.75rem 0.875rem;
        border-radius: var(--radius, 0.5rem);
        text-decoration: none;
        color: var(--color-text-muted);
        font-size: 0.925rem;
        font-weight: 500;
        transition: background 0.15s, color 0.15s;
        min-height: 48px;
    }

    .drawer-item:active {
        background: var(--color-surface-offset);
    }

    .drawer-item.active {
        color: var(--color-primary);
        background: var(--color-primary-highlight, color-mix(in srgb, var(--color-primary) 12%, transparent));
    }

    .drawer-item-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: calc(var(--radius, 0.5rem) - 1px);
        background: var(--color-surface-hover, #252840);
        border: 1px solid var(--color-border);
    }

    .drawer-item.active .drawer-item-icon {
        background: color-mix(in srgb, var(--color-primary) 15%, transparent);
        border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    .drawer-item-label {
        flex: 1;
    }

    .drawer-item-check {
        color: var(--color-primary);
        flex-shrink: 0;
    }

    /* Transitions */
    .backdrop-enter-active,
    .backdrop-leave-active {
        transition: opacity 0.25s ease;
    }

    .backdrop-enter-from,
    .backdrop-leave-to {
        opacity: 0;
    }

    .drawer-enter-active,
    .drawer-leave-active {
        transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .drawer-enter-from,
    .drawer-leave-to {
        transform: translateY(100%);
    }
}
</style>
