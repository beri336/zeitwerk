<!-- src/components/ui/KpiCard.vue -->

<template>

  <div class="kpi-card">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value" :class="`kpi-${variant}`">
      {{ props.private ? mask(value) : value }}
    </div>
    <div v-if="sub" class="kpi-sub">{{ sub }}</div>
  </div>
</template>

<script setup>
import { usePrivacy } from "@/composables/usePrivacy";

const { mask } = usePrivacy();

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  sub: { type: String, default: "" },
  variant: { type: String, default: "" },
  private: { type: Boolean, default: false },
});
</script>

<style scoped>
/* KPI Card */
.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-sm);
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-value {
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums lining-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-sub {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-top: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Colors */
.kpi-ok {
  color: var(--color-success);
}

.kpi-warn {
  color: var(--color-warning);
}

.kpi-err {
  color: var(--color-error);
}
</style>
