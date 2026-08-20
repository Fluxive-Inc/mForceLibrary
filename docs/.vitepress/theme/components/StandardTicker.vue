<template>
  <footer class="ticker-bar">
    <!-- LEFT: BUILD STAMP -->
    <div class="build-version">BUILD {{ buildStamp }}</div>

    <!-- CENTER: SYSTEM STATUS (AUTHENTICATED ONLY, HIDDEN ON LANDING) -->
    <div v-if="isAuthenticated && !isLanding" class="system-status">
      <div v-for="metric in metrics" :key="metric.label" class="ticker-metric">
        <span class="status-dot" :class="metric.status">●</span>
        <span class="t-label">{{ metric.label }}:</span>
        <span class="t-val">{{ metric.value }}</span>
      </div>
      <span class="separator">|</span>
      <span><span class="status-dot success">●</span> ALLOY-DB</span>
    </div>

    <!-- RIGHT: COPYRIGHT (Standard) -->
    <div class="copyright">
      &copy; {{ currentYear }} <a href="https://fluxive.ai" target="_blank">Fluxive Inc</a>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  isLanding: {
    type: Boolean,
    default: false
  }
})

const currentYear = new Date().getFullYear()
const buildStamp = ref('2026.02.24.2104')

const metrics = ref([
  { label: 'Probes', value: '421', status: 'active' },
  { label: 'Ingest', value: '12TB', status: 'warning' },
  { label: 'Nodes', value: 'OK', status: 'success' }
])

const updateBuildStamp = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const h = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    buildStamp.value = `${y}${m}${d}.${h}${min}.00`
}

onMounted(() => {
  updateBuildStamp()
  setInterval(() => {
    const idx = 0
    const current = parseInt(metrics.value[idx].value)
    const change = Math.floor(Math.random() * 3) - 1
    metrics.value[idx].value = String(current + change)
  }, 5000)
})

</script>

<style scoped>
.ticker-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  box-sizing: border-box;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  z-index: 100000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.ticker-bar a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.ticker-bar a:hover {
  color: #00f3ff;
  text-shadow: 0 0 8px #00f3ff;
}

.system-status {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  display: flex;
  gap: 20px;
  color: rgba(255, 255, 255, 0.8);
  align-items: center;
}

.ticker-metric {
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
  color: #0f0;
  font-size: 8px;
}

.status-dot.active { color: #224FB1; }
.status-dot.success { color: #0f0; }
.status-dot.warning { color: #facc15; }

.t-label {
    opacity: 0.5;
    text-transform: uppercase;
    font-size: 10px;
}

.t-val {
    font-weight: 700;
}

.separator {
  opacity: 0.2;
}

@media (max-width: 960px) {
  .ticker-bar {
    padding: 0 20px;
  }
  .system-status {
    display: none;
  }
}
</style>

