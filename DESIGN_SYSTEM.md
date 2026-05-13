# Speakly Design System v1.0
A modern, professional design system for the Speakly multilingual platform.

---

## Color Palette

### Primary Colors
- **Teal**: `#1D9E75` - Main interactive elements, CTAs, success states
- **Azure Blue**: `#378ADD` - Secondary interactive elements, highlights
- **Purple**: `#7F77DD` - Tertiary elements, alternative states

### Accent & Feedback
- **Coral**: `#D85A30` - Alerts, errors, emphasis, destructive actions
- **Success**: `#059669` - Positive feedback, confirmations

### Neutral System
- **Gray 900**: `#2C2C2A` - Primary text (dark mode backgrounds)
- **Gray 600**: `#5F5E5A` - Secondary text, muted content
- **Gray 300**: `#D5D3CF` - Borders, dividers (light mode)
- **Gray 100**: `#F5F4F1` - Light backgrounds, card backgrounds (light mode)

### Background & Surface
- **Light Mode**:
  - Background: `#FFFFFF` (white)
  - Card: `#F9F8F6` (off-white)
  - Muted: `#F5F4F1` (light gray)
  - Elevated: `#FFFFFF` (white for cards/modals)

- **Dark Mode**:
  - Background: `#0F0F0F` (near black)
  - Card: `#1A1A18` (dark gray)
  - Muted: `#262623` (medium dark)
  - Elevated: `#242422` (slightly lighter)

### CSS Variables Reference
```css
/* Primary */
--color-primary: #1D9E75;
--color-primary-dark: #158B63;
--color-primary-light: #35B986;

/* Azure */
--color-azure: #378ADD;
--color-azure-dark: #2970C2;
--color-azure-light: #5A9FE8;

/* Purple */
--color-purple: #7F77DD;
--color-purple-dark: #6B63C8;
--color-purple-light: #9B92F5;

/* Accent */
--color-accent: #D85A30;
--color-accent-dark: #C54A1F;
--color-accent-light: #E87A51;

/* Success */
--color-success: #059669;

/* Backgrounds & Text */
--bg-primary: #FFFFFF / #0F0F0F;
--bg-secondary: #F9F8F6 / #1A1A18;
--bg-muted: #F5F4F1 / #262623;
--bg-elevated: #FFFFFF / #242422;

--text-primary: #2C2C2A / #F5F4F1;
--text-secondary: #5F5E5A / #D5D3CF;
--text-tertiary: #8B8985 / #A3A09C;

--border-primary: #E5E3DF / #3A3A37;
--border-secondary: #D5D3CF / #4A4A47;
```

---

## Typography

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 32px | 700 | 1.2 | Page titles, main headers |
| H2 | 24px | 600 | 1.3 | Section headers |
| H3 | 20px | 600 | 1.4 | Subsection headers |
| Body | 16px | 400 | 1.6 | Main content, paragraphs |
| Small | 14px | 400 | 1.5 | Secondary content |
| Caption | 12px | 500 | 1.4 | Labels, metadata |

### Font Family
- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Fallback**: System fonts for maximum compatibility

### Font Weights
- **400**: Regular (body text)
- **500**: Medium (labels, buttons)
- **600**: Semibold (section headers)
- **700**: Bold (main headers)

---

## Spacing System

| Scale | Size | Usage |
|-------|------|-------|
| xs | 4px | Minimal spacing, tight layouts |
| sm | 8px | Small gaps, compact elements |
| md | 16px | Default spacing, padding |
| lg | 24px | Generous gaps, section spacing |
| xl | 32px | Large gaps, major sections |
| 2xl | 48px | Extra large spacing, hero sections |

---

## Border Radius

| Scale | Size | Usage |
|-------|------|-------|
| sm | 4px | Small buttons, inputs |
| md | 8px | Form elements, small cards |
| lg | 12px | Cards, containers |
| xl | 16px | Large components |
| full | 50% | Circles, avatars, pills |

---

## Components

### Buttons

