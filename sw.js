/**
 * Service Worker for BrowserMind
 * Provides caching, offline support, and performance optimizations
 */

const CACHE_NAME = 'browsermind-v1.3.0';
const RUNTIME_CACHE = 'browsermind-runtime';
const MODELS_CACHE = 'browsermind-models';
const API_CACHE = 'browsermind-api';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/css/base.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/lazy-loader.js',
    '/images/icons/favicon.svg',
    '/images/icons/app-icon-192.svg'
];

// Resources to cache on first request
const RUNTIME_RESOURCES = [
    '/css/sidebar.css',
    '/css/chat.css',
    '/css/components.css',
    '/css/right-sidebar.css',
    '/css/models.css',
    '/css/content.css',
    '/js/ui-components.js',
    '/js/chat-manager.js',
    '/js/sidebar-manager.js',
    '/js/webllm-engine.js'
];

// External resources to cache with different strategies
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2',
    'https://fonts.gstatic.com/s/',
    'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js',
    'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/'
];

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Cache critical resources
                console.log('📦 Service Worker: Caching critical resources...');
                await cache.addAll(CRITICAL_RESOURCES);
                
                console.log('✅ Service Worker: Critical resources cached');
                
                // Skip waiting to activate immediately
                self.skipWaiting();
                
            } catch (error) {
                console.error('❌ Service Worker: Install failed:', error);
            }
        })()
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        (async () => {
            try {
                // Clean up old caches
                const cacheNames = await caches.keys();
                const validCaches = [CACHE_NAME, RUNTIME_CACHE, MODELS_CACHE, API_CACHE];
                const deletionPromises = cacheNames
                    .filter(name => !validCaches.includes(name))
                    .map(name => {
                        console.log('🗑️ Service Worker: Deleting old cache:', name);
                        return caches.delete(name);
                    });
                
                await Promise.all(deletionPromises);
                
                // Take control of all clients
                await self.clients.claim();
                
                console.log('✅ Service Worker: Activated and ready');
                
            } catch (error) {
                console.error('❌ Service Worker: Activation failed:', error);
            }
        })()
    );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests and chrome-extension URLs
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

/**
 * Handle fetch requests with appropriate caching strategy
 */
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache first for app shell resources
        if (isAppShellResource(url)) {
            return await cacheFirst(request, CACHE_NAME);
        }
        
        // Strategy 2: Runtime cache for app resources
        if (isRuntimeResource(url)) {
            return await staleWhileRevalidate(request, RUNTIME_CACHE);
        }
        
        // Strategy 3: Network first for external APIs
        if (isExternalAPI(url)) {
            return await networkFirst(request, RUNTIME_CACHE);
        }
        
        // Strategy 4: Cache first for fonts and static external resources
        if (isStaticExternalResource(url)) {
            return await cacheFirst(request, RUNTIME_CACHE, { maxAge: 86400000 }); // 24 hours
        }
        
        // Strategy 5: Special handling for WebLLM models
        if (isWebLLMResource(url)) {
            return await handleWebLLMResource(request);
        }
        
        // Strategy 6: Cache first for API responses with TTL
        if (isAPIResource(url)) {
            return await cacheFirstWithTTL(request, API_CACHE, { maxAge: 300000 }); // 5 minutes
        }
        
        // Default: Network first with fallback
        return await networkFirst(request, RUNTIME_CACHE);
        
    } catch (error) {
        console.warn('⚠️ Service Worker: Fetch failed for:', request.url, error);
        
        // Return offline fallback if available
        return await getOfflineFallback(request);
    }
}

/**
 * Cache first strategy - good for app shell
 */
async function cacheFirst(request, cacheName, options = {}) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cache is still fresh
        if (options.maxAge) {
            const cachedDate = cachedResponse.headers.get('sw-cached-date');
            if (cachedDate && Date.now() - parseInt(cachedDate) > options.maxAge) {
                // Cache is stale, fetch new version
                return await updateCache(request, cache);
            }
        }
        return cachedResponse;
    }
    
    return await updateCache(request, cache);
}

/**
 * Network first strategy - good for API calls
 */
