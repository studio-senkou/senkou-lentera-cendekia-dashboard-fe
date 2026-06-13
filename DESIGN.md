# Design System — Lentera Cendekia

> A premium learning platform inspired by the warmth of education, the clarity of modern documentation, and the intellectual depth of academic institutions.

---

# 1. Brand Foundation

## Brand Personality

Lentera Cendekia exists to guide learners toward meaningful growth through knowledge, critical thinking, and lifelong learning.

### Core Attributes

- Enlightening
- Thoughtful
- Trustworthy
- Modern
- Human-Centered
- Academic Excellence
- Calm Confidence

### Brand Promise

Lentera Cendekia helps learners illuminate their path through knowledge, mentorship, and purposeful education.

---

# 2. Visual Philosophy

The visual language prioritizes content, readability, and intellectual credibility.

Unlike aggressive marketing-focused education platforms, Lentera Cendekia emphasizes clarity, reflection, and depth.

The interface should feel:

- Warm but professional
- Premium but accessible
- Academic but modern
- Elegant but practical

### Inspiration

- Modern educational institutions
- Editorial publications
- Research journals
- Claude documentation aesthetics
- Contemporary learning platforms

---

# 3. Color System

## Primary Colors

### Deep Navy

`#101828`

Primary brand color.

Used for:

- Headers
- Navigation
- Key text
- Important UI elements

---

### Lentera Orange

`#FF5C06`

Primary action color.

Used for:

- CTA buttons
- Active states
- Highlights
- Important indicators

Usage should remain below 10% of the interface.

---

## Supporting Colors

### Learning Blue

`#155DEE`

Used for:

- Links
- Educational indicators
- Progress states
- Secondary actions

---

### Ivory Background

`#FFF8EE`

Primary page background.

Provides warmth while maintaining a premium appearance.

---

### White Surface

`#FFFFFF`

Used for:

- Cards
- Forms
- Dialogs
- Content containers

---

## Text Colors

### Primary Text

`#0B0B0B`

Main content.

---

### Heading Text

`#101828`

Used for all headings.

---

### Secondary Text

`#667085`

Descriptions and supporting information.

---

### Muted Text

`#98A2B3`

Helper text and metadata.

---

## Borders

### Default Border

`rgba(16, 24, 40, 0.08)`

---

### Strong Border

`rgba(16, 24, 40, 0.16)`

---

## Semantic Colors

### Success

`#16A34A`

### Warning

`#F59E0B`

### Error

`#DC2626`

### Info

`#155DEE`

---

# 4. Typography

## Font Family

### Headings

EB Garamond

Used exclusively for:

- H1
- H2
- Editorial highlights
- Quotes

---

### Body

Inter

Used for:

- Body content
- Navigation
- Forms
- Buttons
- Interface labels

---

### Code

SF Mono

Fallback:

Courier New, monospace

---

# Typography Scale

| Role       | Font        | Size | Weight | Line Height |
| ---------- | ----------- | ---- | ------ | ----------- |
| H1         | EB Garamond | 56px | 400    | 64px        |
| H2         | EB Garamond | 40px | 400    | 48px        |
| H3         | Inter       | 28px | 600    | 36px        |
| H4         | Inter       | 22px | 600    | 30px        |
| H5         | Inter       | 18px | 600    | 28px        |
| Body Large | Inter       | 18px | 400    | 30px        |
| Body       | Inter       | 16px | 400    | 28px        |
| Small      | Inter       | 14px | 400    | 24px        |
| Caption    | Inter       | 12px | 400    | 18px        |

---

# Typography Principles

### Do

- Use EB Garamond only for editorial hierarchy.
- Use Inter for all interface elements.
- Prioritize readability over density.
- Maintain generous line-height.

### Don't

- Use serif fonts inside forms.
- Use more than three text sizes in one component.
- Reduce body text below 14px.

---

# 5. Spacing System

## Base Unit

4px

---

## Scale

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 12px  |
| lg    | 16px  |
| xl    | 24px  |
| 2xl   | 32px  |
| 3xl   | 48px  |
| 4xl   | 64px  |
| 5xl   | 96px  |

---

# Layout Rhythm

### Text → Text

24px

### Component → Component

32px

### Section → Section

64px

### Hero → Content

96px

### Page Padding

Desktop:

64px

Tablet:

48px

Mobile:

24px

---

# 6. Layout System

## Content Width

### Reading Layout

720px

Used for:

