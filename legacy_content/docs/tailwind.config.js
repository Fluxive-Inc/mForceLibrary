module.exports = {
    content: [
        './docs_test/.vitepress/**/*.{js,ts,vue}',
        './docs_test/**/*.md',
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    shell: '#000000',
                    core: '#111111',
                    glass: 'rgba(2, 2, 5, 0.6)'
                },
                brand: {
                    cyan: '#00F0FF',
                    violet: '#BD00FF',
                    indigo: '#4C00FF'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Exo 2', 'sans-serif']
            }
        },
    },
    plugins: [],
}
