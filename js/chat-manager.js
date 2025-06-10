export class ChatManager {
    constructor() {
        this.conversationHistory = [];
        this.archivedChats = [];
        this.currentChatId = null;
        this.originalChatLength = 0;
        this.maxHistoryLength = 20;
        // Don't load archived chats immediately - wait for auth check
        // this.loadArchivedChats();
        // this.loadConversationHistory();
    }

    // Initialize data loading for authenticated users
    initializeForAuthenticatedUser() {
        this.loadArchivedChats();
        this.loadConversationHistory();
    }

    // Clear data when user signs out
    clearForUnauthenticatedUser() {
        // Auto-save current conversation before clearing if it has messages
        if (this.conversationHistory.length > 0) {
            this.archiveCurrentConversation();
        }
        
        // Clear in-memory data
        this.conversationHistory = [];
        this.archivedChats = [];
        this.currentChatId = null;
        this.originalChatLength = 0;
        // Note: We don't clear localStorage here since the user may sign back in
        // and expect their data to still be available
    }

    // Generate user-specific storage keys
    getUserSpecificKey(baseKey) {
        // Get user ID from auth manager if available
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            if (user && user.id) {
                return `${baseKey}_user_${user.id}`;
            }
        }
        // Fallback to base key if no user (shouldn't happen in normal flow)
        return baseKey;
    }

    addMessage(content, role, timestamp = new Date().toISOString()) {
        // Assign a chat ID for completely new conversations (first user message with empty history)
        if (!this.currentChatId && role === 'user' && this.conversationHistory.length === 0) {
            this.currentChatId = Date.now().toString();
            this.originalChatLength = 0; // Set original length for new conversations
        }
        
        const message = {
            role: role,
            content: content,
            timestamp: timestamp
        };

        this.conversationHistory.push(message);

        // Limit history length
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        this.saveConversationHistory();
        return message;
    }

    getRecentMessages(count = 10) {
        return this.conversationHistory.slice(-count);
    }

    prepareMessages(systemPrompt, currentMessage) {
        const messages = [
            { role: "system", content: systemPrompt }
        ];

        // Add conversation history (keeping recent context)
        const recentHistory = this.conversationHistory.slice(-10);
        messages.push(...recentHistory);

        // Add current message
        messages.push({ role: "user", content: currentMessage });

        return messages;
    }

    startNewChat() {
        // Archive current conversation if it has messages and has been modified
        if (this.conversationHistory.length > 0) {
            this.archiveCurrentConversation();
        }
        
        // Clear current conversation
        this.conversationHistory = [];
        this.currentChatId = null;
        this.originalChatLength = 0;
        
        // Save empty state
        this.saveConversationHistory();
        
        return true;
    }

    archiveCurrentConversation() {
        if (this.conversationHistory.length === 0) return;
        
        // If this is a restored conversation, update the existing entry instead of creating a new one
        if (this.currentChatId) {
            const existingIndex = this.archivedChats.findIndex(chat => chat.id === this.currentChatId);
            if (existingIndex !== -1) {
                // Always update the existing conversation with current messages
                this.archivedChats[existingIndex] = {
                    ...this.archivedChats[existingIndex],
                    messages: [...this.conversationHistory],
                    messageCount: this.conversationHistory.length,
                    lastModified: new Date().toISOString()
                };
                
                // Sort by lastModified date after updating
                this.sortAndLimitArchivedChats();
                
                this.saveArchivedChats();
                return;
            }
        }
        
        // Create new archived conversation
        const title = this.generateChatTitle(this.conversationHistory[0].content);
        const now = new Date().toISOString();
        const archived = {
            id: this.currentChatId || Date.now().toString(),
            title: title,
            messages: [...this.conversationHistory],
            created: now,
            lastModified: now,
            messageCount: this.conversationHistory.length
        };
        
        this.archivedChats.push(archived);
        
        // Sort by lastModified date (most recent first) and limit storage
        this.sortAndLimitArchivedChats();
        
        this.saveArchivedChats();
    }

    restoreConversation(chatId) {
        const chat = this.archivedChats.find(c => c.id === chatId);
        if (!chat) return false;
        
        // Archive current conversation if it has messages
        if (this.conversationHistory.length > 0) {
            this.archiveCurrentConversation();
        }
        
        // Restore the selected conversation
        this.conversationHistory = [...chat.messages];
        this.currentChatId = chatId;
        this.originalChatLength = chat.messages.length;
        
        // Save current state
        this.saveConversationHistory();
        
        return chat;
    }

    deleteArchivedChat(chatId) {
        this.archivedChats = this.archivedChats.filter(chat => chat.id !== chatId);
        this.saveArchivedChats();
        
        // If this was the current chat, clear it
        if (this.currentChatId === chatId) {
            this.currentChatId = null;
        }
        
        return true;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.archivedChats = [];
        this.currentChatId = null;
        this.originalChatLength = 0;
        localStorage.removeItem(this.getUserSpecificKey('webllm_conversation_history'));
        localStorage.removeItem(this.getUserSpecificKey('webllm_archived_chats'));
        return true;
    }

    // Sort archived chats by lastModified date (most recent first) and limit count
    sortAndLimitArchivedChats() {
        // Sort by lastModified date, most recent first
        this.archivedChats.sort((a, b) => {
            const dateA = new Date(a.lastModified || a.created || 0);
            const dateB = new Date(b.lastModified || b.created || 0);
            return dateB.getTime() - dateA.getTime();
        });
        
        // Limit archived chats to prevent storage bloat
        if (this.archivedChats.length > 50) {
            this.archivedChats = this.archivedChats.slice(0, 50);
        }
    }

    // Clear all user data from localStorage (for cache clearing operations)
    clearAllUserData() {
        // Get all localStorage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Remove user-specific chat data
            if (key && (key.includes('webllm_conversation_history_user_') || 
                       key.includes('webllm_archived_chats_user_'))) {
                keysToRemove.push(key);
            }
        }
        
        // Remove all user-specific keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear in-memory data
        this.conversationHistory = [];
        this.archivedChats = [];
        this.currentChatId = null;
        this.originalChatLength = 0;
        
        return true;
    }

    generateChatTitle(firstMessage) {
        if (!firstMessage || typeof firstMessage !== 'string') {
            return 'Untitled Chat';
        }
        
        // Clean and truncate the message
        let title = firstMessage
            .trim()
            .replace(/[^\w\s\-.,!?]/g, '') // Remove special characters except basic punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
        
        // Get first few words
        const words = title.split(' ').slice(0, 5);
        title = words.join(' ');
        
        // Truncate if too long
        if (title.length > 40) {
            title = title.substring(0, 37) + '...';
        }
        
        // Fallback to default if empty
        return title || 'Untitled Chat';
    }

    saveConversationHistory() {
        try {
            const historyData = {
                history: this.conversationHistory,
                currentChatId: this.currentChatId,
                originalChatLength: this.originalChatLength,
                timestamp: new Date().toISOString()
            };
            const storageKey = this.getUserSpecificKey('webllm_conversation_history');
            localStorage.setItem(storageKey, JSON.stringify(historyData));
        } catch (error) {
            console.warn('Could not save conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const storageKey = this.getUserSpecificKey('webllm_conversation_history');
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const historyData = JSON.parse(savedData);
                this.conversationHistory = historyData.history || [];
                
                // Restore chat tracking information if available
                if (historyData.currentChatId) {
                    this.currentChatId = historyData.currentChatId;
                    this.originalChatLength = historyData.originalChatLength || this.conversationHistory.length;
                } else {
                    // Legacy data without tracking info - create ID if conversation exists
                    if (this.conversationHistory.length > 0) {
                        this.currentChatId = Date.now().toString();
                        this.originalChatLength = this.conversationHistory.length;
                    }
                }
                
                return this.conversationHistory;
            }
        } catch (error) {
            console.warn('Could not load conversation history:', error);
            this.conversationHistory = [];
        }
        return [];
    }

    loadArchivedChats() {
        try {
            const storageKey = this.getUserSpecificKey('webllm_archived_chats');
            const savedChats = localStorage.getItem(storageKey);
            if (savedChats) {
                this.archivedChats = JSON.parse(savedChats);
                
                // Sort loaded chats by lastModified date (for backward compatibility and ordering)
                this.sortAndLimitArchivedChats();
            }
        } catch (error) {
            console.warn('Could not load archived chats:', error);
            this.archivedChats = [];
        }
    }

    saveArchivedChats() {
        try {
            const storageKey = this.getUserSpecificKey('webllm_archived_chats');
            localStorage.setItem(storageKey, JSON.stringify(this.archivedChats));
        } catch (error) {
            console.warn('Could not save archived chats:', error);
        }
    }

    exportConversation(format = 'json') {
        if (this.conversationHistory.length === 0) {
            return null;
        }

        const timestamp = new Date().toISOString().split('T')[0];

        if (format === 'markdown') {
            return this.generateMarkdownExport();
        } else {
            const exportData = {
                exported_at: new Date().toISOString(),
                model: 'Phi-3.5 Mini',
                conversation_count: this.conversationHistory.length,
                messages: this.conversationHistory
            };
            return JSON.stringify(exportData, null, 2);
        }
    }

    generateMarkdownExport() {
        const timestamp = new Date().toISOString();
        const date = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        let markdown = `# BrowserMind Conversation Export\n\n`;
        markdown += `**Exported:** ${date}\n`;
        markdown += `**Model:** Phi-3.5 Mini\n`;
        markdown += `**Messages:** ${this.conversationHistory.length}\n\n`;
        markdown += `---\n\n`;

        this.conversationHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
            const timestamp = new Date(msg.timestamp).toLocaleTimeString();
            
            markdown += `## ${role} (${timestamp})\n\n`;
            markdown += `${msg.content}\n\n`;
            
            if (index < this.conversationHistory.length - 1) {
                markdown += `---\n\n`;
            }
        });

        markdown += `\n---\n\n`;
        markdown += `*Generated by [BrowserMind](https://github.com/your-repo/browsermind) on ${timestamp}*\n`;

        return markdown;
    }
}