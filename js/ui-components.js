export class UIComponents {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Status and progress elements
        this.statusElement = document.getElementById('status');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
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
        
        // Sidebar elements
        this.hamburgerBtn = document.getElementById('hamburgerBtn');
        this.rightSidebar = document.getElementById('rightSidebar');
        this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.chatHistoryList = document.getElementById('chatHistoryList');
        
        // Collapsible sections
        this.sectionHeaders = document.querySelectorAll('.section-header');
        this.collapsibleSections = document.querySelectorAll('.collapsible-section');
    }

    updateStatus(text, type = 'loading') {
        const statusSpan = this.statusElement.querySelector('span');
        if (statusSpan) {
            statusSpan.textContent = text;
        }
        this.statusElement.className = `status-indicator ${type}`;
    }

    showProgress(show = true) {
        this.progressContainer.classList.toggle('show', show);
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    showLoading(show = true) {
        this.loadingIndicator.classList.toggle('show', show);
    }

    setInputEnabled(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        if (enabled) {
            this.messageInput.focus();
        }
    }

    clearInput() {
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
    }

    addMessage(content, type = 'user', saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
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
}