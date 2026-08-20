import { defineConfig } from 'vitepress'
import { execSync } from 'child_process'

// Get git version
let version = '<no version>'
try {
    version = '0.' + execSync('git rev-parse --short HEAD').toString().trim()
} catch (e) {
    // keeping default
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Library | Fluxive Inc.",
    description: "The Official Knowledge Hub of Fluxive",
    base: '/',
    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        // Add Inter and Exo 2 fonts
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
        ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Exo+2:wght@400;500;600;700&family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap', rel: 'stylesheet' }],
        // Google Tag Manager
        ['script', {}, `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GT-TWD2JXLJ');`],
        // mForce Launchpad
        ['script', { type: 'module', src: 'https://fluxive-launchpad.web.app/launchpad.js' }],
    ],
    themeConfig: {
        version,
        // https://vitepress.dev/reference/default-theme-config
        logo: undefined, // Disabled to prevent double rendering with custom slot
        siteTitle: false, // Disabled to use custom slot title

        nav: [
            { text: 'overview', link: '/' },
            { text: 'core', link: '/core/guide/getting-started' },
            { text: 'reference', link: '/reference/platform/overview' },
            { text: 'templates', link: '/templates/mforce-edges/overview' },
            { text: 'research', link: '/research/influence-design/index' },
            { text: 'academy', link: '/academy/overview' },
            { text: 'news', link: '/news' },
        ],

        sidebar: {
            '/academy/': [
                {
                    text: 'The Academy',
                    items: [
                        { text: 'Overview', link: '/academy/overview' },
                        {
                            text: 'Influence Architecture',
                            collapsed: true,
                            items: [
                                { text: 'Overview', link: '/academy/influence/overview' },
                                { text: 'The Machineforce', link: '/academy/influence/machineforce' },
                                { text: 'Leadership', link: '/academy/influence/leadership' }
                            ]
                        },
                        {
                            text: 'Corporate',
                            collapsed: true,
                            items: [
                                { text: 'Overview', link: '/academy/corporate/overview' }
                            ]
                        }
                    ]
                }
            ],
            '/research/': [
                {
                    text: 'Research Literature',
                    items: [
                        {
                            text: 'Influence Design',
                            collapsed: false,
                            items: [
                                { text: 'Core Philosophy', link: '/research/influence-design/index' },
                                { text: 'Frameworks', link: '/research/influence-design/frameworks' },
                                { text: 'Archetypes', link: '/research/influence-design/archetypes' },
                                { text: 'Methodologies', link: '/research/influence-design/methodologies' },
                                { text: 'Culture', link: '/research/influence-design/culture' },
                                { text: 'Ethics', link: '/research/influence-design/ethics' },
                            ]
                        }
                    ]
                }
            ],
            '/core/': [
                {
                    text: 'Core Documentation',
                    items: [
                        { text: 'Getting Started', link: '/core/guide/getting-started' },
                        { text: 'Architecture', link: '/core/guide/architecture' }
                    ]
                }
            ],
            '/reference/': [
                {
                    text: 'Platform Reference',
                    items: [
                        { text: 'Overview', link: '/reference/platform/overview' },
                        { text: 'Command & Control', link: '/reference/platform/command-control' },
                        { text: 'API Reference', link: '/reference/platform/api-reference' }
                    ]
                },
                {
                    text: 'Persistence',
                    items: [
                        { text: 'Overview', link: '/reference/persistence/overview' },
                        { text: 'Data Models', link: '/reference/persistence/data-models' },
                        { text: 'Integrations', link: '/reference/persistence/integrations' }
                    ]
                }
            ],
            '/templates/': [
                {
                    text: 'Templates & Modules',
                    items: [
                        { text: 'Edge Modules', link: '/templates/mforce-edges/overview' },
                        { text: 'Trackback App', link: '/templates/mforce-edges/modules/trackback-app' },
                        { text: 'Developer Guide', link: '/templates/mforce-edges/developer-guide' }
                    ]
                }
            ],
            '/studio/': [
                {
                    text: 'Studio',
                    items: [
                        { text: 'Overview', link: '/studio/overview' },
                        { text: 'Visual Editor', link: '/studio/visual-editor' },
                        { text: 'Components', link: '/studio/components' }
                    ]
                }
            ]
        },

        footer: {
            copyright: 'Copyright © 2026 Fluxive'
        },

        search: {
            provider: 'local'
        }
    },
    appearance: 'dark', // Force dark mode or default to it
    vue: {
        template: {
            compilerOptions: {
                isCustomElement: (tag) => tag.includes('mforce-')
            }
        }
    }
})
