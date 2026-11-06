<!-- src/components/ui/DeviceChipExt.vue -->

<template>

  <div class="device-card">
    <!-- Header Row -->
    <div class="device-header">
      <span class="device-icon" v-html="deviceIcon"></span>
      <div class="device-info">
        <span class="device-label">{{ device.deviceLabel }}</span>
        <span class="device-sub">{{ device.osLabel }} · {{ device.browserLabel }}
          {{ device.browserVersion }}</span>
      </div>

      <span v-if="device.isPWA" class="badge badge--pwa">{{
        $t("device.pwa")
        }}</span>
      <span class="online-dot" :class="isOnline ? 'online-dot--on' : 'online-dot--off'"
        :title="isOnline ? $t('device.online') : $t('device.offline')">
      </span>
    </div>

    <!-- Divider -->
    <div class="device-divider"></div>

    <div class="device-stats">
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.screen") }}</span>
        <span>
          {{ device.screenW }}×{{ device.screenH }}
          <span v-if="device.isRetina" class="badge badge--retina">{{ $t("device.retina") }}</span>
        </span>
      </div>

      <div class="stat-item">
        <span class="stat-label">{{ $t("device.viewport") }}</span>
        <span>{{ device.viewportW }}×{{ device.viewportH }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">DPR</span>
        <span>
          {{ $t("device.dpr", { ratio: roundedRatio }) }}
          <template v-if="device.colorDepth"> · {{ $t("device.color_depth", { depth: device.colorDepth }) }}</template>
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.input") }}</span>
        <span>{{ device.isTouch ? $t("device.touch") : $t("device.no_touch") }}<template v-if="device.touchPoints"> · {{
          device.touchPoints }}</template></span>
      </div>

      <div v-if="device.cpuCores" class="stat-item">
        <span class="stat-label">CPU</span>
        <span>{{ $t("device.cores", { count: device.cpuCores }) }}</span>
      </div>

      <div v-if="device.deviceMemory" class="stat-item">
        <span class="stat-label">RAM</span>
        <span>{{ $t("device.ram", { gb: device.deviceMemory }) }}</span>
      </div>

      <div v-if="architectureLabel" class="stat-item">
        <span class="stat-label">{{ $t("device.architecture") }}</span>
        <span>{{ architectureLabel }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">{{ $t("device.platform") }}</span>
        <span>{{ platformLabel }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">{{ $t("device.timezone") }}</span>
        <span>{{ device.timezone }} · {{ device.utcOffset }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.languages") }}</span>
        <span>{{ device.languages }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.online_label") }}</span>
        <span>{{ isOnline ? $t("device.online") : $t("device.offline") }}</span>
      </div>
      <div v-if="networkLabel" class="stat-item">
        <span class="stat-label">{{ $t("device.network") }}</span>
        <span>{{ networkLabel }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.local_address") }}</span>
        <span>{{ addressLabel }}</span>
      </div>
      <div v-if="storageLabel" class="stat-item">
        <span class="stat-label">{{ $t("device.storage") }}</span>
        <span>{{ storageLabel }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t("device.cookies") }}</span>
        <span>{{ device.cookieEnabled ? $t("device.cookies_on") : $t("device.cookies_off") }}</span>
      </div>
      <div class="stat-item stat-item--wide">
        <span class="stat-label">{{ $t("device.user_agent") }}</span>
        <span class="stat-wrap">{{ device.userAgent }}</span>
      </div>
    </div>

    <!-- Battery -->
    <template v-if="battery.supported.value">
      <div class="device-divider"></div>
      <div class="battery-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="18" height="10" rx="2" />
          <path d="M20 11v2" stroke-linecap="round" stroke-width="3" />
        </svg>

        <div class="battery-bar-wrap">
          <div class="battery-bar">
            <div class="battery-bar-fill" :style="{
              width: (battery.percent.value ?? 0) + '%',
              background: batteryColor,
            }"></div>
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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  useDevice,
  useBattery,
  useOnlineStatus,
  useHostAddresses,
  useClientHints,
  useStorageEstimate,
} from "@/composables/useDevice";

const device = useDevice();
const battery = useBattery();
const { isOnline } = useOnlineStatus();
const addresses = useHostAddresses();
const hints = useClientHints();
const storage = useStorageEstimate();
const { t } = useI18n();
const lookedUp = ref(false);

onMounted(() => {
  window.setTimeout(() => {
    lookedUp.value = true;
  }, 2200);
});

const roundedRatio = computed(() => Number(device.value.pixelRatio.toFixed(2)));

const addressLabel = computed(() => {
  if (!addresses.value.length) {
    return lookedUp.value
      ? t("device.local_address_none")
      : t("device.local_address_pending");
  }

  return [...addresses.value]
    .sort((first, second) => Number(first.includes(":")) - Number(second.includes(":")))
    .join(", ");
});

const platformLabel = computed(() => {
  const version = hints.value?.platformVersion;

  return [device.value.platform, version].filter(Boolean).join(" ");
});

const architectureLabel = computed(() => {
  const architecture = hints.value?.architecture;
  const bitness = hints.value?.bitness;
  const model = hints.value?.model;

  return [architecture, bitness ? `${bitness}-bit` : "", model].filter(Boolean).join(" · ");
});

const networkLabel = computed(() => {
  const connection = device.value.connection;
  if (!connection?.type)
    return connection?.saveData ? t("device.save_data") : "";

  const detail = t("device.network_detail", {
    type: connection.type,
    downlink: connection.downlink ?? "–",
    rtt: connection.rtt ?? "–",
  });

  return connection.saveData ? `${detail} · ${t("device.save_data")}` : detail;
});

const storageLabel = computed(() => {
  if (!storage.value?.quota)
    return "";

  return t("device.storage_detail", {
    used: formatBytes(storage.value.usage),
    quota: formatBytes(storage.value.quota),
  });
});

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024)
    return `${value} B`;

  if (value < 1024 * 1024)
    return `${Math.round(value / 1024)} KB`;

  const mb = value / (1024 * 1024);
  if (mb < 1024)
    return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;

  return `${(mb / 1024).toFixed(1)} GB`;
}

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
  gap: var(--space-4);
  width: 100%;
  min-width: 0;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.stat-item--wide {
  grid-column: 1 / -1;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.stat-item>span:last-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.stat-wrap {
  white-space: normal;
  overflow-wrap: anywhere;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
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
  .device-stats {
    grid-template-columns: 1fr;
  }
}
</style>
