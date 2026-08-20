---
title: Fluxive Library - Perimeter
---

<script setup>
import { useAuth } from './.vitepress/theme/composables/useAuth'
import Perimeter from './.vitepress/theme/components/Perimeter.vue'
import LibraryHome from './.vitepress/theme/components/LibraryHome.vue'

const { isAuthenticated } = useAuth()
</script>

<div v-if="!isAuthenticated">
    <Perimeter :isAuthenticated="isAuthenticated" />
</div>
<div v-else>
    <LibraryHome />
</div>

<style>
/* Remove default VitePress page padding for this custom landing */
.is-landing .VPDoc {
    padding: 0 !important;
}
.is-landing .vp-doc {
    max-width: none !important;
}
</style>
