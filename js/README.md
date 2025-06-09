# JavaScript Modules Documentation

## Module Overview

### 🚀 **app.js** - Main Application
The main orchestrator that ties all modules together.

**Key Responsibilities:**
- Application initialization
- Event coordination between modules
- Error handling and recovery
- Lifecycle management

**Key Methods:**
- `constructor()` - Initialize all modules
- `sendMessage()` - Handle user input and AI responses
- `switchModel()` - Coordinate model switching
- `exportConversation()` - Handle conversation exports

---

### ⚙️ **webllm-engine.js** - AI Engine Management
Handles all WebLLM operations and model management.

**Key Responsibilities:**
- WebLLM engine initialization
- Model loading and switching
- AI response generation
- GPU/WebGPU integration

**Key Methods:**
- `initializeEngine()` - Set up WebLLM with progress tracking
- `switchModel()` - Switch between different AI models
- `generateResponse()` - Generate AI responses from messages
- `getAvailableModels()` - Define available model configurations

---

### 💬 **chat-manager.js** - Conversation Management
Manages all chat history, archiving, and conversation state.

**Key Responsibilities:**
- Message history management
- Conversation archiving
- Chat restoration
- Export functionality

**Key Methods:**
- `addMessage()` - Add new messages to history
- `startNewChat()` - Archive current and start fresh
- `restoreConversation()` - Load archived conversations
- `exportConversation()` - Generate markdown/JSON exports

---

### 🎨 **ui-components.js** - User Interface
Handles all UI rendering, interactions, and visual feedback.

**Key Responsibilities:**
- Message rendering (markdown + mermaid)
- Visual feedback (progress, status)
- Copy-to-clipboard functionality
- Input/output management

**Key Methods:**
- `addMessage()` - Render messages with markdown support
- `renderContentWithMermaid()` - Process and render mermaid diagrams
- `updateStatus()` - Update application status indicators
- `copyMessageAsMarkdown()` - Handle message copying

---

### 📱 **sidebar-manager.js** - Sidebar Management
Manages sidebar state, collapsible sections, and related UI.

**Key Responsibilities:**
- Sidebar open/close state
- Collapsible section management
- Model list rendering
- Chat history display

**Key Methods:**
- `toggleSection()` - Handle collapsible section interactions
- `renderModelList()` - Display available models
- `updateChatHistoryDisplay()` - Show conversation history
- `saveSectionStates()` - Persist UI state

## Data Flow

```
User Input → app.js → chat-manager.js → webllm-engine.js
                 ↓
            ui-components.js ← sidebar-manager.js
```

## Module Dependencies

```
app.js
├── webllm-engine.js
├── chat-manager.js
├── ui-components.js
└── sidebar-manager.js
    └── ui-components.js
```

## Event Flow

1. **User types message** → `app.js:sendMessage()`
2. **Message added to history** → `chat-manager.js:addMessage()`
3. **UI updated** → `ui-components.js:addMessage()`
4. **AI generates response** → `webllm-engine.js:generateResponse()`
5. **Response rendered** → `ui-components.js:addMessage()`
6. **History updated** → `chat-manager.js:addMessage()`

## Error Handling

Each module implements robust error handling:
- **webllm-engine.js**: GPU/model loading errors
- **chat-manager.js**: Storage and data persistence errors
- **ui-components.js**: Rendering and clipboard errors
- **sidebar-manager.js**: UI state and interaction errors

## Performance Considerations

- **Lazy loading**: Modules only initialize what's needed
- **Event delegation**: Efficient event handling for dynamic content
- **Memory management**: Proper cleanup of resources
- **Debouncing**: Input handling optimization