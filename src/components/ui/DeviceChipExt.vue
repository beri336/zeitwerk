<!-- src/components/ui/DeviceChipExt.vue -->

<template>

  <div class="device-card">
    <!-- Header Row -->
    <div class="device-header">
      <span class="device-icon" v-html="deviceIcon"></span>
      <div class="device-info">
        <span class="device-label">{{ device.deviceLabel }}</span>
        <span class="device-sub"
          >{{ device.osLabel }} · {{ device.browserLabel }}
          {{ device.browserVersion }}</span
        >
      </div>

      <span v-if="device.isPWA" class="badge badge--pwa">{{
        $t("device.pwa")
      }}</span>
      <span
        class="online-dot"
        :class="isOnline ? 'online-dot--on' : 'online-dot--off'"
        :title="isOnline ? $t('device.online') : $t('device.offline')"
      >
      </span>
    </div>

    <!-- Divider -->
    <div class="device-divider"></div>

    <!-- Stats Grid -->
    <div class="device-stats">
      <!-- Screen -->
      <div class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="4" width="20" height="13" rx="2" />
          <path d="M2 20h20" />
          <path d="M8 20l1-3h6l1 3" />
        </svg>

        <span>
          {{ device.screenW }}×{{ device.screenH }}
          <span v-if="device.isRetina" class="badge badge--retina">{{
            $t("device.retina")
          }}</span>
        </span>
      </div>

      <!-- Touch -->
      <div class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 11V6a2 2 0 0 0-4 0v5" />
          <path d="M14 10V4a2 2 0 0 0-4 0v6" />
          <path
            d="M10 10.5V6a2 2 0 0 0-4 0v8l-1.2-1.2a1.5 1.5 0 0 0-2.1 2.1L6 18a6 6 0 0 0 6 0v-1"
          />
          <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2" />
        </svg>

        <span>{{
          device.isTouch ? $t("device.touch") : $t("device.no_touch")
        }}</span>
      </div>

      <!-- CPU cores -->
      <div v-if="device.cpuCores" class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path
            d="M9 7V3M12 7V3M15 7V3M9 21v-4M12 21v-4M15 21v-4M3 9h4M3 12h4M3 15h4M21 9h-4M21 12h-4M21 15h-4"
          />
        </svg>

        <span>{{ $t("device.cores", { count: device.cpuCores }) }}</span>
      </div>

      <!-- RAM -->
      <div v-if="device.deviceMemory" class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="8" width="20" height="8" rx="1" />
          <path
            d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2"
          />
        </svg>
        <span>{{ $t("device.ram", { gb: device.deviceMemory }) }}</span>
      </div>

      <!-- Language -->
      <div class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
        <span>{{ device.language }}</span>
      </div>

      <!-- Pixel Ratio -->
      <div class="stat-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        <span>{{ $t("device.dpr", { ratio: device.pixelRatio }) }}</span>
      </div>
    </div>

    <!-- Battery -->
    <template v-if="battery.supported.value">
      <div class="device-divider"></div>
      <div class="battery-row">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="7" width="18" height="10" rx="2" />
          <path d="M20 11v2" stroke-linecap="round" stroke-width="3" />
        </svg>

        <div class="battery-bar-wrap">
          <div class="battery-bar">
            <div
              class="battery-bar-fill"
              :style="{
                width: (battery.percent.value ?? 0) + '%',
                background: batteryColor,
              }"
            ></div>
          </div>
        </div>

        <span class="battery-label">
          {{ battery.percent.value ?? "..." }}%
          <span v-if="battery.charging.value"> ⚡</span>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  useDevice,
  useBattery,
  useOnlineStatus,
} from "@/composables/useDevice";

const device = useDevice();
const battery = useBattery();
const { isOnline } = useOnlineStatus();
const { t } = useI18n();

const batteryColor = computed(() => {
  const p = battery.percent.value;
  if (p === null) return "var(--color-border)";
  if (p <= 20) return "#ef4444";
  if (p <= 40) return "#f59e0b";
  return "#22c55e";
});

const icons = {
  iphone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="7" y="2" width="10" height="20" rx="3"/>
        <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="10" y1="5" x2="14" y2="5" stroke-linecap="round"/>
           </svg>`,
  ipad: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
         </svg>`,
  android: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="7" y="2" width="10" height="20" rx="3"/>
        <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="10" y1="5" x2="14" y2="5" stroke-linecap="round"/>
         </svg>`,
  tablet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
         </svg>`,
  mac: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="13" rx="2"/>
        <path d="M2 20h20"/>
        <path d="M8 20l1-3h6l1 3"/>
         </svg>`,
  windows: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="13" rx="2"/>
        <path d="M2 20h20"/>
        <path d="M8 20l1-3h6l1 3"/>
         </svg>`,
  linux: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="13" rx="2"/>
        <path d="M2 20h20"/>
        <path d="M8 20l1-3h6l1 3"/>
         </svg>`,
};

const deviceIcon = computed(
  () => icons[device.value.deviceType] ?? icons.windows,
);
</script>

<style scoped>
/* Device Card */
.device-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 0.75rem);
  padding: 1rem 1.125rem;
  width: 100%;
  max-width: 360px;
}

/* Header */
.device-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.device-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-sub {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Online Dot */
.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.online-dot--on {
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e88;
}

.online-dot--off {
  background: #ef4444;
}

/* Badges */
.badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  white-space: nowrap;
}

.badge--pwa {
  background: color-mix(in oklch, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  border: 1px solid color-mix(in oklch, var(--color-primary) 35%, transparent);
}

.badge--retina {
  background: color-mix(in oklch, #a855f7 15%, transparent);
  color: #a855f7;
  border: 1px solid color-mix(in oklch, #a855f7 35%, transparent);
  font-size: 0.55rem;
  margin-left: 3px;
}

/* Divider */
.device-divider {
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
}

/* Stats Grid */
.device-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  min-width: 0;
}

.stat-item svg {
  flex-shrink: 0;
  color: var(--color-text-faint);
}

.stat-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Battery */
.battery-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.battery-bar-wrap {
  flex: 1;
  min-width: 0;
}

.battery-bar {
  height: 5px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.battery-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s ease,
    background 0.3s ease;
}

.battery-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}

/* Mobile */
@media (max-width: 767px) {
  .device-card {
    max-width: 100%;
  }

  .device-stats {
    gap: 0.4rem 0.75rem;
  }
}
</style>
