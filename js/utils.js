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