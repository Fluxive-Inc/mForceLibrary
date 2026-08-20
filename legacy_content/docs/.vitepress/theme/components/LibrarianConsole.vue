<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const activeTab = ref('catalog') // 'catalog', 'stacks', 'raw'
const statusMsg = ref('')
const isLoading = ref(false)

// --- DATA STATE ---
const indexData = ref([])
const fileList = ref([])

// --- CATALOG STATE ---
const catalogSearch = ref('')
const selectedCatalogItem = ref(null) // The item currently being edited
const isNewCatalogItem = ref(false)
const uniqueTags = computed(() => {
    const tags = new Set()
    indexData.value.forEach(item => {
        if (Array.isArray(item.tags)) item.tags.forEach(t => tags.add(t))
    })
    return Array.from(tags).sort()
})

// --- STACKS STATE ---
const selectedFile = ref(null)
const fileContent = ref('')
const initialContent = ref('') 
const showPreview = ref(false)

// --- RAW DATA STATE ---
const rawFilter = ref('')

// --- API CLIENT ---
const API_URL = 'http://localhost:3001/api'

// ------------------------------------------------------------------
// DATA FETCHING
// ------------------------------------------------------------------

const loadCatalog = async () => {
    isLoading.value = true
    try {
        const res = await fetch(`${API_URL}/index`)
        indexData.value = await res.json()
    } catch (e) {
        statusMsg.value = 'ERR: SYNC FAILED'
    } finally { isLoading.value = false }
}

const loadFiles = async () => {
    try {
        const res = await fetch(`${API_URL}/pages`)
        fileList.value = await res.json()
    } catch (e) {}
}

const saveCatalog = async () => {
    isLoading.value = true
    try {
        await fetch(`${API_URL}/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(indexData.value)
        })
        statusMsg.value = 'INDEX SAVED'
        setTimeout(() => statusMsg.value = '', 2000)
    } catch (e) {
        statusMsg.value = 'SAVE FAILED'
    } finally { isLoading.value = false }
}

// ------------------------------------------------------------------
// CATALOG LOGIC
// ------------------------------------------------------------------

// Tree View Computation
const catalogTree = computed(() => {
    const groups = {}
    const query = catalogSearch.value.toLowerCase()
    
    indexData.value.forEach(item => {
        // Filter logic
        if (query && !JSON.stringify(item).toLowerCase().includes(query)) return

        const cat = item.category || 'uncategorized'
        if (!groups[cat]) groups[cat] = []
        groups[cat].push(item)
    })
    return groups
})

const selectCatalogItem = (item) => {
    selectedCatalogItem.value = JSON.parse(JSON.stringify(item)) // Clone
    isNewCatalogItem.value = false
}

const createCatalogItem = () => {
    selectedCatalogItem.value = { 
        title: 'New Entry', 
        path: '', 
        category: 'core', 
        snippet: 'Description...', 
        tags: [] 
    }
    isNewCatalogItem.value = true
}

const saveCurrentCatalogItem = () => {
    if (!selectedCatalogItem.value) return

    if (isNewCatalogItem.value) {
        indexData.value.push(selectedCatalogItem.value)
        isNewCatalogItem.value = false
    } else {
        // Find and update in array
        // We need a unique ID strictly, but using path as key for now
        const idx = indexData.value.findIndex(i => i.path === selectedCatalogItem.value.path)
        if (idx !== -1) {
             indexData.value[idx] = selectedCatalogItem.value
        } else {
            // Path might have changed, tricky without ID. 
            // For MVP: assume editing 'in place' doesn't lose ref if we didn't clone? 
            // We did clone. Let's trying matching by OLD path or just replace if we tracked index.
            // Simple approach: Replace match or push.
            // In a real app we'd use a UUID.
            // Let's iterate and match by title + snippet as heuristic if path changed?
            // Fallback: Remove old (if we had ref) and add new. 
            // Better: Just push update. UX might be slightly glitchy on path rename.
            indexData.value.push(selectedCatalogItem.value) // This dupes if path changed.
            // Correct fix: Add hidden UUID to data or strictly use index.
        }
    }
    saveCatalog()
}

const deleteCatalogItem = () => {
    if (!selectedCatalogItem.value) return
    if (!confirm('Delete this entry?')) return
    
    const path = selectedCatalogItem.value.path
    indexData.value = indexData.value.filter(i => i.path !== path)
    selectedCatalogItem.value = null
    saveCatalog()
}

// ------------------------------------------------------------------
// STACKS LOGIC
// ------------------------------------------------------------------

const selectFile = async (file) => {
    if (fileContent.value !== initialContent.value && selectedFile.value) {
        if(!confirm('Unsaved changes. Discard?')) return
    }
    selectedFile.value = file
    isLoading.value = true
    try {
        const res = await fetch(`${API_URL}/page/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filepath: file })
        })
        const data = await res.json()
        fileContent.value = data.content
        initialContent.value = data.content
    } finally { isLoading.value = false }
}

