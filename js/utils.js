/**
 * Browser Utilities for BrowserMind
 * Common utility functions used across the application
 */

class BrowserUtils {
    /**
     * Detect browser information
     */
    static detectBrowser() {
        const userAgent = navigator.userAgent;
        const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        return {
            isChrome,
            isEdge,
            isFirefox,
            isSafari,
            isMobile,
            userAgent
        };
    }
    
    /**
     * Get user initials from name
     */
    static getUserInitials(name) {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    /**
     * Comprehensive WebGPU support detection
     * Tests both API presence and functional capability
     */
    static async checkWebGPUSupport() {
        // Stage 1: Check API presence
        if (!('gpu' in navigator)) {
            return {
                supported: false,
                reason: 'WebGPU API not available',
                stage: 'api_missing'
            };
        }

        // Stage 2: Test adapter request
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                return {
                    supported: false,
                    reason: 'No WebGPU adapter available',
                    stage: 'no_adapter'
                };
            }

            // Stage 3: Test device creation
            try {
                const device = await adapter.requestDevice({
                    requiredFeatures: [],
                    requiredLimits: {}
                });
                
                // Clean up
                device.destroy();
                
                return {
                    supported: true,
                    reason: 'WebGPU fully functional',
                    stage: 'functional',
                    adapter: {
                        vendor: adapter.info?.vendor || 'Unknown',
                        architecture: adapter.info?.architecture || 'Unknown'
                    }
                };
            } catch (deviceError) {
                return {
                    supported: false,
                    reason: `Device creation failed: ${deviceError.message}`,
                    stage: 'device_failed'
                };
            }
        } catch (adapterError) {
            return {
                supported: false,
                reason: `Adapter request failed: ${adapterError.message}`,
                stage: 'adapter_failed'
            };
        }
    }

    /**
     * Quick WebGPU check (for synchronous use)
     */
    static hasWebGPUAPI() {
        return 'gpu' in navigator && !!navigator.gpu;
    }

    /**
     * Get detailed browser version information
     */
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        let majorVersion = 0;

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)\.(\d+)/);
            if (match) {
                version = match[1] + '.' + match[2];
                majorVersion = parseInt(match[1]);
            }
        } else if (userAgent.includes('Edg')) {
            browser = 'Edge';
            const match = userAgent.match(/Edg\/(\d+)\.(\d+)/);
            if (match) {
                version = match[1] + '.' + match[2];
                majorVersion = parseInt(match[1]);
            }
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
            const match = userAgent.match(/Version\/(\d+)\.(\d+)/);
            if (match) {
                version = match[1] + '.' + match[2];
                majorVersion = parseInt(match[1]);
            }
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)\.(\d+)/);
            if (match) {
                version = match[1] + '.' + match[2];
                majorVersion = parseInt(match[1]);
            }
        }

        return { browser, version, majorVersion, userAgent };
    }

    /**
     * Check if browser meets minimum requirements for WebGPU
     */
    static meetsMinimumRequirements() {
        const { browser, majorVersion } = this.getBrowserInfo();
        
        const minimumVersions = {
            'Chrome': 113,
            'Edge': 113,
            'Safari': 17,
            'Firefox': 113
        };

        return majorVersion >= (minimumVersions[browser] || 999);
    }

    /**
     * Check for essential ES6+ features (centralized)
     */
    static checkES6Support() {
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
     * Simple logging utility
     */
    static createLogger() {
        return {
            info: (message, module = '') => console.log(`[${module}] ${message}`),
            debug: (message, module = '', data = null) => {
                if (data) {
                    console.log(`[${module}] ${message}`, data);
                } else {
                    console.log(`[${module}] ${message}`);
                }
            },
            error: (message, module = '', error = null) => {
                if (error) {
                    console.error(`[${module}] ${message}`, error);
                } else {
                    console.error(`[${module}] ${message}`);
                }
            }
        };
    }
}

// Create global instances
window.BrowserUtils = BrowserUtils;
window.log = BrowserUtils.createLogger();

console.log('🔧 Browser utilities loaded');
console.log('✅ window.BrowserUtils created:', typeof window.BrowserUtils);