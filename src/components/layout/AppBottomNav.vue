<!-- src/components/layout/AppBottomNav.vue -->

<template>

  <!--- Bottom Nav (mobile only) --->
  <nav class="bottom-nav" :aria-label="$t('nav.drawer_title')">
    <!-- Primary Tabs -->
    <RouterLink v-for="item in primaryRoutes" :key="item.path" :to="item.path" class="bottom-nav__item"
      :class="{ active: isActive(item.path) }" :aria-current="isActive(item.path) ? 'page' : undefined">
      <span class="bottom-nav__icon">
        <span v-html="item.icon"></span>
        <span v-if="item.path === '/livetracking' && store.liveStatus !== 'idle'" class="bottom-nav__live"
          :class="`bottom-nav__live--${store.liveStatus}`" aria-hidden="true"></span>
      </span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </RouterLink>

    <!-- More -->
    <button class="bottom-nav__item" type="button" :class="{ active: drawerOpen || secondaryActive }"
      :aria-expanded="drawerOpen" aria-haspopup="dialog" @click="drawerOpen = !drawerOpen">
      <span class="bottom-nav__icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" aria-hidden="true">
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span class="bottom-nav__label">{{ $t('nav.more') }}</span>
    </button>
  </nav>

  <!--- Drawer Backdrop --->
  <Transition name="backdrop">
    <div v-if="drawerOpen" class="drawer-backdrop" @click="closeDrawer"></div>
  </Transition>

  <!--- Slide-in Drawer --->
  <Transition name="drawer">
    <div v-if="drawerOpen" class="drawer" role="dialog" aria-modal="true" :aria-label="$t('nav.more')"
      :style="dragOffset ? { transform: `translateY(${dragOffset}px)`, transition: 'none' } : null">
      <div class="drawer-header" @touchstart.passive="onDragStart" @touchmove.passive="onDragMove"
        @touchend="onDragEnd">
        <span class="drawer-title">{{ $t('nav.more') }}</span>
        <button class="drawer-close" type="button" :aria-label="$t('common.close')" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="drawer-body">
        <div class="drawer-grid">
          <RouterLink v-for="item in secondaryRoutes" :key="item.path" :to="item.path" class="drawer-tile"
            :class="{ active: isActive(item.path) }" @click="closeDrawer">
            <span class="drawer-tile__icon" v-html="item.icon"></span>
            <span class="drawer-tile__label">{{ item.label }}</span>
          </RouterLink>
        </div>

        <div class="drawer-section-label">{{ $t('nav.quick_settings') }}</div>

        <div class="drawer-settings">
          <div class="drawer-row">
            <span class="drawer-row__label">{{ $t('nav.language') }}</span>
            <div class="segmented" role="group" :aria-label="$t('nav.language')">
              <button v-for="code in ['de', 'en']" :key="code" type="button" class="segmented__btn"
                :class="{ active: locale === code }" :aria-pressed="locale === code" @click="setLocale(code)">
                {{ code.toUpperCase() }}
              </button>
            </div>
          </div>

          <button class="drawer-row" type="button" role="switch" :aria-checked="isDark" @click="emit('toggle-theme')">
            <span class="drawer-row__label">{{ $t('nav.dark_theme') }}</span>
            <span class="switch" :class="{ on: isDark }" aria-hidden="true"></span>
          </button>

          <button class="drawer-row" type="button" role="switch" :aria-checked="privacyMode" @click="togglePrivacy">
            <span class="drawer-row__label">{{ $t('settings.privacy.label') }}</span>
            <span class="switch" :class="{ on: privacyMode }" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { usePrivacy } from "@/composables/usePrivacy";

defineProps({ isDark: Boolean });
const emit = defineEmits(["toggle-theme"]);

const { t, locale } = useI18n();
const store = useZeitwerkStore();
const { privacyMode, toggle: togglePrivacy } = usePrivacy();

const route = useRoute();
const drawerOpen = ref(false);

