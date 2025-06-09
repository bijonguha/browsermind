<div align="center">
  <img src="images/logos/logo-primary.svg" alt="BrowserMind Logo" width="300">
  
  **AI That Lives in Your Browser** - A private, secure, and powerful AI chat interface that runs entirely in your web browser using WebLLM and WebGPU.

  ![BrowserMind](https://img.shields.io/badge/AI-Local%20%26%20Private-brightgreen)
  ![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-blue)
  ![ES6 Modules](https://img.shields.io/badge/ES6-Modules-yellow)
  ![No Server](https://img.shields.io/badge/Server-None%20Required-red)
</div>

## ✨ Features

### 🔒 **Privacy First**
- **100% Local Processing** - No data ever leaves your browser
- **No Server Required** - Everything runs client-side
- **Private Conversations** - Your chats stay on your device

### 🤖 **AI Capabilities**
- **Multiple Models** - Choose from 5 different AI models
- **Real-time Chat** - Fast, responsive conversations
- **Markdown Support** - Rich text formatting with code highlighting
- **Mermaid Diagrams** - Interactive flowcharts and diagrams
- **Conversation Memory** - Maintains context across messages

### 💾 **Smart Management**
- **Conversation History** - Automatic saving and restoration
- **Chat Archiving** - Organize and manage multiple conversations
- **Export Options** - Download chats as Markdown or JSON
- **Model Switching** - Switch between AI models mid-conversation

### 🎨 **Modern Interface**
- **Collapsible Sidebar** - Organized, space-efficient design
- **Dark Theme** - Eye-friendly interface
- **Responsive Design** - Works on desktop and mobile
- **Copy Messages** - One-click markdown copying
- **Progress Tracking** - Visual feedback for model loading

## 🚀 Getting Started

### Prerequisites

- **Modern Browser** with WebGPU support:
  - Chrome 113+ (recommended)
  - Edge 113+
  - Firefox 115+ (experimental)
- **GPU** - Discrete GPU recommended for better performance
- **RAM** - At least 8GB system RAM

### Installation

1. **Clone or Download** this repository
2. **Open `index.html`** in your browser
3. **Wait for Model Loading** - First launch downloads ~2.4GB AI model
4. **Start Chatting!** - Your AI assistant is ready

```bash
# Clone the repository
git clone https://github.com/your-username/browsermind.git
cd browsermind

# Open in browser (any local server or file:// protocol)
python -m http.server 8000  # Optional: for local development
```

## 🏗️ Architecture

### Modular Design

BrowserMind is built with a clean, modular architecture:

```
browsermind/
├── index.html              # Main HTML structure
├── css/                    # Stylesheets (modular)
│   ├── base.css           # Core styles & animations
│   ├── sidebar.css        # Left sidebar components
│   ├── right-sidebar.css  # Right sidebar & collapsible sections
│   ├── chat.css           # Chat interface & messages
│   ├── components.css     # Reusable UI components
│   ├── models.css         # Model selection interface
│   ├── content.css        # Markdown & mermaid styling
│   └── responsive.css     # Mobile & responsive design
├── js/                     # JavaScript modules
│   ├── app.js             # Main application orchestration
│   ├── webllm-engine.js   # WebLLM engine & model management
│   ├── chat-manager.js    # Conversation history & management
│   ├── ui-components.js   # UI rendering & interactions
│   └── sidebar-manager.js # Sidebar state & collapsible sections
└── README.md              # This file
```

### Key Components

#### 🔧 **WebLLM Engine** (`js/webllm-engine.js`)
- Model loading and initialization
- WebGPU integration
- Response generation
- Model switching capabilities

#### 💬 **Chat Manager** (`js/chat-manager.js`)
- Conversation history management
- Message threading and context
- Chat archiving and restoration
- Export functionality

#### 🎨 **UI Components** (`js/ui-components.js`)
- Message rendering (markdown + mermaid)
- Copy-to-clipboard functionality
- Progress indicators
- Visual feedback systems

#### 📱 **Sidebar Manager** (`js/sidebar-manager.js`)
- Collapsible section management
- Model selection interface
- Chat history display
- State persistence

## 🤖 Available AI Models

| Model | Size | Description | Best For |
|-------|------|-------------|----------|
| **Phi-3.5 Mini** | ~2.4GB | Fast, efficient model (default) | General chat, coding, reasoning |
| **Llama 3.2 3B** | ~2.0GB | Meta's efficient model | Strong reasoning, coding |
| **Qwen 2.5 3B** | ~2.1GB | Alibaba's multilingual model | Multilingual, coding, chat |
| **Gemma 2 2B** | ~1.4GB | Google's compact model | Fast responses, efficiency |
| **Llama 3.2 1B** | ~0.9GB | Ultra-compact model | Basic chat, minimal resources |

### Model Switching
- Switch models anytime during conversations
- Automatic download and caching
- Conversation context preserved
- Progress tracking during model loading

## 🎮 Usage Guide

### Basic Chat
1. Wait for the model to load (first time only)
2. Type your message in the input box
3. Press Enter or click Send
4. AI responds with markdown-formatted text

### Advanced Features

#### **Start New Chat**
- Click the "New Chat" button in the left sidebar
- Current conversation is automatically archived
- Fresh conversation context begins

#### **Switch AI Models**
1. Open the right sidebar (hamburger menu)
2. Expand the "AI Models" section
3. Click on any available model
4. Confirm the model switch
5. Wait for download/loading to complete

#### **Export Conversations**
1. Open right sidebar → Chat Management
2. Expand "Export Conversation"
3. Choose Markdown or JSON format
4. File downloads automatically

#### **Manage Chat History**
- View all previous conversations in the right sidebar
- Click any chat to restore it
- Delete unwanted conversations
- Conversations auto-save with smart titles

#### **Copy Messages**
- Hover over any AI response
- Click the copy icon at the bottom
- Markdown content copied to clipboard

## 🛠️ Development

### Local Development

```bash
# Serve locally (recommended for development)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### Code Structure

#### CSS Architecture
- **Modular stylesheets** for maintainability
- **BEM-like naming** for consistency
- **CSS custom properties** for theming
- **Mobile-first responsive design**

#### JavaScript Architecture
- **ES6 modules** for clean imports
- **Class-based components** for organization
- **Event delegation** for performance
- **Promise-based async operations**

### Key Technologies

- **WebLLM** - Browser-based AI inference
- **WebGPU** - GPU-accelerated computing
- **Marked.js** - Markdown parsing and rendering
- **Mermaid.js** - Diagram and flowchart rendering
- **CSS Grid/Flexbox** - Modern layout systems
- **ES6 Modules** - Clean, maintainable JavaScript

## 📝 Configuration

### Model Configuration

Models are defined in `js/webllm-engine.js`:

```javascript
getAvailableModels() {
    return [
        {
            id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
            name: "Phi-3.5 Mini Instruct",
            size: "~2.4GB",
            description: "Fast and efficient model",
            icon: "🤖",
            features: ["Chat", "Code", "Reasoning"],
            status: "loaded"
        },
        // ... more models
    ];
}
```

### UI Customization

Styling can be customized through CSS modules:

```css
/* css/base.css - Core theme colors */
:root {
    --primary-gradient: linear-gradient(135deg, #8b5cf6, #06b6d4);
    --background-gradient: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
}
```

## 🔧 Troubleshooting

### Common Issues

#### **Model Not Loading**
- **Check WebGPU Support**: Visit `chrome://gpu/` to verify WebGPU status
- **Update Browser**: Ensure you're using Chrome 113+ or Edge 113+
- **Clear Cache**: Use "Reset Everything" in settings if models are corrupted

#### **Performance Issues**
- **GPU Memory**: Close other GPU-intensive applications
- **Browser Memory**: Close unnecessary tabs
- **Model Size**: Try smaller models (Gemma 2B or Llama 1B)

#### **Storage Issues**
- **Disk Space**: Ensure 3-5GB free space for model caching
- **Clear Cache**: Use "Clear Model Cache" to free up space
- **Browser Limits**: Some browsers limit storage per origin

### WebGPU Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 113+ | ✅ Full Support |
| Edge | 113+ | ✅ Full Support |
| Firefox | 115+ | ⚠️ Experimental |
| Safari | - | ❌ Not Supported |

## 📊 Performance Tips

### Optimal Setup
- **Dedicated GPU** - NVIDIA GTX 1060+ or AMD RX 580+
- **16GB+ RAM** - For comfortable multitasking
- **SSD Storage** - Faster model loading
- **Stable Internet** - For initial model download

### Resource Management
- **Close unused tabs** - Free up GPU memory
- **Use smaller models** - If performance is poor
- **Clear cache regularly** - Prevent storage bloat
- **Monitor GPU usage** - Task Manager → Performance → GPU

## 🔒 Privacy & Security

### Data Privacy
- **No external servers** - Everything runs locally
- **No telemetry** - No usage data collected
- **No API calls** - No data sent to third parties
- **Local storage only** - Conversations saved in browser

### Security Features
- **Sandboxed execution** - Browser security model
- **HTTPS recommended** - For production deployment
- **No eval() usage** - Safe JavaScript practices
- **CSP compatible** - Content Security Policy ready

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure mobile compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebLLM Team** - For making browser-based AI possible
- **Marked.js** - Excellent markdown parsing
- **Mermaid.js** - Beautiful diagram rendering
- **WebGPU Working Group** - For the WebGPU specification

## 📞 Support

Having issues? Here's how to get help:

1. **Check this README** - Most questions are answered here
2. **Browser DevTools** - Check console for error messages
3. **GPU Compatibility** - Verify WebGPU support
4. **GitHub Issues** - Report bugs or request features

---

**Made with ❤️ for privacy-conscious AI enthusiasts**

*BrowserMind - Your AI, Your Browser, Your Privacy*
