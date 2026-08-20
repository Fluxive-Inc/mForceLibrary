<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useLibrarian } from '../composables/useLibrarian'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const isActive = ref(false)
const isExpanded = ref(true) // Start expanded so boxes are visible
const searchQuery = ref('')
const placeholderIndex = ref(0)
const placeholders = [
    'Search Machineforce...',
    'Awaiting Directive...',
    'Query Influence Architecture...'
]

const { openLibrarian, processCommand } = useLibrarian()

const currentPlaceholder = computed(() => placeholders[placeholderIndex.value])

const isDocked = ref(false)

// --- Configuration State ---
const uiConfig = ref({
    contextBoxes: [] // Will be loaded dynamically
})

// --- Search Index (Dynamic Loader) ---
const searchIndex = ref([])

onMounted(async () => {
   try {
       // Load Index
       const resIndex = await fetch('/searchIndex.json')
       if (resIndex.ok) searchIndex.value = await resIndex.json()
       
       // Load UI Config
       const resConfig = await fetch('/config.json')
       if (resConfig.ok) {
           const cfg = await resConfig.json()
           if (cfg.contextBoxes) uiConfig.value.contextBoxes = cfg.contextBoxes
       } else {
       // Fallback Default
           uiConfig.value.contextBoxes = [
                { label: "Core", tag: "Core", icon: "C", path: "/core/guide/getting-started", descHeader: ">> KERNEL.DOCS", descContent: "Architecture & protocols." },
                { label: "Reference", tag: "Reference", icon: "Ref", path: "/reference/platform/overview", descHeader: ">> API.INDEX", descContent: "Glossaries & cheat sheets." },
                { label: "Templates", tag: "Templates", icon: "T", path: "/templates/mforce-edges/overview", descHeader: ">> SCAFFOLD.SYS", descContent: "Boilerplate code." },
                { label: "Research", tag: "Research", icon: "R", path: "/research/influence-design/index", descHeader: ">> R&D.LOGS", descContent: "Experimental frameworks." },
                { label: "Academy", tag: "Academy", icon: "A", path: "/academy/overview", descHeader: ">> TRAINING.MODULES", descContent: "Educational resources & tutorials." },
                { label: "News", tag: "News", icon: "N", path: "/news", descHeader: ">> INTEL.FEED", descContent: "Latest system updates." }
           ]
       }

   } catch (e) {
       console.error("System Load Failed", e)
   }
})


// --- Search Internal State ---
const rawSearchResults = computed(() => {
    if (!searchQuery.value) return null
    
    const query = searchQuery.value.toLowerCase()
    const hit = searchIndex.value.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.snippet.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
    )

    // Return structured object if we have hits, empty structure if not
    return {
        core: hit.filter(i => i.category === 'core' || i.category === 'academy' || i.category === 'research'), 
        reference: hit.filter(i => i.category === 'reference'),
        templates: hit.filter(i => i.category === 'templates'),
        hasHits: hit.length > 0 || searchQuery.value.length > 0
    }
})

// --- Live Web Search (Wikipedia API) ---
const webSearchResults = ref([])
let debouncedSearchTimer = null

