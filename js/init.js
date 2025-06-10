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
    
    /**
     * Check if the browser is compatible with the application
     * This is a secondary check in addition to browser-compatibility.js
     * @returns {boolean} True if compatible, false otherwise
     */
    checkBrowserCompatibility() {
        // Check if the compatibility check has already been performed by browser-compatibility.js
        if (window.browserCompatibility) {
            // If the compatibility modal is visible, browser is incompatible
            if (document.querySelector('.compatibility-modal')) {
                return false;
            }
            
            return true;
        }
        
        // Perform our own compatibility check using centralized detection
        const hasWebGPU = window.BrowserUtils ? 
            window.BrowserUtils.hasWebGPUAPI() : 
            'gpu' in navigator && !!navigator.gpu;
        
        // Check ES6+ features using centralized detection
        const hasES6 = window.BrowserUtils ? 
            window.BrowserUtils.checkES6Support() : 
            this.fallbackES6Check();
        
        // If incompatible, show error
        if (!hasWebGPU || !hasES6) {
            // Show error message
            this.showErrorMessage(
                'Browser Compatibility Error: Your browser doesn\'t support the required features. ' +
                'Please use a modern browser like Chrome 113+, Edge 113+, or Safari 17+.'
            );
            
            return false;
        }
        
        return true;
    }

    /**
     * Fallback ES6 check if BrowserUtils not available
     */
    fallbackES6Check() {
        try {
            eval("() => {}");
            if (typeof Promise === 'undefined') return false;
            eval("`test`");
            return true;
        } catch (e) {
            return false;
        }
    }

    async initialize() {
        try {
            console.log('🚀 Starting BrowserMind initialization...');
            
            // Step 1: Check browser compatibility
            this.updateProgress(1, 'Checking browser compatibility...');
            if (!this.checkBrowserCompatibility()) {
                return; // Stop initialization if browser is incompatible
            }
            
            // Step 2: Verify dependencies
            this.updateProgress(2, 'Checking dependencies...');
            await this.verifyDependencies();
            
            // Step 3: Initialize authentication
            this.updateProgress(3, 'Setting up authentication...');
            await this.initializeAuth();
            
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
            color: #b91c1c;
            padding: 16px;
            border-radius: 8px;
            border: 2px solid #dc2626;
            max-width: 400px;
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
            font-weight: 500;
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