<script setup>
import { useSearch } from '../composables/useSearch'
import { ref, onMounted } from 'vue'

const { initSearch, search } = useSearch()
const results = ref([])
const query = ref('')

onMounted(async () => {
  await initSearch()
  
  // Parse query from URL
  const urlParams = new URLSearchParams(window.location.search)
  const q = urlParams.get('q')
  
  if (q) {
    query.value = q
    results.value = search(q)
  }
})
</script>

<template>
  <div class="search-results-page">
    <h1>Search Results</h1>
    <div class="meta-info" v-if="query">
       Displaying results for: <span class="highlight">"{{ query }}"</span> [ {{ results.length }} records ]
    </div>
    
    <div v-if="results.length > 0" class="results-grid">
      <a 
        v-for="item in results" 
        :key="item.id" 
        :href="item.link"
        class="result-card"
      >
        <div class="r-title">{{ item.title }}</div>
        <div class="r-excerpt">{{ item.excerpt }}</div>
      </a>
    </div>
    
    <div v-else-if="query" class="no-results">
      No records found matching your query.
    </div>
  </div>
</template>

<style scoped>
.search-results-page {
  padding-top: 40px;
}

h1 {
  font-family: var(--vp-font-family-headings);
  font-size: 32px;
  color: var(--vp-c-brand-1);
  margin-bottom: 20px;
}

.meta-info {
  font-family: 'JetBrains Mono', monospace;
  color: var(--vp-c-text-2);
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.highlight {
  color: #ffffff;
  font-weight: 700;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.result-card {
  display: block;
  background: #141428;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.result-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateX(5px);
  background: #1a1a35;
}

.r-title {
  font-family: var(--vp-font-family-headings);
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-card:hover .r-title {
  color: var(--vp-c-brand-1);
}

.r-excerpt {
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.5;
}
</style>