const icon = (body) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ROUTE_ICONS = {
  "/dashboard": icon(
    '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  ),
  "/livetracking": icon(
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M10 2h4"/>',
  ),
  "/overview": icon(
    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h3M8 17h6"/>',
  ),
  "/calendar": icon(
    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="15.5" r="1.5"/>',
  ),
  "/todo": icon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  "/diagrams": icon('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>'),
  "/settings": icon(
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  ),
  "/export": icon(
    '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>',
  ),
};

const allRoutes = computed(() => [
  { path: "/dashboard", label: t("nav.dashboard") },
  { path: "/livetracking", label: t("nav.live_short") },
  { path: "/overview", label: t("nav.overview") },
  { path: "/diagrams", label: t("nav.stats") },
  { path: "/calendar", label: t("nav.calendar") },
  { path: "/todo", label: t("nav.todo") },
  { path: "/export", label: t("nav.export") },
  { path: "/settings", label: t("nav.settings") },
].map((item) => ({ ...item, icon: ROUTE_ICONS[item.path] })));

// the 4 most used tabs at the bottom, rest goes into the "More" sheet
const primaryTabs = ["/dashboard", "/livetracking", "/overview", "/settings"];

const primaryRoutes = computed(() =>
  allRoutes.value.filter((r) => primaryTabs.includes(r.path)),
);

const secondaryRoutes = computed(() =>
  allRoutes.value.filter((r) => !primaryTabs.includes(r.path)),
);

const secondaryActive = computed(() =>
  secondaryRoutes.value.some((item) => isActive(item.path)),
);

function isActive(path) {
  return path === "/overview"
    ? route.path.startsWith("/overview")
    : route.path === path;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function setLocale(code) {
  if (locale.value === code) return;
  locale.value = code;
  localStorage.setItem("locale", code);
}

watch(() => route.fullPath, closeDrawer);

function onKeydown(event) {
  if (event.key === "Escape" && drawerOpen.value) closeDrawer();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

// swipe down on the sheet header to dismiss
const dragOffset = ref(0);
let dragStartY = null;

function onDragStart(event) {
  dragStartY = event.touches[0].clientY;
}

function onDragMove(event) {
  if (dragStartY === null) return;
  dragOffset.value = Math.max(0, event.touches[0].clientY - dragStartY);
}

function onDragEnd() {
  if (dragOffset.value > 80) closeDrawer();
  dragOffset.value = 0;
  dragStartY = null;
}
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
    z-index: 60;
    height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
    padding: 6px max(var(--space-1), env(safe-area-inset-right)) env(safe-area-inset-bottom) max(var(--space-1), env(safe-area-inset-left));
    background: color-mix(in oklch, var(--color-surface) 94%, transparent);
    backdrop-filter: saturate(1.4) blur(14px);
    -webkit-backdrop-filter: saturate(1.4) blur(14px);
    border-top: 1px solid var(--color-border);
  }

  .bottom-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 3px;
    min-width: 0;
    padding: 0;
    color: var(--color-text-muted);
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .bottom-nav__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 32px;
    border-radius: 999px;
    transition: background 0.2s ease, transform 0.15s ease;
  }

  .bottom-nav__icon :deep(svg) {
    display: block;
  }

  .bottom-nav__label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .bottom-nav__item.active {
    color: var(--color-primary);
  }

  .bottom-nav__item.active .bottom-nav__icon {
    background: var(--color-primary-highlight);
  }

  .bottom-nav__item:active .bottom-nav__icon {
    transform: scale(0.92);
  }

  /* Running tracker indicator */
  .bottom-nav__live {
    position: absolute;
    top: 3px;
    right: 13px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid var(--color-surface);
    background: var(--color-success);
  }

  .bottom-nav__live--working {
    animation: livePulse 1.8s ease-in-out infinite;
  }

  .bottom-nav__live--break {
    background: var(--color-gold);
  }

  @keyframes livePulse {

    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-success) 55%, transparent);
    }

    50% {
      box-shadow: 0 0 0 5px color-mix(in oklch, var(--color-success) 0%, transparent);
    }
  }

  /* Backdrop */
  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: oklch(0.1 0 0 / 0.45);
    z-index: 50;
  }

  /* Sheet: sits above the bottom nav so the tabs stay reachable */
  .drawer {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
    left: 0;
    right: 0;
    z-index: 55;
    max-height: calc(88dvh - var(--bottom-nav-height));
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    border-radius: 1.25rem 1.25rem 0 0;
    box-shadow: 0 -12px 40px oklch(0 0 0 / 0.2);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 0.5rem;
    flex-shrink: 0;
    position: relative;
    touch-action: none;
  }

  /* Drag Handle */
  .drawer-header::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--color-border);
  }

  .drawer-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .drawer-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: var(--color-surface-offset);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .drawer-body {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-2) var(--space-4) var(--space-5);
  }

  .drawer-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .drawer-tile {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 60px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface-2);
    color: var(--color-text);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .drawer-tile:active {
    background: var(--color-surface-offset);
  }

  .drawer-tile__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--color-surface-offset);
    color: var(--color-text-muted);
  }

  .drawer-tile__label {
    min-width: 0;
    font-size: var(--text-sm);
    font-weight: 600;
    line-height: 1.2;
    hyphens: auto;
  }

  .drawer-tile.active {
    border-color: color-mix(in oklch, var(--color-primary) 45%, transparent);
    background: color-mix(in oklch, var(--color-primary) 6%, var(--color-surface));
  }

  .drawer-tile.active .drawer-tile__icon {
    background: var(--color-primary-highlight);
    color: var(--color-primary);
  }

  .drawer-tile.active .drawer-tile__label {
    color: var(--color-primary);
  }

  .drawer-section-label {
    margin: var(--space-5) var(--space-1) var(--space-2);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .drawer-settings {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface-2);
    overflow: hidden;
  }

  .drawer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    width: 100%;
    min-height: 52px;
    padding: 0 var(--space-4);
    border: none;
    background: none;
    color: var(--color-text);
    font: inherit;
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
  }

  .drawer-row+.drawer-row {
    border-top: 1px solid var(--color-divider);
  }

  .drawer-row:active {
    background: var(--color-surface-offset);
  }

  .drawer-row__label {
    font-weight: 500;
  }

  .segmented {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 999px;
    background: var(--color-surface-offset);
    border: 1px solid var(--color-border);
  }

  .segmented__btn {
    min-width: 48px;
    min-height: 32px;
    padding: 0 var(--space-3);
    border: none;
    border-radius: 999px;
    background: none;
    color: var(--color-text-muted);
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .segmented__btn.active {
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }

  .switch {
    position: relative;
    flex-shrink: 0;
    width: 44px;
    height: 26px;
    border-radius: 999px;
    background: var(--color-surface-dynamic);
    transition: background 0.2s ease;
  }

  .switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px oklch(0 0 0 / 0.3);
    transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .switch.on {
    background: var(--color-primary);
  }

  .switch.on::after {
    transform: translateX(18px);
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

  .drawer {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .drawer-enter-from,
  .drawer-leave-to {
    transform: translateY(calc(100% + var(--bottom-nav-height)));
  }
}

@media (max-width: 360px) {
  .bottom-nav__icon {
    width: 48px;
  }

  .bottom-nav__label {
    font-size: 10px;
  }

  .drawer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