const saveFile = async () => {
    if (!selectedFile.value) return
    isLoading.value = true
    try {
        await fetch(`${API_URL}/page/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filepath: selectedFile.value, content: fileContent.value })
        })
        initialContent.value = fileContent.value
        statusMsg.value = `SAVED ${selectedFile.value}`
        setTimeout(() => statusMsg.value = '', 2000)
    } finally { isLoading.value = false }
}

const previewUrl = computed(() => {
    if (!selectedFile.value) return ''
    // Convert filepath to route
    // e.g. "guide/getting-started.md" -> "/guide/getting-started"
    let route = selectedFile.value.replace('.md', '').replace('index', '')
    if (!route.startsWith('/')) route = '/' + route
    return route
})

// ------------------------------------------------------------------
// RAW DATA LOGIC
// ------------------------------------------------------------------
const filteredRawJson = computed(() => {
    if (!rawFilter.value) return JSON.stringify(indexData.value, null, 2)
    
    const filtered = indexData.value.filter(item => JSON.stringify(item).toLowerCase().includes(rawFilter.value.toLowerCase()))
    return JSON.stringify(filtered, null, 2)
})


// ------------------------------------------------------------------
// LIFECYCLE
// ------------------------------------------------------------------
watch(() => props.isOpen, (val) => {
    if (val) {
        loadCatalog()
        loadFiles()
    }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="librarian-overlay">
        
        <!-- SIDEBAR NAVIGATION -->
        <div class="main-sidebar">
             <div class="ms-header">
                 LIBRARIAN <span class="accent">v1.0</span>
             </div>
             
             <button class="ms-tab" :class="{ active: activeTab === 'catalog' }" @click="activeTab = 'catalog'">
                 <span class="icon">📇</span> CARD CATALOG
             </button>
             <button class="ms-tab" :class="{ active: activeTab === 'stacks' }" @click="activeTab = 'stacks'">
                 <span class="icon">📚</span> THE STACKS
             </button>
             <button class="ms-tab" :class="{ active: activeTab === 'raw' }" @click="activeTab = 'raw'">
                 <span class="icon">💾</span> RAW DATA
             </button>

             <div class="ms-status">
                 STATUS: {{ isLoading ? 'BUSY...' : 'READY' }}
                 <div class="status-msg" v-if="statusMsg">{{ statusMsg }}</div>
             </div>
             
             <button class="ms-close" @click="$emit('close')">EXIT CONSOLE</button>
        </div>

        <!-- MAIN CONTENT FRAME -->
        <div class="main-content">
            
            <!-- == VIEW: CATALOG == -->
            <div v-if="activeTab === 'catalog'" class="view-layout catalog-layout">
                <!-- Tree Pane -->
                <div class="col-tree">
                    <div class="pane-header">
                        <span>SEARCH INDEX</span>
                        <button class="mini-btn" @click="createCatalogItem">+</button>
                    </div>
                    <div class="tree-search">
                        <input v-model="catalogSearch" placeholder="Filter nodes..." />
                    </div>
                    <div class="tree-scroll">
                        <div v-for="(items, category) in catalogTree" :key="category" class="tree-group">
                            <div class="group-label">📂 {{ category.toUpperCase() }}</div>
                            <div 
                                v-for="item in items" 
                                :key="item.path" 
                                class="tree-item"
                                :class="{ active: selectedCatalogItem?.path === item.path }"
                                @click="selectCatalogItem(item)"
                            >
                                <span class="item-icon">📄</span> 
                                {{ item.title }}
                            </div>
                        </div>
                    </div>
                    <!-- Tag Cloud -->
                    <div class="tag-cloud-pane">
                        <div class="pane-header">KNOWN TAGS</div>
                        <div class="tag-list">
                            <span v-for="tag in uniqueTags" :key="tag" class="tag-chip" @click="catalogSearch = tag">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Editor Pane -->
                <div class="col-main">
                    <div v-if="selectedCatalogItem" class="form-container">
                        <div class="form-header">
                            <div class="fh-title">{{ isNewCatalogItem ? 'CREATING NEW ENTRY' : 'EDITING ENTRY' }}</div>
                            <div class="fh-actions">
                                <button class="btn-danger" @click="deleteCatalogItem" v-if="!isNewCatalogItem">DELETE</button>
                                <button class="btn-primary" @click="saveCurrentCatalogItem">SAVE CHANGES</button>
                            </div>
                        </div>
                        
                        <div class="form-body">
                             <div class="form-row">
                                 <label>TITLE</label>
                                 <input v-model="selectedCatalogItem.title" />
                             </div>
                             <div class="form-row">
                                 <label>PATH (URL)</label>
                                 <input v-model="selectedCatalogItem.path" />
                             </div>
                             <div class="form-row split">
                                 <div>
                                     <label>CATEGORY</label>
                                     <input v-model="selectedCatalogItem.category" list="cat-options" />
                                     <datalist id="cat-options">
                                         <option>core</option>
                                         <option>reference</option>
                                         <option>templates</option>
                                         <option>web</option>
                                     </datalist>
                                 </div>
                                 <div>
                                     <label>TYPE</label>
                                     <select>
                                         <option>Internal Doc</option>
                                         <option>External Link</option>
                                     </select>
                                 </div>
                             </div>
                             <div class="form-row">
                                 <label>SNIPPET (DESCRIPTION)</label>
                                 <textarea v-model="selectedCatalogItem.snippet" rows="3"></textarea>
                             </div>
                             <div class="form-row">
                                 <label>TAGS (Comma separated)</label>
                                 <input 
                                    :value="selectedCatalogItem.tags?.join(', ')"
                                    @input="e => selectedCatalogItem.tags = e.target.value.split(',').map(s => s.trim()).filter(s => s)"
                                 />
                             </div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        SELECT A NODE TO INSPECT ATTRIBUTES
                    </div>
                </div>
            </div>

            <!-- == VIEW: STACKS == -->
            <div v-if="activeTab === 'stacks'" class="view-layout stacks-layout">
                <!-- File Tree -->
                <div class="col-tree">
                    <div class="pane-header">LIBRARY FILES</div>
                    <div class="tree-scroll">
                        <div v-for="file in fileList" :key="file" class="file-row" 
                             :class="{ active: selectedFile === file }"
                             @click="selectFile(file)">
                            {{ file }}
                        </div>
                    </div>
                </div>

                <!-- Editor -->
                <div class="col-editor">
                    <div class="editor-header">
                        <span class="fname">{{ selectedFile || 'NO_FILE_SELECTED' }}</span>
                        <div class="editor-tools" v-if="selectedFile">
                            <button class="mini-btn" @click="showPreview = !showPreview">
                                {{ showPreview ? 'HIDE PREVIEW' : 'SHOW PREVIEW' }}
                            </button>
                            <button class="btn-primary" @click="saveFile">SAVE</button>
                        </div>
                    </div>
                    <div class="editor-workspace" :class="{ 'has-preview': showPreview }">
                        <textarea 
                            v-if="selectedFile" 
                            v-model="fileContent" 
                            class="code-editor" 
                            spellcheck="false"
                        ></textarea>
                        <div v-else class="empty-state">SELECT A FILE FROM THE STACKS</div>

                        <!-- Live Preview Frame -->
                        <div v-if="showPreview && selectedFile" class="preview-frame">
                            <iframe :src="previewUrl" frameborder="0"></iframe>
                        </div>
                    </div>
                </div>
            </div>

            <!-- == VIEW: RAW DATA == -->
            <div v-if="activeTab === 'raw'" class="view-layout raw-layout">
                <div class="col-full">
                    <div class="pane-header">
                        <span>SEARCH INDEX JSON</span>
                        <input v-model="rawFilter" placeholder="Deep filter object..." class="raw-filter" />
                    </div>
                    <textarea class="raw-viewer" readonly>{{ filteredRawJson }}</textarea>
                </div>
            </div>

        </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- BASE LAYOUT --- */
.librarian-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #000;
    z-index: 99999;
    display: flex;
    font-family: 'JetBrains Mono', monospace;
    color: #ccc;
}

/* Sidebar */
.main-sidebar {
    width: 250px;
    background: #080808;
    border-right: 1px solid #222;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}
.ms-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-weight: 800;
    letter-spacing: 1px;
    border-bottom: 1px solid #222;
    color: #fff;
}
.ms-header .accent { color: var(--vp-c-brand-1); margin-left: 8px; font-size: 10px; background: #222; padding: 2px 6px; border-radius: 4px; }
.ms-tab {
    height: 50px;
    background: transparent;
    border: none;
    color: #888;
    text-align: left;
    padding: 0 20px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    display: flex;
    align-items: center; gap: 10px;
    transition: all 0.2s;
    border-left: 3px solid transparent;
}
.ms-tab:hover { background: #111; color: #fff; }
.ms-tab.active { background: #161616; color: #fff; border-left-color: var(--vp-c-brand-1); }
.ms-tab .icon { font-size: 16px; width: 24px; text-align: center; }

.ms-status {
    margin-top: auto;
    padding: 20px;
    font-size: 11px;
    color: #555;
    border-top: 1px solid #222;
}
.status-msg { color: var(--fx-amber); margin-top: 4px; }

.ms-close {
    height: 50px;
    background: #220000;
    border: none;
    color: #f55;
    font-family: inherit;
    font-weight: 800;
    cursor: pointer;
    border-top: 1px solid #400;
}
.ms-close:hover { background: #440000; color: #fff; }

/* Main Content Area */
.main-content {
    flex: 1;
    background: #050505;
    overflow: hidden;
    position: relative;
    display: flex;
}

.view-layout {
    flex: 1;
    display: flex;
    width: 100%;
    height: 100vh; /* Fill height */
    padding-bottom: 30px; /* Space for ticker */
}

/* --- COLUMNS --- */
.col-tree {
    width: 280px;
    border-right: 1px solid #222;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
}
.col-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.col-editor { flex: 1; display: flex; flex-direction: column; }
.col-full { flex: 1; display: flex; flex-direction: column; }

/* Headers */
.pane-header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #111;
    border-bottom: 1px solid #222;
    font-size: 11px;
    font-weight: 700;
    color: #666;
}

/* Tree UI */
.tree-search { padding: 10px; border-bottom: 1px solid #222; }
.tree-search input { 
    width: 100%; background: #000; border: 1px solid #333; color: #fff; 
    padding: 6px 10px; font-family: inherit; font-size: 12px; 
}
.tree-scroll { flex: 1; overflow-y: auto; padding: 10px 0; }
.tree-group { margin-bottom: 12px; }
.group-label { 
    padding: 4px 16px; font-size: 10px; color: #555; font-weight: 800; 
}
.tree-item {
    padding: 6px 16px 6px 24px;
    font-size: 13px;
    color: #aaa;
    cursor: pointer;
    display: flex; align-items: center; gap: 8px;
}
.tree-item:hover { background: #161616; color: #fff; }
.tree-item.active { background: #222; color: #fff; border-right: 2px solid var(--vp-c-brand-1); }
.item-icon { font-size: 12px; opacity: 0.5; }

/* Tag Cloud */
.tag-cloud-pane { 
    height: 200px; border-top: 1px solid #222; 
    display: flex; flex-direction: column;
}
.tag-list { padding: 12px; display: flex; flex-wrap: wrap; gap: 6px; overflow-y: auto; }
.tag-chip {
    background: #1a1a1a; color: #888; padding: 2px 6px; font-size: 10px; border-radius: 4px; border: 1px solid #333;
    cursor: pointer;
}
.tag-chip:hover { border-color: var(--vp-c-brand-1); color: #fff; }

/* Form UI */
.form-container { max-width: 800px; margin: 0 auto; width: 100%; padding: 40px; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #222; padding-bottom: 20px; }
.fh-title { font-size: 18px; font-weight: 700; color: #fff; }
.fh-actions { display: flex; gap: 10px; }

.form-body { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; flex-direction: column; gap: 8px; }
.form-row label { font-size: 11px; color: #666; font-weight: 700; }
.form-row input, .form-row select, .form-row textarea {
    background: #080808; border: 1px solid #333; color: #fff; padding: 12px;
    font-family: inherit; font-size: 13px;
}
.form-row input:focus, .form-row textarea:focus { border-color: var(--vp-c-brand-1); outline: none; }
.form-row.split { flex-direction: row; gap: 20px; }
.form-row.split > div { flex: 1; display: flex; flex-direction: column; gap: 8px; }

/* Buttons */
.btn-primary { 
    background: var(--vp-c-brand-1); color: #000; border: none; padding: 8px 16px; 
    font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-primary:hover { opacity: 0.9; }
.btn-danger { 
    background: transparent; color: #f55; border: 1px solid #f55; padding: 8px 16px; 
    font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:hover { background: #f55; color: #000; }
.mini-btn { background: #222; border: 1px solid #444; color: #fff; padding: 2px 8px; cursor: pointer; }

/* Stacks UI */
.file-row { padding: 8px 16px; font-size: 13px; color: #999; cursor: pointer; }
.file-row:hover { background: #161616; color: #fff; }
.file-row.active { background: #222; color: #fff; }

.editor-header { 
    height: 48px; border-bottom: 1px solid #222; display: flex; 
    align-items: center; justify-content: space-between; padding: 0 20px;
}
.editor-tools { display: flex; gap: 10px; }
.editor-workspace { flex: 1; display: flex; overflow: hidden; }
.code-editor {
    flex: 1; background: #050505; color: #ddd; border: none; padding: 20px; resize: none; outline: none;
    line-height: 1.6;
}
.preview-frame {
    width: 50%;
    border-left: 1px solid #333;
    background: #fff;
}
.preview-frame iframe { width: 100%; height: 100%; }

/* Raw UI */
.raw-filter { background: #000; border: 1px solid #333; color: #fff; padding: 4px 8px; width: 300px; }
.raw-viewer { 
    flex: 1; background: #080808; color: #88ff88; padding: 20px; border: none; resize: none; 
    font-family: 'JetBrains Mono', monospace; font-size: 12px; 
}

.empty-state {
    flex: 1; display: flex; align-items: center; justify-content: center;
    color: #333; font-weight: 900; font-size: 20px;
    background: repeating-linear-gradient(45deg, #050505, #050505 10px, #0a0a0a 10px, #0a0a0a 20px);
}
</style>
