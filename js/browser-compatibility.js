/**
 * BrowserMind Compatibility Checker
 * Verifies browser compatibility before loading the application
 * Checks for WebGPU support and ES6+ compatibility
 */

class BrowserCompatibility {
    constructor() {
        // Run compatibility check immediately
        this.checkCompatibility();
    }
    
    /**
     * Check browser compatibility for critical features
     * @returns {boolean} True if browser is compatible, false otherwise
     */
    checkCompatibility() {
        // Check WebGPU support - critical for WebLLM engine
        const hasWebGPU = !!window.navigator.gpu;
        
        // Check ES6+ features
        const hasES6 = this.checkES6Support();
        
        // If incompatible, show modal and prevent further loading
        if (!hasWebGPU || !hasES6) {
            this.showIncompatibilityModal(hasWebGPU, hasES6);
            return false;
        }
        
        return true;
    }
    
    /**
     * Check for essential ES6+ features
     * @returns {boolean} True if ES6+ is supported, false otherwise
     */
    checkES6Support() {
        try {
            // Test arrow functions
            eval("() => {}");
            
            // Test promises
            if (typeof Promise === 'undefined') return false;
            
            // Test template literals
            eval("`test`");
            
            // Test destructuring
            eval("const {a} = {a: 1}");
            
            // Test async/await
            eval("async function test() { await Promise.resolve(); }");
            
            return true;
        } catch (e) {
            console.error("ES6+ compatibility check failed:", e);
            return false;
        }
    }
    
    /**
     * Show incompatibility modal with helpful information
     * @param {boolean} hasWebGPU Whether WebGPU is supported
     * @param {boolean} hasES6 Whether ES6+ features are supported
     */
    showIncompatibilityModal(hasWebGPU, hasES6) {
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
            message.innerHTML = 'Your browser doesn\'t support <strong>WebGPU</strong>, which is required ' +
                'to run the AI models in BrowserMind.';
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
        
        const browsers = [
            { name: 'Google Chrome', version: '113+', url: 'https://www.google.com/chrome/' },
            { name: 'Microsoft Edge', version: '113+', url: 'https://www.microsoft.com/edge' },
            { name: 'Safari', version: '17+', url: 'https://www.apple.com/safari/' },
            { name: 'Firefox', version: '113+', url: 'https://www.mozilla.org/firefox/' }
        ];
        
        browsers.forEach(browser => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = browser.url;
            link.target = '_blank';
            link.textContent = `${browser.name} (${browser.version})`;
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