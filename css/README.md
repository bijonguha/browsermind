# CSS Modules Documentation

## Module Overview

### 🎨 **base.css** - Foundation Styles
Core styling foundation for the entire application.

**Contains:**
- CSS Reset and normalization
- Root variables and theming
- Base typography and colors
- Common animations (@keyframes)
- Utility classes and button styles

**Key Features:**
- CSS custom properties for theming
- Consistent color palette
- Smooth animations (pulse, slideUp, thinking)

---

### 🏠 **sidebar.css** - Left Sidebar
Styling for the main left sidebar and its components.

**Contains:**
- Logo and branding styles
- Status indicators
- New chat button
- Info cards
- Sidebar layout and positioning

**Key Components:**
- `.sidebar` - Main container
- `.logo-section` - Branding area
- `.status-indicator` - Connection status
- `.new-chat-btn` - Primary action button

---

### 📱 **right-sidebar.css** - Right Sidebar
Collapsible right sidebar with organized sections.

**Contains:**
- Sidebar positioning and animations
- Collapsible section mechanics
- Header and close button styles
- Overlay for mobile

**Key Components:**
- `.right-sidebar` - Main container with slide animation
- `.collapsible-section` - Expandable content areas
- `.section-header` - Clickable section toggles
- `.sidebar-overlay` - Mobile background overlay

---

### 💬 **chat.css** - Chat Interface
Main chat area including messages and conversation flow.

**Contains:**
- Chat container layout
- Message bubbles and styling
- Chat header and navigation
- Hamburger menu animation
- Welcome message styling

**Key Components:**
- `.chat-container` - Main chat area
- `.message` - Individual message bubbles
- `.message.user` / `.message.assistant` - Message types
- `.hamburger-btn` - Animated menu toggle

---

### 🔧 **components.css** - Reusable Components
Shared UI components used throughout the application.

**Contains:**
- Progress bars and loading indicators
- Input fields and buttons
- Chat history lists
- Action buttons
- Copy functionality

**Key Components:**
- `.progress-container` - Model loading progress
- `.input-container` - Message input area
- `.chat-history-list` - Conversation history
- `.copy-btn` - Message copy functionality

---

### 🤖 **models.css** - Model Selection
AI model selection and management interface.

**Contains:**
- Model cards and selection
- Status indicators for models
- Current model display
- Loading states
- Model badges and icons

**Key Components:**
- `.model-card` - Individual model selection
- `.model-status` - Loading/available/error states
- `.model-badge` - Current/available indicators
- `.current-model-info` - Active model display

---

### 📄 **content.css** - Content Rendering
Markdown content and mermaid diagram styling.

**Contains:**
- Markdown element styling
- Code syntax highlighting
- Mermaid diagram containers
- Table styling
- Link and typography

**Key Components:**
- `.message-content` - Markdown container
- `.mermaid-container` - Diagram wrapper
- `.mermaid-error` - Error message styling
- Code blocks and syntax highlighting

---

### 📱 **responsive.css** - Mobile Adaptations
Mobile-first responsive design adaptations.

**Contains:**
- Breakpoint-specific styles
- Mobile layout adjustments
- Touch-friendly sizing
- Responsive typography
- Mobile sidebar behavior

**Breakpoints:**
- `@media (max-width: 768px)` - Tablet and small desktop
- `@media (max-width: 480px)` - Mobile phones

## CSS Architecture

### Design System

```css
/* Color Palette */
--primary: #8b5cf6 (Purple)
--secondary: #06b6d4 (Cyan)
--success: #10b981 (Green)
--warning: #fbbf24 (Yellow)
--error: #ef4444 (Red)

/* Typography */
--font-primary: 'Inter' (UI Text)
--font-mono: 'JetBrains Mono' (Code)

/* Spacing */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

### Component Hierarchy

```
base.css (Foundation)
├── sidebar.css (Left UI)
├── right-sidebar.css (Right UI)
├── chat.css (Main Content)
├── components.css (Shared Elements)
├── models.css (AI Models)
├── content.css (Message Content)
└── responsive.css (Mobile Overrides)
```

### Naming Conventions

- **BEM-inspired**: `.component__element--modifier`
- **Semantic naming**: Focus on purpose, not appearance
- **State classes**: `.is-active`, `.is-loading`, `.is-collapsed`
- **Utility classes**: `.sr-only`, `.visually-hidden`

### Performance Optimizations

- **Minimal specificity**: Avoid deep nesting
- **CSS containment**: Isolation for complex components
- **Hardware acceleration**: `transform` and `opacity` for animations
- **Efficient selectors**: Class-based targeting

### Accessibility Features

- **High contrast**: WCAG AA compliant colors
- **Focus indicators**: Visible keyboard navigation
- **Screen reader support**: Semantic HTML structure
- **Reduced motion**: Respects `prefers-reduced-motion`

## Customization Guide

### Theme Customization

Modify CSS custom properties in `base.css`:

```css
:root {
    --primary: #your-color;
    --background: #your-background;
    --text-primary: #your-text-color;
}
```

### Component Customization

Each component can be customized by overriding specific classes:

```css
/* Custom message styling */
.message.assistant {
    background: your-custom-gradient;
    border-radius: your-custom-radius;
}
```

### Responsive Customization

Add custom breakpoints in `responsive.css`:

```css
@media (max-width: your-breakpoint) {
    /* Your custom responsive styles */
}
```