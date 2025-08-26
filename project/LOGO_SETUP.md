# GlenceGauge Logo Setup Instructions

This document explains how to add your custom GlenceGauge logo to the application.

## Where to Place Your Logo Files

Place your logo files in the `public` directory with these exact names:

```
public/
├── glence-logo.svg           # Main logo (SVG format - recommended)
├── glence-logo-16x16.png     # Small favicon (16x16 pixels)
├── glence-logo-32x32.png     # Standard favicon (32x32 pixels)
├── glence-logo-180x180.png   # Apple touch icon (180x180 pixels)
└── vite.svg                  # Fallback logo (already exists)
```

## Recommended Logo Formats and Sizes

### 1. Main Logo (glence-logo.svg)
- **Format**: SVG (Scalable Vector Graphics)
- **Why SVG**: Works at any size, small file size, crisp on all displays
- **Requirements**: Should work well in both light and dark backgrounds
- **Dimensions**: Vector format (no specific pixel dimensions needed)

### 2. Favicon Versions (PNG format)
- **glence-logo-16x16.png**: 16×16 pixels (browser tab icon)
- **glence-logo-32x32.png**: 32×32 pixels (bookmark icon, desktop shortcut)
- **glence-logo-180x180.png**: 180×180 pixels (Apple devices when adding to home screen)

## Logo Design Recommendations

### Visual Guidelines
- **Simple and clean**: Should be recognizable at small sizes
- **High contrast**: Must be visible on both light and dark backgrounds
- **Professional appearance**: Suitable for business/industrial application
- **Gauge/Tank theme**: Related to fuel tank monitoring if possible

### Technical Requirements
- **SVG**: Use clean paths, avoid complex gradients that might not render well
- **PNG**: Use transparent backgrounds where appropriate
- **Color scheme**: Consider using your brand colors or complementary colors to the app's blue theme

## How the Logo System Works

### Automatic Fallback
The application automatically tries to load your custom logo first, then falls back to the default Gauge icon if your logo files don't exist.

### Using the Logo Component
You can use the logo component anywhere in the application:

```tsx
import { Logo, LogoIcon } from './components/Logo';

// Full logo with text
<Logo size="lg" showText={true} />

// Icon only
<LogoIcon size="md" />

// Different variants
<Logo variant="white" size="xl" />  // For dark backgrounds
<Logo variant="dark" size="sm" />   // For light backgrounds
```

## Where Logos Appear

Your logo will appear in:
- ✅ Browser tab (favicon)
- ✅ Browser bookmarks
- ✅ Mobile device home screen (when app is added)
- ✅ Application components (when you use the Logo component)

## Testing Your Logo

1. Place your logo files in the `public` directory
2. Start the development server: `npm run dev`
3. Check the browser tab for your favicon
4. Use the Logo component in your React components to display the logo

## Example Logo Usage in Components

```tsx
// In a header component
<header className="bg-white shadow-sm">
  <Logo size="lg" showText={true} />
</header>

// In a sidebar
<div className="sidebar">
  <LogoIcon size="md" className="mb-4" />
</div>

// On a dark background
<div className="bg-gray-900 p-4">
  <Logo variant="white" size="xl" />
</div>
```

## Need Help?

If you need help with:
- Converting your logo to different formats
- Creating the required sizes
- Integrating the logo into specific components

Just let me know and I can assist you further!