- Articles
- Learning modules
- Documentation
- Blog content

---

### Standard Layout

1200px

Used for:

- Landing pages
- Dashboards
- Program pages

---

### Wide Layout

1280px

Used for:

- Complex data views
- Admin interfaces

---

# Grid

## Desktop

12 Columns

Gap:

24px

---

## Tablet

8 Columns

Gap:

20px

---

## Mobile

4 Columns

Gap:

16px

---

# 7. Navigation

## Header

Height:

64px

Background:

rgba(255,255,255,0.9)

Backdrop Blur:

20px

Border Bottom:

1px solid rgba(16,24,40,0.08)

---

## Navigation Link

Font:

Inter

Size:

14px

Weight:

500

Color:

#667085

Hover:

#101828

Active:

#101828

Active Indicator:

2px solid #FF5C06

---

# 8. Buttons

## Primary Button

Background:

#FF5C06

Text:

#FFFFFF

Height:

44px

Padding:

16px 24px

Border Radius:

6px

Border:

None

Hover:

#E55400

Active:

#CC4900

---

## Secondary Button

Background:

#FFFFFF

Text:

#101828

Border:

1px solid rgba(16,24,40,0.12)

Height:

44px

Border Radius:

6px

Hover:

rgba(16,24,40,0.03)

---

## Ghost Button

Background:

Transparent

Text:

#667085

Height:

44px

Border Radius:

6px

Hover:

rgba(16,24,40,0.04)

---

# 9. Cards

## Standard Card

Background:

#FFFFFF

Border:

1px solid rgba(16,24,40,0.08)

Border Radius:

8px

Padding:

24px

Shadow:

0 1px 3px rgba(0,0,0,0.05)

---

## Hover State

Shadow:

0 6px 20px rgba(0,0,0,0.08)

Border:

1px solid rgba(16,24,40,0.12)

---

## Featured Card

Background:

#FFFFFF

Border Top:

4px solid #FF5C06

Padding:

32px

Radius:

8px

---

# 10. Forms

## Input

Height:

44px

Padding:

12px 16px

Radius:

6px

Border:

1px solid rgba(16,24,40,0.16)

Background:

#FFFFFF

---

## Focus State

Border:

#155DEE

Shadow:

0 0 0 3px rgba(21,93,238,0.10)

---

## Label

Font:

Inter

Size:

14px

Weight:

600

Color:

#101828

Margin Bottom:

8px

---

## Helper Text

Font:

Inter

Size:

12px

Color:

#667085

---

# 11. Elevation

## Level 0

No shadow

Used for:

- Text
- Navigation
- Static content

---

## Level 1

0 1px 3px rgba(0,0,0,0.05)

Used for:

- Cards
- Inputs

---

## Level 2

0 6px 20px rgba(0,0,0,0.08)

Used for:

- Hover states
- Dropdowns

---

## Level 3

0 12px 32px rgba(0,0,0,0.12)

Used for:

- Modals
- Floating panels

---

# 12. Responsive Design

## Mobile

320px–639px

### Rules

- Single column layout
- 24px page padding
- Full-width buttons
- H1 reduced to 40px

---

## Tablet

640px–1023px

### Rules

- Two-column layouts
- 48px page padding
- Reduced section spacing

---

## Desktop

1024px+

### Rules

- Full navigation
- 1200px content width
- Maximum spacing rhythm

---

# 13. Accessibility

## Requirements

- Minimum contrast ratio 4.5:1
- Touch targets minimum 44×44px
- Visible focus indicators
- Consistent heading hierarchy
- Keyboard navigation support

---

# 14. Design Rules

## Do

- Prioritize content over decoration.
- Use whitespace generously.
- Keep interfaces calm and focused.
- Use orange only for meaningful actions.
- Maintain consistent spacing rhythm.
- Favor clarity over visual complexity.

---

## Don't

- Don't use more than one accent color per section.
- Don't overuse orange.
- Don't place cards inside cards.
- Don't use large shadows.
- Don't create dense layouts.
- Don't sacrifice readability for aesthetics.

---

# Design Summary

**Typography:** Asah (EB Garamond + Inter)

**Color Identity:** Lentera Cendekia (Deep Navy + Lentera Orange)

**Spacing & Layout:** Claude-inspired

**Personality:** Premium Learning Institution

**Experience Goal:** A calm, trustworthy, and intellectually inspiring platform where content becomes the primary focus and learning feels meaningful.
