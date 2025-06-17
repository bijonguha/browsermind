export class UIComponents {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Status and progress elements
        this.statusElement = document.getElementById('status');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressMainText = document.getElementById('progressMainText');
        this.progressSubText = document.getElementById('progressSubText');
        this.progressStats = document.getElementById('progressStats');
        this.progressDownloaded = document.getElementById('progressDownloaded');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressTime = document.getElementById('progressTime');
        this.progressTip = document.getElementById('progressTip');
        this.startTime = null;
        this.progressCompleted = false;
        
        // Chat elements
        this.messagesElement = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Action buttons
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.clearCacheBtn = document.getElementById('clearCacheBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
        this.exportJsonBtn = document.getElementById('exportJsonBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        
        // Model elements
        this.modelList = document.getElementById('modelList');
        this.currentModelInfo = document.getElementById('currentModelInfo');
        this.headerModelInfo = document.getElementById('headerModelInfo');
        
        // Sidebar elements
        this.hamburgerBtn = document.getElementById('hamburgerBtn');
        this.rightSidebar = document.getElementById('rightSidebar');
        this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.chatHistoryList = document.getElementById('chatHistoryList');
        
        // AI Status Compact
        this.aiStatusCompact = document.getElementById('aiStatusCompact');
        this.aiStatusClose = document.getElementById('aiStatusClose');
        
        // Collapsible sections
        this.sectionHeaders = document.querySelectorAll('.section-header');
        this.collapsibleSections = document.querySelectorAll('.collapsible-section');
        
        // Initialize AI status close handler
        this.initializeAIStatusHandler();
    }

    initializeAIStatusHandler() {
        if (this.aiStatusClose) {
            this.aiStatusClose.addEventListener('click', () => {
                this.hideAIStatusCompact();
            });
        }
    }

    showAIStatusCompact() {
        if (this.aiStatusCompact) {
            this.aiStatusCompact.classList.add('show');
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                this.hideAIStatusCompact();
            }, 8000);
        }
    }

    hideAIStatusCompact() {
        if (this.aiStatusCompact) {
            this.aiStatusCompact.classList.remove('show');
            this.aiStatusCompact.classList.add('hide');
            
            // Remove hide class after animation
            setTimeout(() => {
                this.aiStatusCompact.classList.remove('hide');
            }, 400);
        }
    }

    transformProgressToStatus() {
        if (!this.progressContainer) {
            return;
        }
        
        // Add completing animation to progress container
        this.progressContainer.classList.add('completing');
        
        // Wait for animation to complete, then show status indicator
        setTimeout(() => {
            // Completely remove from DOM to ensure layout reflows
            this.progressContainer.style.display = 'none';
            this.progressContainer.remove();
            
            // Show the compact status indicator
            this.showAIStatusCompact();
        }, 1200); // Match the animation duration
    }

    recreateProgressContainer() {
        // Find the main content container where progress should be inserted
        const mainContent = document.querySelector('.main-content');
        const chatContainer = document.querySelector('.chat-container');
        
        if (!mainContent || !chatContainer) {
            console.error('⚠️ Cannot recreate progress container - main content not found');
            return;
        }
        
        // Create new progress container from the original HTML structure
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.id = 'progressContainer';
        
        progressContainer.innerHTML = `
            <div class="progress-info">
                <div class="progress-header">
                    <div class="progress-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div class="progress-details">
                        <h3>Setting up your AI</h3>
                    </div>
                </div>
                
                <div class="progress-status">
                    <p class="progress-main-text" id="progressMainText">Preparing your local AI assistant...</p>
                    <p class="progress-sub-text" id="progressSubText">This may take a moment on first visit</p>
                    
                    <div class="progress-stats" id="progressStats" style="display: none;">
                        <div class="progress-stat">
                            <span class="progress-stat-label">Downloaded</span>
                            <span class="progress-stat-value" id="progressDownloaded">0 MB</span>
                        </div>
                        <div class="progress-stat">
                            <span class="progress-stat-label">Progress</span>
                            <span class="progress-stat-value" id="progressPercent">0%</span>
                        </div>
                        <div class="progress-stat">
                            <span class="progress-stat-label">Time</span>
                            <span class="progress-stat-value" id="progressTime">0s</span>
                        </div>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                
                <div class="progress-tip" id="progressTip" style="display: none;">
                    <span class="progress-tip-icon">💡</span>
                    <p class="progress-tip-text">First-time setup downloads the AI model to your browser. Future visits will be much faster!</p>
                </div>
            </div>
        `;
        
        // Insert before chat container
        mainContent.insertBefore(progressContainer, chatContainer);
        
        // Re-initialize element references
        this.progressContainer = progressContainer;
        this.progressFill = document.getElementById('progressFill');
        this.progressMainText = document.getElementById('progressMainText');
        this.progressSubText = document.getElementById('progressSubText');
        this.progressStats = document.getElementById('progressStats');
        this.progressDownloaded = document.getElementById('progressDownloaded');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressTime = document.getElementById('progressTime');
        this.progressTip = document.getElementById('progressTip');
    }

    updateStatus(text, type = 'loading') {
        if (!this.statusElement) {
            console.warn('Status element not found');
            return;
        }
        const statusSpan = this.statusElement.querySelector('span');
        if (statusSpan) {
            statusSpan.textContent = text;
        }
        this.statusElement.className = `status-indicator ${type}`;
    }

    showProgress(show = true) {
        // Check if container exists AND is in DOM
        const needsRecreation = !this.progressContainer || !document.contains(this.progressContainer);
        
        if (needsRecreation && show) {
            this.recreateProgressContainer();
            if (!this.progressContainer) {
                console.error('❌ Failed to recreate progress container');
                return;
            }
        } else if (!this.progressContainer) {
            console.warn('Progress container not found');
            return;
        }
        
        if (show) {
            // Reset state for new progress session
            this.startTime = null;
            this.progressCompleted = false;
            if (this.progressStats) this.progressStats.style.display = 'none';
            if (this.progressTip) this.progressTip.style.display = 'none';
            
            // Reset progress display to initial state
            if (this.progressMainText) this.progressMainText.textContent = 'Preparing your local AI assistant...';
            if (this.progressSubText) this.progressSubText.textContent = 'This may take a moment on first visit';
            if (this.progressFill) this.progressFill.style.width = '0%';
            
            // Initialize loading animation on icon
            const progressIcon = this.progressContainer?.querySelector('.progress-icon');
            if (progressIcon) {
                progressIcon.classList.add('loading');
                progressIcon.classList.remove('completing');
            }
            
            // Force display immediately
            this.progressContainer.style.display = 'flex';
            this.progressContainer.classList.add('show');
            
            // Ensure it's visible in the next frame
            requestAnimationFrame(() => {
                this.progressContainer.style.opacity = '1';
                this.progressContainer.style.visibility = 'visible';
                this.progressContainer.style.transform = 'translateY(0)';
            });
        } else {
            this.progressContainer.classList.remove('show');
            // Reset timer and animation when hiding
            this.startTime = null;
            this.progressCompleted = false;
            const progressIcon = this.progressContainer?.querySelector('.progress-icon');
            if (progressIcon) {
                progressIcon.classList.remove('loading', 'completing');
            }
        }
    }

    updateProgress(percentage, text) {
        if (!this.progressFill) {
            console.warn('Progress elements not found');
            return;
        }
        
        // Mark as completed when we reach 100% or get "Ready" message
        if (percentage >= 100 || (text && (text.includes('Ready') || text.includes('🎉')))) {
            if (!this.progressCompleted) {
                this.progressCompleted = true;
                // Trigger transformation after a short delay to let final progress update show
                setTimeout(() => {
                    this.transformProgressToStatus();
                }, 1500);
            }
        }
        
        // Initialize start time if not set
        if (!this.startTime && percentage > 0) {
            this.startTime = Date.now();
        }
        
        // Ensure percentage is within bounds
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        // Update progress bar width
        this.progressFill.style.width = `${clampedPercentage}%`;
        
        // Parse and display user-friendly progress information
        const progressInfo = this.parseProgressText(text, clampedPercentage);
        this.updateProgressDisplay(progressInfo, clampedPercentage);
    }

    parseProgressText(text, percentage) {
        if (!text) return { main: 'Loading...', sub: '', showStats: false };
        
        // Parse technical WebLLM messages into user-friendly format
        if (text.includes('Fetching param cache')) {
            const match = text.match(/Fetching param cache\[(\d+)\/(\d+)\]: (\d+)MB fetched\. (\d+)% completed, (\d+) secs elapsed/);
            if (match) {
                const [, current, total, mbFetched, percent, seconds] = match;
                return {
                    main: `Downloading AI model...`,
                    sub: `Getting your AI ready - this creates a local copy for privacy`,
                    showStats: true,
                    downloaded: mbFetched,
                    time: seconds,
                    showTip: true,
                    tipText: 'First-time setup downloads the AI model to your browser. Future visits will be much faster!'
                };
            }
        }
        
        // Handle WebGPU loading messages and fix the typo
        if (text.includes('Finish loading on WebGPU')) {
            return {
                main: 'Finalizing AI setup...',
                sub: 'Almost ready to chat!',
                showStats: true,
                showTip: false,
                isCompleting: true
            };
        }
        
        if (text.includes('Finished loading on WebGPU')) {
            return {
                main: 'AI setup complete!',
                sub: 'Your assistant is ready',
                showStats: true,
                showTip: false,
                isCompleting: true
            };
        }
        
        // Handle "Setting up your AI" initial message
        if (text.includes('Setting up your AI')) {
            return {
                main: 'Setting up your AI',
                sub: 'Getting your AI ready - this creates a local copy for privacy',
                showStats: false,
                showTip: true,
                tipText: 'AI models are downloaded to your browser for privacy. Switching models may require a download.'
            };
        }
        
        // Handle other progress messages
        if (text.includes('Loading')) {
            return {
                main: 'Loading AI model...',
                sub: 'Almost ready to chat!',
                showStats: percentage > 5,
                showTip: false
            };
        }
        
        if (text.includes('Initializing') || text.includes('Starting')) {
            return {
                main: 'Starting up your AI assistant...',
                sub: 'Preparing everything for you',
                showStats: false,
                showTip: false
            };
        }
        
        if (text.includes('Ready') || text.includes('Completed')) {
            return {
                main: '🎉 AI Ready!',
                sub: 'Your personal assistant is loaded and ready to chat',
                showStats: true,
                showTip: false,
                isCompleting: true
            };
        }
        
        // Default fallback for unknown messages
        return {
            main: text.length > 50 ? 'Setting up your AI...' : text,
            sub: text.length > 50 ? 'This may take a moment' : 'Getting everything ready',
            showStats: percentage > 10,
            showTip: percentage > 5 && percentage < 90
        };
    }

    updateProgressDisplay(info, percentage) {
        // Update main text
        if (this.progressMainText && info.main) {
            this.progressMainText.textContent = info.main;
        }
        
        // Update sub text
        if (this.progressSubText && info.sub) {
            this.progressSubText.textContent = info.sub;
        }
        
        // Update icon animation based on completion state
        const progressIcon = this.progressContainer?.querySelector('.progress-icon');
        if (progressIcon) {
            if (info.isCompleting || percentage >= 100) {
                // Stop loading animation and show completion state
                progressIcon.classList.remove('loading');
                progressIcon.classList.add('completing');
            } else {
                // Show loading animation
                progressIcon.classList.add('loading');
                progressIcon.classList.remove('completing');
            }
        }
        
        // Update stats if available
        if (this.progressStats) {
            if (info.showStats) {
                this.progressStats.style.display = 'flex';
                
                if (this.progressPercent) {
                    this.progressPercent.textContent = `${Math.round(percentage)}%`;
                }
                
                if (this.progressDownloaded && info.downloaded) {
                    this.progressDownloaded.textContent = `${info.downloaded} MB`;
                }
                
                if (this.progressTime && info.time) {
                    this.progressTime.textContent = `${info.time}s`;
                } else if (this.progressTime && this.startTime) {
                    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
                    this.progressTime.textContent = `${elapsed}s`;
                }
            } else {
                this.progressStats.style.display = 'none';
            }
        }
        
        // Show/hide tip and update text if provided
        if (this.progressTip) {
            if (info.showTip) {
                this.progressTip.style.display = 'block';
                // Update tip text if provided
                if (info.tipText) {
                    const tipTextElement = this.progressTip.querySelector('.progress-tip-text');
                    if (tipTextElement) {
                        tipTextElement.textContent = info.tipText;
                    }
                }
            } else {
                this.progressTip.style.display = 'none';
            }
        }
    }

    showLoading(show = true) {
        this.loadingIndicator.classList.toggle('show', show);
    }

    setInputEnabled(enabled) {
        // Check both engine status and authentication
        const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
        const shouldEnable = enabled && isAuthenticated;
        
        this.messageInput.disabled = !shouldEnable;
        this.sendButton.disabled = !shouldEnable;
        
        if (shouldEnable) {
            this.messageInput.focus();
        }
        
        // Update placeholder based on auth status
        if (!isAuthenticated) {
            this.messageInput.placeholder = "Please sign in to start chatting! Click the hamburger menu (☰) to access sign-in options.";
        } else {
            this.messageInput.placeholder = "Ask me anything... I'm running right here in your browser! 🤖";
        }
    }

    clearInput() {
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
    }

    addMessage(content, type = 'user', saveToHistory = true, extraClass = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}${extraClass ? ' ' + extraClass : ''}`;
        
        // Add error styling for failed model loading messages
        if (type === 'system' && content.includes('Failed to load the AI model')) {
            messageDiv.classList.add('error-message');
            
            // Add inline styles for the error message
            messageDiv.style.backgroundColor = '#fee2e2';
            messageDiv.style.color = '#b91c1c';
            messageDiv.style.borderLeft = '4px solid #dc2626';
            messageDiv.style.padding = '12px 16px';
            messageDiv.style.margin = '12px 0';
            messageDiv.style.borderRadius = '6px';
            messageDiv.style.fontWeight = '500';
        }
        
        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Render content based on type
        if (type === 'assistant') {
            // Check for mermaid diagrams first
            if (this.containsMermaidDiagram(content)) {
                this.renderContentWithMermaid(contentDiv, content);
            } else {
                // Render as markdown
                contentDiv.innerHTML = this.renderMarkdown(content);
            }
        } else {
            // For user and system messages, use plain text
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(contentDiv);
        
        // Add copy button for assistant messages (after content)
        if (type === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.title = 'Copy as markdown';
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyMessageAsMarkdown(content, copyBtn);
            });
            
            actionsDiv.appendChild(copyBtn);
            messageDiv.appendChild(actionsDiv);
        }
        
        this.messagesElement.appendChild(messageDiv);
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;

        return messageDiv;
    }

    clearMessages(keepSystemMessages = true) {
        if (keepSystemMessages) {
            const systemMessages = Array.from(this.messagesElement.children).filter(
                msg => msg.classList.contains('system')
            );
            this.messagesElement.innerHTML = '';
            systemMessages.forEach(msg => this.messagesElement.appendChild(msg));
        } else {
            this.messagesElement.innerHTML = '';
        }
    }

    renderMarkdown(content) {
        if (typeof marked === 'undefined') {
            return content; // Fallback to plain text if marked is not available
        }
        return marked.parse(content);
    }

    containsMermaidDiagram(content) {
        // More flexible regex patterns to catch different formats
        const patterns = [
            /```mermaid\s*\n[\s\S]*?\n```/i,      // Standard: ```mermaid\n...\n```
            /```mermaid[\s\S]*?```/i,              // No newlines: ```mermaid...```
            /```\s*mermaid\s*\n[\s\S]*?\n```/i,   // Extra spaces: ``` mermaid \n...\n```
            /```\s*mermaid[\s\S]*?```/i,          // Flexible spacing: ``` mermaid...```
            /```\s*mermaid\s+[\s\S]*?```/i,       // With extra whitespace after mermaid
            /~~mermaid[\s\S]*?~~/i,                // Alternative syntax with tildes
            /\[mermaid\][\s\S]*?\[\/mermaid\]/i    // Square bracket syntax
        ];
        
        return patterns.some(pattern => pattern.test(content));
    }

    async renderContentWithMermaid(container, content) {
        // More comprehensive pattern to split by mermaid blocks
        const mermaidPattern = /(```\s*mermaid[\s\S]*?```)/gi;
        const parts = content.split(mermaidPattern);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // Check if this part is a mermaid block
            if (/```\s*mermaid/i.test(part)) {
                // Extract mermaid code with more flexible regex
                let mermaidCode = part
                    .replace(/```\s*mermaid\s*/i, '')  // Remove opening tag
                    .replace(/```\s*$/, '')            // Remove closing tag
                    .trim();
                
                // Create mermaid container
                const mermaidContainer = document.createElement('div');
                mermaidContainer.className = 'mermaid-container';
                
                try {
                    if (typeof window.mermaid !== 'undefined' && mermaidCode) {
                        // Clean and validate mermaid code
                        const cleanedCode = this.cleanMermaidCode(mermaidCode);
                        
                        if (!cleanedCode) {
                            throw new Error('Invalid or empty mermaid code after cleaning');
                        }
                        
                        // Create unique ID for this diagram
                        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        
                        // Render the diagram
                        const { svg } = await window.mermaid.render(diagramId, cleanedCode);
                        
                        // Create wrapper div and add the SVG
                        const mermaidDiv = document.createElement('div');
                        mermaidDiv.className = 'mermaid';
                        mermaidDiv.innerHTML = svg;
                        mermaidContainer.appendChild(mermaidDiv);
                        
                        container.appendChild(mermaidContainer);
                    } else {
                        // Fallback: show as code block
                        mermaidContainer.innerHTML = `<pre><code>Mermaid diagram (library: ${typeof window.mermaid}, code length: ${mermaidCode.length}):\n${mermaidCode}</code></pre>`;
                        container.appendChild(mermaidContainer);
                    }
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                    // Create a helpful error message with suggestions
                    const errorMessage = this.createMermaidErrorMessage(error, mermaidCode);
                    mermaidContainer.innerHTML = errorMessage;
                    container.appendChild(mermaidContainer);
                }
            } else if (part.trim()) {
                // Regular text content - render as markdown
                const textDiv = document.createElement('div');
                textDiv.innerHTML = this.renderMarkdown(part);
                container.appendChild(textDiv);
            }
        }
    }

    cleanMermaidCode(code) {
        if (!code || typeof code !== 'string') {
            return null;
        }

        // First, normalize line endings and remove markdown markers
        let cleaned = code
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remove any residual markdown code block markers
            .replace(/^```mermaid\s*/i, '')
            .replace(/```\s*$/i, '')
            // Replace problematic characters
            .replace(/[\u201C\u201D]/g, '"')  // Replace smart quotes
            .replace(/[\u2018\u2019]/g, "'")  // Replace smart apostrophes
            .replace(/[\u2013\u2014]/g, '-'); // Replace en/em dashes

        // Process line by line to maintain proper structure
        const lines = cleaned.split('\n').map(line => line.trim());
        const cleanedLines = [];

        for (let line of lines) {
            // Skip empty lines or problematic patterns
            if (!line || 
                line.startsWith('.') ||
                line.includes('varNode') ||
                line.includes('varClose') ||
                line.includes('\\.relabel') ||
                line.includes('\\.divider') ||
                line.includes('\\.label') ||
                line.includes('\\.nextof') ||
                line.includes('alpha,') ||
                line.includes('beta,') ||
                /varNode\s+"[^"]*"\s+of\s+"[^"]*"/.test(line)) {
                continue;
            }

            // Clean up the line
            line = line
                .replace(/\|\s*if\s*\([^)]*\)\s*\|/g, '') // Remove conditional syntax
                .replace(/\|\s*else\s*\|/g, '')           // Remove else syntax
                .replace(/\.of\s+node/g, '')             // Remove .of node syntax
                .replace(/\.relabel\s+\.as/g, '')       // Remove .relabel .as syntax
                .replace(/\.divider/g, '')               // Remove .divider syntax
                .replace(/\.label/g, '')                 // Remove .label syntax
                .replace(/\.nextof/g, '')                // Remove .nextof syntax
                .trim();

            if (line) {
                cleanedLines.push(line);
            }
        }

        cleaned = cleanedLines.join('\n');

        // Basic validation - check if it starts with a known mermaid diagram type
        const validTypes = [
            'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
            'stateDiagram', 'pie', 'journey', 'gantt', 'gitgraph',
            'erDiagram', 'requirement', 'mindmap', 'timeline'
        ];

        const firstWord = cleaned.split(/\s+/)[0]?.toLowerCase();
        
        if (!validTypes.includes(firstWord)) {
            console.warn('Mermaid code does not start with a valid diagram type:', firstWord);
            // Try to create a simple fallback diagram
            if (cleaned.includes('-->') || cleaned.includes('->')) {
                cleaned = 'graph TD\n' + cleaned;
            } else {
                return null; // Invalid code
            }
        }

        return cleaned.length > 10 ? cleaned : null; // Return null if too short
    }

    createMermaidErrorMessage(error, originalCode) {
        const suggestions = [];
        
        if (error.message.includes('Parse error')) {
            suggestions.push('The diagram syntax appears to be malformed');
            suggestions.push('Try using simpler mermaid syntax');
        }
        
        if (originalCode.includes('.of') || originalCode.includes('.relabel')) {
            suggestions.push('The code contains unsupported syntax patterns');
        }

        if (originalCode.includes('varNode') || originalCode.includes('varClose')) {
            suggestions.push('Custom variable syntax is not supported');
        }

        const suggestionText = suggestions.length > 0 
            ? `\n\nSuggestions:\n${suggestions.map(s => `• ${s}`).join('\n')}`
            : '';

        return `
            <div class="mermaid-error">
                <h4>🚫 Mermaid Diagram Error</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                ${suggestionText}
                <details>
                    <summary>View original code</summary>
                    <pre><code>${originalCode}</code></pre>
                </details>
                <p><em>Try asking for a simpler diagram or check the <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank">mermaid documentation</a> for correct syntax.</em></p>
            </div>
        `;
    }

    async copyMessageAsMarkdown(content, buttonElement) {
        try {
            // Copy the raw markdown content to clipboard
            await navigator.clipboard.writeText(content);
            
            // Show visual feedback
            this.showCopyFeedback(buttonElement);
            
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = content;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                this.showCopyFeedback(buttonElement);
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                this.showCopyError(buttonElement);
            }
        }
    }
    
    showCopyFeedback(buttonElement) {
        // Store original content
        const originalHTML = buttonElement.innerHTML;
        const originalTitle = buttonElement.title;
        
        // Update button to show success
        buttonElement.classList.add('copied');
        buttonElement.title = 'Copied!';
        buttonElement.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
        `;
        
        // Reset after 2 seconds
        setTimeout(() => {
            buttonElement.classList.remove('copied');
            buttonElement.title = originalTitle;
            buttonElement.innerHTML = originalHTML;
        }, 2000);
    }
    
    showCopyError(buttonElement) {
        // Store original content
        const originalHTML = buttonElement.innerHTML;
        const originalTitle = buttonElement.title;
        
        // Update button to show error
        buttonElement.style.color = '#ef4444';
        buttonElement.title = 'Copy failed';
        buttonElement.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `;
        
        // Reset after 2 seconds
        setTimeout(() => {
            buttonElement.style.color = '';
            buttonElement.title = originalTitle;
            buttonElement.innerHTML = originalHTML;
        }, 2000);
    }

    updateHeaderModelName(modelName) {
        if (!this.headerModelInfo) {
            return;
        }
        
        // Extract just the short name from the full model name
        let shortName = modelName;
        if (modelName.includes('Phi-3.5')) {
            shortName = 'Phi-3.5 Mini';
        } else if (modelName.includes('Llama-3.2-3B')) {
            shortName = 'Llama 3.2 3B';
        } else if (modelName.includes('Llama-3.2-1B')) {
            shortName = 'Llama 3.2 1B';
        } else if (modelName.includes('Qwen2.5-3B')) {
            shortName = 'Qwen 2.5 3B';
        } else if (modelName.includes('gemma-2-2b')) {
            shortName = 'Gemma 2 2B';
        }
        
        this.headerModelInfo.textContent = shortName;
    }
}