import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { useData } from 'vitepress'
import { useAuth } from './composables/useAuth'
import VersionBadge from './components/VersionBadge.vue'
import LoginForm from './components/LoginForm.vue'
import HeaderConsole from './components/HeaderConsole.vue'
import HomeAnalytics from './components/HomeAnalytics.vue'
import NeuralCurator from './components/NeuralCurator.vue'
import ArticleView from './components/ArticleView.vue'
import NewsList from './components/NewsList.vue'
import FxBreadcrumb from './components/FxBreadcrumb.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    Layout() {
        const { frontmatter, page } = useData()
        const { isAuthenticated } = useAuth()

        // Hide UI for perimeter or home pages
        const isLanding = page.value.relativePath === 'index.md'

        return h(DefaultTheme.Layout, {
            class: [
                isLanding ? 'is-landing' : ''
            ]
        }, {
            'nav-bar-title-before': () => h('div', { class: 'custom-logo-link', role: 'button', onClick: () => window.location.href = 'https://fluxive.ai', 'aria-label': 'Go to Fluxive.ai' }, [
                h('div', { class: 'logo-wrapper' }, [
                    h('img', { src: '/logo.svg', class: 'logo-basic', alt: 'Fluxive' }),
                    h('img', { src: '/logo.svg', class: 'logo-hover', alt: 'Fluxive Hover' })
                ])
            ]),
            'layout-top': () => h(HeaderConsole),
            'sidebar-nav-after': () => h(VersionBadge),
            'layout-bottom': () => [
                h(HomeAnalytics),
                h('mforce-launchpad'),
                (frontmatter.value.secured && !isAuthenticated.value)
                    ? h('div', { class: 'auth-overlay' }, [h(LoginForm)])
                    : null
            ]
        })
    },
    enhanceApp({ app }) {
        app.component('LoginForm', LoginForm)
        app.component('ArticleView', ArticleView)
        app.component('NewsList', NewsList)
        app.component('HomeAnalytics', HomeAnalytics)
        app.component('NeuralCurator', NeuralCurator)
        app.component('FxBreadcrumb', FxBreadcrumb)

        if (typeof window !== 'undefined') {
            if (!document.querySelector('script[src*="mForceLaunchpad.js"]')) {
                const script = document.createElement('script')
                script.src = 'https://fluxive-launchpad.web.app/com/mForceLaunchpad.js'
                script.type = 'module'
                document.head.appendChild(script)
            }

            window.addEventListener('mforce-auth-changed', (event: any) => {
                const { user } = event.detail
                console.log('mForce Auth Sync:', user ? user.uid : 'Guest')
                // Sync to local mock auth for now
                if (user) {
                    localStorage.setItem('fx_auth_token', 'mforce_' + user.uid)
                } else {
                    localStorage.removeItem('fx_auth_token')
                }
            })
        }
    }
}
