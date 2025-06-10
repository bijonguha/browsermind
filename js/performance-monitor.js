/**
 * Performance Monitor for BrowserMind
 * Tracks and optimizes rendering performance, especially on mobile
 */

export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memoryUsage: [],
            renderTimes: [],
            scrollPerformance: []
        };
        
        this.isMonitoring = false;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.observers = new Map();
        
        this.initializeMonitoring();
    }

    /**
     * Initialize performance monitoring
     */
    initializeMonitoring() {
        // Check if we should enable monitoring (avoid overhead on low-end devices)
        if (this.shouldEnableMonitoring()) {
            this.startFPSMonitoring();
            this.setupIntersectionObserver();
            this.setupPerformanceObserver();
            this.monitorMemoryUsage();
        }
        
        // Always setup reduced motion detection
        this.setupReducedMotionDetection();
        
        console.log('📊 Performance Monitor initialized');
    }

    /**
     * Determine if we should enable detailed monitoring
     */
    shouldEnableMonitoring() {
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection;
        
        // Enable monitoring on capable devices
        return deviceMemory >= 4 && 
               (!connection || connection.effectiveType !== '2g');
    }

    /**
     * Start FPS monitoring
     */
    startFPSMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorFrame();
    }

    /**
     * Monitor frame rate
     */
    monitorFrame() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.metrics.fps.push(fps);
            
            // Keep only last 60 frames
            if (this.metrics.fps.length > 60) {
                this.metrics.fps.shift();
            }
            
            // Detect performance issues
            if (fps < 30 && this.frameCount > 60) {
                this.handleLowPerformance(fps);
            }
        }
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        requestAnimationFrame(() => this.monitorFrame());
    }

    /**
     * Handle low performance scenarios
     */
    handleLowPerformance(fps) {
        console.warn(`⚠️ Low FPS detected: ${fps.toFixed(1)}`);
        
        // Reduce animation quality
        this.reduceAnimationComplexity();
        
        // Disable non-essential animations
        this.disableNonEssentialAnimations();
        
        // Emit performance warning
        this.emitPerformanceWarning('low-fps', { fps });
    }

    /**
     * Reduce animation complexity for better performance
     */
    reduceAnimationComplexity() {
        const style = document.createElement('style');
        style.id = 'performance-optimizations';
        style.textContent = `
            /* Reduce animation complexity for performance */
            .progress-icon.loading {
                animation-duration: 2s !important;
            }
            
            .auth-prompt::before,
            .auth-prompt::after {
                display: none !important;
            }
            
            .thinking-animation .dot {
                animation-duration: 2s !important;
            }
            
            /* Disable backdrop filters on low-end devices */
            .progress-container,
            .sidebar,
            .right-sidebar {
                backdrop-filter: none !important;
            }
            
            /* Simplify gradients */
            .progress-fill,
            .new-chat-btn,
            #sendButton {
                background: #8b5cf6 !important;
            }
        `;
        
        // Only add if not already present
        if (!document.getElementById('performance-optimizations')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Disable non-essential animations
     */
    disableNonEssentialAnimations() {
        const elements = document.querySelectorAll([
            '.auth-prompt',
            '.ai-status-icon',
            '.progress-icon.loading'
        ].join(','));
        
        elements.forEach(element => {
            element.style.animation = 'none';
        });
    }

    /**
     * Setup Intersection Observer for efficient rendering
     */
    setupIntersectionObserver() {
        // Observer for messages (virtual scrolling)
        const messageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                
                if (entry.isIntersecting) {
                    // Element is visible, ensure full rendering
                    element.style.contentVisibility = 'visible';
                } else {
                    // Element is not visible, optimize rendering
                    element.style.contentVisibility = 'auto';
                }
            });
        }, {
            rootMargin: '100px 0px', // Pre-load elements 100px before they're visible
            threshold: 0.1
        });

        // Observe all messages
        const observeMessages = () => {
            const messages = document.querySelectorAll('.message');
            messages.forEach(message => {
                if (!message.hasAttribute('data-observed')) {
                    messageObserver.observe(message);
                    message.setAttribute('data-observed', 'true');
                }
            });
        };

        // Initial observation
        observeMessages();

        // Re-observe when new messages are added
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            const containerObserver = new MutationObserver(observeMessages);
            containerObserver.observe(messagesContainer, { childList: true });
            this.observers.set('messages', containerObserver);
        }

        this.observers.set('messageIntersection', messageObserver);
    }

    /**
     * Setup Performance Observer for detailed metrics
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Observe long tasks
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.duration > 50) {
                            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
                            this.emitPerformanceWarning('long-task', {
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                        }
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longTask', longTaskObserver);
                
            } catch (error) {
                console.warn('Long task observer not supported:', error);
            }

            // Observe layout shifts
            try {
                const layoutShiftObserver = new PerformanceObserver((list) => {
                    let cumulativeScore = 0;
                    
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            cumulativeScore += entry.value;
                        }
                    });
                    
                    if (cumulativeScore > 0.1) {
                        console.warn(`⚠️ Layout shift detected: ${cumulativeScore}`);
                        this.emitPerformanceWarning('layout-shift', {
                            score: cumulativeScore
                        });
                    }
                });
                
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('layoutShift', layoutShiftObserver);
                
            } catch (error) {
                console.warn('Layout shift observer not supported:', error);
            }
        }
    }

    /**
     * Monitor memory usage
     */
    monitorMemoryUsage() {
        if ('memory' in performance) {
            const checkMemory = () => {
                const memory = performance.memory;
                const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                this.metrics.memoryUsage.push({
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    ratio: usageRatio,
                    timestamp: Date.now()
                });
                
                // Keep only last 100 measurements
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Alert if memory usage is high
                if (usageRatio > 0.9) {
                    console.warn(`⚠️ High memory usage: ${(usageRatio * 100).toFixed(1)}%`);
                    this.emitPerformanceWarning('high-memory', {
                        ratio: usageRatio,
                        used: memory.usedJSHeapSize,
                        limit: memory.jsHeapSizeLimit
                    });
                }
            };
            
            // Check memory every 10 seconds
            setInterval(checkMemory, 10000);
            checkMemory(); // Initial check
        }
    }

    /**
     * Setup reduced motion detection
     */
    setupReducedMotionDetection() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (event) => {
            if (event.matches) {
                console.log('🔄 Reduced motion preference detected');
                this.enableReducedMotionMode();
            } else {
                this.disableReducedMotionMode();
            }
        };
        
        // Initial check
        handleReducedMotion(mediaQuery);
        
        // Listen for changes
        mediaQuery.addEventListener('change', handleReducedMotion);
    }

    /**
     * Enable reduced motion mode
     */
    enableReducedMotionMode() {
        document.body.classList.add('reduced-motion');
        
        // Disable all animations
        const style = document.createElement('style');
        style.id = 'reduced-motion-override';
        style.textContent = `
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        
        if (!document.getElementById('reduced-motion-override')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Disable reduced motion mode
     */
    disableReducedMotionMode() {
        document.body.classList.remove('reduced-motion');
        
        const style = document.getElementById('reduced-motion-override');
        if (style) {
            style.remove();
        }
    }

    /**
     * Emit performance warning event
     */
    emitPerformanceWarning(type, data) {
        const event = new CustomEvent('performance-warning', {
            detail: { type, data, timestamp: Date.now() }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        const avgFPS = this.metrics.fps.length > 0 
            ? this.metrics.fps.reduce((a, b) => a + b) / this.metrics.fps.length 
            : 0;
        
        const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        
        return {
            averageFPS: avgFPS.toFixed(1),
            currentFPS: this.metrics.fps[this.metrics.fps.length - 1]?.toFixed(1) || 0,
            memoryUsage: latestMemory ? {
                used: (latestMemory.used / 1024 / 1024).toFixed(1) + ' MB',
                ratio: (latestMemory.ratio * 100).toFixed(1) + '%'
            } : null,
            frameCount: this.frameCount,
            isMonitoring: this.isMonitoring
        };
    }

    /**
     * Optimize for mobile performance
     */
    optimizeForMobile() {
        // Detect mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('📱 Mobile device detected, applying optimizations');
            
            // Reduce animation complexity
            this.reduceAnimationComplexity();
            
            // Optimize scroll performance
            this.optimizeScrollPerformance();
            
            // Reduce backdrop filters
            this.reduceBackdropFilters();
        }
    }

    /**
     * Optimize scroll performance
     */
    optimizeScrollPerformance() {
        const scrollableElements = document.querySelectorAll([
            '.messages',
            '.right-sidebar-content',
            '.chat-history-list'
        ].join(','));
        
        scrollableElements.forEach(element => {
            // Use passive scroll listeners
            element.style.overflowAnchor = 'none';
            element.style.scrollBehavior = 'auto';
            
            // Add CSS containment
            element.style.contain = 'layout style paint';
        });
    }

    /**
     * Reduce backdrop filters for better performance
     */
    reduceBackdropFilters() {
        const style = document.createElement('style');
        style.id = 'mobile-optimizations';
        style.textContent = `
            @media (max-width: 768px) {
                .sidebar,
                .right-sidebar,
                .progress-container,
                .input-container {
                    backdrop-filter: none !important;
                }
            }
        `;
        
        if (!document.getElementById('mobile-optimizations')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Cleanup observers and monitoring
     */
    destroy() {
        this.isMonitoring = false;
        
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        this.observers.clear();
        
        // Remove performance optimization styles
        const perfStyles = [
            'performance-optimizations',
            'reduced-motion-override',
            'mobile-optimizations'
        ];
        
        perfStyles.forEach(id => {
            const style = document.getElementById(id);
            if (style) style.remove();
        });
        
        console.log('📊 Performance Monitor destroyed');
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();