---
title: Fluxive Library - Perimeter
---

<script setup>
import { useAuth } from './.vitepress/theme/composables/useAuth'
import Perimeter from './.vitepress/theme/components/Perimeter.vue'

const { isAuthenticated } = useAuth()
</script>

<Perimeter :isAuthenticated="isAuthenticated" />

<style>
/* Remove default VitePress page padding for this custom landing */
.VPDoc {
    padding: 0 !important;
}
.vp-doc {
    max-width: none !important;
}
</style>
