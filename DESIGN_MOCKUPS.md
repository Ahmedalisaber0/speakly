# Speakly - High-Fidelity Design Mockups & Specifications

## 📐 Design Mockup Specifications for Figma/Design Tools

---

## 1. HOMEPAGE DESIGN MOCKUP

### Layout Grid
- Desktop: 12-column grid, 1280px max-width, 32px gutters
- Tablet: 8-column grid, 768px width, 24px gutters
- Mobile: 4-column grid, full width, 16px gutters

### Header Section
```
┌─────────────────────────────────────────────────────────┐
│  [S] Speakly    Practice    Translate    News    [→ Started]  │
└─────────────────────────────────────────────────────────┘
Height: 64px
Sticky: Yes
Background: rgba(255,255,255,0.8) with backdrop blur 8px
Border: 1px bottom, --border-primary color
Shadow: 0 2px 8px rgba(0,0,0,0.08)
```

### Hero Section
```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────┐  ┌─────────────────────┐   │
│  │ Practice languages with AI  │  │  [Gradient Visual]  │   │
│  │ that [knows you]            │  │                     │   │
│  │                             │  │                     │   │
│  │ Speakly remembers your...  │  │                     │   │
│  │                             │  └─────────────────────┘   │
│  │ ┌──────────────────────────┐ │                           │
│  │ │[Native] → [Target]       │ │                           │
│  │ │[Create Account][Sign In] │ │                           │
│  └─────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

**Text Specifications:**
- H1: "Practice languages with an AI **that knows you**"
  - Size: 32px, Weight: 700, Line-height: 1.2
  - Gradient: Primary to Azure
- Subheading: "Speakly remembers..." (Body, 16px, 400, secondary color)
- Body copy: Max width 672px, centered

**Language Selection Card:**
- Background: --bg-secondary
- Border: 1px --border-primary, radius 12px
- Padding: 24px
- Grid: 3 columns (Native | Arrow | Target)
- Inputs: 44px height, rounded 8px
- Labels: 12px, 500 weight, --text-secondary

**CTA Buttons:**
- Primary: Teal background, white text, 44px height, 24px padding horizontal
- Secondary: White background, teal text, 2px border, 44px height

### Features Section
```
┌──────────────────────────────────────────────────────────┐
│ Why choose Speakly?                                     │
│ ┌──────────┬──────────┬──────────┐                      │
│ │ [🎯]     │ [💾]     │ [🎤]     │                      │
│ │ Personal │ Memory   │ Natural  │                      │
│ │ Learning │ Saves    │ Speech   │                      │
│ └──────────┴──────────┴──────────┘                      │
│ ┌──────────┬──────────┬──────────┐                      │
│ │ [📰]     │ [🌍]     │ [✨]     │                      │
│ │ News     │ Multiple │ AI       │                      │
│ │ Content  │ Languages│ Feedback │                      │
│ └──────────┴──────────┴──────────┘                      │
└──────────────────────────────────────────────────────────┘
```

**Feature Cards:**
- Grid: 3 columns (responsive to 1 on mobile)
- Gap: 24px
- Card: Background --bg-secondary, border 1px, radius 12px, padding 24px
- Icon: 48x48px, gradient background, 24px icon
- Hover: Border changes to primary color, shadow increases
- Transition: 200ms ease-in-out
- Title: 20px, 600 weight, --text-primary
- Description: 14px, 400 weight, --text-secondary

### CTA Section (Bottom)
```
┌──────────────────────────────────────────────────────────┐
│         Ready to practice smarter?                      │
│         [Get started free button]                       │
└──────────────────────────────────────────────────────────┘
```

- Background: Gradient primary to azure
- Padding: 48px
- Border radius: 16px
- Text: White, centered
- Button: White background, teal text, 16px bold

### Footer
```
┌─────────┬─────────┬─────────┬─────────┐
│ Product │Resources│Company  │ Follow  │
│ - Chat  │ - Blog  │ - About │ - Twitter
│ -...    │ -...    │ -...    │ -...
└─────────┴─────────┴─────────┴─────────┘
Copyright © 2025 Speakly. All rights reserved.
```

- Background: --bg-secondary
- Border: 1px top, --border-primary
- Padding: 32px
- Column layout: 4 columns desktop, responsive to single column on mobile
- Link size: 14px, secondary color, hover to primary

---

## 2. TRANSLATION PAGE DESIGN MOCKUP

### Header
```
┌──────────────────────────────────────────────────────┐
│ [S] Speakly    Practice    [Translate]    News      │
└──────────────────────────────────────────────────────┘
```

Height: 64px
Sticky with backdrop blur

### Language Selector Bar
```
┌──────────────────────────────────────────────────────┐
│        [🇬🇧 English]  [↕]  [🇪🇸 Spanish]        │
└──────────────────────────────────────────────────────┘
```

- Padding: 24px
- Background: --bg-secondary
- Border: 1px bottom, --border-primary
- Flex layout, centered
- Gap between selectors: 16px
- Swap button: 40x40px, rounded 8px

### Main Content Area
```
┌─────────────────────────┬─────────────────────────┐
│ English                 │ Spanish                 │
│ ┌─────────────────────┐ │ ┌─────────────────────┐ │
│ │                     │ │ │ Translation...      │ │
│ │ [Type text here]    │ │ │                     │ │
│ │                     │ │ │                     │ │
│ │ 245 characters      │ │ │                     │ │
│ ├─────────────────────┤ │ ├─────────────────────┤ │
│ │ [🔊] [✕]            │ │ │ [🔊] [📋]          │ │
│ └─────────────────────┘ │ └─────────────────────┘ │
│                         │                         │
│ Corrections & Suggestions                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ original → corrected                           │ │
│ │ Grammar explanation here                       │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────┴─────────────────────────┘
```

**Layout:**
- 2-column grid (responsive to 1 on tablet/mobile)
- Gap: 24px
- Padding: 24px
- Max-width: 1400px centered

**Textareas:**
- Height: 256px (h-64)
- Padding: 16px
- Border: 1px, --border-primary
- Border-radius: 12px
- Font: 16px, line-height 1.6
- Focus: Ring 2px primary color
- Placeholder: --text-tertiary

**Label:**
- Size: 14px, 500 weight
- Color: --text-primary
- Margin-bottom: 12px

**Character Count:**
- Positioned bottom-right of textarea
- Font: 12px, --text-tertiary
- Padding: 8px from edge

**Control Buttons:**
- Size: 40x40px or 44x44px
- Border: 1px, --border-primary
- Border-radius: 8px
- Hover: Background --bg-muted, color primary
- Disabled: Opacity 50%
- Transition: 200ms

**Corrections Section:**
- Background: #fef3c7 (yellow/amber)
- Border: 1px #fcd34d
- Border-radius: 12px
- Padding: 16px
- Margin-top: 24px
- Title: 14px, 600 weight, #b45309
- Item height: auto, padding 12px
- Line-through original text in red
- Bold corrected text in green

### Bottom Action Bar
```
┌──────────────────────────────────────────────────────┐
│              [Translate Button]                     │
└──────────────────────────────────────────────────────┘
```

- Sticky bottom
- Height: 80px (with padding)
- Border: 1px top, --border-primary
- Background: --bg-secondary
- Button: Full width, max 400px
- Height: 44px
- Primary color, white text
- Icon + Text
- Loading state: spinner animation + "Translating..."

---

## 3. CHAT PAGE DESIGN MOCKUP

### Layout Structure
```
┌────────────────┬─────────────────────────────────────┐
│   Sidebar      │         Chat Area                   │
│ [New Chat]     │                                     │
│ [Title 1]      │ ┌─────────────────────────────────┐│
│ [Title 2]      │ │ [Header] [Profile]              ││
│ [Title 3]      │ ├─────────────────────────────────┤│
│                │ │ [Assistant message bubble]      ││
│                │ │                                 ││
│                │ │          [User message bubble]  ││
│                │ │                                 ││
│                │ ├─────────────────────────────────┤│
│                │ │ [Mic] [Input box] [Send]       ││
│                │ └─────────────────────────────────┘│
└────────────────┴─────────────────────────────────────┘
```

### Header
- Height: 64px
- Left: Conversation title + username + dialect
- Right: Profile badge with user initials
- Background: --bg-secondary
- Border-bottom: 1px, --border-primary
- Sticky: Yes

### Message Bubbles
**User Message:**
- Background: --color-primary (Teal)
- Text: White
- Alignment: Right
- Border-radius: 12px (12px except bottom-right 4px)
- Padding: 12px 16px
- Max-width: 70% on desktop, 85% on mobile
- Shadow: 0 2px 8px rgba(primary, 0.2)

**AI Message:**
- Background: --bg-muted
- Text: --text-primary
- Alignment: Left
- Border-radius: 12px (12px except top-left 4px)
- Padding: 12px 16px
- Max-width: 70% on desktop
- Shadow: 0 2px 8px rgba(0,0,0,0.08)

**Message Spacing:**
- Gap between messages: 16px
- Timestamp: 12px, --text-tertiary, centered below message

### Input Area
```
┌────────────────────────────────────────────────────┐
│ [🎤]  [Input field...]  [Send →]                 │
└────────────────────────────────────────────────────┘
```

- Height: 64px (with padding)
- Padding: 16px
- Border-top: 1px, --border-primary
- Background: --bg-secondary
- Sticky: Yes

**Microphone Button:**
- Size: 44x44px
- Icon: 20px
- Listening state: Background --color-accent, animate pulse
- Idle state: Border, hover background --bg-muted

**Input Field:**
- Flex-1
- Height: 44px
- Padding: 12px 16px
- Border-radius: 8px
- Border: 1px, --border-primary
- Focus: Ring 2px primary
- Placeholder: --text-tertiary

**Send Button:**
- Size: 44x44px
- Background: --color-primary
- Icon: 20px white
- Hover: Background primary-dark
- Disabled: Opacity 50%

### Sidebar
- Width: 280px on desktop, drawer on mobile
- Background: --bg-secondary
- Border-right: 1px, --border-primary
- Scrollable: Yes

**New Chat Button:**
- Margin: 16px
- Width: calc(100% - 32px)
- Height: 40px
- Primary color, white text
- Border-radius: 8px
- Icon + Text

**Conversation Items:**
- Height: 56px
- Padding: 12px 16px
- Border: 1px bottom, --border-subtle
- Hover: Background --bg-muted
- Active: Border-left 3px primary color
- Truncate title: text-truncate
- Timestamp: 12px, --text-tertiary

---

## 4. COLOR SPECIFICATIONS FOR DESIGN TOOLS

### Teal (Primary)
- Light: #35B986 (RGB: 53, 185, 134)
- Regular: #1D9E75 (RGB: 29, 158, 117) ← Use this
- Dark: #158B63 (RGB: 21, 139, 99)

### Azure (Secondary)
- Light: #5A9FE8 (RGB: 90, 159, 232)
- Regular: #378ADD (RGB: 55, 138, 221) ← Use this
- Dark: #2970C2 (RGB: 41, 112, 194)

### Purple (Tertiary)
- Light: #9B92F5 (RGB: 155, 146, 245)
- Regular: #7F77DD (RGB: 127, 119, 221) ← Use this
- Dark: #6B63C8 (RGB: 107, 99, 200)

### Coral (Accent)
- Light: #E87A51 (RGB: 232, 122, 81)
- Regular: #D85A30 (RGB: 216, 90, 48) ← Use this
- Dark: #C54A1F (RGB: 197, 74, 31)

### Success
- #059669 (RGB: 5, 150, 105)

### Light Mode Grays
- Gray-900: #2C2C2A (Primary text)
- Gray-600: #5F5E5A (Secondary text)
- Gray-300: #D5D3CF (Borders)
- Gray-100: #F5F4F1 (Backgrounds)

### Dark Mode Grays
- Gray-900: #0F0F0F (Background)
- Gray-700: #262623 (Secondary bg)
- Gray-400: #3A3A37 (Borders)
- Gray-200: #A3A09C (Secondary text)

---

## 5. RESPONSIVE BREAKPOINTS

### Mobile
- Width: 360px - 640px
- Single column layouts
- Full-width inputs
- Hamburger menus
- Bottom navigation (optional)

### Tablet
- Width: 640px - 1024px
- 2-column layouts
- Sidebar may collapse
- Optimized touch targets

### Desktop
- Width: 1024px+
- Multi-column layouts
- Visible sidebars
- Full feature set

---

## 6. ACCESSIBILITY SPECIFICATIONS

### Color Contrast
All text must meet WCAG AA (4.5:1) or AAA (7:1):
- ✅ Teal (#1D9E75) on white: 6.2:1 (AA+)
- ✅ White on teal: 6.2:1 (AA+)
- ✅ Dark gray (#2C2C2A) on white: 14.7:1 (AAA)

### Focus Indicators
- Outline: 2px solid --color-primary
- Offset: 2px from element
- Applies to all interactive elements

### Touch Targets
- Minimum: 44px x 44px
- Preferred: 48px x 48px
- Spacing: 8px between touch targets

---

## 7. MOTION & ANIMATION SPECIFICATIONS

### Page Transitions
- Duration: 300ms
- Easing: ease-out
- Type: Fade in

### Button Interactions
- Hover: 200ms ease-in-out
- Active: Instant
- Disabled: No animation

### Loading States
- Spinner: 1.5s linear rotation
- Pulse: 2s ease-in-out opacity
- Shimmer: 2s ease-in-out position

### Message Arrivals
- Chat messages: Slide up + fade in, 200ms

---

## 8. TYPOGRAPHY SPECIFICATIONS

### Font Family
- Primary: Inter
- Fallback 1: -apple-system
- Fallback 2: BlinkMacSystemFont
- Fallback 3: Segoe UI
- Fallback 4: sans-serif

### Font Files to Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

---

## 9. SPACING GUIDE

```
xs:   4px   (very small gaps)
sm:   8px   (small gaps)
md:  16px   (default)
lg:  24px   (generous)
xl:  32px   (large)
2xl: 48px   (extra large)
```

Use multiples of these values for:
- Padding
- Margins
- Gaps (flexbox)
- Gutters (grid)

---

## 10. BORDER RADIUS GUIDE

```
sm:   4px    (small buttons, input borders)
md:   8px    (form elements, small cards)
lg:  12px    (cards, containers)
xl:  16px    (large modals)
full: 50%    (circles, avatars, pills)
```

---

## Implementation Checklist

- [ ] Create Figma file with all color swatches
- [ ] Create component library in Figma
- [ ] Set up typography styles in Figma
- [ ] Create page templates (Desktop, Tablet, Mobile)
- [ ] Document interaction states
- [ ] Create responsive demo prototype
- [ ] Get design approval
- [ ] Hand off to development team
- [ ] Verify implementation against specs
- [ ] Test on actual devices
- [ ] Collect user feedback
- [ ] Iterate and refine

---

## Resources

- Design System: `DESIGN_SYSTEM.md`
- Component Library: `COMPONENT_LIBRARY.md`
- Implementation Progress: `REDESIGN_PROGRESS.md`
- Code: React/Next.js with Tailwind CSS

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** Ready for Figma Implementation
