<template>
  <div class="perimeter-wrapper bg-black text-white h-screen w-screen overflow-hidden flex flex-col items-center justify-center m-0 relative">

    <!-- 1. SITE HEADER (Immutable Standard) -->
    <header class="fixed top-0 left-0 w-full h-[60px] z-50 flex items-center justify-between px-10 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <!-- Left: Fluxive Identity -->
        <div class="flex items-center gap-4">
            <img src="/logo.svg" alt="Fluxive" class="h-10 w-10 object-contain" />
            <span class="font-orbitron font-bold text-sm tracking-widest text-white uppercase hidden md:block">
                FLUXIVE <span class="text-blue-500">INTELLIGENT BEYOND ARTIFICIAL</span>
            </span>
        </div>
        <!-- Right: Google Cloud Badge -->
        <div class="flex items-center gap-2 opacity-80">
            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Built with</span>
            <!-- Placeholder for badge if image missing -->
            <div class="flex items-center gap-1 font-bold text-slate-200">
                <span class="text-blue-500">Google</span> Cloud
                <span class="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded ml-1">STARTUPS</span>
            </div>
        </div>
    </header>

    <!-- 2. GLASS PANEL (Center Stage) -->
    <div class="relative z-10 mx-4 p-0 rounded-[24px] glass-panel flex flex-col items-center justify-center text-center shadow-2xl"
         :class="{ 'opacity-0 translate-y-4': !isMounted }"
         id="main-card"
         style="width: 438px; height: 334px;">
      
      <!-- Top Glow Line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

      <!-- VISION MARK (Top Right) -->
      <div class="absolute top-6 right-8 pointer-events-none">
        <span class="font-orbitron font-extrabold tracking-[0.1em] text-[14px] bg-clip-text text-transparent bg-gradient-to-b from-[#051A45] to-[#0066FF] border-text"
              style="-webkit-text-stroke: 0.5px rgba(255,255,255,0.5); background-clip: text;">
            fluXive<sup class="text-[0.6em] ml-0.5 bg-clip-text text-transparent bg-gradient-to-r from-[#0066FF] to-[#00F3FF]" style="-webkit-text-stroke: 0;">OS</sup>
        </span>
      </div>

      <!-- ICON -->
      <div class="relative mb-6 mt-6">
          <div class="absolute inset-0 blur-[30px] opacity-20 bg-blue-500 rounded-full"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="relative z-10 text-blue-500 transition-colors duration-1000">
            <path :d="config.iconPath"></path>
          </svg>
      </div>

      <!-- TITLE -->
      <h1 class="text-3xl font-bold mb-2 text-white tracking-widest font-orbitron uppercase">
        {{ config.title }}
      </h1>

      <!-- SUBTITLE -->
      <div class="text-xs font-mono tracking-[0.2em] mb-0 uppercase flex items-center justify-center gap-2 text-blue-400">
        <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
        <span>{{ config.subtitle }}</span>
      </div>

    </div>

    <!-- 3. LAUNCHPAD (Immutable Component) -->
    <mforce-launchpad></mforce-launchpad>

    <!-- 4. FOOTER (Ticker Bar) -->
    <footer class="fixed bottom-0 left-0 w-full h-[30px] bg-black border-t border-white/10 z-50 flex items-center justify-between px-10 box-border text-[0.7rem] font-mono text-slate-500">
        <div class="flex items-center gap-4">
            <span class="text-slate-600">BUILD 2026.02.12.2100</span>
            <span class="hidden md:inline-block">REGION: US-EAST-1</span>
        </div>
        <div class="text-slate-600">
            &copy; 2026 Fluxive Inc
        </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const isMounted = ref(false)

const CONFIG = {
  library: { 
      title: 'LIBRARY', 
      subtitle: 'RESOURCE ARCHIVE', 
      iconPath: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' 
  }
}

const config = ref(CONFIG.library)

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})

</script>

<style scoped>
.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace;
}

.glass-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  background-clip: padding-box;
}

.tech-label {
    background: linear-gradient(90deg, #2979FF, #60A5FA); 
    -webkit-background-clip: text; 
    background-clip: text;
    -webkit-text-fill-color: transparent; 
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.1);
    filter: drop-shadow(0 4px 4px rgba(0,0,0,0.9));
}

.os-sup {
    font-size: 0.6em; 
    margin-left: 2px; 
    color: #9ca3af; 
    -webkit-text-fill-color: #9ca3af; 
    text-shadow: none;
}
</style>
