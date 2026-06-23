# Workspace Rules - Frontend UI & Design Guidelines

When building or editing pages and components:

## Layout & Grid
- Use CSS Grid for page layout and Flexbox for component-level alignment.
- Implement a 12-column grid with a max-width of 1200px, centered, with 24px column gaps and 16–24px horizontal padding on mobile.
- All sections must align to the grid. No orphaned elements floating outside the column system.
- Responsive breakpoints: 1200px (desktop), 768px (tablet), 480px (mobile). Use fluid spacing — never fixed px-only layouts.

## Spacing System
- Base unit: 8px. All padding, margin, and gap values must be multiples of 8 (8, 16, 24, 32, 48, 64).
- Section vertical padding: 64px desktop, 40px mobile.
- Card internal padding: 24px.

## Typography
- Font stack: `'Inter', system-ui, -apple-system, sans-serif` — load from Google Fonts.
- Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64px. Use only these sizes.
- Line-height: 1.5 for body, 1.2 for headings.
- Font weights: 400 (body), 500 (labels/UI), 600 (subheadings), 700 (headings).
- Never use default browser font sizes — always set explicit sizes.

## Color System
- Define a CSS custom property palette at :root. Defaults:
  --color-bg: #0f0f11
  --color-surface: #1a1a1f
  --color-border: #2a2a35
  --color-text-primary: #f0f0f5
  --color-text-secondary: #8888a0
  --color-accent: #7c6aff
  --color-accent-hover: #9580ff
- All colors must reference these variables — no hardcoded hex values in components.

## Components & Defaults
- Buttons: 12px 24px padding, 8px border-radius, 500 weight, uppercase tracking 0.04em. Primary uses --color-accent. Hover state required.
- Inputs: full-width, 12px 16px padding, 8px border-radius, border uses --color-border, focus ring uses --color-accent at 40% opacity.
- Cards: background --color-surface, border 1px solid --color-border, border-radius 12px, padding 24px, subtle box-shadow.
- Navigation: sticky top-0, backdrop-filter blur(12px), height 64px, logo left + links right layout.

## Visual Polish
- Smooth transitions on interactive elements: `transition: all 0.2s ease`.
- Subtle hover lift on cards: `transform: translateY(-2px)`.
- Use 1 accent gradient sparingly: `linear-gradient(135deg, #7c6aff, #a78bfa)` — for hero text or a single CTA only.
- No drop shadows heavier than `0 4px 24px rgba(0,0,0,0.3)`.

## Code Quality
- Semantic HTML5 elements (header, nav, main, section, footer, article).
- Mobile-first CSS.
- No external CSS frameworks (no Tailwind, Bootstrap).
- All placeholder content must be realistic and domain-appropriate — no "Lorem ipsum."
- Every interactive element must have a visible focus state.
