# 🎨 BrowserMind Visual Assets

This directory contains all visual assets for BrowserMind including logos, icons, screenshots, and social media assets.

## 📁 Directory Structure

```
images/
├── logos/          # Main logos and branding
├── icons/          # Application icons and favicons
├── screenshots/    # Application screenshots
├── social/         # Social media assets
└── README.md       # This file
```

## 🖼️ Asset Categories

### Logos (`logos/`)
- **Primary Logo** - Main BrowserMind logo with text
- **Logo Mark** - Icon-only version
- **Horizontal Logo** - Wide format for headers
- **Vertical Logo** - Stacked format
- **Light/Dark Variants** - For different backgrounds

### Icons (`icons/`)
- **Favicon** - Browser tab icon (16x16, 32x32, 48x48)
- **App Icons** - Various sizes for different platforms
- **Feature Icons** - Icons for specific features
- **Status Icons** - Loading, success, error indicators

### Screenshots (`screenshots/`)
- **Hero Image** - Main application screenshot
- **Feature Demonstrations** - Key feature highlights
- **Mobile Views** - Responsive design examples
- **Interface Overview** - Complete UI walkthrough

### Social Media (`social/`)
- **Open Graph** - Social sharing previews (1200x630)
- **Twitter Cards** - Twitter sharing format
- **GitHub Social** - Repository preview image
- **LinkedIn** - Professional network sharing

## 🎨 Design Guidelines

### Color Palette
```css
Primary Gradient: linear-gradient(135deg, #8b5cf6, #06b6d4)
Purple: #8b5cf6
Cyan: #06b6d4
Dark Blue: #0f0f23
Navy: #1a1a2e
Steel Blue: #16213e
```

### Typography
- **Primary Font**: Inter (Modern, clean sans-serif)
- **Monospace Font**: JetBrains Mono (Code and technical text)
- **Logo Font**: Inter Bold/ExtraBold

### Logo Concepts
1. **Brain + Browser**: Neural network pattern inside browser window
2. **Circuit Brain**: Brain with circuit board patterns
3. **Gradient Orb**: Abstract brain/mind representation
4. **Minimalist**: Clean geometric brain icon

## 📐 Standard Sizes

### Favicons
- `favicon-16x16.png` - Browser tab
- `favicon-32x32.png` - Browser bookmark
- `favicon-48x48.png` - Desktop shortcut
- `favicon.ico` - Multi-size ICO file

### App Icons
- `icon-192x192.png` - Android Chrome
- `icon-512x512.png` - Android Chrome (high-res)
- `apple-touch-icon.png` - iOS Safari (180x180)

### Logos
- `logo-primary.svg` - Main scalable logo
- `logo-horizontal.svg` - Wide format
- `logo-mark.svg` - Icon only
- `logo-white.svg` - Light backgrounds
- `logo-dark.svg` - Dark backgrounds

### Social Assets
- `og-image.png` - 1200x630 (Open Graph)
- `twitter-card.png` - 1200x600 (Twitter)
- `github-social.png` - 1280x640 (GitHub)

## 🔧 Usage Guidelines

### Logo Usage
- **Minimum Size**: 32px height for logo mark
- **Clear Space**: 0.5x logo height on all sides
- **Color Variants**: Use appropriate contrast for backgrounds
- **Don't**: Distort, rotate, or modify colors

### Icon Usage
- **Consistent Style**: Maintain 2px stroke weight
- **Color Harmony**: Use brand color palette
- **Accessibility**: Ensure sufficient contrast (4.5:1 minimum)

### File Formats
- **SVG**: Scalable graphics, logos, icons
- **PNG**: Screenshots, social media, favicons
- **ICO**: Multi-size favicon for IE/legacy support
- **WebP**: Optimized web images (future consideration)

## 🚀 Implementation

### HTML Integration
```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="images/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="images/icons/favicon-16x16.png">
<link rel="apple-touch-icon" href="images/icons/apple-touch-icon.png">

<!-- Open Graph -->
<meta property="og:image" content="images/social/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:image" content="images/social/twitter-card.png">
```

### CSS Integration
```css
/* Logo in header */
.logo-icon {
    background-image: url('../images/logos/logo-mark.svg');
    background-size: contain;
    background-repeat: no-repeat;
}

/* Feature icons */
.icon-models { background-image: url('../images/icons/models.svg'); }
.icon-chat { background-image: url('../images/icons/chat.svg'); }
.icon-settings { background-image: url('../images/icons/settings.svg'); }
```

## 🎯 Asset Creation Checklist

### Logos
- [ ] Primary logo with text
- [ ] Icon-only logo mark
- [ ] Horizontal layout version
- [ ] Light/dark variants
- [ ] Multiple formats (SVG, PNG)

### Icons
- [ ] Favicon set (16, 32, 48px)
- [ ] App icons (192, 512px)
- [ ] Apple touch icon (180px)
- [ ] Feature icons (SVG)

### Screenshots
- [ ] Hero/main interface
- [ ] Model selection view
- [ ] Chat interface
- [ ] Mobile responsive view
- [ ] Settings/sidebar views

### Social Media
- [ ] Open Graph image (1200x630)
- [ ] Twitter card (1200x600)
- [ ] GitHub social preview
- [ ] LinkedIn sharing format

## 📱 Mobile Considerations

### iOS (iPhone/iPad)
- Apple Touch Icon: 180x180px
- iOS Splash Screen: Various sizes
- App Store Icon: 1024x1024px (if creating PWA)

### Android
- Chrome Icon: 192x192px, 512x512px
- Adaptive Icon: Foreground + Background layers
- Play Store Icon: 512x512px (if creating PWA)

### Windows
- Live Tile: 150x150px, 310x310px
- App Icon: 44x44px, 150x150px

## 🎨 Design Tools & Resources

### Recommended Tools
- **Figma** - Web-based design tool
- **Adobe Illustrator** - Vector graphics
- **Inkscape** - Free SVG editor
- **GIMP** - Free raster editor

### Icon Libraries
- **Heroicons** - UI icons
- **Lucide** - Feature icons
- **Phosphor Icons** - System icons
- **Tabler Icons** - Interface icons

### Color Tools
- **Coolors.co** - Palette generator
- **Adobe Color** - Color wheel
- **Contrast Checker** - Accessibility testing

## 📋 Brand Guidelines

### Do's
✅ Use official color palette
✅ Maintain consistent spacing
✅ Ensure high contrast
✅ Use SVG for scalable graphics
✅ Optimize file sizes

### Don'ts
❌ Modify logo colors
❌ Distort proportions
❌ Use low-resolution images
❌ Ignore accessibility
❌ Mix different icon styles

---

*All assets should reflect BrowserMind's core values: Privacy, Performance, and Modern Design*