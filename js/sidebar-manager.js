export class SidebarManager {
    constructor(uiComponents) {
        this.ui = uiComponents;
        this.setupEventListeners();
        this.loadSectionStates();
    }

    setupEventListeners() {
        // Right sidebar functionality
        this.ui.hamburgerBtn.addEventListener('click', () => this.toggleRightSidebar());
        this.ui.closeSidebarBtn.addEventListener('click', () => this.closeRightSidebar());
        this.ui.sidebarOverlay.addEventListener('click', () => this.closeRightSidebar());
        
        // Collapsible section toggling
        this.ui.sectionHeaders.forEach(header => {
            header.addEventListener('click', () => this.toggleSection(header.dataset.toggle));
        });
        
        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.ui.rightSidebar.classList.contains('open')) {
                this.closeRightSidebar();
            }
        });
    }

    toggleRightSidebar() {
        const isOpen = this.ui.rightSidebar.classList.contains('open');
        if (isOpen) {
            this.closeRightSidebar();
        } else {
            this.openRightSidebar();
        }
    }

    openRightSidebar() {
        this.ui.rightSidebar.classList.add('open');
        this.ui.sidebarOverlay.classList.add('show');
        this.ui.hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeRightSidebar() {
        this.ui.rightSidebar.classList.remove('open');
        this.ui.sidebarOverlay.classList.remove('show');
        this.ui.hamburgerBtn.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Collapsible section functionality
    toggleSection(sectionName) {
        const section = document.querySelector(`[data-section="${sectionName}"]`);
        const content = document.getElementById(`${sectionName}Section`);
        
        if (!section || !content) return;

        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse section
            content.classList.remove('expanded');
            section.classList.add('collapsed');
        } else {
            // Expand section
            content.classList.add('expanded');
            section.classList.remove('collapsed');
        }

        // Save section states to localStorage
        this.saveSectionStates();
    }

    // Save section states to localStorage
    saveSectionStates() {
        const states = {};
        this.ui.collapsibleSections.forEach(section => {
            const sectionName = section.dataset.section;
            const content = document.getElementById(`${sectionName}Section`);
            states[sectionName] = content ? content.classList.contains('expanded') : false;
        });
        localStorage.setItem('webllm_section_states', JSON.stringify(states));
    }

    // Load section states from localStorage
    loadSectionStates() {
        try {
            const savedStates = localStorage.getItem('webllm_section_states');
            const states = savedStates ? JSON.parse(savedStates) : { chat: true }; // Default: chat expanded
            
            this.ui.collapsibleSections.forEach(section => {
                const sectionName = section.dataset.section;
                const content = document.getElementById(`${sectionName}Section`);
                const shouldExpand = states[sectionName] || false;
                
                if (content) {
                    if (shouldExpand) {
                        content.classList.add('expanded');
                        section.classList.remove('collapsed');
                    } else {
                        content.classList.remove('expanded');
                        section.classList.add('collapsed');
                    }
                }
            });
        } catch (error) {
            console.warn('Could not load section states:', error);
            // Default: expand chat section
            const chatContent = document.getElementById('chatSection');
            if (chatContent) {
                chatContent.classList.add('expanded');
            }
        }
    }

    showAuthRequiredForHistory() {
        this.ui.chatHistoryList.innerHTML = `
            <div class="auth-required-message">
                <div class="auth-required-icon">🔐</div>
                <div class="auth-required-content">
                    <h4>Sign in Required</h4>
                    <p>Sign in to access your conversation history and sync across devices.</p>
                </div>
            </div>
        `;
    }

    updateChatHistoryDisplay(archivedChats, currentChatId) {
        if (archivedChats.length === 0) {
            this.ui.chatHistoryList.innerHTML = `
                <div class="chat-history-empty">
                    <p>No previous conversations</p>
                </div>
            `;
            return;
        }
        
        this.ui.chatHistoryList.innerHTML = '';
        
        archivedChats.forEach(chat => {
            const chatItem = this.createChatHistoryItem(chat);
            this.ui.chatHistoryList.appendChild(chatItem);
        });
        
        this.markActiveChat(currentChatId);
    }

    createChatHistoryItem(chat) {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        item.dataset.chatId = chat.id;
        
        const date = new Date(chat.created);
        const isToday = date.toDateString() === new Date().toDateString();
        const dateStr = isToday ? 
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        item.innerHTML = `
            <div class="chat-history-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </div>
            <div class="chat-history-item-content">
                <div class="chat-history-item-title">${chat.title}</div>
                <div class="chat-history-item-date">${dateStr} • ${chat.messageCount} messages</div>
            </div>
            <div class="chat-history-item-actions">
                <button class="chat-history-action-btn" data-action="delete" title="Delete chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        `;
        
        return item;
    }

    markActiveChat(activeChatId) {
        // Remove active class from all items
        this.ui.chatHistoryList.querySelectorAll('.chat-history-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current item
        if (activeChatId) {
            const activeItem = this.ui.chatHistoryList.querySelector(`[data-chat-id="${activeChatId}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    renderModelList(models, currentModelId) {
        if (!this.ui.modelList) return;

        this.ui.modelList.innerHTML = '';
        
        models.forEach(model => {
            const modelCard = this.createModelCard(model, currentModelId);
            this.ui.modelList.appendChild(modelCard);
        });
    }

    createModelCard(model, currentModelId) {
        const card = document.createElement('div');
        card.className = `model-card ${model.status}`;
        if (model.id === currentModelId) {
            card.classList.add('current');
        }
        
        card.innerHTML = `
            <div class="model-icon">${model.icon}</div>
            <div class="model-details">
                <div class="model-name">${model.name}</div>
                <div class="model-size">${model.size}</div>
                <div class="model-status ${model.status}">${this.getStatusText(model.status)}</div>
                <div class="model-description">${model.description}</div>
            </div>
            ${model.id === currentModelId ? '<div class="model-badge current-badge">Current</div>' : ''}
            ${model.status === 'available' ? '<div class="model-badge download-badge">Available</div>' : ''}
        `;

        // Store model data for click handler
        card.dataset.modelId = model.id;
        
        return card;
    }

    getStatusText(status) {
        switch (status) {
            case 'loaded': return 'Loaded';
            case 'loading': return 'Loading...';
            case 'available': return 'Available';
            case 'error': return 'Error';
            default: return 'Unknown';
        }
    }

    updateCurrentModelDisplay(model) {
        if (!this.ui.currentModelInfo || !model) return;

        this.ui.currentModelInfo.innerHTML = `
            <div class="model-card current">
                <div class="model-icon">${model.icon}</div>
                <div class="model-details">
                    <div class="model-name">${model.name}</div>
                    <div class="model-size">${model.size}</div>
                    <div class="model-status loaded">Loaded</div>
                </div>
                <div class="model-badge current-badge">Current</div>
            </div>
        `;
    }
}