/**
 * BrowserMind Compatibility Checker
 * Verifies browser compatibility before loading the application
 * Checks for WebGPU support and ES6+ compatibility
 */

class BrowserCompatibility {
    constructor() {
        // Run compatibility check immediately
        this.initializeCompatibilityCheck();
    }
    
    /**
     * Initialize compatibility check asynchronously
     */
    async initializeCompatibilityCheck() {
        try {
            await this.checkCompatibility();
        } catch (error) {
            console.error('Compatibility check failed:', error);
            // Fall back to basic check
            this.basicCompatibilityCheck();
        }
    }
    
    /**
     * Basic synchronous compatibility check fallback
     */
    basicCompatibilityCheck() {
        const hasWebGPU = 'gpu' in navigator && !!navigator.gpu;
        const hasES6 = window.BrowserUtils ? 
            window.BrowserUtils.checkES6Support() : 
            this.fallbackES6Check();
        
        if (!hasWebGPU || !hasES6) {
            this.showIncompatibilityModal(hasWebGPU, hasES6, null);
        }
    }
    
    /**
     * Check browser compatibility for critical features
     * @returns {boolean} True if browser is compatible, false otherwise
     */
    async checkCompatibility() {
        // Check ES6+ features first (synchronous)
        const hasES6 = this.checkES6Support();
        
        // Basic WebGPU API check (synchronous)
        const hasWebGPUAPI = window.BrowserUtils ? 
            window.BrowserUtils.hasWebGPUAPI() : 
            'gpu' in navigator && !!navigator.gpu;
        
        // If basic checks fail, show modal immediately
        if (!hasWebGPUAPI || !hasES6) {
            this.showIncompatibilityModal(hasWebGPUAPI, hasES6, null);
            return false;
        }
        
        // Enhanced WebGPU functional check (asynchronous)
        let webGPUResult = null;
        if (window.BrowserUtils && window.BrowserUtils.checkWebGPUSupport) {
            try {
                webGPUResult = await window.BrowserUtils.checkWebGPUSupport();
                if (!webGPUResult.supported) {
                    this.showIncompatibilityModal(false, hasES6, webGPUResult);
                    return false;
                }
            } catch (error) {
                console.warn('Enhanced WebGPU check failed:', error);
                // Fall back to basic check result
            }
        }
        
        return true;
    }
    
