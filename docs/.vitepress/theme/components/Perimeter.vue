<template>
  <div v-if="!isAuthenticated" class="perimeter-wrapper">
    <!-- 1. HEADER (Immutable per Protocol) -->
    <header class="perimeter-header">
      <div class="header-left">
        <img src="/logo.svg" alt="Fluxive" class="header-logo" />
        <div class="brand-text">
          <span class="company">FLUXIVE</span>
          <span class="tagline">INTELLIGENT BEYOND ARTIFICIAL</span>
        </div>
      </div>
      <div class="header-right">
        <div class="built-with">Built with</div>
        <img src="/google-badge.png" alt="Google Cloud for Startups" class="google-badge" />
      </div>
    </header>

    <!-- 2. BACKGROUND LAYERS (Graphics Animated) -->
    <div class="bg-layers">
      <div class="glow-layer"></div>
      <div class="runners-container">
        <div v-for="i in 15" :key="i" class="runner" :style="{ '--left': `${(i-1)*7}%`, '--delay': `${Math.random()*5}s` }"></div>
      </div>
      <div class="grid-layer"></div>
    </div>

    <!-- 3. MAIN GLASS PANEL -->
    <main class="glass-container">
      <transition name="mount-card" appear>
        <div class="glass-panel" :class="{ 'mounted': isMounted }">
          <div class="protocol-mark">fluXiveOS<sup>v2.1</sup></div>
          
          <div class="panel-content">
            <div class="product-icon-wrapper">
                <div class="icon-pulse"></div>
                <img :src="productIcon" alt="Product Icon" class="product-icon" />
            </div>
            <h1 class="product-title">{{ productTitle }}</h1>
            <p class="product-subtitle">{{ productSubtitle }}</p>

            <div class="auth-trigger">
              <button class="sign-in-button" @click="triggerAuth">
                <span class="btn-text">INITIALIZE ACCESS</span>
                <span class="btn-glow"></span>
              </button>
            </div>
          </div>

          <div class="security-stamp">ENCRYPTED PERIMETER // GATEKEEPER ACTIVE</div>
        </div>
      </transition>
    </main>

    <!-- 4. FOOTER (Managed by StandardTicker in Reality, but Perimeter owns the space here) -->
    <StandardTicker :isAuthenticated="isAuthenticated" :isLanding="true" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StandardTicker from './StandardTicker.vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const isMounted = ref(false)

// Protocol Variables
const productTitle = ref('mForceLibrary')
const productSubtitle = ref('Information Mining & Knowledge Hub')
const productIcon = ref('/logo.svg')

const triggerAuth = () => {
  const launchpad = document.querySelector('mforce-launchpad')
  if (launchpad && launchpad.shadowRoot) {
    const loginBtn = launchpad.shadowRoot.querySelector('#login-trigger') || 
                     launchpad.shadowRoot.querySelector('button')
    if (loginBtn) loginBtn.click()
  } else {
    console.warn('Launchpad not ready. Attempting fallback...')
  }
}

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})
</script>

<style scoped>
.perimeter-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #051A45 0%, #000000 100%);
  color: #ffffff;
  font-family: 'Exo 2', 'Inter', sans-serif;
  overflow: hidden;
  z-index: 99999;
}

/* --- 1. HEADER --- */
.perimeter-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-logo {
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(34, 79, 177, 0.8));
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.company {
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 2px;
  line-height: 1;
}

.tagline {
  font-size: 8px;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.built-with {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.google-badge {
  height: 28px;
  opacity: 0.9;
}

/* --- 2. BACKGROUND ANIMATIONS --- */
.bg-layers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.glow-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle, rgba(34, 79, 177, 0.1) 0%, transparent 70%);
  animation: pulse-glow 10s infinite alternate ease-in-out;
}

@keyframes pulse-glow {
  0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
}

.runners-container {
  position: absolute;
  inset: 0;
}

.runner {
  position: absolute;
  top: -100px;
  left: var(--left);
  width: 1px;
  height: 120px;
  background: linear-gradient(to bottom, transparent, #00f3ff, transparent);
  animation: runner-falling 5s linear infinite;
  animation-delay: var(--delay);
  opacity: 0.4;
}

@keyframes runner-falling {
  from { transform: translateY(-120px); }
  to { transform: translateY(110vh); }
}

.grid-layer {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(34, 79, 177, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 79, 177, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.5;
  mask-image: radial-gradient(circle at center, black 20%, transparent 80%);
}

/* --- 3. GLASS PANEL --- */
.glass-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.glass-panel {
  width: 438px;
  height: 334px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.protocol-mark {
  position: absolute;
  top: 20px;
  right: 25px;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.5;
  letter-spacing: 1px;
  font-family: 'Share Tech Mono', monospace;
}

.protocol-mark sup {
  color: #00F3FF;
  margin-left: 2px;
}

.product-icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 24px;
}

.product-icon {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.5));
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(34, 79, 177, 0.4);
  filter: blur(20px);
  border-radius: 50%;
  animation: icon-breathing 3s infinite;
}

@keyframes icon-breathing {
  0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
}

.product-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin: 0;
  background: linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Exo 2', sans-serif;
}

.product-subtitle {
  font-size: 11px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-top: 10px;
  font-family: 'Share Tech Mono', monospace;
  color: #3b82f6;
}

.auth-trigger {
  margin-top: 48px;
}

.sign-in-button {
  background: #224FB1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px 40px;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  transition: all 0.4s;
  border-radius: 2px;
  overflow: hidden;
}

.sign-in-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 79, 177, 0.5);
  background: #2d5fd1;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.sign-in-button:hover .btn-glow {
  transform: translateX(100%);
}

.security-stamp {
  position: absolute;
  bottom: 20px;
  font-size: 9px;
  letter-spacing: 2px;
  opacity: 0.2;
  font-family: 'Share Tech Mono', monospace;
}

/* Transitions */
.mount-card-enter-active {
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.mount-card-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
  filter: blur(10px);
}
</style>
