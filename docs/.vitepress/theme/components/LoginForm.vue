<script setup>
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()

const handleLogin = () => {
    // For demo purposes, we treat clicking the button as a successful auth trigger
    // In a real scenario, this might open a modal or redirect to OAuth
    login()
    
    // Optional: Reload or redirect if needed, but the reactive state should handle the UI switch
    // window.location.reload() 
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Admin Access</h1>
      <p class="login-subtitle">Sign in via Fluxive Toolbar</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Kept for visual consistency, but fields might not be needed if toolbar handles everything. 
             However, usually "Connect login" implies using the button to trigger the global auth flow.
             I will remove input fields to avoid confusion if the toolbar handles the UI. -->
        
        <div class="info-message">
            Please use the button below to launch the secure login via the Fluxive Toolbar.
        </div>

        <button type="submit" class="login-button">
          Open Login
        </button>
      </form>
      
      <div class="db-notice">
        <code class="text-xs text-gray-500">Authentication Service: Fluxive Toolbar</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
}

.login-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 2.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(120deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.info-message {
    text-align: center;
    color: var(--vp-c-text-1);
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: white;
  font-weight: 600;
  transition: opacity 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover {
  opacity: 0.9;
}

.error-message {
  color: var(--vp-c-danger-1);
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
}

.db-notice {
  margin-top: 2rem;
  text-align: center;
  opacity: 0.7;
}
</style>
