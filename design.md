# Design — De Smakelijke Bok

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

---

## Genre

playful

---

## Macrostructure family

- **Home (ecosystem)** — Ecosystem Index (20). Multiple discovery surfaces in order:
  typographic hero → featured cards accordion → category masonry grid → game section.
  Vary section head weights; not every section needs a display heading.
- **Browse pages (recipes, favorites)** — Catalogue (11). Filter bar above a uniform
  grid; heading stays small and left-aligned.
- **Content pages (about)** — Letter (12). First-person prose, no hero image,
  signed close. No buttons in fold.
- **Detail pages (recipe/[slug])** — Long Document (2). Content takes over;
  no marketing chrome.

---

## Theme

Custom — vibe: "warm parchment, herb-green, goat-kitchen cozy"

```css
--color-paper:      oklch(97% 0.012 85);   /* warm cream base */
--color-paper-2:    oklch(92% 0.018 75);   /* section / card fill */
--color-rule:       oklch(89% 0.018 85);   /* hairlines and borders */
--color-ink:        oklch(26% 0.022 55);   /* warm dark brown, headings */
--color-ink-2:      oklch(44% 0.020 55);   /* secondary text, captions */
--color-accent:     oklch(38% 0.120 148);  /* herb green — ONE accent */
--color-accent-ink: oklch(97% 0.008 148);  /* near-white on accent fills */
--color-focus:      oklch(55% 0.140 148);  /* focus ring (≥ 3:1 on paper) */
```

Dark mode:
```css
--color-paper:      oklch(18% 0.018 55);
--color-paper-2:    oklch(22% 0.020 55);
--color-rule:       oklch(30% 0.018 55);
--color-ink:        oklch(92% 0.008 80);
--color-ink-2:      oklch(70% 0.010 75);
--color-accent:     oklch(52% 0.130 148);
--color-accent-ink: oklch(16% 0.010 148);
--color-focus:      oklch(65% 0.140 148);
```

Diversification axes: **light / roman-serif / chromatic-other (herb-green)**

---

## Typography

- **Display:** Fraunces, variable (`opsz,wght@9..144,300..900`), weight 700, roman.
  Optical size `opsz 72` at hero scale; `opsz 36` at section heads.
  All headers `font-style: normal` — no italic on headings, ever.
- **Body:** Satoshi (Fontshare), weight 400 body / 500 label / 700 heading.
- **No outlier face** — this site doesn't need a third family.

Font-size scale: 1.25 ratio from 16 px base.
Display: `clamp(2.75rem, 5vw + 1rem, 5.25rem)`.
Headings tight-tracked: `letter-spacing: -0.02em`.
Body measure: `max-width: 65ch`.

---

## Spacing

4-point named scale. Pages use named tokens — never raw px or rem values.

```
--space-3xs: 0.25rem   --space-2xs: 0.5rem    --space-xs: 0.75rem
--space-sm:  1rem      --space-md:  1.5rem    --space-lg: 2rem
--space-xl:  3rem      --space-2xl: 4.5rem    --space-3xl: 7rem
```

Section breaks use `--space-2xl` minimum.

---

## Motion

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — default for reveals.
- Durations: `--dur-fast: 150ms` (hover) · `--dur-short: 220ms` (transitions).
- Reveal: fade-only on first section (opacity 0 → 1). No scroll-triggered fades.
- `prefers-reduced-motion: reduce` → all animations collapse to ≤ 150ms opacity.
- Animate `transform` and `opacity` only — never layout properties.
- Do not animate focus rings. They appear instantly.

---

## Microinteractions stance

- Cards: `translateY(-2px)` + shadow expansion on hover. One signal only.
- Buttons: `translateY(-1px)` on hover. No scale, no glow.
- Silent success — no celebratory toasts on save / favourite.
- Hover tooltip delay 800 ms · focus tooltip delay 0 ms.

---

## CTA voice

- **Primary:** herb-green filled pill — `background: var(--color-accent)`, `color: var(--color-accent-ink)`, `border-radius: var(--radius-pill)`, `padding: var(--space-xs) var(--space-lg)`. Hover: `translateY(-1px)` + shadow. No `transition-all`.
- **Secondary / outline:** transparent, `border: 1.5px solid var(--color-accent)`, `color: var(--color-accent)`.
- **Typographic:** text + `→` underline on hover. No box.

---

## Navigation

**N7 Brutal slab.** Full-width bar. 2px `border-bottom: 2px solid var(--color-rule)`.
Wordmark: `DE SMAKELIJKE BOK` in Fraunces 700, letter-spacing 0.02em.
Links: tracked uppercase Satoshi 500 (`letter-spacing: 0.08em`).
Background: `var(--color-paper)`. No shadow, no blur.
Mobile: wordmark + hamburger. Links expand in a drawer.

*N5 Floating pill is banned for playful genre.*

---

## Footer

**Ft8 Marquee scroll.** Repeating tagline loop:
`LEKKER ETEN · DE SMAKELIJKE BOK · LEKKER ETEN · DE SMAKELIJKE BOK ·`
Speed: 32s. `prefers-reduced-motion: reduce` → static, no animation.
Below marquee: single line — copyright + language switcher.

---

## What pages MUST share

- Wordmark treatment (Fraunces 700 all-caps).
- Accent colour and placement (≤ 5 % per viewport).
- Display + body fonts.
- CTA voice (pill shape, border-radius, padding rhythm).
- N7 nav and Ft8 footer on every route.

## What pages MAY differ on

- Macrostructure within the page-type family.
- Hero / opening section style.
- Enrichment — H9 custom illustration allowed on home (the mascot IS the illustration).

---

## Exports

### tokens.css
See `tokens.css` at project root.

### Tailwind v4 `@theme`
See `src/app/globals.css` `@theme` block.
