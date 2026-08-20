import { ref } from 'vue'

const isAuthenticated = ref(false)

// Init from storage if client-side
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('fx_auth_token')
    if (stored) {
        isAuthenticated.value = true
    }
}

export function useAuth() {

    const login = () => {
        // Mock login - in reality this would validate credentials
        isAuthenticated.value = true
        if (typeof window !== 'undefined') {
            localStorage.setItem('fx_auth_token', 'mock_token_' + Date.now())
        }
    }

    const logout = () => {
        isAuthenticated.value = false
        if (typeof window !== 'undefined') {
            localStorage.removeItem('fx_auth_token')
        }
        window.location.reload()
    }

    return {
        isAuthenticated,
        login,
        logout
    }
}
