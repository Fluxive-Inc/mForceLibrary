<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const isHome = computed(() => frontmatter.value.layout === 'home')
// const pageTitle = computed(() => page.value.title || 'Fluxive Library') // Unused now
</script>

<template>
  <div class="fx-console-wrapper">
    <!-- 1. Title Row -->
    <div class="console-header">
      <div class="header-left">
        <div class="console-title">Fluxive Directory</div>
        <div class="console-subtitle">Go the way you want to</div>
      </div>
      <div class="header-right">
        <a href="/demo.html" class="demo-link">UI DEMO &rarr;</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fx-console-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  background: linear-gradient(180deg, rgba(5, 10, 20, 0.9) 0%, rgba(5, 10, 20, 0) 100%);
  padding-bottom: 20px;
}

/* Header Text */
.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: 60px; /* Offset for logo */
  padding-right: 40px;
  margin-top: 14px;
  pointer-events: auto;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.console-title {
  background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-family: var(--vp-font-family-headings);
  font-weight: 900;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4));
  margin-bottom: 0;
  line-height: 1.1;
}

.console-subtitle {
  color: #94A3B8; /* Slate 400 */
  font-family: var(--vp-font-family-base);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

.demo-link {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  text-decoration: none;
  font-weight: 600;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.demo-link:hover {
  opacity: 1;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
</style>