async function networkFirst(request, cacheName, timeout = 3000) {
    const cache = await caches.open(cacheName);
    
    try {
        // Try network first with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const networkResponse = await fetch(request, { 
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (networkResponse.ok) {
            // Cache successful response
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
        }
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Stale while revalidate strategy - good for frequently updated resources
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always fetch in background to update cache
    const fetchPromise = fetch(request)
        .then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(error => {
            console.warn('⚠️ Background fetch failed:', request.url, error);
        });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Wait for network if no cache
    return await fetchPromise;
}

/**
 * Network only strategy - for resources that shouldn't be cached
 */
async function networkOnly(request) {
    return await fetch(request);
}

/**
 * Update cache with new response
 */
async function updateCache(request, cache) {
    const response = await fetch(request);
    
    if (response.ok) {
        const responseClone = response.clone();
        
        // Add timestamp for cache invalidation
        const headers = new Headers(responseClone.headers);
        headers.set('sw-cached-date', Date.now().toString());
        
        const modifiedResponse = new Response(responseClone.body, {
            status: responseClone.status,
            statusText: responseClone.statusText,
            headers: headers
        });
        
        await cache.put(request, modifiedResponse);
    }
    
    return response;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // For HTML requests, return cached index.html
    if (request.headers.get('Accept')?.includes('text/html')) {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) {
            return cachedIndex;
        }
    }
    
    // For other requests, return a generic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'This resource is not available offline',
            url: url.href
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

/**
 * Resource type detection functions
 */
function isAppShellResource(url) {
    return url.origin === self.location.origin && 
           (url.pathname === '/' || 
            url.pathname === '/index.html' ||
            url.pathname.startsWith('/css/base.css') ||
            url.pathname.startsWith('/css/responsive.css') ||
            url.pathname.startsWith('/js/app.js') ||
            url.pathname.startsWith('/images/icons/'));
}

function isRuntimeResource(url) {
    return url.origin === self.location.origin && 
           (url.pathname.startsWith('/css/') ||
            url.pathname.startsWith('/js/') ||
            url.pathname.startsWith('/images/')) &&
           !isAppShellResource(url);
}

function isExternalAPI(url) {
    return url.origin !== self.location.origin &&
           (url.pathname.includes('/api/') ||
            url.hostname.includes('accounts.google.com') ||
            url.hostname.includes('analytics'));
}

function isStaticExternalResource(url) {
    return url.origin !== self.location.origin &&
           (url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com') ||
            url.hostname.includes('cdn.jsdelivr.net'));
}

function isWebLLMResource(url) {
    return url.pathname.includes('.wasm') ||
           url.pathname.includes('.bin') ||
           url.pathname.includes('mlc-chat') ||
           url.searchParams.has('cache-control');
}

function isAPIResource(url) {
    return url.pathname.includes('/api/') ||
           url.pathname.includes('.json') && !url.pathname.includes('manifest.json') ||
           url.searchParams.has('api');
}

/**
 * Advanced caching strategies
 */

/**
 * Handle WebLLM resources with special caching
 */
async function handleWebLLMResource(request) {
    const url = new URL(request.url);
    const cache = await caches.open(MODELS_CACHE);
    
    // For large model files, check if already cached
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // For new requests, try network but don't fail hard
    try {
        const response = await fetch(request);
        if (response.ok && response.status === 200) {
            // Only cache successful responses
            const clonedResponse = response.clone();
            await cache.put(request, clonedResponse);
        }
        return response;
    } catch (error) {
        console.warn('⚠️ WebLLM resource fetch failed:', url.href, error);
        throw error; // Let the caller handle the error
    }
}

/**
 * Cache first with TTL
 */
async function cacheFirstWithTTL(request, cacheName, options = {}) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check TTL
        const cachedDate = cachedResponse.headers.get('sw-cached-date');
        const now = Date.now();
        const maxAge = options.maxAge || 300000; // 5 minutes default
        
        if (cachedDate && (now - parseInt(cachedDate)) < maxAge) {
            return cachedResponse;
        }
    }
    
    // Cache expired or doesn't exist, fetch new
    try {
        const response = await fetch(request);
        if (response.ok) {
            const clonedResponse = response.clone();
            const headers = new Headers(clonedResponse.headers);
            headers.set('sw-cached-date', Date.now().toString());
            
            const modifiedResponse = new Response(clonedResponse.body, {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                headers: headers
            });
            
            await cache.put(request, modifiedResponse);
        }
        return response;
    } catch (error) {
        // Return stale cache if network fails
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Background sync for offline actions
 */
async function handleBackgroundSync(event) {
    if (event.tag === 'chat-sync') {
        console.log('🔄 Background sync: Syncing chat data...');
        // Sync offline chat messages
        await syncOfflineChats();
    } else if (event.tag === 'cache-update') {
        console.log('🔄 Background sync: Updating caches...');
        // Update critical resources
        await updateCriticalResources();
    }
}

/**
 * Sync offline chat messages
 */
async function syncOfflineChats() {
    try {
        // Get offline messages from IndexedDB or localStorage
        const offlineMessages = await getOfflineMessages();
        
        if (offlineMessages.length > 0) {
            // Send to server when back online
            for (const message of offlineMessages) {
                try {
                    await syncMessage(message);
                } catch (error) {
                    console.warn('Failed to sync message:', error);
                }
            }
            
            // Clear synced messages
            await clearSyncedMessages();
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * Update critical resources in background
 */
async function updateCriticalResources() {
    try {
        const cache = await caches.open(CACHE_NAME);
        
        // Update critical resources one by one
        for (const resource of CRITICAL_RESOURCES) {
            try {
                const response = await fetch(resource);
                if (response.ok) {
                    await cache.put(resource, response);
                    console.log('📦 Updated cache for:', resource);
                }
            } catch (error) {
                console.warn('Failed to update:', resource, error);
            }
        }
    } catch (error) {
        console.error('Critical resource update failed:', error);
    }
}

/**
 * Placeholder functions for offline message handling
 */
async function getOfflineMessages() {
    // In a real implementation, this would read from IndexedDB
    return [];
}

async function syncMessage(message) {
    // In a real implementation, this would send to server
    console.log('Syncing message:', message);
}

async function clearSyncedMessages() {
    // In a real implementation, this would clear from IndexedDB
    console.log('Cleared synced messages');
}

/**
 * Intelligent cache pruning
 */
async function pruneOldCaches() {
    try {
        const caches = await window.caches.keys();
        const prunePromises = [];
        
        for (const cacheName of caches) {
            if (cacheName.includes('browsermind-v') && cacheName !== CACHE_NAME) {
                prunePromises.push(window.caches.delete(cacheName));
                console.log('🗑️ Pruned old cache:', cacheName);
            }
        }
        
        await Promise.all(prunePromises);
    } catch (error) {
        console.error('Cache pruning failed:', error);
    }
}

/**
 * Performance monitoring for caching
 */
function monitorCachePerformance(request, response, startTime) {
    const duration = Date.now() - startTime;
    const cacheHit = response.headers.get('sw-cache-hit') === 'true';
    
    // Log performance metrics
    console.log(`📊 Cache performance: ${request.url} - ${duration}ms - ${cacheHit ? 'HIT' : 'MISS'}`);
    
    // Send performance data to clients
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHE_PERFORMANCE',
                data: {
                    url: request.url,
                    duration,
                    cacheHit,
                    timestamp: Date.now()
                }
            });
        });
    });
}

