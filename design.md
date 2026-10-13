# Design — De Smakelijke Bok

Locked design system. Future Hallmark runs read this file first; pages defer
to it. Amend intentionally — the file is the rule.

**Source of truth:** `tokens.css` (project root), imported by
`src/app/globals.css`. Change a colour or size there and every page follows.

---

## System

- Genre · editorial, soft register (warm paper, hand-set cookbook)
- Theme · custom — vibe: "watercolour storybook, goat's reading nook"
- Axes · light / roman-serif / chromatic-other (sage)
- Audience · Dutch home cooks, friends & family
- One job · help someone pick a recipe to cook tonight
- The illustrations are the brand. Layout gives them room; UI stays quiet.

## Page families

| Page | Macrostructure | Status |
| --- | --- | --- |
| Home (`/[locale]`) | Index-First + H9 illustration frontispiece | **Shipped** |
| Recipes (`/recipes`), Favorites | Catalogue — filter bar over a uniform grid | Tokens only, layout not redesigned yet |
| Recipe detail (`/recipes/[slug]`) | Long Document — content takes over, no marketing chrome | Tokens only, layout not redesigned yet |
| About (`/about`) | Title page — cookbook front matter, voorwoord, three questions | **Shipped** |

### Home — "Inhoud"
1. **Frontispiece** — mascot illustration bleeds off the left edge (rounded on the
   right only), welcome + intro + pill CTA + typographic link to `#inhoud`.
   Stacks on mobile, side by side from 60rem.
2. **Uit de keuken** — `FeaturedCards` accordion (keeps the `recipe-hero` view transition).
3. **Inhoud** — every recipe by chapter (Voorgerechten → Hoofdgerechten → Desserts),
   `name ····· total time` rows. Desktop: hovering/focusing a row swaps the sticky
   plate illustration. Mobile: 48px thumbnail per row instead (no hover on touch).
4. **Alfabetsoep** — the game, on the one blush band of the page.

### About — "Title page"
1. **Title page** — compact enough that the illustration shows above the fold; the book title, sitting close under the nav, as the
   visible h1 (page title kept as sr-only text), a `✻` ornament between hairlines,
   and a Fraunces subtitle.
2. **Illustration** — the logo scene, multiply-blended into the paper with a soft
   radial mask in light mode, framed with `--radius-plate` in dark mode.
3. **Voorwoord** — single 38rem column with a sage drop cap.
4. **Drie vragen aan de bok** — question / answer rows between hairlines; stacked on
   mobile, 1fr / 2fr from 48rem. The last answer carries the one `.text-link` to the
   recipes. No pill, no button.
5. **Close** — "Smakelijk eten," + signature in display type, centred.

## Tokens (see `tokens.css` for the full set + dark mode)

```css
--color-paper:       oklch(97.5% 0.010 80);   /* page cream */
--color-paper-2:     oklch(94% 0.016 72);     /* bands, cards */
--color-paper-3:     oklch(91% 0.028 50);     /* blush band — max one per page */
--color-ink:         oklch(30% 0.024 55);     /* headings */
--color-ink-2:       oklch(42% 0.024 58);     /* body */
--color-muted:       oklch(50% 0.022 65);     /* captions, meta */
--color-rule:        oklch(87% 0.020 72);
--color-rule-strong: oklch(76% 0.024 70);     /* dotted leaders */
--color-accent:      oklch(46% 0.075 135);    /* deep sage — the ONE accent */
--color-accent-ink:  oklch(98% 0.008 100);    /* text on accent */
--color-focus:       oklch(50% 0.130 135);
```

- **Accent chroma is 0.075 on purpose** — below Hallmark's usual 0.12 floor.
  The brand is sage, not basil; more chroma reads as a different site.
- **Kitchen tints** (`--color-blush*`, `--color-sky*`) come from the illustrations.
  Backgrounds and small state signals only — never CTAs or link text.
- Dark mode lives in `[data-theme="dark"]` in `tokens.css` (set by `useTheme`).

### Legacy names → tokens
Components use Tailwind classes like `bg-cream` and `text-brown-dark`. Those
names are aliases in `globals.css`, so they still work:

| Legacy | Token |
| --- | --- |
| `cream` / `cream-dark` | `paper` / `paper-2` |
| `brown-dark` / `brown` / `brown-light` | `ink` / `ink-2` / `muted` |
| `sage-dark` / `sage` / `sage-light` | `accent` / `accent-soft` / `accent-tint` |
| `peach-*`, `dusty-blue-*` | `blush-*`, `sky-*` |

New code should use the token names (`var(--color-ink)`) directly.

## Typography

- **Display** · Fraunces, weight 600, roman, `font-variation-settings: "SOFT" 100`
  (rounded serifs = storybook, not newspaper). Tracking −0.015em.
- **Body** · Geist 400 / 500 / 600.
- Both via `next/font/google` in `src/app/[locale]/layout.tsx`.
- No italic headings, ever. No third family.
- Sizes: `--text-display` (h1), `--text-display-s` (section h2), `--text-xl` (chapter h3).

## CTA voice

- **Primary** · `.btn.btn-primary` — accent pill, accent-ink text, hover lifts 1px
  and goes to ink. One per section, max.
- **Secondary** · `.text-link` — ink text, 2px underline in `rule-strong`, accent on hover.
- No emoji in headings or CTAs.

## Motion stance

- Quiet. Hover colour shifts, a blush marker sweeping under recipe titles (`.recipe-title .marker`), 1px button lift, 220ms opacity fade on the index plate.
- Easing `--ease-out`; durations `--dur-fast` (150ms) / `--dur-base` (220ms).
- `prefers-reduced-motion` → opacity only, ≤150ms. Focus rings never animate.
- No scroll-triggered reveals, no floating decoration (VeggieBackground is retired from home).

## What pages MUST share

- `tokens.css`, the two fonts, the sage accent and its ≤5% footprint.
- Pill + text-link CTA voice.
- Illustrations framed with `--radius-plate`, never with fake chrome.

## Known gaps (fix when redesigning those pages)

- Nav + footer keep their old structure; they're only restyled via tokens.
- Soup game buttons use white text on mid-tone fills; in dark mode the sage
  button is ~3.6:1 (below AA for small text).

## Exports

`tokens.css` is the source of truth. For Tailwind v4 `@theme`, DTCG
`tokens.json`, or shadcn/ui variables, ask "extend design.md with
Tailwind exports" (or the format you want).
