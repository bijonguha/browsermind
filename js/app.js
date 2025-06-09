import { WebLLMEngine } from './webllm-engine.js';
import { ChatManager } from './chat-manager.js';
import { UIComponents } from './ui-components.js';
import { SidebarManager } from './sidebar-manager.js';

class BrowserMindApp {
    constructor() {
        console.log('🚀 BrowserMind initializing...');
        
        this.engine = new WebLLMEngine();
        this.chatManager = new ChatManager();
        this.ui = new UIComponents();
        this.sidebar = new SidebarManager(this.ui);
        
        this.setupEventListeners();
        this.initializeMarkdown();
        this.restoreConversation();
        this.initializeModels();
        
        // Ensure DOM is fully ready and UI elements are available
        this.waitForDOMReady().then(() => {
            this.initializeEngine();
        });
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
        // Chat functionality
        this.ui.sendButton.addEventListener('click', () => this.sendMessage());
        this.ui.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.ui.messageInput.addEventListener('input', () => {
            this.ui.messageInput.style.height = 'auto';
            this.ui.messageInput.style.height = Math.min(this.ui.messageInput.scrollHeight, 120) + 'px';
        });

        // Action buttons
        this.ui.clearAllBtn.addEventListener('click', () => this.clearEverything());
        this.ui.clearCacheBtn.addEventListener('click', () => this.clearCache());
        this.ui.clearHistoryBtn.addEventListener('click', () => this.clearConversationHistory());
        this.ui.exportMarkdownBtn.addEventListener('click', () => this.exportConversation('markdown'));
        this.ui.exportJsonBtn.addEventListener('click', () => this.exportConversation('json'));
        this.ui.newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // Chat history event delegation
        this.ui.chatHistoryList.addEventListener('click', (e) => {
            const chatItem = e.target.closest('.chat-history-item');
            const deleteBtn = e.target.closest('[data-action="delete"]');
            
            if (deleteBtn && chatItem) {
                e.stopPropagation();
                this.deleteArchivedChat(chatItem.dataset.chatId);
            } else if (chatItem) {
                this.restoreArchivedConversation(chatItem.dataset.chatId);
            }
        });
        
        // Model switching event delegation
        this.ui.modelList.addEventListener('click', (e) => {
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

    async initializeEngine() {
        try {
            console.log('🔧 Starting engine initialization...');
            console.log('🔍 Checking UI elements availability:', {
                progressContainer: !!this.ui.progressContainer,
                progressFill: !!this.ui.progressFill,
                progressText: !!this.ui.progressText
            });
            
            // Show progress immediately with enhanced visibility
            console.log('🎬 Showing initial progress...');
            this.ui.showProgress(true);
            this.ui.updateProgress(0, 'Initializing...');
            
            // Add a small delay to ensure progress is visible before starting heavy operations
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.engine.initializeEngine(
                (report) => {
                    const percentage = Math.round(report.progress * 100);
                    console.log(`📈 Progress: ${percentage}% - ${report.text}`);
                    this.ui.updateProgress(percentage, report.text || 'Loading...');
                },
                (text, type) => {
                    console.log(`📊 Status: ${text} (${type})`);
                    this.ui.updateStatus(text, type);
                }
            );

            console.log('✅ Engine initialization completed');
            
            // Show completion state briefly before hiding
            this.ui.updateProgress(100, 'Ready!');
            
            // Small delay to ensure all WebLLM callbacks are processed and user sees completion
            setTimeout(() => {
                this.ui.showProgress(false);
                this.ui.setInputEnabled(true);
                this.ui.messageInput.placeholder = 'Type your message here...';

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
        }
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
        this.sidebar.updateChatHistoryDisplay(this.chatManager.archivedChats, this.chatManager.currentChatId);
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
            this.ui.updateProgress(0, 'Preparing model switch...');
            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);

            await this.engine.switchModel(
                modelId,
                (report) => {
                    const percentage = Math.round(report.progress * 100);
                    this.ui.updateProgress(percentage, report.text || 'Loading...');
                },
                (text, type) => this.ui.updateStatus(text, type)
            );

            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
            this.sidebar.updateCurrentModelDisplay(this.engine.getCurrentModel());

            this.ui.showProgress(false);
            this.ui.setInputEnabled(true);

            // Update header with new model name
            this.ui.updateHeaderModelName(model.name);

            // Add system message about model switch
            this.ui.addMessage(`🔄 Switched to ${model.name}! Model loaded and ready.`, 'system', false);

        } catch (error) {
            this.sidebar.renderModelList(this.engine.availableModels, this.engine.currentModel);
            this.ui.showProgress(false);
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
            
            // Clear conversation history and archived chats
            this.chatManager.clearHistory();
            
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
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BrowserMindApp();
});