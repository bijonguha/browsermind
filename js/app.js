import { lazyLoader } from './lazy-loader.js';
import { performanceMonitor } from './performance-monitor.js';

class BrowserMindApp {
    constructor() {
        console.log('🚀 BrowserMind initializing...');
        
        // Initialize core components first
        this.engine = null;
        this.chatManager = null;
        this.ui = null;
        this.sidebar = null;
        
        // PWA features
        this.pwaInstallPrompt = null;
        
        // Performance message throttling
        this.performanceMessageThrottles = {
            lowFPS: { lastShown: 0, cooldown: 30000 }, // 30 seconds
            highMemory: { lastShown: 0, cooldown: 60000 }, // 1 minute
            longTask: { lastShown: 0, cooldown: 45000 }, // 45 seconds
            layoutShift: { lastShown: 0, cooldown: 30000 } // 30 seconds
        };
        
        // Start progressive initialization
        this.progressiveInitialization();
        
        // Initialize PWA features
        this.initializePWAFeatures();
    }

    /**
     * Progressive initialization based on device capabilities
     */
    async progressiveInitialization() {
        try {
            // Phase 1: Load critical components
            await this.loadCriticalComponents();
            
            // Phase 2: Initialize core functionality
            await this.initializeCoreFeatures();
            
            // Phase 3: Load non-critical features on idle
            this.loadNonCriticalFeatures();
            
        } catch (error) {
            console.error('❌ Progressive initialization failed:', error);
            // Fallback to basic initialization
            await this.fallbackInitialization();
        }
    }

    /**
     * Load critical components first
     */
    async loadCriticalComponents() {
        try {
            // Load core modules
            const [
                { UIComponents },
                { SidebarManager },
                { ChatManager }
            ] = await Promise.all([
                lazyLoader.loadModule('./ui-components.js'),
                lazyLoader.loadModule('./sidebar-manager.js'),
                lazyLoader.loadModule('./chat-manager.js')
            ]);

            this.ui = new UIComponents();
            this.sidebar = new SidebarManager(this.ui);
            this.chatManager = new ChatManager();
        } catch (error) {
            console.error('❌ Failed to load critical components:', error);
            throw error;
        }
    }

    /**
     * Initialize core features
     */
    async initializeCoreFeatures() {
        this.setupEventListeners();
        this.startNewConversation();
        this.loadVersionInfo();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Auto-cleanup performance messages periodically
        this.startPerformanceMessageCleanup();
        
        // Apply layout fixes immediately to prevent input hiding
        this.preventLayoutShifts();
        
        // Wait for DOM to be ready
        await this.waitForDOMReady();
        
        // Initialize engine loading (but don't wait for it)
        this.initializeEngineAsync();
    }

    /**
     * Setup performance monitoring and optimizations
     */
    setupPerformanceMonitoring() {
        // Listen for performance warnings
        window.addEventListener('performance-warning', (event) => {
            const { type, data } = event.detail;
            console.warn(`⚠️ Performance warning: ${type}`, data);
            
            // Handle specific performance issues
            this.handlePerformanceWarning(type, data);
        });
        
        // Optimize for mobile if detected
        performanceMonitor.optimizeForMobile();
        
        // Log initial performance metrics after 5 seconds
        setTimeout(() => {
            performanceMonitor.getMetrics();
        }, 5000);
    }

    /**
     * Handle performance warnings with throttling
     */
    handlePerformanceWarning(type, data) {
        switch (type) {
            case 'low-fps':
                this.handleLowFPS(data.fps);
                break;
                
            case 'high-memory':
                this.handleHighMemoryUsage(data.ratio);
                break;
                
            case 'long-task':
                this.handleLongTask(data.duration);
                break;
                
            case 'layout-shift':
                this.handleLayoutShift(data.score);
                break;
        }
    }

    /**
     * Check if we should show a performance message (throttling)
     */
    shouldShowPerformanceMessage(type) {
        const now = Date.now();
        const throttle = this.performanceMessageThrottles[type];
        
        if (!throttle || (now - throttle.lastShown) >= throttle.cooldown) {
            if (throttle) throttle.lastShown = now;
            return true;
        }
        
        return false;
    }

    /**
     * Handle low FPS scenarios (silent optimization)
     */
    handleLowFPS(fps) {
        // Apply optimizations silently - no chat messages
        this.optimizeChatAnimations();
    }