/**
 * Message handling for cache management
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'CLEAR_CACHE':
            handleClearCache(payload);
            break;
            
        case 'CACHE_RESOURCE':
            handleCacheResource(payload);
            break;
            
        case 'GET_CACHE_INFO':
            handleGetCacheInfo();
            break;
            
        case 'PRUNE_CACHES':
            handlePruneCaches();
            break;
            
        case 'PRELOAD_RESOURCE':
            handlePreloadResource(payload);
            break;
    }
});

/**
 * Clear specific cache or all caches
 */
async function handleClearCache(payload) {
    try {
        if (payload?.cacheName) {
            await caches.delete(payload.cacheName);
            console.log('🗑️ Service Worker: Cleared cache:', payload.cacheName);
        } else {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('🗑️ Service Worker: Cleared all caches');
        }
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHE_CLEARED',
                success: true
            });
        });
        
    } catch (error) {
        console.error('❌ Service Worker: Cache clear failed:', error);
    }
}

/**
 * Cache specific resource
 */
async function handleCacheResource(payload) {
    try {
        const { url, cacheName = RUNTIME_CACHE } = payload;
        const cache = await caches.open(cacheName);
        await cache.add(url);
        
        console.log('📦 Service Worker: Cached resource:', url);
        
    } catch (error) {
        console.error('❌ Service Worker: Cache resource failed:', error);
    }
}

/**
 * Get cache information
 */
async function handleGetCacheInfo() {
    try {
        const cacheNames = await caches.keys();
        const cacheInfo = {};
        
        for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            cacheInfo[name] = {
                size: keys.length,
                resources: keys.map(req => req.url)
            };
        }
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHE_INFO',
                data: cacheInfo
            });
        });
        
    } catch (error) {
        console.error('❌ Service Worker: Get cache info failed:', error);
    }
}

/**
 * Handle cache pruning
 */
async function handlePruneCaches() {
    try {
        await pruneOldCaches();
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHES_PRUNED',
                success: true
            });
        });
        
    } catch (error) {
        console.error('❌ Service Worker: Cache pruning failed:', error);
    }
}

/**
 * Handle resource preloading
 */
async function handlePreloadResource(payload) {
    try {
        const { url, cacheName = RUNTIME_CACHE, priority = 'normal' } = payload;
        const cache = await caches.open(cacheName);
        
        // Preload with appropriate priority
        const response = await fetch(url, {
            priority: priority === 'high' ? 'high' : 'low'
        });
        
        if (response.ok) {
            await cache.put(url, response);
            console.log('📦 Service Worker: Preloaded resource:', url);
        }
        
    } catch (error) {
        console.error('❌ Service Worker: Resource preload failed:', error);
    }
}

/**
 * Background sync event listener
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered:', event.tag);
    event.waitUntil(handleBackgroundSync(event));
});

/**
 * Periodic background sync for cache updates
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-update') {
        console.log('🔄 Service Worker: Periodic sync - updating caches');
        event.waitUntil(updateCriticalResources());
    }
});

/**
 * Push notification handling (placeholder for future implementation)
 */
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Push notification received');
    
    if (event.data) {
        const data = event.data.json();
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'BrowserMind', {
                body: data.body || 'You have a new notification',
                icon: '/images/icons/app-icon-192.svg',
                badge: '/images/icons/app-icon-192.svg',
                tag: 'browsermind-notification',
                requireInteraction: false,
                actions: [
                    {
                        action: 'open',
                        title: 'Open App'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ]
            })
        );
    }
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if no existing window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});