<!-- src/components/LanguageSwitcher.vue -->

<template>
  <div class="lang-toggle">
    <button
      v-for="l in locales"
      :key="l"
      type="button"
      class="lang-btn"
      :class="{ active: locale === l }"
      @click="setLocale(l)"
    >
      {{ l.toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale, availableLocales } = useI18n();

// Falls du später mehr Sprachen hast, nimm availableLocales;
// aktuell reicht eine feste Liste:
const locales = computed(() => ["de", "en"]);

function setLocale(l) {
  if (locale.value === l) return;
  locale.value = l;
  localStorage.setItem("locale", l);
}
</script>

<style scoped>
.lang-toggle {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.lang-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
}

.lang-btn.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}
</style>
