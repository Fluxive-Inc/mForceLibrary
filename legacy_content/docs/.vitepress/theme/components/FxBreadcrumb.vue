<script setup>
import { useData } from 'vitepress'
import { computed, ref, nextTick, watch, onMounted } from 'vue'
import { useSearch } from '../composables/useSearch'
import { useLibrarian } from '../composables/useLibrarian'
import LibrarianConsole from './LibrarianConsole.vue'

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
const { isLibrarianOpen, openLibrarian, processCommand } = useLibrarian()

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
    const result = processCommand(cmdStr)
    
    if (result.type === 'action' && result.action === 'open_librarian') {
         commandOutput.value = { type: 'success', text: result.msg }
         setTimeout(openLibrarian, 800)
    } else if (result.type === 'info') {
         commandOutput.value = { type: 'success', text: result.msg }
    } else if (result.type === 'error') {
         commandOutput.value = { type: 'error', text: result.msg }
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
  <div class="breadcrumb-wrapper">
    <!-- 3. Breadcrumb/Search Bar (Hidden on Home) -->
    <div 
      class="fx-breadcrumb-bar" 
      :class="{ 'is-search-mode': isSearchMode }"
      @click="enableSearch"
    >
      <!-- VIEW A: Breadcrumb Display -->
      <template v-if="!isSearchMode">
        <a 
          href="/" 
          class="terminal-anchor" 
          aria-label="Return to Home"
          @click.stop
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </a>

        <div class="terminal-sep">://</div>

        <div class="readout-window">
          <transition name="terminal-fade" mode="out-in">
            <div v-if="isHome" key="home" class="terminal-text home-msg">
              System Ready
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
          
          <div v-if="commandOutput" class="suggestions-dropdown command-output-panel">
               <div class="cmd-result" :class="commandOutput.type">
                   <span class="cmd-prefix">&gt;&gt;</span> {{ commandOutput.text }}
               </div>
          </div>

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

    <LibrarianConsole :is-open="isLibrarianOpen" @close="isLibrarianOpen = false" />
  </div>
</template>

<style scoped>
/* Breadcrumb Bar (Modified for Console) */
.fx-breadcrumb-bar {
  width: 90%;
  max-width: 1400px;
  height: 36px; /* Back to original height for balance */
  background: rgba(10, 12, 16, 0.9);
  backdrop-filter: blur(12px);
  /* border: 1px solid rgba(57, 255, 20, 0.2); Full border removed */
  border: none;
  border-radius: 0; 
  display: flex;
  align-items: center;
  padding: 0 4px; /* Reduced padding as brackets take space */
  pointer-events: auto;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  font-family: var(--vp-font-family-mono); /* Ensure brackets match mono feel */
  margin: 20px auto; /* Centered in demo page */
}

/* Green Brackets */
.fx-breadcrumb-bar::before {
  content: '[';
  color: var(--vp-c-brand-1);
  font-size: 18px; /* Shrunk from 24px */
  font-weight: 300;
  margin-right: 8px;
  line-height: 1;
}

.fx-breadcrumb-bar::after {
  content: ']';
  color: var(--vp-c-brand-1);
  font-size: 18px; /* Shrunk from 24px */
  font-weight: 300;
  margin-left: 8px;
  line-height: 1;
}

.fx-breadcrumb-bar.is-search-mode {
  /* border-color: var(--vp-c-brand-1); removed specific border */
  box-shadow: 0 0 20px rgba(34, 79, 177, 0.2);
  background: #000;
}

/* --- Internal Breadcrumb Components (Copied Styles) --- */
.terminal-anchor {
  color: var(--vp-c-brand-1);
  display: flex;
  align-items: center;
}
.terminal-sep {
  color: var(--vp-c-brand-1);
  margin: 0 12px;
  font-size: 12px;
  opacity: 0.8;
}
.readout-window {
  flex: 1;
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}
.page-msg {
  color: #e2e8f0;
  font-weight: 700;
  text-transform: uppercase;
}
.home-msg {
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

/* Search Input */
.search-container {
  width: 100%;
  display: flex;
  align-items: center;
}
.search-prompt {
  color: var(--vp-c-brand-1);
  margin-right: 12px;
  font-weight: 700;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  outline: none;
  text-transform: uppercase;
}
.suggestions-dropdown {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  background: #050510;
  border: 1px solid var(--vp-c-brand-1);
  z-index: 200;
}
.suggestion-item {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
}
.suggestion-item:hover {
  background: rgba(34, 79, 177, 0.1);
}
.s-title {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
}
.s-excerpt {
  color: #94a3b8;
  font-size: 10px;
}

/* Transition */
.terminal-fade-enter-active, .terminal-fade-leave-active {
  transition: all 0.2s ease;
}
.terminal-fade-enter-from, .terminal-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