#### Primary Button
- **Background**: Primary color (#1D9E75)
- **Text**: White (#FFFFFF)
- **Padding**: 12px 24px (sm), 10px 20px (sm), 8px 16px (xs)
- **Border Radius**: 8px
- **Font Size**: 16px (regular), 14px (small)
- **States**:
  - Default: Primary color
  - Hover: `brightness(110%)`
  - Active: `brightness(95%)`
  - Disabled: 50% opacity, cursor not-allowed

#### Secondary Button
- **Background**: Transparent
- **Border**: 2px solid Primary color
- **Text**: Primary color
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **States**:
  - Hover: Light background (primary with 10% opacity)
  - Active: Medium background (primary with 20% opacity)

#### Ghost Button
- **Background**: Transparent
- **Border**: None
- **Text**: Primary color
- **Hover**: Light background (primary with 10% opacity)

#### Icon Button
- **Size**: 40px x 40px (regular), 36px x 36px (small)
- **Border Radius**: 8px
- **Icon Size**: 20px (regular), 16px (small)

### Input Fields

#### Text Input
- **Border**: 1px solid `--border-primary`
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Focus**: 
  - Border: 2px solid Primary color
  - Box shadow: `0 0 0 3px rgba(29, 158, 117, 0.1)`
- **Placeholder**: `--text-tertiary`

#### Textarea
- **Border**: 1px solid `--border-primary`
- **Border Radius**: 12px
- **Padding**: 16px
- **Resize**: Vertical only
- **Font Size**: 16px (prevents zoom on mobile)

#### Select/Dropdown
- **Same styling as text input**
- **Icon**: Chevron down on the right

### Cards

#### Standard Card
- **Background**: `--bg-secondary`
- **Border**: 1px solid `--border-primary`
- **Border Radius**: 12px
- **Padding**: 16px
- **Box Shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Hover**:
  - Box Shadow: `0 8px 16px rgba(0, 0, 0, 0.12)`
  - Transform: `translateY(-2px)`
  - Transition: `200ms ease-in-out`

#### Message Card (Chat)
- **User Message**: 
  - Background: Primary color (#1D9E75)
  - Text: White
  - Alignment: Right
  - Border Radius: 12px
- **AI Message**:
  - Background: `--bg-muted`
  - Text: `--text-primary`
  - Alignment: Left
  - Border Radius: 12px

### Form Elements

#### Label
- **Font Size**: 14px
- **Font Weight**: 500
- **Color**: `--text-primary`
- **Margin Bottom**: 8px

#### Error Message
- **Font Size**: 12px
- **Color**: `--color-accent` (#D85A30)
- **Margin Top**: 4px

#### Success State
- **Border Color**: `--color-success`
- **Icon**: Green checkmark

---

## Animations

### Transition Speeds
- **Fast**: 150ms (small interactions)
- **Standard**: 200ms (normal transitions)
- **Slow**: 300ms (page transitions)

### Easing Functions
- **Default**: `ease-in-out`
- **Entrance**: `ease-out`
- **Exit**: `ease-in`

### Animation Keyframes

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### Spin (Loading)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Pulse (Loading/Active)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Layout

### Grid System
- **Desktop**: 12-column grid with 24px gutters
- **Tablet**: 8-column grid with 16px gutters
- **Mobile**: 4-column grid with 16px gutters

### Container Sizes
- **Full**: 100% (edge-to-edge)
- **xl**: 1280px
- **lg**: 1024px
- **md**: 768px

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Responsive Padding
- **Mobile**: 16px horizontal
- **Tablet**: 24px horizontal
- **Desktop**: 32px horizontal

---

## Accessibility

### Color Contrast
- **WCAG AA**: 4.5:1 minimum for normal text
- **WCAG AAA**: 7:1 minimum for enhanced contrast
- Ensure all interactive elements have sufficient contrast

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible (`outline: 2px solid --color-primary`)

### Focus Indicators
- **Outline Width**: 2px
- **Outline Color**: Primary color
- **Outline Offset**: 2px

### ARIA Labels
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for form errors
- Use `role` attributes for custom components

---

## Component Patterns

### Header
- **Height**: 64px
- **Sticky Position**: On scroll
- **Shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Content**: Logo (left), Search (center), Profile (right)
- **Mobile**: Logo (left), Menu hamburger (right)

### Sidebar
- **Width**: 280px (desktop), 100% (mobile)
- **Scrollable**: Yes, with custom scrollbar
- **Background**: `--bg-secondary`
- **Border Right**: 1px solid `--border-primary`

### Main Content
- **Max Width**: 1280px
- **Horizontal Padding**: Responsive (16px mobile, 32px desktop)
- **Vertical Padding**: 24px

### Footer
- **Height**: Auto (min 64px)
- **Background**: `--bg-secondary`
- **Border Top**: 1px solid `--border-primary`
- **Content**: Copyright, links, social icons

---

## Dark Mode Implementation

### CSS Variables Strategy
```css
:root {
  /* Light mode (default) */
  --color-primary: #FFFFFF;
  --color-text: #2C2C2A;
}

.dark {
  /* Dark mode */
  --color-primary: #0F0F0F;
  --color-text: #F5F4F1;
}
```

### Media Query
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Auto-apply dark mode based on system preference */
  }
}
```

---

## Icons

### Icon Library
- **Primary**: Tabler Icons
- **Fallback**: Feather Icons

### Icon Sizes
- **xs**: 16px (small labels)
- **sm**: 20px (buttons)
- **md**: 24px (headers)
- **lg**: 32px (hero sections)

### Icon Weight
- **Default**: 2px stroke width
- **Bold**: 2.5px stroke width (emphasis)

---

## Interaction States

### Button States
- **Default**: Normal styling
- **Hover**: Brightness increase, slight lift (transform: translateY(-2px))
- **Active/Pressed**: Brightness decrease
- **Focus**: Outline with 2px primary color, offset 2px
- **Loading**: Spinner animation, disabled state
- **Disabled**: 50% opacity, cursor not-allowed

### Input States
- **Default**: Standard border
- **Hover**: Border color brightens
- **Focus**: Bold border, colored outline
- **Error**: Red border, error icon
- **Success**: Green border, success icon
- **Disabled**: Gray background, opacity 50%

### Link States
- **Default**: Primary color, no underline
- **Hover**: Underline, brightness increase
- **Active**: Brightness decrease
- **Visited**: Purple (#7F77DD)

---

## Motion Design

### Page Transitions
- **Fade In**: 300ms ease-out (all pages)
- **Slide Up (Optional)**: 200ms ease-out for modals

### Element Transitions
- **Buttons**: 200ms ease-in-out for all state changes
- **Cards**: 200ms ease-in-out for hover effects
- **Inputs**: 200ms ease-in-out for focus/blur

### Loading States
- **Spinner**: 1.5s linear rotation
- **Pulse**: 2s ease-in-out opacity pulse

---

## Responsive Design

### Mobile-First Approach
1. Start with mobile layout (< 640px)
2. Add tablet adjustments (640px - 1024px)
3. Add desktop enhancements (> 1024px)

### Responsive Typography
- **Desktop**: H1 32px, Body 16px
- **Tablet**: H1 28px, Body 15px
- **Mobile**: H1 24px, Body 14px

### Responsive Spacing
- **Desktop**: 24px gutters, 32px padding
- **Tablet**: 20px gutters, 24px padding
- **Mobile**: 16px gutters, 16px padding

### Touch Targets
- **Minimum**: 44px x 44px for touch targets
- **Ideal**: 48px x 48px for better UX

---

## Usage Guidelines

### When to Use Primary Color (#1D9E75)
- Main CTAs (buttons)
- Primary interactive elements
- Success states
- Brand highlights

### When to Use Azure Blue (#378ADD)
- Secondary CTAs
- Alternative actions
- Information highlights
- Accents

### When to Use Accent/Coral (#D85A30)
- Error states
- Warnings
- Destructive actions
- Important notifications

### When to Use Purple (#7F77DD)
- Tertiary actions
- Alternative selections
- Emphasis on secondary elements

---

## Files & Implementation

### CSS Files
- `globals.css`: Global styles, CSS variables, animations
- `components/`: Component-specific styling
- Tailwind config: Extended colors, spacing, animations

### Component Files
- Button.tsx / button.css
- Input.tsx / input.css
- Card.tsx / card.css
- Header.tsx / header.css
- Sidebar.tsx / sidebar.css

---

## Best Practices

1. **Use CSS Variables** for all colors - makes dark mode easy
2. **Consistent Spacing** - always use multiples of 4px (xs scale)
3. **Proper Contrast** - verify all text meets WCAG standards
4. **Responsive Design** - test on mobile, tablet, desktop
5. **Accessibility First** - keyboard navigation, focus states, ARIA labels
6. **Animation Purpose** - only animate when it improves UX
7. **Performance** - use transform/opacity for animations (GPU accelerated)

---

## References

- [Figma Design File](https://figma.com/...) - (To be created)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tabler Icons](https://tabler.io/icons)
- [Tailwind CSS](https://tailwindcss.com/)
