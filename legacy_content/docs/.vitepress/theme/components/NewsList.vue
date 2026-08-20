<script setup>
import { ref, onMounted } from 'vue'
import { useWixClient } from '../composables/wixClient'

const { fetchNewsList } = useWixClient()
const news = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        news.value = await fetchNewsList()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
})

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<template>
  <div class="news-list-container">
    <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
    </div>

    <div v-else class="news-grid">
        <a v-for="item in news" :key="item._id" :href="`/article?id=${item._id}`" class="news-card">
            <div class="card-image" :style="{ backgroundImage: `url(${item.image})` }"></div>
            <div class="card-content">
                <span class="date">{{ formatDate(item.date) }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.excerpt }}</p>
                <span class="read-more">Read Article →</span>
            </div>
        </a>
    </div>
  </div>
</template>

<style scoped>
.news-list-container {
    padding: 2rem 0;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.news-card {
    display: block;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid transparent;
}

.news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    border-color: var(--vp-c-brand);
}

.card-image {
    height: 200px;
    background-size: cover;
    background-position: center;
}

.card-content {
    padding: 1.5rem;
}

.date {
    font-size: 0.8rem;
    color: var(--vp-c-text-2);
    display: block;
    margin-bottom: 0.5rem;
}

h3 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    color: var(--vp-c-text-1);
    line-height: 1.4;
}

p {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--vp-c-text-2);
    line-height: 1.6;
}

.read-more {
    font-size: 0.9rem;
    color: var(--vp-c-brand);
    font-weight: 500;
}

/* Spinner */
.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--vp-c-bg-soft);
    border-top: 3px solid var(--vp-c-brand);
    border-radius: 50%;
    margin: 2rem auto;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
