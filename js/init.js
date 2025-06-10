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
            this.showErrorMessage(error.message);
        }
    }

    async verifyDependencies() {
        const required = ['appConfig', 'authManager', 'BrowserUtils'];
        const missing = required.filter(dep => typeof window[dep] === 'undefined');
        
        if (missing.length > 0) {
            throw new Error(`Missing dependencies: ${missing.join(', ')}`);
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
        const { default: App } = await import('./app.js');
        window.app = new App();
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
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