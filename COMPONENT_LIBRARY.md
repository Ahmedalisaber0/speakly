# Speakly Component Library

A comprehensive guide to all reusable components in the Speakly design system.

---

## Button Components

### Primary Button
Used for main CTAs and important actions.

```tsx
<button className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-smooth">
  Primary Action
</button>
```

**States:**
- Default: Full opacity
- Hover: `brightness(110%)`
- Active: `brightness(95%)`
- Disabled: `opacity-50`

### Secondary Button
For alternative or less important actions.

```tsx
<button className="px-6 py-3 rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--bg-muted)] transition-smooth">
  Secondary Action
</button>
```

### Ghost Button
Text-only button with minimal styling.

```tsx
<button className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-smooth">
  Ghost Action
</button>
```

### Icon Button
For icon-only interactions.

```tsx
<button className="w-10 h-10 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-muted)] flex items-center justify-center transition-smooth">
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
  </svg>
</button>
```

---

## Input Components

### Text Input
For single-line text entry.

```tsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-smooth"
/>
```

### Textarea
For multi-line text entry.

```tsx
<textarea
  placeholder="Enter text..."
  className="w-full h-32 p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-smooth"
/>
```

### Select Dropdown
For selecting from predefined options.

```tsx
<select className="w-full px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-smooth">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## Card Components

### Standard Card
General-purpose card for content grouping.

```tsx
<div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-sm hover:shadow-md transition-smooth">
  {/* Content */}
</div>
```

### Message Card - User
For user messages in chat.

```tsx
<div className="flex justify-end mb-3">
  <div className="max-w-[70%] px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white">
    User message here
  </div>
</div>
```

### Message Card - AI
For AI/assistant messages in chat.

```tsx
<div className="flex justify-start mb-3">
  <div className="max-w-[70%] px-4 py-3 rounded-xl bg-[var(--bg-muted)] text-[var(--text-primary)]">
    AI message here
  </div>
</div>
```

---

## Header/Navigation Components

### Main Header
Sticky header with navigation.

```tsx
<header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
  <div className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
    {/* Logo/Brand */}
    <nav className="hidden md:flex items-center gap-8">
      {/* Navigation Links */}
    </nav>
  </div>
</header>
```

### Navigation Link
For navigation items in header.

```tsx
<a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth">
  Link Text
</a>
```

**Active state:**
```tsx
<a href="#" className="text-sm text-[var(--color-primary)] font-medium">
  Active Link
</a>
```

---

## Form Components

### Form Group with Label
Complete form field with label and error message.

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-[var(--text-primary)]">
    Label Text
  </label>
  <input
    type="text"
    placeholder="Placeholder..."
    className="w-full px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
  />
  {error && <p className="text-xs text-[var(--color-accent)]">{error}</p>}
</div>
```

### Error State
Input with error styling.

```tsx
<input
  className="w-full px-4 py-2 rounded-lg border-2 border-[var(--color-accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
/>
<p className="mt-1 text-xs text-[var(--color-accent)]">Error message here</p>
```

### Success State
Input with success styling.

```tsx
<input
  className="w-full px-4 py-2 rounded-lg border-2 border-[var(--color-success)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
/>
```

---

## Alert/Notification Components

### Info Alert
For general information.

```tsx
<div className="p-4 rounded-lg bg-[#dbeafe] border border-[#60a5fa] text-[#1e40af] text-sm">
  Information message here
</div>
```

### Success Alert
For positive feedback.

```tsx
<div className="p-4 rounded-lg bg-[#dcfce7] border border-[#86efac] text-[#166534] text-sm">
  Success message here
</div>
```

### Warning Alert
For cautionary messages.

```tsx
<div className="p-4 rounded-lg bg-[#fef3c7] border border-[#fcd34d] text-[#92400e] text-sm">
  Warning message here
</div>
```

### Error Alert
For error messages.