    /**
     * Check for essential ES6+ features using centralized detection
     * @returns {boolean} True if ES6+ is supported, false otherwise
     */
    checkES6Support() {
        return window.BrowserUtils ? 
            window.BrowserUtils.checkES6Support() : 
            this.fallbackES6Check();
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
    
    /**
     * Show incompatibility modal with helpful information
     * @param {boolean} hasWebGPU Whether WebGPU is supported
     * @param {boolean} hasES6 Whether ES6+ features are supported
     * @param {Object} webGPUResult Detailed WebGPU test results
     */
    showIncompatibilityModal(hasWebGPU, hasES6, webGPUResult) {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'compatibility-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'compatibility-modal-content';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'compatibility-modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Browser Compatibility Issue';
        header.appendChild(title);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'compatibility-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Close';
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
        header.appendChild(closeButton);
        
        // Create body
        const body = document.createElement('div');
        body.className = 'compatibility-modal-body';
        
        // Create message based on what's missing
        const message = document.createElement('p');
        if (!hasWebGPU && !hasES6) {
            message.innerHTML = 'Your browser doesn\'t support the required features to run BrowserMind. ' +
                'This application requires <strong>WebGPU</strong> and modern JavaScript features.';
        } else if (!hasWebGPU) {
            let webGPUMessage = 'Your browser doesn\'t support <strong>WebGPU</strong>, which is required to run the AI models in BrowserMind.';
            
            if (webGPUResult) {
                switch (webGPUResult.stage) {
                    case 'api_missing':
                        webGPUMessage += '<br><small>⚠️ WebGPU API not available in this browser.</small>';
                        break;
                    case 'no_adapter':
                        webGPUMessage += '<br><small>⚠️ WebGPU API found but no graphics adapter available.</small>';
                        break;
                    case 'adapter_failed':
                        webGPUMessage += '<br><small>⚠️ Failed to request WebGPU adapter: ' + webGPUResult.reason + '</small>';
                        break;
                    case 'device_failed':
                        webGPUMessage += '<br><small>⚠️ WebGPU adapter found but device creation failed: ' + webGPUResult.reason + '</small>';
                        break;
                }
            }
            
            message.innerHTML = webGPUMessage;
        } else {
            message.innerHTML = 'Your browser doesn\'t support some modern JavaScript features required ' +
                'to run BrowserMind properly.';
        }
        body.appendChild(message);
        
        // Add explanation
        const explanation = document.createElement('p');
        explanation.textContent = 'BrowserMind uses cutting-edge web technologies to run AI models directly in your browser. ' +
            'Please upgrade to a compatible browser to use this application.';
        body.appendChild(explanation);
        
        // Add browser recommendations
        const recommendations = document.createElement('div');
        recommendations.className = 'browser-recommendations';
        
        const recommendationsTitle = document.createElement('h3');
        recommendationsTitle.textContent = 'Recommended Browsers:';
        recommendations.appendChild(recommendationsTitle);
        
        const browserList = document.createElement('ul');
        
        // Get dynamic browser requirements if available
        let browsers;
        if (window.BrowserUtils && window.BrowserUtils.getBrowserInfo) {
            const currentBrowser = window.BrowserUtils.getBrowserInfo();
            const meetsRequirements = window.BrowserUtils.meetsMinimumRequirements();
            
            browsers = [
                { name: 'Google Chrome', version: '113+', url: 'https://www.google.com/chrome/', current: currentBrowser.browser === 'Chrome' },
                { name: 'Microsoft Edge', version: '113+', url: 'https://www.microsoft.com/edge', current: currentBrowser.browser === 'Edge' },
                { name: 'Safari', version: '17+', url: 'https://www.apple.com/safari/', current: currentBrowser.browser === 'Safari' },
                { name: 'Firefox', version: '113+', url: 'https://www.mozilla.org/firefox/', current: currentBrowser.browser === 'Firefox' }
            ];
            
            // Add current browser info
            if (currentBrowser.browser !== 'Unknown') {
                const currentBrowserInfo = document.createElement('p');
                currentBrowserInfo.innerHTML = `<strong>Current browser:</strong> ${currentBrowser.browser} ${currentBrowser.version} ${meetsRequirements ? '✅' : '❌'}`;
                currentBrowserInfo.style.marginTop = '10px';
                body.appendChild(currentBrowserInfo);
            }
        } else {
            browsers = [
                { name: 'Google Chrome', version: '113+', url: 'https://www.google.com/chrome/' },
                { name: 'Microsoft Edge', version: '113+', url: 'https://www.microsoft.com/edge' },
                { name: 'Safari', version: '17+', url: 'https://www.apple.com/safari/' },
                { name: 'Firefox', version: '113+', url: 'https://www.mozilla.org/firefox/' }
            ];
        }
        
        browsers.forEach(browser => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = browser.url;
            link.target = '_blank';
            link.textContent = `${browser.name} (${browser.version})`;
            if (browser.current) {
                link.style.fontWeight = 'bold';
                item.style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
            }
            item.appendChild(link);
            browserList.appendChild(item);
        });
        
        recommendations.appendChild(browserList);
        body.appendChild(recommendations);
        
        // Add footer with additional info
        const footer = document.createElement('div');
        footer.className = 'compatibility-modal-footer';
        
        const footerText = document.createElement('p');
        footerText.innerHTML = 'BrowserMind requires <strong>WebGPU</strong> support to run AI models locally in your browser. ' +
            'This technology provides the performance needed for efficient AI processing while maintaining your privacy.';
        footer.appendChild(footerText);
        
        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);
        
        // Add styles inline to ensure they're applied
        const style = document.createElement('style');
        style.textContent = `
            .compatibility-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            
            .compatibility-modal-content {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .compatibility-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #eaeaea;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .compatibility-modal-header h2 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .compatibility-modal-close {
                background: none;
                border: none;
                color: #666;
                font-size: 24px;
                cursor: pointer;
                padding: 0 8px;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .compatibility-modal-close:hover {
                color: #8B5CF6;
            }
            
            .compatibility-modal-body {
                padding: 24px;
                flex: 1;
            }
            
            .compatibility-modal-body p {
                margin: 0 0 16px;
                line-height: 1.5;
                color: #444;
            }
            
            .browser-recommendations {
                margin-top: 24px;
                padding: 16px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            
            .browser-recommendations h3 {
                margin: 0 0 12px;
                font-size: 1.1rem;
                font-weight: 600;
                color: #333;
            }
            
            .browser-recommendations ul {
                margin: 0;
                padding: 0 0 0 24px;
            }
            
            .browser-recommendations li {
                margin-bottom: 8px;
            }
            
            .browser-recommendations a {
                color: #8B5CF6;
                text-decoration: none;
                font-weight: 500;
            }
            
            .browser-recommendations a:hover {
                text-decoration: underline;
            }
            
            .compatibility-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #eaeaea;
                background-color: #f8f9fa;
                border-radius: 0 0 12px 12px;
            }
            
            .compatibility-modal-footer p {
                margin: 0;
                font-size: 0.9rem;
                color: #666;
                line-height: 1.5;
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Prevent further script execution by adding an event listener that stops propagation
        document.addEventListener('DOMContentLoaded', (event) => {
            event.stopPropagation();
            event.preventDefault();
        }, true);
        
        // Log the compatibility issue
        console.error('Browser compatibility check failed:', {
            hasWebGPU,
            hasES6
        });
    }
}

// Initialize compatibility checker immediately
window.browserCompatibility = new BrowserCompatibility();

// Make sure it runs again when DOM is ready to catch any issues
document.addEventListener('DOMContentLoaded', () => {
    // If no compatibility modal exists yet, run the check again
    if (!document.querySelector('.compatibility-modal')) {
        window.browserCompatibility = new BrowserCompatibility();
    }
});