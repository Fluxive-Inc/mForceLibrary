<script setup>
import { useData } from 'vitepress'
import { computed, ref, nextTick, watch, onMounted } from 'vue'
import { useSearch } from '../composables/useSearch'

const { frontmatter, page } = useData()

const isHome = computed(() => frontmatter.value.layout === 'home')
const pageTitle = computed(() => page.value.title || 'Fluxive Library')

// --- Omnibar Logic ---
const isSearchMode = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const suggestions = ref([])
const commandOutput = ref(null)

const { initSearch, search } = useSearch()

onMounted(() => {
  initSearch()
})

// watch query for type-ahead or command clearing
watch(searchQuery, (newQuery) => {
  // Clear command output if user keeps typing
  if (commandOutput.value && !newQuery.startsWith('cmd')) {
      commandOutput.value = null
  }

  if (newQuery.startsWith('cmd')) {
      suggestions.value = [] // Don't show search suggestions for commands
      return
  }

  if (newQuery.length > 1) {
    suggestions.value = search(newQuery)
  } else {
    suggestions.value = []
  }
})

// Enable Search Mode
const enableSearch = async () => {
  isSearchMode.value = true
  await nextTick()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

// Disable Search Mode (with delay to allow clicks)
const disableSearch = () => {
  setTimeout(() => {
    isSearchMode.value = false
    searchQuery.value = '' // Clear on exit? Optional.
    suggestions.value = []
    commandOutput.value = null
  }, 200)
}

// Handle Command Execution
const executeCommand = (cmdStr) => {
    const parts = cmdStr.trim().split(/\s+/)
    const command = parts[1] // parts[0] is 'cmd'

    if (!command) {
        commandOutput.value = { 
            type: 'error', 
            text: 'NO COMMAND ENTERED. TRY "CMD INFO"' 
        }
    } else if (command.toLowerCase() === 'info') {
        const themeConfig = frontmatter.value.theme || {} 
        // Attempting to grab version, fallback to hardcoded if not exposed
        const version = '1.0.0' // Mock or grab from useData if available
        commandOutput.value = { 
            type: 'success', 
            text: `SYSTEM VERSION: ${version} // FLUXIVE LIBRARY ACTIVE` 
        }
    } else {
         commandOutput.value = { 
            type: 'error', 
            text: `UNKNOWN COMMAND: "${command}"` 
        }
    }
}

// Handle Enter Key (Full Search or Command)
const handleEnter = () => {
  const query = searchQuery.value.trim()
  
  if (query.toLowerCase().startsWith('cmd')) {
      executeCommand(query)
      return
  }

  if (query) {
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }
}

// Handle Suggestion Click
const selectSuggestion = (url) => {
    window.location.href = url
}
</script>

<template>
  <div 
    class="fx-breadcrumb-bar" 
    :class="{ 'is-search-mode': isSearchMode }"
    @click="enableSearch"
  >
    
    <!-- VIEW A: Breadcrumb Display -->
    <template v-if="!isSearchMode">
      <!-- Permanent Home Icon Anchor -->
      <a 
        href="/" 
        class="terminal-anchor" 
        aria-label="Return to Home"
        @click.stop
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </a>

      <!-- Terminal Separator -->
      <div class="terminal-sep">://</div>

      <!-- Animated Readout Content -->
      <div class="readout-window">
        <transition name="terminal-fade" mode="out-in">
          <div v-if="isHome" key="home" class="terminal-text home-msg">
            Fluxive Library // System Ready
          </div>
          <div v-else key="page" class="terminal-text page-msg">
            {{ pageTitle }}
          </div>
        </transition>
      </div>
    </template>

    <!-- VIEW B: Search Input -->
    <template v-else>
      <div class="search-container">
        <span class="search-prompt">&gt;_</span>
        <input 
          ref="searchInput"
          v-model="searchQuery"
          type="text" 
          class="search-input"
          :class="{ 'is-command-active': searchQuery.toLowerCase().startsWith('cmd ') }"
          placeholder="SEARCH SYSTEM..."
          @blur="disableSearch"
          @keydown.enter="handleEnter"
        />
        
        <!-- Command Output Display -->
        <div v-if="commandOutput" class="suggestions-dropdown command-output-panel">
             <div class="cmd-result" :class="commandOutput.type">
                 <span class="cmd-prefix">&gt;&gt;</span> {{ commandOutput.text }}
             </div>
        </div>

        <!-- Type-Ahead Dropdown -->
        <div v-if="suggestions.length > 0 && !commandOutput" class="suggestions-dropdown">
            <div 
                v-for="item in suggestions" 
                :key="item.id" 
                class="suggestion-item"
                @mousedown="selectSuggestion(item.link)"
            >
                <div class="s-title">{{ item.title }}</div>
                <div class="s-excerpt">{{ item.excerpt }}</div>
            </div>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* Full Width Terminal Bar */
.fx-breadcrumb-bar {
  width: 100%;
  height: 32px; /* Condensed height as per previous request */
  background: rgba(10, 12, 16, 0.95); /* Deep Dark Terminal BG */
  backdrop-filter: blur(10px);
  
  /* Terminal Bar Lines */
  border-top: 1px solid rgba(57, 255, 20, 0.2);
  border-bottom: 1px solid rgba(57, 255, 20, 0.2);
  
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  font-family: 'JetBrains Mono', monospace; /* Monospace enforced */
  font-size: 13px;
  z-index: 45; /* Above Sidebar */
  position: fixed;
  top: var(--vp-nav-height);
  padding-left: 24px;
  padding-right: 24px;
  left: 0;
  pointer-events: auto;
  cursor: text; /* Indicate actionable area */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Search Mode Active State */
.fx-breadcrumb-bar.is-search-mode {
  border-color: var(--vp-c-brand-1); /* Neon Green Border */
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.1);
  background: rgba(5, 5, 8, 1); /* Solid Dark */
}

/* Home Icon Anchor */
.terminal-anchor {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1); /* Neon Green */
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 4px;
}

