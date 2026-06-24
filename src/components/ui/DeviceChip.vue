<!-- src/components/ui/DeviceChip.vue -->

<template>
  <div class="device-chip">

    <span class="device-icon" v-html="deviceIcon"></span>
    <div class="device-info">
      <span class="device-label">{{ device.deviceLabel }}</span>
      <span class="device-sub"
        >{{ device.osLabel }} · {{ device.browserLabel }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useDevice } from "@/composables/useDevice";

const device = useDevice();

const icons = {
  iphone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="7" y="2" width="10" height="20" rx="3"/>
    <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="10" y1="5" x2="14" y2="5" stroke-linecap="round"/>
  </svg>`,

  ipad: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  android: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="7" y="2" width="10" height="20" rx="3"/>
    <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="10" y1="5" x2="14" y2="5" stroke-linecap="round"/>
  </svg>`,

  tablet: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12" y2="18" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  mac: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="4" width="20" height="13" rx="2"/>
    <path d="M2 20h20"/>
    <path d="M8 20l1-3h6l1 3"/>
  </svg>`,

  windows: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="4" width="20" height="13" rx="2"/>
    <path d="M2 20h20"/>
    <path d="M8 20l1-3h6l1 3"/>
  </svg>`,

  linux: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
/* Device Chip */
.device-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-surface, #252840);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius, 0.5rem);
  padding: 0.5rem 0.75rem;
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
  min-width: 0;
}

.device-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-sub {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