    /**
     * Handle high memory usage (silent optimization)
     */
    handleHighMemoryUsage(ratio) {
        console.warn(`🧠 High memory usage detected: ${(ratio * 100).toFixed(1)}%`);
        
        // Apply optimizations silently - no chat messages
        if (this.chatManager && this.chatManager.conversationHistory.length > 20) {
            this.chatManager.conversationHistory = this.chatManager.conversationHistory.slice(-10);
            this.chatManager.saveConversationHistory();
        }
        
        // Trigger garbage collection if possible
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Handle long tasks (silent optimization)
     */
    handleLongTask(duration) {
        // Apply optimizations silently - no chat messages
        this.enableTaskScheduling = true;
    }

    /**
     * Handle layout shifts with throttling
     */
    handleLayoutShift(score) {
        // Apply optimizations silently - no chat messages
        // Always apply optimizations regardless of message throttling
        this.preventLayoutShifts();
    }

    /**
     * Clean up excessive system messages to prevent chat overflow
     */
    cleanupExcessiveSystemMessages() {
        if (!this.ui || !this.ui.messagesElement) return;
        
        const systemMessages = this.ui.messagesElement.querySelectorAll('.message.system');
        const maxSystemMessages = 5; // Keep only the last 5 system messages
        
        if (systemMessages.length > maxSystemMessages) {
            const messagesToRemove = Array.from(systemMessages).slice(0, systemMessages.length - maxSystemMessages);
            messagesToRemove.forEach(message => {
                // Only remove performance-related system messages
                if (message.textContent.includes('Performance:') || 
                    message.textContent.includes('Memory:') || 
                    message.textContent.includes('Layout:')) {
                    message.remove();
                }
            });
        }
    }

    /**
     * Start periodic cleanup of performance messages
     */
    startPerformanceMessageCleanup() {
        // Performance optimizations run silently without user messages
        // No cleanup needed since no messages are generated
    }

    /**
     * Optimize chat animations for performance
     */
    optimizeChatAnimations() {
        const style = document.createElement('style');
        style.id = 'chat-performance-optimizations';
        style.textContent = `
            .message {
                animation: none !important;
            }
            
            .loading-indicator .thinking-animation .dot {
                animation-duration: 2s !important;
            }
            
            .copy-btn {
                transition: none !important;
            }
        `;
        
        if (!document.getElementById('chat-performance-optimizations')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Prevent layout shifts and ensure chat input visibility
     */
    preventLayoutShifts() {
        const style = document.createElement('style');
        style.id = 'layout-shift-prevention';
        style.textContent = `
            .progress-container {
                min-height: 200px;
            }
            
            .message {
                contain: layout style paint;
            }
            
            .chat-header {
                min-height: 80px;
            }
            
            /* Ensure chat input area is always visible */
            .input-container {
                position: sticky;
                bottom: 0;
                z-index: 100;
                background: inherit;
                min-height: 80px;
            }
            
            /* Prevent message overflow from hiding input */
            .messages {
                max-height: calc(100vh - 200px);
                overflow-y: auto;
                padding-bottom: 20px;
            }
            
            /* Limit system message height to prevent spam */
            .message.system {
                max-height: 100px;
                overflow: hidden;
                transition: opacity 0.3s ease;
            }
        `;
        
        if (!document.getElementById('layout-shift-prevention')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Load non-critical features on idle
     */
    loadNonCriticalFeatures() {
        // Load on idle or after delay
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.initializeNonCriticalFeatures();
            }, { timeout: 3000 });
        } else {
            setTimeout(() => {
                this.initializeNonCriticalFeatures();
            }, 2000);
        }
    }

    /**
     * Initialize non-critical features
     */
    async initializeNonCriticalFeatures() {
        try {
            // Load auth and markdown asynchronously
            await Promise.allSettled([
                this.initializeAuth(),
                this.initializeMarkdown()
            ]);
            
            // Load external resources
            lazyLoader.loadNonCriticalResources();
        } catch (error) {
            console.warn('⚠️ Some non-critical features failed to load:', error);
        }
    }

    /**
     * Fallback initialization for failed progressive loading
     */
    async fallbackInitialization() {
        try {
            // Direct imports as fallback
            const { WebLLMEngine } = await import('./webllm-engine.js');
            const { ChatManager } = await import('./chat-manager.js');
            const { UIComponents } = await import('./ui-components.js');
            const { SidebarManager } = await import('./sidebar-manager.js');

            this.engine = new WebLLMEngine();
            this.chatManager = new ChatManager();
            this.ui = new UIComponents();
            this.sidebar = new SidebarManager(this.ui);

            this.setupEventListeners();
            this.startNewConversation();
            this.loadVersionInfo();
            
            await this.waitForDOMReady();
            this.initializeEngine();
        } catch (error) {
            console.error('❌ Fallback initialization failed:', error);
            this.showCriticalError(error);
        }
    }

    /**
     * Initialize engine asynchronously
     */
    async initializeEngineAsync() {
        try {
            if (!this.engine) {
                const { WebLLMEngine } = await lazyLoader.loadModule('./webllm-engine.js');
                this.engine = new WebLLMEngine();
            }
            
            this.initializeModels();
            await this.initializeEngine();
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            this.showEngineError(error);
        }
    }

    /**
     * Show critical error to user
     */
    showCriticalError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a2e;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-family: 'Inter', sans-serif;
            z-index: 10000;
        `;
        
        errorDiv.innerHTML = `
            <h1 style="margin-bottom: 20px; color: #ef4444;">BrowserMind Loading Error</h1>
            <p style="margin-bottom: 20px; text-align: center; max-width: 500px;">
                We encountered an error while loading the application. Please try refreshing the page.
            </p>
            <button onclick="window.location.reload()" style="
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
            ">Refresh Page</button>
            <details style="margin-top: 20px; max-width: 600px;">
                <summary style="cursor: pointer; margin-bottom: 10px;">Error Details</summary>
                <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; font-size: 12px; overflow: auto;">
${error.message}
${error.stack}
                </pre>
            </details>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Show engine-specific error
     */
    showEngineError(error) {
        if (this.ui && this.ui.addMessage) {
            this.ui.addMessage(
                `❌ Failed to initialize AI engine: ${error.message}. Please refresh the page to try again.`,
                'system',
                false
            );
        }
    }

    async waitForDOMReady() {
        // Wait for the next frame to ensure all elements are rendered
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Double requestAnimationFrame to ensure complete rendering
                    resolve();
                });
            });
        });
    }

    setupEventListeners() {
        // Chat functionality with auth guard
        this.ui.sendButton.addEventListener('click', () => {
            if (this.requireAuth()) return;
            this.sendMessage();
        });
        this.ui.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.requireAuth()) return;
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.ui.messageInput.addEventListener('input', () => {
            this.ui.messageInput.style.height = 'auto';
            this.ui.messageInput.style.height = Math.min(this.ui.messageInput.scrollHeight, 120) + 'px';
        });

        // Show auth prompt when user tries to interact with disabled input
        this.ui.messageInput.addEventListener('focus', () => {
            if (this.ui.messageInput.disabled) {
                this.requireAuth();
            }
        });

        this.ui.messageInput.addEventListener('click', () => {
            if (this.ui.messageInput.disabled) {
                this.requireAuth();
            }
        });

        // Action buttons with auth guards
        this.ui.clearAllBtn.addEventListener('click', () => {
            this.clearEverything();
        });
        this.ui.clearCacheBtn.addEventListener('click', () => {
            this.clearCache();
        });
        this.ui.clearHistoryBtn.addEventListener('click', () => {
            if (this.requireAuth()) return;
            this.clearConversationHistory();
        });
        this.ui.exportMarkdownBtn.addEventListener('click', () => {
            if (this.requireAuth()) return;
            this.exportConversation('markdown');
        });
        this.ui.exportJsonBtn.addEventListener('click', () => {
            if (this.requireAuth()) return;
            this.exportConversation('json');
        });
        this.ui.newChatBtn.addEventListener('click', () => {
            if (this.requireAuth()) return;
            this.startNewChat();
        });
        
        // Chat history event delegation with auth guard
        this.ui.chatHistoryList.addEventListener('click', (e) => {
            if (this.requireAuth()) return;
            
            const chatItem = e.target.closest('.chat-history-item');
            const deleteBtn = e.target.closest('[data-action="delete"]');
            
            if (deleteBtn && chatItem) {
                e.stopPropagation();
                this.deleteArchivedChat(chatItem.dataset.chatId);
            } else if (chatItem) {
                // Don't restore if it's the current chat
                if (!chatItem.classList.contains('current-chat')) {
                    this.restoreArchivedConversation(chatItem.dataset.chatId);
                }
            }
        });
        
        // Model switching event delegation with auth guard
        this.ui.modelList.addEventListener('click', (e) => {
            if (this.requireAuth()) return;
            
            const modelCard = e.target.closest('.model-card');
            if (modelCard && modelCard.dataset.modelId) {
                const modelId = modelCard.dataset.modelId;
                const model = this.engine.availableModels.find(m => m.id === modelId);
                if (model && model.id !== this.engine.currentModel && model.status !== 'loading') {
                    this.switchModel(modelId);
                }
            }
        });
    }

    // Check if user is authenticated, show prompt if not
    requireAuth() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            return false; // User is authenticated, allow action
        }
        
        // User is not authenticated, show prompt
        this.showAuthPrompt();
        return true; // Block the action
    }

    // Show authentication prompt
    showAuthPrompt() {
        // Open right sidebar to show auth section
        const rightSidebar = document.getElementById('rightSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (rightSidebar) {
            rightSidebar.classList.add('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.add('active');
            }
        }
        
        // Add a temporary highlight to auth section
        const authSection = document.getElementById('authSection');
        if (authSection) {
            authSection.style.animation = 'authHighlight 2s ease-in-out';
            setTimeout(() => {
                authSection.style.animation = '';
            }, 2000);
        }
        
        // Show a toast message with red background
        this.ui.addMessage('🔐 Please sign in to use this feature. Click the Sign in button above to get started!', 'system', false, 'auth-required');
    }

    async initializeEngine() {
        try {
            // Check browser compatibility first
            if (!this.checkBrowserCompatibility()) {
                this.ui.addMessage('Your browser is not compatible with BrowserMind. Please use a modern browser like Chrome 113+, Edge 113+, or Safari 17+.', 'system', false);
                return;
            }
            
            // Show progress immediately with enhanced visibility
            this.ui.showProgress(true);
            this.ui.updateProgress(0, 'Initializing...');
            
            // Add a small delay to ensure progress is visible before starting heavy operations
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.engine.initializeEngine(
                (report) => {
                    const percentage = Math.round(report.progress * 100);
                    this.ui.updateProgress(percentage, report.text || 'Loading...');
                },
                (text, type) => {
                    this.ui.updateStatus(text, type);
                }
            );
            
            // Show completion state briefly before hiding
            this.ui.updateProgress(100, 'Ready!');
            
            // Small delay to ensure all WebLLM callbacks are processed and user sees completion
            setTimeout(() => {
                this.ui.showProgress(false);
                this.ui.setInputEnabled(true);

                // Update header with current model name
                const currentModel = this.engine.getCurrentModel();
                if (currentModel) {
                    this.ui.updateHeaderModelName(currentModel.name);
                }

                // Remove the welcome message and show success
                const welcomeMessage = this.ui.messagesElement.querySelector('.welcome-message');
                if (welcomeMessage) {
                    welcomeMessage.remove();
                }
                this.ui.addMessage('🎉 BrowserMind is ready! Your AI assistant is now running locally in your browser. All conversations stay private and secure.', 'system', false);
            }, 1500); // 1.5 second delay to show completion state

        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            this.ui.showProgress(false);
            
            let errorMessage = 'Failed to load the AI model. ';
            if (error.message.includes('WebGPU')) {
                errorMessage += 'Your browser may not support WebGPU. Please try using Chrome or Edge with WebGPU enabled.';
            } else {
                errorMessage += 'Please refresh the page to try again.';
            }
            
            this.ui.addMessage(errorMessage, 'system', false);
        }
    }

    async sendMessage() {
        const message = this.ui.messageInput.value.trim();
        if (!message || this.engine.isLoading || !this.engine.engine) return;

        // Add user message to UI and chat manager
        this.ui.addMessage(message, 'user', false);
        this.chatManager.addMessage(message, 'user');
        this.ui.clearInput();
        
        this.ui.setInputEnabled(false);
        this.ui.showLoading(true);

        try {
            // Prepare messages with conversation history
            const messages = this.chatManager.prepareMessages(this.engine.systemPrompt, message);

            const response = await this.engine.generateResponse(messages);
            
            // Add assistant response
            this.ui.addMessage(response, 'assistant', false);
            this.chatManager.addMessage(response, 'assistant');

        } catch (error) {
            console.error('Error generating response:', error);
            this.ui.addMessage('Sorry, I encountered an error while generating a response. Please try again.', 'system', false);
        } finally {
            this.ui.setInputEnabled(true);
            this.ui.showLoading(false);
            // Update chat history to reflect new message count
            this.updateChatHistoryDisplay();
        }
    }

    startNewConversation() {
        // Always start with a fresh conversation
        this.chatManager.startNewChat();
        
        // Clear UI completely
        this.ui.clearMessages(false);
        
        // Update chat history display
        this.updateChatHistoryDisplay();
        
        // Add welcome message
        this.ui.addMessage('👋 Welcome to BrowserMind! Start a new conversation by typing your question below.', 'system', false);
    }

    startNewChat() {
        this.chatManager.startNewChat();
        
        // Clear UI messages (keep only system messages about engine status)
        const systemMessages = Array.from(this.ui.messagesElement.children).filter(
            msg => msg.classList.contains('system') && 
            (msg.textContent.includes('ready') || msg.textContent.includes('loading') || msg.textContent.includes('error'))
        );
        
        this.ui.clearMessages(false);
        systemMessages.forEach(msg => this.ui.messagesElement.appendChild(msg));
        
        // Update chat history display
        this.updateChatHistoryDisplay();
        
        // Add system message about new chat
        this.ui.addMessage('🆕 New conversation started! Ask me anything.', 'system', false);
    }

    restoreConversation() {
        const restoredMessages = this.chatManager.loadConversationHistory();
        
        // Restore messages to UI
        restoredMessages.forEach(msg => {
            this.ui.addMessage(msg.content, msg.role, false);
        });

        if (restoredMessages.length > 0) {
            this.ui.addMessage(`Restored ${restoredMessages.length} previous messages from your last session.`, 'system', false);
        }
    }

    restoreArchivedConversation(chatId) {
        const chat = this.chatManager.restoreConversation(chatId);
        if (!chat) return;
        
        // Clear current UI messages
        this.ui.clearMessages(false);
        
        // Restore messages to UI
        this.chatManager.conversationHistory.forEach(msg => {
            this.ui.addMessage(msg.content, msg.role, false);
        });
        
        // Update display
        this.updateChatHistoryDisplay();
        
        // Add system message
        this.ui.addMessage(`📂 Restored conversation: "${chat.title}"`, 'system', false);
        
        // Close the right sidebar after restoring
        this.sidebar.closeRightSidebar();
    }

    deleteArchivedChat(chatId) {
        if (!confirm('Delete this conversation? This action cannot be undone.')) {
            return;
        }
        
        this.chatManager.deleteArchivedChat(chatId);
        this.updateChatHistoryDisplay();
    }

    clearConversationHistory() {
        if (!confirm('This will clear your current conversation history AND all archived chats. Continue?')) {
            return;
        }

        this.chatManager.clearHistory();
        this.ui.clearMessages(true);
        this.updateChatHistoryDisplay();
        this.ui.addMessage('All conversation history cleared. Starting fresh!', 'system', false);
    }

    updateChatHistoryDisplay() {
        // Only show chat history if user is authenticated
        if (window.authManager && window.authManager.isAuthenticated()) {
            // Create current chat data if there's an active conversation
            const currentChat = this.chatManager.conversationHistory.length > 0 ? {
                id: this.chatManager.currentChatId || 'current',
                title: this.chatManager.currentChatId ? 
                    this.chatManager.generateChatTitle(this.chatManager.conversationHistory[0].content) : 
                    'Current Chat',
                messages: this.chatManager.conversationHistory,
                messageCount: this.chatManager.conversationHistory.length,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                isCurrent: true
            } : null;
            
            this.sidebar.updateChatHistoryDisplay(
                this.chatManager.archivedChats, 
                this.chatManager.currentChatId,
                currentChat
            );
        } else {
            this.sidebar.showAuthRequiredForHistory();
        }
    }

    async switchModel(modelId) {
        const model = this.engine.availableModels.find(m => m.id === modelId);
        if (!model) return;

        // Confirm model switch
        const confirmed = confirm(`Switch to ${model.name}? This will:\n\n• Download the model (~${model.size}) if not cached\n• Restart the engine\n• Keep your current conversation\n\nContinue?`);
        if (!confirmed) return;

        try {
            this.ui.setInputEnabled(false);
            this.ui.showProgress(true);
            this.ui.updateProgress(0, 'Setting up your AI');
            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
            
            // Add a small delay to ensure progress is visible before starting operations
            await new Promise(resolve => setTimeout(resolve, 300));

            await this.engine.switchModel(
                modelId,
                (report) => {
                    const percentage = Math.round(report.progress * 100);
                    // Let the original WebLLM text go through parseProgressText for full display
                    this.ui.updateProgress(percentage, report.text || 'Loading...');
                },
                (text, type) => this.ui.updateStatus(text, type)
            );

            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
            this.sidebar.updateCurrentModelDisplay(this.engine.getCurrentModel());

            // Show completion state briefly before hiding (similar to initial loading)
            this.ui.updateProgress(100, 'Model loaded successfully!');
            
            // Add delay to ensure users see the completion state
            setTimeout(() => {
                this.ui.showProgress(false);
                this.ui.setInputEnabled(true);

                // Update header with new model name
                this.ui.updateHeaderModelName(model.name);

                // Add system message about model switch
                this.ui.addMessage(`🔄 Switched to ${model.name}! Model loaded and ready.`, 'system', false);
            }, 1500); // 1.5 second delay to show completion state

        } catch (error) {
            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
            this.ui.showProgress(false);
            this.ui.setInputEnabled(true);
            this.ui.addMessage(`❌ Failed to switch to ${model.name}. Please try again or select a different model.`, 'system', false);
        }
    }

    initializeModels() {
        this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
        this.sidebar.updateCurrentModelDisplay(this.engine.getCurrentModel());
        this.updateChatHistoryDisplay();
        
        // Initialize header with current model name
        const currentModel = this.engine.getCurrentModel();
        if (currentModel) {
            this.ui.updateHeaderModelName(currentModel.name);
        }
    }

    exportConversation(format = 'json') {
        const exportData = this.chatManager.exportConversation(format);
        if (!exportData) {
            this.ui.addMessage('No conversation to export yet.', 'system', false);
            this.sidebar.closeRightSidebar();
            return;
        }

        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const mimeType = format === 'markdown' ? 'text/markdown' : 'application/json';
            const fileExtension = format === 'markdown' ? 'md' : 'json';
            const fileName = `browsermind-chat-${timestamp}.${fileExtension}`;

            const dataBlob = new Blob([exportData], { type: mimeType });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = fileName;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);

            this.ui.addMessage(`✅ Conversation exported as ${format.toUpperCase()}! (${this.chatManager.conversationHistory.length} messages)`, 'system', false);
            this.sidebar.closeRightSidebar();

        } catch (error) {
            console.error('Error exporting conversation:', error);
            this.ui.addMessage('❌ Failed to export conversation. Please try again.', 'system', false);
        }
    }

    async clearCache() {
        if (!confirm('This will clear all cached models and you\'ll need to download them again. Continue?')) {
            return;
        }

        try {
            this.ui.updateStatus('Clearing cache...', 'loading');
            
            // Clear IndexedDB (where WebLLM stores models)
            const databases = await indexedDB.databases();
            await Promise.all(
                databases.map(db => {
                    return new Promise((resolve, reject) => {
                        const deleteReq = indexedDB.deleteDatabase(db.name);
                        deleteReq.onsuccess = () => resolve();
                        deleteReq.onerror = () => reject(deleteReq.error);
                    });
                })
            );

            // Clear Cache Storage
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            // Clear chat data first
            this.chatManager.clearAllUserData();
            
            // Clear Local Storage
            localStorage.clear();
            
            // Clear Session Storage
            sessionStorage.clear();

            this.ui.addMessage('Cache cleared successfully! Please refresh the page to reload the model.', 'system');
            this.ui.updateStatus('Cache cleared - refresh needed', 'ready');
            
            // Reset engine
            this.engine.engine = null;
            this.ui.setInputEnabled(false);

        } catch (error) {
            console.error('Error clearing cache:', error);
            this.ui.addMessage('Error clearing cache. You may need to clear it manually through browser settings.', 'system');
            this.ui.updateStatus('Error clearing cache', 'error');
        }
    }

    async clearEverything() {
        if (!confirm('⚠️ This will completely reset the application:\n\n• Clear all AI models (will need to re-download)\n• Clear conversation history\n• Clear all cached data\n• Require page refresh\n\nThis action cannot be undone. Continue?')) {
            return;
        }

        try {
            this.ui.updateStatus('Clearing everything...', 'loading');
            
            // Clear conversation history and archived chats for all users
            this.chatManager.clearAllUserData();
            
            // Clear all localStorage
            localStorage.clear();
            
            // Clear all sessionStorage
            sessionStorage.clear();
            
            // Clear IndexedDB (where WebLLM stores models)
            const databases = await indexedDB.databases();
            await Promise.all(
                databases.map(db => {
                    return new Promise((resolve, reject) => {
                        const deleteReq = indexedDB.deleteDatabase(db.name);
                        deleteReq.onsuccess = () => resolve();
                        deleteReq.onerror = () => reject(deleteReq.error);
                        deleteReq.onblocked = () => {
                            console.warn(`Database ${db.name} is blocked`);
                            resolve(); // Continue anyway
                        };
                    });
                })
            );

            // Clear Cache Storage (Service Worker caches)
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            // Clear WebGPU memory if possible
            if (this.engine.engine) {
                try {
                    this.engine.engine = null;
                } catch (e) {
                    console.warn('Could not dispose engine:', e);
                }
            }

            // Clear all UI messages
            this.ui.clearMessages(false);
            
            // Reset application state
            this.engine.engine = null;
            this.ui.setInputEnabled(false);
            this.ui.clearInput();
            
            // Show completion message
            this.ui.addMessage('🧹 Complete reset successful! All data cleared:', 'system', false);
            this.ui.addMessage('✅ AI models removed\n✅ Conversation history deleted\n✅ All cached data cleared\n✅ Browser storage emptied', 'system', false);
            this.ui.addMessage('Please refresh the page to start fresh!', 'system', false);
            
            this.ui.updateStatus('Complete reset - refresh required', 'ready');

        } catch (error) {
            console.error('Error during complete reset:', error);
            this.ui.addMessage('⚠️ Reset partially completed with some errors. Manual browser cache clearing may be needed.', 'system', false);
            this.ui.updateStatus('Reset completed with errors', 'error');
        }
    }

    // Initialize markdown and mermaid
    async initializeMarkdown() {
        // Configure marked for better security and features
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: false // We'll handle sanitization manually if needed
            });
        }

        // Wait for mermaid to be available and initialize it
        this.waitForMermaid();
    }

    async waitForMermaid() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkMermaid = () => {
            return new Promise((resolve) => {
                const check = () => {
                    if (typeof window.mermaid !== 'undefined') {
                        resolve(true);
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(check, 100);
                    } else {
                        resolve(false);
                    }
                };
                check();
            });
        };

        const mermaidLoaded = await checkMermaid();
        
        if (mermaidLoaded) {
            try {
                window.mermaid.initialize({
                    startOnLoad: false,
                    theme: 'dark',
                    themeVariables: {
                        darkMode: true,
                        primaryColor: '#8b5cf6',
                        primaryTextColor: '#e2e8f0',
                        primaryBorderColor: '#06b6d4',
                        lineColor: '#94a3b8',
                        backgroundColor: '#1e293b',
                        tertiaryColor: '#374151'
                    },
                    flowchart: {
                        htmlLabels: false
                    }
                });
                console.log('Mermaid initialized successfully');
            } catch (error) {
                console.warn('Mermaid initialization failed:', error);
            }
        } else {
            console.warn('Mermaid library failed to load');
        }
    }

    initializeAuth() {
        // Initialize authentication system
        if (window.authManager) {
            // Initialize auth after a short delay to ensure all scripts are loaded
            setTimeout(async () => {
                try {
                    await window.authManager.initialize();
                    console.log('✅ Authentication system initialized');
                    
                    // Update input state based on initial auth status
                    setTimeout(() => {
                        this.ui.setInputEnabled(this.engine.engine !== null);
                        
                        // If user is already authenticated, load their data
                        if (window.authManager.isAuthenticated()) {
                            this.chatManager.initializeForAuthenticatedUser();
                        }
                        this.updateChatHistoryDisplay();
                    }, 100);
                } catch (error) {
                    console.warn('Authentication initialization failed:', error);
                }
            }, 500);
        } else {
            console.warn('Auth manager not available');
        }
    }

    async loadVersionInfo() {
        try {
            const response = await fetch('./version.json');
            const versionData = await response.json();
            
            // Update version display
            const versionElement = document.getElementById('appVersion');
            if (versionElement) {
                versionElement.textContent = versionData.version;
            }
            
            console.log(`🚀 BrowserMind v${versionData.version} loaded`);
        } catch (error) {
            console.warn('Could not load version info:', error);
        }
    }
    
    /**
     * Check browser compatibility
     * This is a tertiary check in addition to browser-compatibility.js and init.js
     * @returns {boolean} True if compatible, false otherwise
     */
    checkBrowserCompatibility() {
        // Check if compatibility has already been verified
        if (window.browserCompatibility) {
            // If the compatibility modal is visible, browser is incompatible
            if (document.querySelector('.compatibility-modal')) {
                return false;
            }
            return true;
        }
        
        // Use centralized WebGPU detection
        const hasWebGPU = window.BrowserUtils ? 
            window.BrowserUtils.hasWebGPUAPI() : 
            'gpu' in navigator && !!navigator.gpu;
        
        if (!hasWebGPU) {
            return false;
        }
        
        // Check ES6+ features using centralized detection
        return window.BrowserUtils ? 
            window.BrowserUtils.checkES6Support() : 
            window.browserCompatibility?.fallbackES6Check?.() || true;
    }

    /**
     * Initialize PWA features
     */
    initializePWAFeatures() {
        // Handle PWA install prompt
        this.handleInstallPrompt();
        
        // Handle share target
        this.handleShareTarget();
        
        // Handle file handlers
        this.handleFileHandlers();
        
        // Handle protocol handlers
        this.handleProtocolHandlers();
        
        // Add PWA utilities to UI
        this.addPWAUtilities();
    }

    /**
     * Handle PWA install prompt
     */
    handleInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Store the event for later use
            this.pwaInstallPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            console.log('✅ PWA app installed');
            this.hideInstallButton();
            
            if (this.ui && this.ui.addMessage) {
                this.ui.addMessage('📱 BrowserMind has been installed! You can now access it from your home screen.', 'system', false);
            }
        });
    }

    /**
     * Show install button in UI
     */
    showInstallButton() {
        // Check if button already exists
        if (document.getElementById('pwaInstallBtn')) return;
        
        // Create install button
        const installBtn = document.createElement('button');
        installBtn.id = 'pwaInstallBtn';
        installBtn.className = 'action-btn pwa-install-btn';
        installBtn.title = 'Install BrowserMind';
        installBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Install App
        `;
        
        // Add click handler
        installBtn.addEventListener('click', () => {
            this.installPWA();
        });
        
        // Add to settings section
        const settingsSection = document.getElementById('settingsSection');
        if (settingsSection) {
            const cacheSubsection = settingsSection.querySelector('.subsection');
            if (cacheSubsection) {
                cacheSubsection.appendChild(installBtn);
            }
        }
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    /**
     * Install PWA
     */
    async installPWA() {
        if (!this.pwaInstallPrompt) {
            console.log('📱 No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.pwaInstallPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.pwaInstallPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }
            
            // Clear the stored prompt
            this.pwaInstallPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('❌ PWA installation failed:', error);
        }
    }

    /**
     * Handle share target functionality
     */
    handleShareTarget() {
        // Check if app was launched with shared content
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('title') || urlParams.has('text') || urlParams.has('url')) {
            const sharedTitle = urlParams.get('title') || '';
            const sharedText = urlParams.get('text') || '';
            const sharedUrl = urlParams.get('url') || '';
            
            // Combine shared content
            let message = '';
            if (sharedTitle) message += `Title: ${sharedTitle}\n`;
            if (sharedText) message += `Text: ${sharedText}\n`;
            if (sharedUrl) message += `URL: ${sharedUrl}\n`;
            
            if (message) {
                message = `📤 Shared content:\n${message}\n\nHow can I help you with this?`;
                
                // Wait for app to initialize then add the shared content
                setTimeout(() => {
                    if (this.ui && this.ui.addMessage) {
                        this.ui.addMessage(message, 'system', false);
                        
                        // Pre-fill the input if not too long
                        if (this.ui.messageInput && message.length < 500) {
                            this.ui.messageInput.value = `Help me understand this shared content: ${sharedText || sharedTitle || sharedUrl}`.slice(0, 200);
                        }
                    }
                }, 2000);
            }
        }
    }

    /**
     * Handle file handlers
     */
    handleFileHandlers() {
        // Check if app was launched with files
        if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
            window.launchQueue.setConsumer(async (launchParams) => {
                if (launchParams.files && launchParams.files.length > 0) {
                    for (const fileHandle of launchParams.files) {
                        try {
                            const file = await fileHandle.getFile();
                            await this.handleImportedFile(file);
                        } catch (error) {
                            console.error('❌ Failed to handle imported file:', error);
                        }
                    }
                }
            });
        }
    }

    /**
     * Handle imported files
     */
    async handleImportedFile(file) {
        try {
            const text = await file.text();
            const fileName = file.name;
            const fileType = file.type;
            
            let message = `📁 Imported file: ${fileName}\n\n`;
            
            // Handle different file types
            if (fileType === 'application/json') {
                try {
                    const jsonData = JSON.parse(text);
                    message += `JSON content:\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\`\`\`\n\nHow can I help you with this data?`;
                } catch (e) {
                    message += `File content:\n\`\`\`\n${text}\`\`\`\n\nHow can I help you with this file?`;
                }
            } else if (fileType === 'text/markdown') {
                message += `Markdown content:\n\`\`\`markdown\n${text}\`\`\`\n\nHow can I help you with this document?`;
            } else {
                message += `Content:\n\`\`\`\n${text}\`\`\`\n\nHow can I help you with this file?`;
            }
            
            // Add to chat
            if (this.ui && this.ui.addMessage) {
                this.ui.addMessage(message, 'system', false);
            }
            
        } catch (error) {
            console.error('❌ Failed to process imported file:', error);
            if (this.ui && this.ui.addMessage) {
                this.ui.addMessage(`❌ Failed to import file: ${file.name}. Please try again.`, 'system', false);
            }
        }
    }

    /**
     * Handle protocol handlers
     */
    handleProtocolHandlers() {
        // Check if app was launched with custom protocol
        const urlParams = new URLSearchParams(window.location.search);
        const chatParam = urlParams.get('chat');
        
        if (chatParam) {
            // Decode the chat parameter
            try {
                const decodedMessage = decodeURIComponent(chatParam);
                
                // Wait for app to initialize then add the message
                setTimeout(() => {
                    if (this.ui && this.ui.addMessage) {
                        this.ui.addMessage('🔗 Launched via protocol handler', 'system', false);
                        
                        // Pre-fill the input
                        if (this.ui.messageInput) {
                            this.ui.messageInput.value = decodedMessage;
                            this.ui.messageInput.focus();
                        }
                    }
                }, 2000);
                
            } catch (error) {
                console.error('❌ Failed to decode protocol parameter:', error);
            }
        }
    }

    /**
     * Add PWA utilities to UI
     */
    addPWAUtilities() {
        // Add PWA status indicator
        this.addPWAStatus();
        
        // Add offline notification
        this.handleOfflineStatus();
        
        // Add update notification
        this.handleAppUpdates();
    }

    /**
     * Add PWA status indicator
     */
    addPWAStatus() {
        // Check if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone || 
                      document.referrer.includes('android-app://');
        
        if (isPWA) {
            console.log('📱 Running as PWA');
            
            // Add PWA indicator to UI
            const statusDiv = document.createElement('div');
            statusDiv.className = 'pwa-status';
            statusDiv.innerHTML = '📱 PWA Mode';
            statusDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(139, 92, 246, 0.1);
                color: #8b5cf6;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                border: 1px solid rgba(139, 92, 246, 0.2);
            `;
            
            document.body.appendChild(statusDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }
    }

    /**
     * Handle offline/online status
     */
    handleOfflineStatus() {
        const updateOnlineStatus = () => {
            if (this.ui && this.ui.addMessage) {
                if (navigator.onLine) {
                    this.ui.addMessage('🌐 Back online! All features available.', 'system', false);
                } else {
                    this.ui.addMessage('📴 You\'re offline. BrowserMind continues to work locally!', 'system', false);
                }
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    /**
     * Handle app updates
     */
    handleAppUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                    this.showUpdateNotification();
                }
            });
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        if (this.ui && this.ui.addMessage) {
            this.ui.addMessage('🔄 A new version of BrowserMind is available! Refresh the page to update.', 'system', false);
        }
        
        // Add update button to settings
        const updateBtn = document.createElement('button');
        updateBtn.className = 'action-btn update-btn';
        updateBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
            </svg>
            Update App
        `;
        
        updateBtn.addEventListener('click', () => {
            window.location.reload();
        });
        
        const settingsSection = document.getElementById('settingsSection');
        if (settingsSection) {
            const cacheSubsection = settingsSection.querySelector('.subsection');
            if (cacheSubsection) {
                cacheSubsection.appendChild(updateBtn);
            }
        }
    }
}

// Export the class for use by init.js
export default BrowserMindApp;

// Legacy initialization (disabled when using init.js)
// document.addEventListener('DOMContentLoaded', () => {
//     window.app = new BrowserMindApp();
// });