```tsx
<div className="p-4 rounded-lg bg-[#fee2e2] border border-[var(--color-accent)] text-[var(--color-accent)] text-sm">
  Error message here
</div>
```

---

## Badge/Label Components

### Primary Badge
For highlighting primary information.

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-xs">
  Badge
</span>
```

### Secondary Badge
For secondary information.

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] font-medium text-xs">
  Badge
</span>
```

---

## Loading States

### Spinner
For indicating loading.

```tsx
<svg className="w-6 h-6 text-[var(--color-primary)] animate-spin-slow" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

### Pulse Animation
For subtle loading or attention.

```tsx
<div className="h-3 bg-[var(--bg-muted)] rounded animate-pulse-slow"></div>
```

---

## Layout Components

### Container
Maximum width container for content.

```tsx
<div className="max-w-6xl mx-auto">
  {/* Content */}
</div>
```

### Grid (2 Column)
Two-column responsive grid.

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>{/* Column 1 */}</div>
  <div>{/* Column 2 */}</div>
</div>
```

### Grid (3 Column)
Three-column responsive grid.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Flex Stack
Vertical flex container with spacing.

```tsx
<div className="space-y-4">
  {/* Items with gap */}
</div>
```

### Flex Row
Horizontal flex container with spacing.

```tsx
<div className="flex items-center gap-4">
  {/* Items with gap */}
</div>
```

---

## Modal/Overlay Components

### Modal Container
For modals and dialogs.

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-[var(--bg-primary)] rounded-xl p-8 max-w-md w-full shadow-lg">
    {/* Modal content */}
  </div>
</div>
```

---

## Accessibility Features

### Keyboard Focus
All interactive elements support keyboard navigation with visible focus:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### ARIA Labels
For icon-only buttons:

```tsx
<button aria-label="Close dialog">
  <svg>...</svg>
</button>
```

### Screen Reader Announcements
For dynamic content:

```tsx
<div role="status" aria-live="polite">
  {/* Updated content */}
</div>
```

---

## Dark Mode Support

All components automatically support dark mode through CSS variables. No additional styling needed:

```tsx
// Light mode (default)
--bg-primary: #FFFFFF
--text-primary: #2C2C2A

// Dark mode (automatic)
--bg-primary: #0F0F0F
--text-primary: #F5F4F1
```

---

## Responsive Breakpoints

### Mobile First
Base styles apply to all screen sizes.

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### Breakpoint Usage
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

---

## Animation Utilities

### Fade In
```tsx
<div className="animate-fade-in">Content</div>
```

### Slide Up
```tsx
<div className="animate-slide-up">Content</div>
```

### Slide Down
```tsx
<div className="animate-slide-down">Content</div>
```

### Slide Left
```tsx
<div className="animate-slide-left">Content</div>
```

### Slide Right
```tsx
<div className="animate-slide-right">Content</div>
```

### Spin (Loading)
```tsx
<svg className="animate-spin-slow">...</svg>
```

### Pulse
```tsx
<div className="animate-pulse-slow">Content</div>
```

### Smooth Transitions
```tsx
<div className="transition-smooth">Content</div>
```

---

## Usage Tips

1. **Always use CSS variables** for colors
2. **Use the spacing scale**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px)
3. **Maintain consistent border radius**: sm (4px), md (8px), lg (12px), xl (16px)
4. **Test dark mode** during development
5. **Ensure keyboard navigation** works for all interactive elements
6. **Use appropriate ARIA labels** for accessibility
7. **Test animations** don't cause performance issues
8. **Respect user's motion preferences** with `prefers-reduced-motion`

---

## Component Status

✅ Buttons (all variants)
✅ Inputs & Forms
✅ Cards
✅ Alerts
✅ Badges
✅ Loading States
✅ Navigation
✅ Layouts
✅ Animations
✅ Accessibility

All components follow the Speakly Design System v1.0 specifications.
