import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

export class WebLLMEngine {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.currentModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
        this.availableModels = this.getAvailableModels();
        this.systemPrompt = `You are an AI assistant running locally in the user's browser via WebLLM. You can reference our current conversation for context.

Core behaviors:
- Provide clear, actionable answers
- Reference previous messages when relevant
- Ask for clarification when needed
- Be honest about limitations
- Keep responses focused and concise

Capabilities:
- Code analysis and debugging
- Text writing and editing
- Explanations and problem-solving
- Building on our conversation topics

Tone: Professional, conversational, and helpful.

Note: You process everything locally for privacy. If you need context from outside our conversation, please ask.`;
        this.loadSavedModel();
    }

    getAvailableModels() {
        return [
            {
                id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
                name: "Phi-3.5 Mini Instruct",
                size: "~2.4GB",
                description: "Fast and efficient small language model, perfect for chat and general tasks",
                icon: "🤖",
                features: ["Chat", "Code", "Reasoning"],
                status: "available"
            },
            {
                id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
                name: "Llama 3.2 3B Instruct",
                size: "~2.0GB", 
                description: "Meta's efficient model with strong reasoning capabilities",
                icon: "🦙",
                features: ["Chat", "Reasoning", "Code"],
                status: "available"
            },
            {
                id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
                name: "Qwen 2.5 3B Instruct",
                size: "~2.1GB",
                description: "Alibaba's multilingual model with strong performance",
                icon: "🏮",
                features: ["Chat", "Multilingual", "Code"],
                status: "available"
            },
            {
                id: "gemma-2-2b-it-q4f16_1-MLC",
                name: "Gemma 2 2B Instruct",
                size: "~1.4GB",
                description: "Google's compact model with good performance",
                icon: "💎",
                features: ["Chat", "Fast", "Efficient"],
                status: "available"
            },
            {
                id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
                name: "Llama 3.2 1B Instruct",
                size: "~0.9GB",
                description: "Ultra-compact model for basic chat tasks",
                icon: "🚀",
                features: ["Chat", "Ultra-fast", "Minimal"],
                status: "loaded"
            }
        ];
    }

    loadSavedModel() {
        const savedModel = localStorage.getItem('webllm_current_model');
        if (savedModel && this.availableModels.find(m => m.id === savedModel)) {
            this.currentModel = savedModel;
        }
    }

    async initializeEngine(progressCallback, statusCallback) {
        try {
            statusCallback('Checking WebGPU support...', 'loading');
            
            // Enhanced WebGPU support check
            if (window.BrowserUtils && window.BrowserUtils.checkWebGPUSupport) {
                const webGPUResult = await window.BrowserUtils.checkWebGPUSupport();
                if (!webGPUResult.supported) {
                    const errorMessage = `WebGPU not functional: ${webGPUResult.reason}`;
                    console.error(errorMessage);
                    statusCallback(errorMessage, 'error');
                    
                    // Show compatibility error if not already shown
                    if (!document.querySelector('.compatibility-modal')) {
                        this.showCompatibilityError(webGPUResult);
                    }
                    
                    throw new Error(errorMessage);
                }
                console.log('✅ WebGPU functional check passed:', webGPUResult);
            } else if (!navigator.gpu) {
                console.error('WebGPU not supported in this browser');
                statusCallback('WebGPU not supported', 'error');
                
                // Show a more user-friendly error if the compatibility check didn't catch this
                if (!document.querySelector('.compatibility-modal')) {
                    this.showCompatibilityError();
                }
                
                throw new Error('WebGPU not supported in this browser');
            }

            statusCallback('Loading model...', 'loading');

            this.engine = await CreateMLCEngine(
                this.currentModel,
                {
                    initProgressCallback: progressCallback
                }
            );

            statusCallback('Ready!', 'ready');
            return true;

        } catch (error) {
            console.error('Error initializing WebLLM:', error);
            statusCallback('Error loading model', 'error');
            throw error;
        }
    }

    async switchModel(modelId, progressCallback, statusCallback) {
        const model = this.availableModels.find(m => m.id === modelId);
        if (!model || model.id === this.currentModel) return false;

        try {
            model.status = 'loading';
            statusCallback(`Switching to ${model.name}...`, 'loading');

            // Properly dispose of the current engine
            await this.disposeEngine();

            this.currentModel = modelId;
            this.engine = await CreateMLCEngine(
                modelId,
                {
                    initProgressCallback: progressCallback
                }
            );

            model.status = 'loaded';
            this.availableModels.forEach(m => {
                if (m.id !== modelId && m.status === 'loaded') {
                    m.status = 'available';
                }
            });

            localStorage.setItem('webllm_current_model', modelId);
            statusCallback('Ready!', 'ready');
            return true;

        } catch (error) {
            console.error('Error switching model:', error);
            model.status = 'error';
            statusCallback('Error loading model', 'error');
            throw error;
        }
    }

    /**
     * Properly dispose of the current engine to free memory
     */
    async disposeEngine() {
        if (this.engine) {
            try {
                // Call dispose if available
                if (typeof this.engine.dispose === 'function') {
                    await this.engine.dispose();
                }
                
                // Clear reference
                this.engine = null;
                
                // Suggest garbage collection
                if (window.gc) {
                    window.gc();
                }
                
                console.log('🧹 Engine disposed and memory cleaned');
                
            } catch (error) {
                console.warn('⚠️ Engine disposal failed:', error);
                this.engine = null;
            }
        }
    }

    /**
     * Check device capabilities and optimize settings accordingly
     */
    getOptimizedSettings() {
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection;
        
        // Base settings
        let settings = {
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.9
        };
        
        // Optimize for low-memory devices
        if (deviceMemory < 4) {
            settings.max_tokens = 256;
            console.log('📱 Optimized settings for low-memory device');
        }
        
        // Optimize for slow connections
        if (connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g')) {
            settings.max_tokens = Math.min(settings.max_tokens, 256);
            console.log('🌐 Optimized settings for slow connection');
        }
        
        return settings;
    }

    async generateResponse(messages) {
        if (!this.engine || this.isLoading) {
            throw new Error('Engine not ready');
        }

        this.isLoading = true;
        try {
            // Get optimized settings for current device
            const settings = this.getOptimizedSettings();
            
            const response = await this.engine.chat.completions.create({
                messages: messages,
                stream: false,
                max_tokens: settings.max_tokens,
                temperature: settings.temperature,
                top_p: settings.top_p
            });

            return response.choices[0].message.content;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
            };
        }
        return null;
    }

    /**
     * Force garbage collection and cleanup
     */
    forceCleanup() {
        // Clear any cached data
        if (this.engine && typeof this.engine.clearCache === 'function') {
            this.engine.clearCache();
        }
        
        // Suggest garbage collection
        if (window.gc) {
            window.gc();
        }
        
        console.log('🧹 Forced cleanup completed');
    }

    getCurrentModel() {
        return this.availableModels.find(m => m.id === this.currentModel);
    }
    
    /**
     * Show a compatibility error message if WebGPU is not supported
     * This is a fallback in case the browser-compatibility.js check doesn't catch it
     */
    showCompatibilityError(webGPUResult = null) {
        // Use the centralized compatibility modal if available
        if (window.BrowserCompatibility) {
            const compatibility = new window.BrowserCompatibility();
            compatibility.showIncompatibilityModal(false, true, webGPUResult);
            return;
        }
        
        // Fallback to simple error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 16px;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 16px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
            border-bottom: 4px solid #dc2626;
        `;
        
        let errorMessage = 'Your browser doesn\'t support WebGPU, which is required to run AI models in BrowserMind.';
        if (webGPUResult) {
            errorMessage += ` (${webGPUResult.reason})`;
        }
        
        errorDiv.innerHTML = `
            <strong>Browser Compatibility Error:</strong>
            ${errorMessage}
            Please use a modern browser like Chrome 113+, Edge 113+, or Safari 17+.
        `;
        
        document.body.prepend(errorDiv);
    }
}