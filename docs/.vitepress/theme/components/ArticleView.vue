<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { useWixClient } from '../composables/wixClient'

const { fetchNewsItem } = useWixClient()
const article = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (id) {
            try {
                article.value = await fetchNewsItem(id)
                if (!article.value) {
                    error.value = "Article not found."
                }
            } catch (e) {
                error.value = "Error loading article."
            } finally {
                loading.value = false
            }
        } else {
            error.value = "No article ID provided."
            loading.value = false
        }
    }
})

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>

<template>
  <div class="article-container">
    <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading article...</p>
    </div>

    <div v-else-if="error" class="error-state">
        <h3>{{ error }}</h3>
        <a href="/news" class="back-link">← Back to News</a>
    </div>

    <article v-else class="article-content">
        <a href="/news" class="back-link">← Back to News</a>
        
        <header class="article-header">
            <div class="meta">
                <span class="date">{{ formatDate(article.date) }}</span>
                <span class="author">By {{ article.author }}</span>
            </div>
            <h1>{{ article.title }}</h1>
            <div class="tags">
                <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
        </header>

        <img v-if="article.image" :src="article.image" :alt="article.title" class="featured-image" />

        <div class="content" v-html="article.content"></div>
    </article>
  </div>
</template>

<style scoped>
.article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.loading-state, .error-state {
    text-align: center;
    padding: 4rem 0;
    color: var(--vp-c-text-2);
}

.back-link {
    display: inline-block;
    margin-bottom: 2rem;
    color: var(--vp-c-brand);
    text-decoration: none;
    font-weight: 500;
}

.article-header {
    margin-bottom: 2rem;
}

.article-header h1 {
    font-size: 2.5rem;
    line-height: 1.2;
    margin: 1rem 0;
    color: var(--vp-c-text-1);
}

.meta {
    display: flex;
    gap: 1rem;
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
}

.tags {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
}

.tag {
    background: var(--vp-c-bg-soft);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--vp-c-text-2);
}

.featured-image {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.content :deep(p) {
    margin-bottom: 1.2rem;
    line-height: 1.8;
}

.content :deep(h2), .content :deep(h3) {
    margin-top: 2rem;
    margin-bottom: 1rem;
}

/* Spinner */
.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--vp-c-bg-soft);
    border-top: 3px solid var(--vp-c-brand);
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
