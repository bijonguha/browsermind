<div align="center">
  <img src="images/logos/logo-primary.svg" alt="BrowserMind Logo" width="300">
  
  **AI That Lives in Your Browser** - A private, secure, and powerful AI chat interface that runs entirely in your web browser using WebLLM and WebGPU.

  ![BrowserMind](https://img.shields.io/badge/AI-Local%20%26%20Private-brightgreen)
  ![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-blue)
  ![ES6 Modules](https://img.shields.io/badge/ES6-Modules-yellow)
  ![No Server](https://img.shields.io/badge/Server-None%20Required-red)

  **[🚀 Try it here](https://browsermind.vercel.app/)**
</div>

## ✨ Features

- **100% Local Processing** - No data ever leaves your browser
- **Multiple AI Models** - Choose from 5 different models
- **Real-time Chat** - Fast, responsive conversations with markdown support
- **Conversation History** - Automatic saving and export options
- **Modern Interface** - Dark theme, responsive design

## 🚀 Getting Started

### Prerequisites
- Chrome 113+ or Edge 113+ (WebGPU support required)
- 8GB+ RAM and discrete GPU recommended

### Installation
1. Clone this repository
2. Open `index.html` in your browser
3. Wait for model loading (~2.4GB download on first run)
4. Start chatting!

```bash
git clone https://github.com/your-username/browsermind.git
cd browsermind
python -m http.server 8000  # Optional local server
```

## 🤖 Available Models

| Model | Size | Best For |
|-------|------|----------|
| **Phi-3.5 Mini** | ~2.4GB | General chat, coding, reasoning |
| **Llama 3.2 3B** | ~2.0GB | Strong reasoning, coding |
| **Qwen 2.5 3B** | ~2.1GB | Multilingual, coding, chat |
| **Gemma 2 2B** | ~1.4GB | Fast responses, efficiency |
| **Llama 3.2 1B** | ~0.9GB | Basic chat, minimal resources |

## 🔒 Privacy & Security

- **No external servers** - Everything runs locally
- **No telemetry** - No usage data collected
- **Local storage only** - Conversations saved in browser
- **Sandboxed execution** - Browser security model

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
