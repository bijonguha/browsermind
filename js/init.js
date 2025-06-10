/**
 * BrowserMind Initialization Manager
 * Coordinates the loading and initialization of all application modules
 */

class BrowserMindInit {
    constructor() {
        this.initializeStep = 0;
        this.totalSteps = 4;
        this.errors = [];
        this.startTime = Date.now();
    }

    async initialize() {
        try {
            console.log('🚀 Starting BrowserMind initialization...');
            
            // Step 1: Verify dependencies
            this.updateProgress(1, 'Checking dependencies...');
            await this.verifyDependencies();
            
            // Step 2: Initialize authentication
            this.updateProgress(2, 'Setting up authentication...');
            await this.initializeAuth();
            
            // Step 3: Initialize analytics
            this.updateProgress(3, 'Initializing analytics...');
            await this.initializeAnalytics();
            
            // Step 4: Start main application
            this.updateProgress(4, 'Starting application...');
            await this.startApplication();
            
            const loadTime = Date.now() - this.startTime;
            console.log(`✅ BrowserMind initialized successfully in ${loadTime}ms`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            console.error('Debug info:', {
                appConfig: typeof window.appConfig,
                authManager: typeof window.authManager,
                BrowserUtils: typeof window.BrowserUtils,
                seoAnalytics: typeof window.seoAnalytics
            });
            this.showErrorMessage(error.message);
        }
    }

    async verifyDependencies() {
        // Wait for critical dependencies to load with timeout
        const critical = ['appConfig', 'BrowserUtils'];
        const optional = ['authManager', 'seoAnalytics'];
        const maxWait = 5000; // 5 seconds
        const checkInterval = 100; // 100ms
        let waited = 0;
        
        while (waited < maxWait) {
            const missingCritical = critical.filter(dep => typeof window[dep] === 'undefined');
            
            if (missingCritical.length === 0) {
                // Critical dependencies loaded, check optional ones
                const missingOptional = optional.filter(dep => typeof window[dep] === 'undefined');
                if (missingOptional.length > 0) {
                    console.warn('Optional dependencies not loaded:', missingOptional);
                }
                return; // Continue with initialization
            }
            
            // Wait a bit more
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        // Final check for critical dependencies
        const missingCritical = critical.filter(dep => typeof window[dep] === 'undefined');
        if (missingCritical.length > 0) {
            throw new Error(`Missing critical dependencies after ${maxWait}ms: ${missingCritical.join(', ')}`);
        }
    }

    async initializeAuth() {
        if (window.authManager && typeof window.authManager.initialize === 'function') {
            await window.authManager.initialize();
        }
    }

    async initializeAnalytics() {
        if (window.seoAnalytics && typeof window.seoAnalytics.initialize === 'function') {
            window.seoAnalytics.initialize();
        }
    }

    async startApplication() {
        // Wait for DOM to be ready if not already
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
        
        // Import and start the main application
        const { default: BrowserMindApp } = await import('./app.js');
        window.app = new BrowserMindApp();
    }

    updateProgress(step, message) {
        this.initializeStep = step;
        console.log(`[${step}/${this.totalSteps}] ${message}`);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            max-width: 400px;
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        errorDiv.innerHTML = `
            <strong>Initialization Error</strong><br>
            ${message}<br>
            <small>Please refresh the page to try again.</small>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }
}

// Initialize when DOM is ready with a small delay to ensure all scripts load
document.addEventListener('DOMContentLoaded', async () => {
    // Small delay to ensure all scripts are executed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.browserMindInit = new BrowserMindInit();
    await window.browserMindInit.initialize();
});

// Debug helper
window.getBrowserMindStatus = () => {
    return {
        initialized: window.app ? true : false,
        authReady: window.authManager ? window.authManager.isInitialized : false,
        configLoaded: window.appConfig ? true : false,
        analyticsReady: window.seoAnalytics ? true : false
    };
};

console.log('🔧 Initialization manager loaded');