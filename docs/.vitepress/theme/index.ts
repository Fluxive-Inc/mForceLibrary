import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { useData } from 'vitepress'
import { useAuth } from './composables/useAuth'
import VersionBadge from './components/VersionBadge.vue'
import LoginForm from './components/LoginForm.vue'
import HeaderConsole from './components/HeaderConsole.vue'
import NeuralCurator from './components/NeuralCurator.vue'
import ArticleView from './components/ArticleView.vue'
import NewsList from './components/NewsList.vue'
import FxBreadcrumb from './components/FxBreadcrumb.vue'
import SolarToggle from './components/SolarToggle.vue'
import StandardTicker from './components/StandardTicker.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    Layout() {
        const { frontmatter, page } = useData()
        const { isAuthenticated } = useAuth()

        // Hide UI for perimeter or home pages IF NOT AUTHENTICATED
        const isLanding = page.value.relativePath === 'index.md' && !isAuthenticated.value

        return h(DefaultTheme.Layout, {
            class: [
                isLanding ? 'is-landing' : '',
                isAuthenticated.value ? 'is-authenticated' : 'is-guest'
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
                h('script', { dangerouslySetInnerHTML: { __html: 'window.FLUXIVE_BRIDGE_API = window.location.origin;' } }),
                h('mforce-launchpad', { 'home-url': '/' }),
                h(SolarToggle),
                h(StandardTicker, { isAuthenticated: isAuthenticated.value, isLanding: isLanding }),
                (frontmatter.value.secured && !isAuthenticated.value)
                    ? h('div', { class: 'auth-overlay' }, [h(LoginForm)])
                    : null
            ]
        })
    },
    enhanceApp({ app }: { app: any }) {
        app.component('LoginForm', LoginForm)
        app.component('ArticleView', ArticleView)
        app.component('NewsList', NewsList)
        app.component('NeuralCurator', NeuralCurator)
        app.component('FxBreadcrumb', FxBreadcrumb)

        if (typeof window !== 'undefined') {
            if (!document.querySelector('script[src*="fluxive-launchpad.js"]')) {
                const script = document.createElement('script')
                script.src = 'https://machineforce.fluxive.ai/launch.js'
                script.type = 'module'
                script.setAttribute('integrity', 'sha384-v8SHlFoCQOoVCp3GcoEcmsccbpGDZasgK3BzictJ6N/xAHctahSVMmNBgUk2Eqy2')
                script.setAttribute('crossorigin', 'anonymous')
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