.terminal-anchor:hover {
  background: rgba(57, 255, 20, 0.1);
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
}

/* Separator */
.terminal-sep {
  color: var(--vp-c-brand-1); /* Neon Green */
  margin: 0 12px;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 11px; /* Smaller text */
  opacity: 0.8;
}

/* Readout Window */
.readout-window {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  user-select: none; /* Prevent text selection to favor clicking */
}

/* Text Styles */
.terminal-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-msg {
  color: rgba(255, 255, 255, 0.5); /* Gray/Muted */
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-msg {
  color: #e2e8f0;
  text-transform: uppercase;
  font-weight: 800; /* Bold */
  letter-spacing: 0.5px;
}

/* --- Search Input Styles --- */
.search-container {
  width: 100%;
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}

.search-prompt {
  color: var(--vp-c-brand-1);
  margin-right: 12px;
  font-weight: 700;
  animation: blink 1.5s infinite;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  outline: none;
  text-transform: uppercase;
  height: 100%;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Command Styling */
.search-input.is-command-active {
    color: var(--vp-c-brand-2) !important; /* Royal Blue */
    font-weight: 700;
    text-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
    letter-spacing: 0.5px;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
    position: absolute;
    top: 36px; /* Below the bar (32px + 4px gap) */
    left: 0;
    width: 600px; /* Limit width */
    max-height: 400px;
    background: #050510;
    border: 1px solid var(--vp-c-brand-1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    overflow-y: auto;
    z-index: 100;
}

/* Suggestion Item */
.suggestion-item {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    transition: background 0.1s;
}

.suggestion-item:hover {
    background: rgba(57, 255, 20, 0.1);
}

.s-title {
    color: var(--vp-c-brand-1);
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 4px;
}

.s-excerpt {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.4;
    white-space: normal; /* Allow wrapping */
}

/* Command Output Styles */
.command-output-panel {
    border-color: var(--vp-c-brand-2); /* Blue border for commands */
    padding: 16px;
}

.cmd-result {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
}

.cmd-result.success {
    color: var(--vp-c-brand-1); /* Green */
}

.cmd-result.error {
    color: var(--vp-c-danger-1); /* Red */
}

.cmd-prefix {
    opacity: 0.5;
    margin-right: 8px;
}

/* Terminal Animation */
.terminal-fade-enter-active,
.terminal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.terminal-fade-enter-from {
  opacity: 0;
  transform: translateX(10px); /* Slide in from right */
}

.terminal-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px); /* Slide out to left */
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
