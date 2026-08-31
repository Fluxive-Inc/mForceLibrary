/**
 * FLUXIVE NETWORK PROXY (Service Worker)
 * The Invisible Authentication Layer.
 * 
 * Intercepts all API requests and injects the authorization token.
 * The application JavaScript NEVER sees the token.
 */

const TOKEN_CACHE = {
    accessToken: null,
    expiry: 0
};

// --- 1. ACTIVATION ---
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[FluxiveProxy] Installed.');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('[FluxiveProxy] Activated & Controlling.');
});

// --- 2. MESSAGE BUS (Receive Token from Hypervisor) ---
self.addEventListener('message', (event) => {
    const { type, token, user } = event.data;

    if (type === 'FLUX_AUTH_UPDATE') {
        if (token) {
            console.log('[FluxiveProxy] Token Secured.');
            TOKEN_CACHE.accessToken = token;
            // Decode clean expiration if possible, or assume 55 mins
            TOKEN_CACHE.expiry = Date.now() + (55 * 60 * 1000);
        } else {
            console.log('[FluxiveProxy] Token Purged.');
            TOKEN_CACHE.accessToken = null;
        }
    }
});

// --- 3. INTERCEPTOR (Inject Token) ---
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Only intercept API calls to our backend
    const isApiCall = requestUrl.hostname.endsWith('fluxive.ai') && requestUrl.pathname.startsWith('/api/');

    // Ignore static assets, authentication endpoints that don't need bearer, etc.
    // Also ignore the Heartbeat if it uses cookies only.

    if (isApiCall && TOKEN_CACHE.accessToken) {
        // Clone the request to modify headers
        const newRequest = new Request(event.request, {
            headers: {
                ...Object.fromEntries(event.request.headers),
                'Authorization': `Bearer ${TOKEN_CACHE.accessToken}`,
                'X-Flux-Proxy': 'Secure'
            }
        });

        console.log(`[FluxiveProxy] Injecting Auth -> ${requestUrl.pathname}`);
        event.respondWith(fetch(newRequest));
    }
});
