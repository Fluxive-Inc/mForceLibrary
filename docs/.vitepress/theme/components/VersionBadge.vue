<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { theme } = useData()
const version = computed(() => theme.value.version || '<no version>')
</script>

<template>
  <div class="version-badge">
    {{ version }}
  </div>
</template>

<style scoped>
.version-badge {
  margin-top: 1rem;
  padding: 0 12px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  opacity: 0.6;
}
</style>
