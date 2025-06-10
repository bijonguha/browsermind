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
            
            if (!navigator.gpu) {
                console.error('WebGPU not supported in this browser');
                statusCallback('WebGPU not supported', 'error');
                
                // Show a more user-friendly error if the compatibility check didn't catch this
                if (!window.browserCompatibility || !document.querySelector('.compatibility-modal')) {
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

            if (this.engine) {
                this.engine = null;
            }

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

    async generateResponse(messages) {
        if (!this.engine || this.isLoading) {
            throw new Error('Engine not ready');
        }

        this.isLoading = true;
        try {
            const response = await this.engine.chat.completions.create({
                messages: messages,
                stream: false,
                max_tokens: 512,
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } finally {
            this.isLoading = false;
        }
    }

    getCurrentModel() {
        return this.availableModels.find(m => m.id === this.currentModel);
    }
    
    /**
     * Show a compatibility error message if WebGPU is not supported
     * This is a fallback in case the browser-compatibility.js check doesn't catch it
     */
    showCompatibilityError() {
        // Create a simple error message if the full compatibility modal isn't already shown
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #fee2e2;
            color: #dc2626;
            padding: 16px;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 16px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        `;
        
        errorDiv.innerHTML = `
            <strong>Browser Compatibility Error:</strong>
            Your browser doesn't support WebGPU, which is required to run AI models in BrowserMind.
            Please use a modern browser like Chrome 113+, Edge 113+, or Safari 17+.
        `;
        
        document.body.prepend(errorDiv);
    }
}