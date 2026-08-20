<script setup>
import { ref, onMounted } from 'vue'

const metrics = ref([
  { label: 'Probes', value: '421', status: 'active' },
  { label: 'Sys', value: 'OK', status: 'success' },
  { label: 'Users', value: '142', status: 'active' },
  { label: 'Ingest', value: '12TB', status: 'warning' }
])

// Simulate live data updates
const versionString = ref('')

const updateTime = () => {
  const now = new Date()
  const options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }
  
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(now)
  const getPart = (type) => parts.find(p => p.type === type)?.value
  
  versionString.value = `VERSION: ${getPart('year')}.${getPart('month')}.${getPart('day')}_${getPart('hour')}${getPart('minute')}`
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)

  setInterval(() => {
    // Randomly fluctuate the active user count
    const current = parseInt(metrics.value[2].value)
    const change = Math.floor(Math.random() * 5) - 2
    metrics.value[2].value = String(current + change)
  }, 3000)
})
</script>

<template>
  <div class="ticker-bar">
    
    <!-- Left: Compact Log Stream -->
    <div class="ticker-section log-section">
      <div class="terminal-dots">
          <span></span><span></span><span></span>
      </div>
      <div class="ticker-log">
          <span class="prompt">&gt;</span> <span class="cmd">{{ versionString }}</span>
      </div>
    </div>

    <!-- Right: Horizontal Metrics -->
    <div class="ticker-section metrics-section">
      <div v-for="metric in metrics" :key="metric.label" class="ticker-metric">
        <span class="t-label">{{ metric.label }}</span>
        <span class="t-val">{{ metric.value }}</span>
        <span class="t-dot" :class="metric.status"></span>
      </div>
      <!-- Copyright Append -->
      <div class="ticker-copyright">Copyright © 2026 Fluxive</div>
    </div>
    
  </div>
</template>

<style scoped>
.ticker-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px; /* Reduced to 30px */
  max-height: 30px;
  overflow: hidden;
  background: rgba(5, 8, 12, 0.95);
  border-top: 1px solid rgba(34, 79, 177, 0.3); /* Neon Blue Border */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 200000;
  backdrop-filter: blur(10px);
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.5); /* Reduced shadow */
}

.ticker-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* Log Section */
.terminal-dots {
    display: flex;
    gap: 4px;
}
.terminal-dots span {
    width: 4px;
    height: 4px;
    background: #333;
    border-radius: 50%;
}
.terminal-dots span:nth-child(1) { background: #224FB1; animation: pulse 1s infinite alternate; }

.ticker-log {
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
}
.ticker-log .prompt { color: #224FB1; margin-right: 4px; }
.ticker-log .cmd { color: #e2e8f0; }
.ticker-log .time { color: #475569; margin-left: 8px; }

/* Metrics Section */
.metrics-section {
    gap: 24px;
}

.ticker-metric {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
}

.t-label {
    color: #94a3b8;
    text-transform: uppercase;
}
.t-val {
    color: #fff;
    font-weight: 700;
}
.t-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}
.t-dot.active { background: #224FB1; box-shadow: 0 0 5px #224FB1; }
.t-dot.success { background: #3b82f6; box-shadow: 0 0 5px #3b82f6; }
.t-dot.warning { background: #eab308; box-shadow: 0 0 5px #eab308; }

@keyframes pulse {
    0% { opacity: 0.4; }
    100% { opacity: 1; }
}

@media (max-width: 600px) {
    .ticker-bar {
        font-size: 10px;
        padding: 0 12px;
    }
    .metrics-section { gap: 12px; }
    .log-section { display: none; } /* Hide logs on mobile */
    .ticker-copyright { display: none; } /* Hide copyright on mobile if crowded */
}

.ticker-copyright {
    color: #64748b;
    font-size: 10px; /* Reduced font size */
    margin-left: 16px;
    padding-left: 16px;
    border-left: 1px solid rgba(255,255,255,0.1);
    white-space: nowrap;
    line-height: 1; /* Tight align */
}

/* Respond to Global Docking State */
:global(body.fx-curator-docked) .ticker-log,
:global(body.fx-curator-docked) .terminal-dots {
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}
</style>
