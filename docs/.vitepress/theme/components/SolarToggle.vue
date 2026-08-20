<template>
  <button id="fluxive-solar-toggle" class="solar-toggle-fab" @click="toggleTheme" aria-label="Toggle Light/Dark Theme">
    <div class="toggle-content">
      <span class="timezone-label">{{ timezone }}</span>

      <!-- Sky Horizon Element bounds the SVG travel -->
      <div class="icon-container">
        
        <!-- Realistic Sun (Visible in Solar Mode) -->
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="20%" stop-color="#fff0bd"/>
              <stop offset="50%" stop-color="#ffb347"/>
              <stop offset="100%" stop-color="#ff7b00" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="60%" stop-color="#ffcc00"/>
              <stop offset="100%" stop-color="#ff9900"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#sun-grad)"/>
          <circle cx="50" cy="50" r="22" fill="url(#sun-core)"/>
        </svg>

        <!-- Realistic Moon (Visible in Lunar Mode) -->
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="moon-base" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="50%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#475569"/>
            </radialGradient>
            <filter id="moon-glow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.2"></feDropShadow>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="28" fill="url(#moon-base)" filter="url(#moon-glow)"/>
          <circle cx="40" cy="42" r="5" fill="#64748b" opacity="0.3"/>
          <circle cx="58" cy="54" r="7" fill="#64748b" opacity="0.4"/>
          <circle cx="48" cy="62" r="4" fill="#64748b" opacity="0.4"/>
          <circle cx="55" cy="38" r="3" fill="#64748b" opacity="0.3"/>
        </svg>

      </div>
    </div>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timezone = ref('NEW YORK')
const isSolar = ref(false)

const updateTimezone = () => {
  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const parts = userTimeZone.split('/')
    const city = parts[parts.length - 1].replace(/_/g, ' ')
    timezone.value = city.toUpperCase()
  } catch (e) {
    console.warn('Could not determine timezone locale.')
  }
}

const toggleTheme = (e) => {
  const nextTheme = isSolar.value ? 'lunar' : 'solar'
  
  const applyTheme = () => {
    isSolar.value = !isSolar.value
    if (isSolar.value) {
      document.body.classList.add('solar-mode')
      document.documentElement.classList.add('solar')
      localStorage.setItem('fluxive-theme', 'solar')
    } else {
      document.body.classList.remove('solar-mode')
      document.documentElement.classList.remove('solar')
      localStorage.setItem('fluxive-theme', 'lunar')
    }
  }

  // View Transition API support
  if (!document.startViewTransition) {
    applyTheme()
    return
  }

  const x = e.clientX || window.innerWidth - 30
  const y = e.clientY || 30
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transitionClass = nextTheme === 'solar' ? 'transition-to-solar' : 'transition-to-lunar'
  document.documentElement.classList.add(transitionClass)

  const transition = document.startViewTransition(applyTheme)

  transition.finished.then(() => {
    document.documentElement.classList.remove(transitionClass)
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]

    document.documentElement.animate(
      {
        clipPath: nextTheme === 'solar' ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        pseudoElement: nextTheme === 'solar' 
          ? '::view-transition-new(root)' 
          : '::view-transition-old(root)',
      }
    )
  })
}

onMounted(() => {
  updateTimezone()
  const savedMode = localStorage.getItem('fluxive-theme')
  if (savedMode === 'solar') {
    isSolar.value = true
    document.body.classList.add('solar-mode')
    document.documentElement.classList.add('solar')
  }
})
</script>

<style scoped>
.solar-toggle-fab {
  position: fixed;
  top: 6px;
  right: clamp(10px, 2vw, 20px);
  z-index: 99999;
  width: clamp(48px, 6vw, 62px);
  height: clamp(54px, 7vw, 68px);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
}

.toggle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding-bottom: 6px;
}

.timezone-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  font-weight: 700;
  color: inherit;
  line-height: 1;
  z-index: 2;
  margin-bottom: 4px;
}

.icon-container {
  position: relative;
  width: 28px;
  height: 28px;
}

svg {
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
}

.solar-toggle-fab:hover svg {
  transform: scale(1.15) rotate(2deg) translateY(-5px);
  filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6));
}

/* Lunar Mode (Default) state */
.sun-icon {
  opacity: 0;
  transform: translateY(20px) scale(0.5);
}
.moon-icon {
  opacity: 1;
  transform: translateY(0px) scale(1);
}

/* Solar Mode active state */
:global(body.solar-mode) .sun-icon {
  opacity: 1;
  transform: translateY(0px) scale(1);
}
:global(body.solar-mode) .moon-icon {
  opacity: 0;
  transform: translateY(20px) scale(0.5);
}

:global(body.solar-mode) .solar-toggle-fab:hover svg {
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
}

/* View Transition Styles */
:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation: none;
  mix-blend-mode: normal;
}

:global(html.transition-to-solar::view-transition-old(root)) { z-index: 1; }
:global(html.transition-to-solar::view-transition-new(root)) { z-index: 9999; }

:global(html.transition-to-lunar::view-transition-old(root)) { z-index: 9999; }
:global(html.transition-to-lunar::view-transition-new(root)) { z-index: 1; }
</style>
