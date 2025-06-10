/**
 * Lazy Loading Utility for BrowserMind
 * Provides adaptive loading based on device capabilities and network conditions
 */

export class LazyLoader {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        this.deviceMemory = navigator.deviceMemory || 4;
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        
        this.strategy = this.determineLoadingStrategy();
        console.log(`🚀 LazyLoader initialized with strategy: ${this.strategy}`);
    }

    /**
     * Determine loading strategy based on device capabilities
     */
    determineLoadingStrategy() {
        const effectiveType = this.connection?.effectiveType || 'unknown';
        const downlink = this.connection?.downlink || 10;
        const saveData = this.connection?.saveData || false;

        // Conservative loading for low-end devices or slow connections
        if (saveData || this.deviceMemory < 2 || effectiveType === '2g' || downlink < 1) {
            return 'minimal';
        }

        // Standard loading for average devices
        if (this.deviceMemory < 4 || effectiveType === '3g' || downlink < 5) {
            return 'standard';
        }

        // Full loading for high-end devices
        return 'full';
    }

    /**
     * Lazy load a JavaScript module
     */
    async loadModule(modulePath, options = {}) {
        if (this.loadedModules.has(modulePath)) {
            return this.loadedModules.get(modulePath);
        }

        if (this.loadingPromises.has(modulePath)) {
            return this.loadingPromises.get(modulePath);
        }

        const loadingPromise = this.performModuleLoad(modulePath, options);
        this.loadingPromises.set(modulePath, loadingPromise);

        try {
            const module = await loadingPromise;
            this.loadedModules.set(modulePath, module);
            this.loadingPromises.delete(modulePath);
            return module;
        } catch (error) {
            this.loadingPromises.delete(modulePath);
            console.error(`Failed to load module: ${modulePath}`, error);
            throw error;
        }
    }

    /**
     * Perform actual module loading with timeout and retry logic
     */
    async performModuleLoad(modulePath, options) {
        const { timeout = 10000, retries = 2 } = options;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const module = await Promise.race([
                    import(modulePath),
                    new Promise((_, reject) => {
                        controller.signal.addEventListener('abort', () => {
                            reject(new Error(`Module load timeout: ${modulePath}`));
                        });
                    })
                ]);

                clearTimeout(timeoutId);
                console.log(`✅ Module loaded: ${modulePath} (attempt ${attempt + 1})`);
                return module;

            } catch (error) {
                console.warn(`⚠️ Module load attempt ${attempt + 1} failed: ${modulePath}`, error);
                
                if (attempt === retries) {
                    throw error;
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    /**
     * Lazy load external scripts (non-module)
     */
    async loadScript(src, options = {}) {
        if (this.loadedModules.has(src)) {
            return Promise.resolve();
        }

        const { async = true, defer = false, timeout = 10000 } = options;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.defer = defer;

            const timeoutId = setTimeout(() => {
                script.remove();
                reject(new Error(`Script load timeout: ${src}`));
            }, timeout);

            script.onload = () => {
                clearTimeout(timeoutId);
                this.loadedModules.set(src, true);
                console.log(`✅ Script loaded: ${src}`);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeoutId);
                script.remove();
                reject(new Error(`Script load error: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Lazy load CSS with media queries for responsive loading
     */
    async loadCSS(href, media = 'all') {
        if (this.loadedModules.has(href)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = media;

            link.onload = () => {
                this.loadedModules.set(href, true);
                console.log(`✅ CSS loaded: ${href}`);
                resolve();
            };

            link.onerror = () => {
                link.remove();
                reject(new Error(`CSS load error: ${href}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Preload resources based on strategy
     */
    async preloadCriticalResources() {
        const criticalResources = this.getCriticalResources();
        
        const preloadPromises = criticalResources.map(async (resource) => {
            try {
                if (resource.type === 'module') {
                    await this.loadModule(resource.src, resource.options);
                } else if (resource.type === 'script') {
                    await this.loadScript(resource.src, resource.options);
                } else if (resource.type === 'css') {
                    await this.loadCSS(resource.src, resource.media);
                }
            } catch (error) {
                console.warn(`Failed to preload resource: ${resource.src}`, error);
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log('🎯 Critical resources preloaded');
    }

    /**
     * Get critical resources based on loading strategy
     */
    getCriticalResources() {
        const baseResources = [
            { type: 'module', src: './ui-components.js', options: { timeout: 5000 } },
            { type: 'module', src: './sidebar-manager.js', options: { timeout: 5000 } }
        ];

        if (this.strategy === 'minimal') {
            return baseResources;
        }

        const standardResources = [
            ...baseResources,
            { type: 'module', src: './chat-manager.js', options: { timeout: 8000 } }
        ];

        if (this.strategy === 'standard') {
            return standardResources;
        }

        // Full strategy
        return [
            ...standardResources,
            { type: 'script', src: 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js', options: { timeout: 10000 } }
        ];
    }

    /**
     * Load non-critical resources on idle
     */
    loadNonCriticalResources() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.loadSecondaryResources(), { timeout: 5000 });
        } else {
            setTimeout(() => this.loadSecondaryResources(), 2000);
        }
    }

    /**
     * Load secondary resources based on strategy
     */
    async loadSecondaryResources() {
        const secondaryResources = this.getSecondaryResources();
        
        for (const resource of secondaryResources) {
            try {
                if (resource.type === 'script') {
                    await this.loadScript(resource.src, resource.options);
                }
            } catch (error) {
                console.warn(`Failed to load secondary resource: ${resource.src}`, error);
            }
        }
    }

    /**
     * Get secondary resources that can be loaded later
     */
    getSecondaryResources() {
        const resources = [];

        if (this.strategy !== 'minimal') {
            resources.push({
                type: 'script',
                src: 'https://accounts.google.com/gsi/client',
                options: { async: true, defer: true, timeout: 15000 }
            });
        }

        if (this.strategy === 'full') {
            resources.push({
                type: 'script',
                src: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.esm.min.mjs',
                options: { async: true, timeout: 15000 }
            });
        }

        return resources;
    }

    /**
     * Get loading strategy information
     */
    getStrategyInfo() {
        return {
            strategy: this.strategy,
            deviceMemory: this.deviceMemory,
            connection: {
                effectiveType: this.connection?.effectiveType || 'unknown',
                downlink: this.connection?.downlink || 'unknown',
                saveData: this.connection?.saveData || false
            }
        };
    }
}

// Export singleton instance
export const lazyLoader = new LazyLoader();