const fetchWebResults = async (query) => {
    if (!query || query.length < 2) {
        webSearchResults.value = []
        return
    }

    try {
        // Using Wikipedia OpenSearch as a reliable, CORS-friendly "Web Intel" source
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json&origin=*`)
        const data = await res.json()
        
        // Data format: [query, [titles], [descriptions], [links]]
        const titles = data[1]
        const descs = data[2]
        const links = data[3]

        webSearchResults.value = titles.map((t, i) => ({
            title: t,
            path: links[i],
            category: 'web',
            snippet: descs[i] || 'External Knowledge Base Entry',
            isExternal: true
        }))
    } catch (e) {
        console.error("Web Intel Uplink Failed:", e)
        // Fallback if API fails
        webSearchResults.value = [
            {
                title: `Google Search: "${query}"`,
                path: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                category: 'web',
                snippet: '>> SYSTEM_OFFLINE: INITIATE_MANUAL_SEARCH',
                isExternal: true,
                isSearchAction: true
            }
        ]
    }
}

watch(searchQuery, (newVal) => {
    clearTimeout(debouncedSearchTimer)
    debouncedSearchTimer = setTimeout(() => {
        fetchWebResults(newVal)
    }, 300)
})

// Persistent state for "last known good" results
const persistentResults = ref({ core: [], reference: [], templates: [], web: [] })
const showEndOfLibraryWarning = ref(false)

// Watcher to handle "End of Library" logic
watch(rawSearchResults, (newVal) => {
    if (!newVal) {
        // Query cleared
        persistentResults.value = { core: [], reference: [], templates: [], web: [] }
        showEndOfLibraryWarning.value = false
        return
    }

    if (newVal.hasHits || webSearchResults.value.length > 0) {
        // We have matches, update the display and hide warning
        persistentResults.value = {
            ...newVal,
            web: webSearchResults.value
        }
        showEndOfLibraryWarning.value = false
    } else {
        // No matches for current query -> KEEP persistentResults as they were
        // But SHOW the warning
        showEndOfLibraryWarning.value = true
    }
})

// Watch web results specifically to update persistent view even if rawSearchResults doesn't change
watch(webSearchResults, (newWeb) => {
    if (newWeb.length > 0) {
        persistentResults.value.web = newWeb
        showEndOfLibraryWarning.value = false
    }
})

const searchResults = persistentResults // Expose for template


// Cycle placeholders (only when not docked)
onMounted(() => {
    setInterval(() => {
        if (!isActive.value && !isDocked.value) {
            placeholderIndex.value = (placeholderIndex.value + 1) % placeholders.length
        }
    }, 4000)
})

const handleFocus = () => {
    isActive.value = true
    document.body.classList.add('fx-dimmed') 
}

const handleBlur = () => {
    // Only undim if empty and not docked
    if (!searchQuery.value && !isDocked.value) {
        isActive.value = false
        isExpanded.value = false
        document.body.classList.remove('fx-dimmed')
    }
}

const handleInput = (e) => {
    searchQuery.value = e.target.value
    
    // Docking Logic: Input length > 0 -> Dock immediately
    if (searchQuery.value.length > 0) {
        if (!isDocked.value) {
            isDocked.value = true
            isExpanded.value = true // Expand graph? Or show results?
            document.body.classList.add('fx-curator-docked')
        }
    } else {
        // Optional: Undock if empty? Or stay docked?
        // For now, let's keep it sticky or allow undock if explicitly cleared (later)
        if (searchQuery.value.length === 0) {
           // We might want to undock if user clears to start over
           isDocked.value = false
           document.body.classList.remove('fx-curator-docked')
        }
    }
}

// --- Context Selection ---
const selectContext = (box) => {
    if (box.path) {
        window.location.href = box.path
        return
    }
    searchQuery.value = box.tag
    // Manually trigger dock/search logic effectively
    isDocked.value = true
    isExpanded.value = true
    document.body.classList.add('fx-curator-docked')
    // Trigger web search if needed or just let watchers handle it
    fetchWebResults(box.tag)
}

// Handle Enter on Main Input
const handleEnter = (e) => {
    const val = searchQuery.value.trim()
    if (val.toLowerCase().startsWith('cmd')) {
        const result = processCommand(val)
        if (result.type === 'action' && result.action === 'open_librarian') {
            openLibrarian()
        }
    }
}

// Helper to map index to style classes
const getBranchClass = (idx) => {
    return `branch-${idx}`
}

const getBranchType = (idx) => {
    if (idx === 0) return 'construct'
    if (idx === 1) return 'command'
    return 'diagnose' // Fallback color
}
</script>

<template>
  <div class="neural-curator" :class="{ 'is-active': isActive, 'is-expanded': isExpanded, 'is-docked': isDocked }" v-show="!isLibrarianOpen">
    
    <!-- Phase 1: The Nucleus (Input) -->
    <div class="curator-nucleus">
        <div class="nucleus-glow"></div>
        <input 
            type="text" 
            class="curator-input"
            :placeholder="currentPlaceholder"
            :value="searchQuery"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
            @keydown.enter="handleEnter"
        />
        <div class="nucleus-border"></div>
    </div>

    <!-- Phase 3: The Tensor Graph (Boxes) - Loaded from Config -->
    <transition name="fade">
    <div class="tensor-graph" v-if="isExpanded">
        
        <div 
            v-for="(box, idx) in uiConfig.contextBoxes" 
            :key="idx"
            class="tensor-branch"
            :class="getBranchClass(idx)"
        >
            <div class="branch-line"></div>
            <div class="node-cluster">
                <div class="node-item" :data-type="getBranchType(idx)" @click="selectContext(box)">
                    <span class="node-icon">{{ box.icon }}</span>
                    <span class="node-label">{{ box.label }}</span>
                    <div class="holo-pane" v-if="box.descHeader">
                        <div class="holo-header">{{ box.descHeader }}</div>
                        <div class="holo-content">{{ box.descContent }}</div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    </transition>

    <!-- Phase 4: Curator Results Grid (Docked Only) -->
    <Teleport to="body">
      <div class="curator-results-container" v-if="isDocked">
          
          <!-- End of Library Warning -->
          <div v-if="showEndOfLibraryWarning" class="end-of-library-warning">
              <span class="warning-icon">!</span>
              You've reached the end of the library. Here is what we have to support you:
          </div>
  
          <div class="results-grid">
              
              <!-- Column 1: Core / Academy -->
              <div class="result-column">
                  <div class="col-header">>> CORE_DOCS</div>
                  <a v-for="res in searchResults.core" :key="res.path" :href="res.path" class="result-card">
                      <div class="res-title">{{ res.title }}</div>
                      <div class="res-desc">{{ res.snippet }}</div>
                  </a>
                  <div v-if="!searchResults.core?.length" class="empty-state">No matching core signals.</div>
              </div>
  
              <!-- Column 2: References -->
              <div class="result-column">
                  <div class="col-header">>> REFERENCES</div>
                  <a v-for="res in searchResults.reference" :key="res.path" :href="res.path" class="result-card">
                      <div class="res-title">{{ res.title }}</div>
                      <div class="res-desc">{{ res.snippet }}</div>
                  </a>
                  <div v-if="!searchResults.reference?.length" class="empty-state">No matching references.</div>
              </div>
  
              <!-- Column 3: Templates -->
              <div class="result-column">
                  <div class="col-header">>> TEMPLATES</div>
                  <a v-for="res in searchResults.templates" :key="res.path" :href="res.path" class="result-card">
                      <div class="res-title">{{ res.title }}</div>
                      <div class="res-desc">{{ res.snippet }}</div>
                  </a>
                  <div v-if="!searchResults.templates?.length" class="empty-state">No matching templates.</div>
              </div>

              <!-- Column 4: Web Intel -->
              <div class="result-column">
                  <div class="col-header">>> WEB_INTEL</div>
                  <a v-for="res in searchResults.web" :key="res.path" :href="res.path" :target="res.isExternal ? '_blank' : '_self'" class="result-card" :class="{ 'is-external': res.isExternal, 'is-search-action': res.isSearchAction }">
                      <div class="res-title">
                          {{ res.title }}
                          <span v-if="res.isExternal" class="ext-icon">↗</span>
                      </div>
                      <div class="res-desc">{{ res.snippet }}</div>
                  </a>
                  <div v-if="!searchResults.web?.length" class="empty-state">No signal.</div>
              </div>
  
          </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* --- Core Variables --- */
.neural-curator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 600px;
    margin: 0;
    z-index: 200;
    font-family: var(--vp-font-family-mono);
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1); /* Global transition for move */
}

.neural-curator.is-active,
.neural-curator.is-expanded {
    z-index: 9999; 
}

/* --- Docked State --- */
.neural-curator.is-docked {
    position: fixed;
    top: calc(var(--vp-nav-height) + 80px); /* Align under top menu */
    left: 50%;
    width: 100%;
    max-width: 600px;
    margin: 0;
    transform: translateX(-50%) !important;
    z-index: 10000;
}

.neural-curator.is-docked .curator-nucleus {
    height: 48px; /* Match ticker height */
}

/* Adjust brackets when docked (Optional: remove or shrink) */
.neural-curator.is-docked .curator-nucleus::before,
.neural-curator.is-docked .curator-nucleus::after {
    font-size: 20px; /* Smaller brackets */
    line-height: 48px;
}

/* Hide Tensor Graph when docked (Start simple, show results instead) */
/* REVISED: Show Tensor Graph when docked, but styled as a row */
.neural-curator.is-docked .tensor-graph {
    opacity: 1;
    pointer-events: auto;
    position: fixed;
    top: 60px; /* Below the input bar */
    left: 50%;
    transform: translateX(-50%);
    width: 600px; /* Match max-width */
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 16px;
    z-index: 10002; /* Above results */
}

.neural-curator.is-docked .tensor-branch {
    position: relative;
    top: auto; left: auto;
    transform: none !important; /* Reset spring physics */
    width: auto; height: auto;
    opacity: 1;
}

.neural-curator.is-docked .branch-line {
    display: none; /* Hide lines in row mode */
}

.neural-curator.is-docked .node-cluster {
    width: auto;
    gap: 0;
}

.neural-curator.is-docked .node-item {
    min-width: unset;
    padding: 8px 16px;
    background: rgba(10, 12, 16, 0.9);
}

/* Hide holo-pane in docked mode to prevent visual clutter */
.neural-curator.is-docked .holo-pane {
    display: none;
}

/* --- Nucleus --- */
.curator-nucleus {
    position: relative;
    width: 100%;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Green Brackets for Curator */
.curator-nucleus::before {
  content: '[';
  color: var(--vp-c-brand-1); /* Neon Green */
  font-family: var(--vp-font-family-mono);
  font-size: 32px;
  font-weight: 300;
  margin-right: 12px;
  line-height: 1;
  pointer-events: none;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.curator-nucleus::after {
  content: ']';
  color: var(--vp-c-brand-1); /* Neon Green */
  font-family: var(--vp-font-family-mono);
  font-size: 32px;
  font-weight: 300;
  margin-left: 12px;
  line-height: 1;
  pointer-events: none;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.curator-nucleus:hover::before,
.curator-nucleus:hover::after {
    opacity: 1;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

.curator-input {
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 12, 0.6);
    border: none;
    /* border-radius: 9999px; Remove rounded pill for terminal look */
    border-radius: 0;
    padding: 0 32px;
    color: #fff;
    font-size: 16px;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 2;
    font-family: var(--vp-font-family-mono); /* Force mono */
}

.curator-input:focus {
    outline: none;
    background: rgba(10, 10, 12, 0.9);
    /* box-shadow: 0 0 30px rgba(0, 229, 255, 0.1); */
}

/* Breathing Glow - Modified for Brackets */
.nucleus-border {
    position: absolute;
    top: 10%; bottom: 10%; /* Shrink vertical to focus on text */
    left: 0; right: 0;
    border-radius: 4px;
    /* border: 1px solid rgba(255, 255, 255, 0.1); remove border */
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 3;
}

.neural-curator:not(.is-active) .nucleus-border {
    animation: breathe 4s infinite ease-in-out;
}

@keyframes breathe {
    0%, 100% { border-color: rgba(255, 255, 255, 0.1); box-shadow: 0 0 0 rgba(0,0,0,0); }
    50% { border-color: rgba(255, 255, 255, 0.3); box-shadow: 0 0 10px rgba(255, 255, 255, 0.05); }
}

.is-active .nucleus-border {
    border-color: var(--fx-teal);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}

/* --- Tensor Graph (Expansion) --- */
.tensor-graph {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    pointer-events: none; /* Allow clicks to pass through empty space */
}

.tensor-branch {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    pointer-events: auto;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring physics */
    opacity: 0;
}

/* SCATTERED POSITIONS FOR NODES */
/* Branch 0: Academy (Top Left) */
.is-expanded .branch-0 {
    transform: translate(-320px, -180px);
    opacity: 1;
}

/* Branch 1: Core (Top Right) */
.is-expanded .branch-1 {
    transform: translate(320px, -180px);
    opacity: 1;
}

/* Branch 2: Research (Bottom Left) */
.is-expanded .branch-2 {
    transform: translate(-320px, 180px);
    opacity: 1;
}

/* Branch 3: Reference (Bottom Right) */
.is-expanded .branch-3 {
    transform: translate(320px, 180px);
    opacity: 1;
}

/* Branch 4: Studio (Top Center) */
.is-expanded .branch-4 {
    transform: translate(0, -260px);
    opacity: 1;
}

/* Branch 5: Templates (Bottom Center) */
.is-expanded .branch-5 {
    transform: translate(0, 260px);
    opacity: 1;
}


/* --- Node Styling --- */
.node-cluster {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 140px;
}

.node-item {
    background: #000; /* Solid black for visibility */
    border: 1px solid rgba(255,255,255,0.2);
    padding: 10px 18px;
    border-radius: 2px; /* Technical sharp corners */
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.8);
    min-width: 160px; /* Ensure uniform width */
    margin-left: -80px; /* Center relative to branch point */
}

.node-item:hover {
    transform: scale(1.05) translateY(-2px);
    z-index: 100;
    background: #111;
}

.node-icon { 
    font-weight: bold; 
    font-size: 14px;
}
.node-label { 
    font-size: 13px; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
    color: #fff; 
    font-weight: 700;
}

/* Type Specific Colors */
.node-item[data-type="construct"] { border-color: rgba(0, 229, 255, 0.3); }
.node-item[data-type="construct"] .node-icon { color: var(--fx-teal); }
.node-item[data-type="construct"]:hover { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2); border-color: var(--fx-teal); }

.node-item[data-type="command"] { border-color: rgba(138, 99, 210, 0.3); }
.node-item[data-type="command"] .node-icon { color: var(--fx-violet); }
.node-item[data-type="command"]:hover { box-shadow: 0 0 15px rgba(138, 99, 210, 0.2); border-color: var(--fx-violet); }

.node-item[data-type="diagnose"] { border-color: rgba(255, 176, 32, 0.3); }
.node-item[data-type="diagnose"] .node-icon { color: var(--fx-amber); }
.node-item[data-type="diagnose"]:hover { box-shadow: 0 0 15px rgba(255, 176, 32, 0.2); border-color: var(--fx-amber); }

/* --- Holographic Pane --- */
.holo-pane {
    position: absolute;
    top: 50%;
    left: 100%;
    margin-left: 20px;
    width: 200px;
    background: rgba(10, 10, 12, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-50%) scale(0.9);
    transition: all 0.3s ease;
    border-left: 3px solid #fff;
    z-index: 200;
}

.node-item:hover .holo-pane {
    opacity: 1;
    transform: translateY(-50%) scale(1);
    pointer-events: auto;
}


/* --- Results Grid (Docked Mode) --- */
.curator-results-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    width: 100vw;
    height: 100vh;
    padding: 260px 40px 80px 40px; /* Increased top padding to accommodate docked boxes */
    z-index: 9000; /* Below curator input (z-index 10000) */
    pointer-events: none; /* Let events pass for now, but content needs pointer events */
    background: radial-gradient(circle at center, rgba(10,12,16,0.9) 0%, transparent 80%);
    transition: opacity 0.5s ease;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
    pointer-events: auto; /* Enable clicks on results */
}

.result-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.col-header {
    font-size: 12px;
    color: var(--vp-c-brand-1);
    margin-bottom: 12px;
}

.result-card {
    display: block;
    background: rgba(10, 10, 12, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px;
    border-radius: 2px;
    text-decoration: none;
    transition: all 0.2s ease;
}

.result-card:hover {
    background: rgba(10, 10, 12, 0.9);
    border-color: var(--vp-c-brand-1);
    transform: translateX(4px);
}

.result-card.is-search-action {
    border-color: rgba(0, 243, 255, 0.3);
    border-style: dashed;
}

.result-card.is-search-action:hover {
    background: rgba(0, 243, 255, 0.1);
    border-color: var(--vp-c-brand-2);
}

.ext-icon {
    font-size: 10px;
    margin-left: 4px;
    color: var(--vp-c-brand-1);
    vertical-align: top;
}

.res-title {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
}

.res-desc {
    color: #94a3b8;
    font-size: 12px;
}

.empty-state {
    color: #475569;
    font-size: 12px;
    font-style: italic;
}

.end-of-library-warning {
    position: fixed; /* Fix position to ensure it stacks correctly */
    top: calc(var(--vp-nav-height) + 110px); /* 64 + 40(gap) + 56(input) + 10(gap) approx */
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
    margin: 0;
    padding: 12px 16px;
    background: rgba(255, 176, 32, 0.1); /* Amber tint */
    z-index: 10001; /* Above results, below/with input context */
    border-left: 3px solid var(--fx-amber);
    color: var(--fx-amber);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeIn 0.3s ease-out;
}

.warning-icon {
    font-weight: bold;
    font-family: monospace;
    background: var(--fx-amber);
    color: #000;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
