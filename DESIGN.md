---
name: Hike
description: A night-lit product lab for an original sneaker brand. Dark stage, one ember signal, light that takes the colour of the shoe on show.
colors:
  stage-black: "#06070A"
  steel-surface: "#101217"
  steel-raised: "#181B21"
  steel-high: "#24272E"
  hairline: "#22252B"
  field-stroke: "#32363E"
  chalk: "#F2F3F6"
  fog: "#93979F"
  ember: "#FF5A1F"
  ember-ink: "#FF713D"
  steel-glow: "#8199BB"
  go-green: "#3BCE89"
  alarm-red: "#F05656"
typography:
  display:
    fontFamily: "Archivo Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Archivo Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.16em"
    fontVariation: "'wdth' 112"
rounded:
  tile: "12px"
  field: "16px"
  card: "28px"
  panel: "36px"
  pill: "9999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "32px"
  gutter-lg: "48px"
  section: "112px"
  section-lg: "144px"
  header: "72px"
  container-max: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-signal:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.steel-raised}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-lg:
    padding: "0 32px"
    height: "56px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    size: "40px"
  product-card:
    backgroundColor: "{colors.steel-surface}"
    rounded: "{rounded.card}"
  input-field:
    backgroundColor: "{colors.steel-surface}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.field}"
    padding: "0 20px"
    height: "56px"
  badge-sale:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.stage-black}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  header-island:
    backgroundColor: "{colors.steel-surface}"
    rounded: "{rounded.pill}"
    height: "60px"
---

# Design System: Hike

## Overview

**Creative North Star: "The Night-Lit Product Lab"**

Every shoe is staged as a lit object in a dark room. The page is a near-black stage with cool steel surfaces; the only warm colour is a single ember signal reserved for action. The light in the room is not fixed: an ambient glow token (`--glow`) is re-tinted at runtime from the most saturated swatch of the colourway on show, so switching shoe or colourway changes the colour of the whole stage. A faint 64px engineering grid, fading out toward the edges, sits under hero and feature stages.

Type does the shouting. Headlines are Archivo stretched to its widest (wdth 125), extra-bold, upper case and tightly set; everything else is Archivo at normal width, quiet and legible. Motion is soft and long: one exponential ease, blur-to-sharp entrances, springs for anything the hand touches, and Lenis smooth scrolling. Under reduced motion the stage stays lit but still: no transforms, loops or smooth scrolling.

The theme is dark only (`color-scheme: dark`). There is no light mode to maintain.

**Key Characteristics:**
- Near-black stage, three steel surface steps, hairline borders.
- One ember accent for actions, sale flags and focus; nothing else is warm.
- Colourway-driven ambient light (`--glow`) as the signature device.
- Expanded, extra-bold, upper-case display type over normal-width UI text.
- Pills everywhere you click; generously rounded (28px) cards and panels.
- Blur-to-sharp rises, spring tilts and orbit rings; transforms and loops are off under reduced motion.

## Colors

A cold, near-monochrome night palette with one hot signal and one borrowed light.

### Primary
- **Ember** (#FF5A1F): the only accent. Signal buttons ("Add to bag", checkout), the sale badge and sale price, the bag count bubble, text links in panels, and the focus ring. 6.6:1 against Stage Black.
- **Ember Ink** (#FF713D): a lighter ember for ember-coloured text where a little more lift is needed.

### Secondary
- **Colourway Glow** (runtime `--glow`, default = Ember): ambient light behind products. Derived from the most saturated swatch of the active colourway; saturation is floored at 55% and lightness clamped to 45 to 62% so the light never goes muddy.
- **Steel Glow** (#8199BB): the glow used when a colourway is near-neutral (white, black, grey; swatch saturation under 12%).

### Neutral
- **Stage Black** (#06070A): page background and text on light/ember fills.
- **Steel Surface** (#101217): cards, inputs, the header island and overlay panels.
- **Steel Raised** (#181B21): hover fills for ghost and outline buttons, icon buttons, menu rows.
- **Steel High** (#24272E): outline-button strokes, scrollbar thumb. Interactive control borders use Control instead.
- **Hairline** (#22252B): default dividers and borders.
- **Control** (`--control`, hsl 222 8% 42%): the border colour for interactive controls (inputs, chips, size pills, swatch rings, outline icon buttons), at least 3:1 against every surface. Use `border-control` / `ring-control`; hairlines stay for decoration.
- **Field Stroke** (#32363E): the input token stroke.
- **Chalk** (#F2F3F6): primary text and the primary (light) button fill.
- **Fog** (#93979F): secondary text, labels, legends. 6.9:1 against Stage Black.

### Status
- **Go Green** (#3BCE89): confirmations and unlocked perks (free delivery, club sign-up, order placed), usually as a 10% tint pill with Go Green text.
- **Alarm Red** (#F05656): field errors and destructive states.

### Named Rules
**The One Ember Rule.** Ember is the only warm UI colour, and it means "act" or "deal". It is never used as decoration, as a section background, or for a heading.

**The Borrowed Light Rule.** Atmospheric colour comes from the product, never from a palette pick. Glows, card light and the hero stage read `--glow`; set it from `glowFromSwatch()` on the element that owns the colourway. Soft pools of that light are the `.glow-pool` utility (a radial gradient, so no extra blur filter is needed); Tailwind's `bg-glow` is the solid colour, for dots and beads.

## Typography

**Display Font:** Archivo Variable, width axis 125% (with system-ui fallback)
**Body Font:** Archivo Variable, normal width
**Label Font:** Archivo Variable, width 112%

Archivo is self-hosted as one variable file (wdth 62 to 125, wght 100 to 900). Its width axis carries the hierarchy: one family, three widths.

**Character:** athletic and engineered. The display setting is wide, heavy and tight like a stadium scoreboard; the UI setting is plain and calm so the product can lead.

### Hierarchy
- **Display** (800, clamp(2.75rem, 7vw, 6rem), line-height 0.92, -0.035em, upper case, balanced wrap): hero product name, page titles (listing, product detail). Up to clamp(3rem, 12vw, 6rem) on single-word moments.
- **Headline** (800, clamp(2rem, 4.5vw, 3.5rem) up to clamp(2.25rem, 6vw, 5.5rem) for feature sections, same setting as Display): section titles on the home page.
- **Title** (600, 1rem, tight leading): product names on cards, row titles in menus and the bag. Small display-set titles (1.25rem to 2rem) head panels and sport tiles.
- **Body** (400, 1rem, 1.5): descriptions and supporting copy; secondary copy is 0.875rem in Fog, kept to about 24 to 60ch.
- **Label** (600, 0.6875rem, 0.16em tracking, upper case, wdth 112): filter legends, footer column heads, spec terms, table headers, badges. Labels name a control or a data group; they never sit above a headline as decoration.

Prices and counts always use tabular figures.

### Named Rules
**The Width-Is-Hierarchy Rule.** Rank is expressed by Archivo's width axis and weight, not by switching families. Never add a second typeface.

## Layout

Content sits in a centred container capped at 1440px, with side gutters of 20px (mobile), 32px (md) and 48px (lg). The header is a floating island 12 to 16px from the top edge; pages reserve 72px for it (`--header-h`) and start their content at about 112 to 144px.

Home sections are separated by 112px on mobile and 144px from md up. The hero is a two-column stage on large screens (copy and buy box left, the shoe right at about half the viewport width: `min(58vw, …)`, never shorter than 44vw) and stacks shoe-first on mobile, the shoe capped at min(88vw, 46svh). Product grids are dense, two up on mobile and three to four up on desktop, with a filter rail on the listing page. The home page carries one scroll-pinned sequence (a 260vh "lab" section) where the shoe turns a few degrees and spec callouts draw in. The callout layer shares the shoe's box, so each dot stays on its part of the shoe (weight at the heel, foam stack in the midsole, drop at the forefoot). The pin is used only from 768px wide and 640px tall, and not under reduced motion; elsewhere the section is a static layout in its final state.

**The Stage-First Rule.** On any surface that sells one shoe, the shoe gets the largest area on the screen, and type never overlaps it.

## Elevation & Depth

Depth comes from light, not from stacked drop shadows. Surfaces step up in tone (Stage Black to Steel Surface to Steel Raised), raised panels carry a one-pixel top highlight with a long, soft dark shadow, and products float on their own coloured light.

### Shadow Vocabulary
- **Edge light** (`inset 0 1px 0 0 hsl(0 0% 100% / 0.07), 0 24px 60px -24px hsl(0 0% 0% / 0.8)`): product cards and raised panels.
- **Island** (`0 20px 60px -20px rgba(0,0,0,0.8)` with 24px backdrop blur): the header island once scrolled, and the mega menu (`0 40px 80px -30px rgba(0,0,0,0.9)`).
- **Product float** (`drop-shadow(0 30px 40px rgba(0,0,0,0.65))`): every shoe cut-out.
- **Glow hover** (`0 0 40px -6px hsl(var(--glow) / 0.7)` on primary, `0 0 44px -4px hsl(var(--signal) / 0.75)` on signal): button hover only.

### Named Rules
**The Light-Not-Shadow Rule.** Lift is shown with a top highlight and coloured light. Hard, offset or opaque shadows are not part of this world.

## Shapes

Nearly everything you press is a full pill: buttons, icon buttons, nav items and their sliding indicator, badges, swatches, the quantity stepper, the header itself. Containers are generously rounded: 28px for product cards, the mega menu and overlays; 36px for the largest feature panels; 16px for inputs and menu rows; 12px for size chips and small tiles. Borders are hairlines at 6 to 8% white or Steel High. Circles recur as a motif: dashed orbit rings around hero products and two-tone diagonal colourway swatches.

## Components

### Buttons
Tactile and quiet at rest, lit on hover.
- **Shape:** full pill. Heights 36px (sm, 16px padding), 48px (md, 24px), 56px (lg, 32px). Semibold, tight tracking.
- **Primary:** Chalk fill, Stage Black text. Hover goes pure white and picks up a glow in the current `--glow` colour.
- **Signal:** Ember fill, Stage Black text, for the one commit action per view ("Add to bag", "Checkout", "Place order"). Hover brightens and glows ember.
- **Outline / Ghost:** transparent; outline adds a Steel High stroke. Hover fills Steel Raised.
- **States:** every button scales to 0.97 on press; disabled is 40% opacity. Transitions are 300ms on the site ease.

### Chips and Swatches
- **Size and filter chips:** 40px tall, 12px corners, Control stroke at rest; selected is a Chalk fill with Stage Black text. Category tabs and other segmented choices are pills whose selection indicator slides between options on a spring.
- **Colourway swatches:** 20px circles split diagonally into the colourway's two colours inside a 24px (cards) or 32px (hero) hit area, ringed in Chalk when active and in Control otherwise. On product cards, hover or click previews that colourway in place; focus alone never changes content.
- **Size pills:** the hero uses a radiogroup of 44px-tall, 12px-cornered pills with a Control stroke; selected is a Chalk fill, sold out is struck through and disabled. Arrow keys move the selection.

### Cards / Containers
- **Product card** (adapted from the 21st.dev "Product Card" by ravikatiyar162): 4:5 Steel Surface tile, 28px corners, 6% white hairline, Edge light. On a hovering fine pointer (and not under reduced motion) it tilts up to 7 to 9 degrees toward the pointer on a spring and a 260px glow in the colourway's colour follows the cursor; the shoe floats forward on its own depth layer, lifting and turning slightly on hover. The shoe image never animates a blur, so the CSS drop-shadow stays visible. A small masked grid and a resting pool of colourway light sit under the shoe. Badges top left, favourite top right, swatches bottom left; name, price and tagline sit below the tile, not on it.
- **Panels and overlays:** Steel Surface at 86% with backdrop blur, 28px corners, Island shadow.

### Inputs / Fields
- **Style:** 56px tall, Steel Surface fill, Control stroke, 16px corners, 20px inner padding, label above in 0.875rem medium.
- **Focus:** the stroke turns Ember and the global focus ring (2px Ember, 3px offset) shows as well; inputs never suppress the outline. Every field has a visible label.
- **Error:** Alarm Red stroke and an Alarm Red message below, wired with `aria-describedby`.

### Navigation
- **Header island:** a full-pill bar, 56px (60px from md), capped at 1440px. Transparent over the hero; once scrolled it becomes Steel Surface at 72% with blur and the Island shadow. It slides away on scroll down and returns on scroll up.
- **Nav items:** pill-shaped; a translucent white pill indicator morphs between hovered and active items. Hovering a category opens a mega menu of product rows.
- **Icon buttons:** 40px circles, 80% Chalk icons at 1.75 stroke; the bag count is an Ember bubble.
- **Mobile:** a slide-in menu and a slide-in bag drawer share one overlay component.

### Hero Showcase (signature)
Adapted from the 21st.dev "Spatial Product Showcase" by daiwiikharihar. The active shoe floats inside two orbit rings (dashed outer ring turning once per 40s, solid inner ring the other way once per 60s, with a glowing bead), over a breathing pool of `--glow` light, with a slight pointer parallax. A floating dock (a group of toggle buttons, with a polite live region announcing the change) switches between four featured shoes, each opening on a colourway that lights the stage differently: Air Runner in Black/Ember (ember), Tempo Elite in Electric Blue (blue), Velocity in Volt (yellow-green) and Glide Max in Lilac (lilac). Each switch re-tints the stage light and the shoe blurs out and springs back in; the first image does not animate in, so it can be the LCP element. The buy box sits beside it: name, then the tagline as a muted subhead (no label above the heading), price, a colourway swatch row, the size pills and "Add to bag". Picking a colourway swaps the shoe and re-tints the light; a size that is sold out in the new colourway is dropped from the selection. At the 10-per-size limit the button reports it inline instead of opening the bag.

### Motion
- **Ease:** one curve for the whole site, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Rise:** sections enter from 28px below, 10px blur and zero opacity to sharp in 0.9s, once, when 12% into view; children stagger by 80ms.
- **Springs:** layout and pill indicators (stiffness 260, damping 30), card tilt (220, 22), colourway image swaps (200, 22).
- **Smooth scroll:** Lenis, skipped entirely under reduced motion.
- **Reduced motion:** the whole app runs under `MotionConfig reducedMotion="user"`. Transform and layout animations are skipped (nothing slides, scales or tilts) while opacity fades are kept, so content still appears gently. Infinite loops (orbit rings, glow pulse, float) and Lenis are off, CSS animations and transitions collapse to 0.01ms, the lab section is static, and the marquee stops. Outside reduced motion the marquee pauses on hover and on focus-within.

## Product imagery

Shoes are cut-outs on transparent WebP, one per colourway, in `src/assets/products/`. Two are original, logo-free AI-generated renders (Air Runner in Black/Ember and Flex Motion in Ember); the other 28 colourways are derived from those two by `scripts/recolor-colorways.ts`, which recolours the upper and the sole as two separate regions. Every file, the two originals included, is trimmed to its alpha bounding box with about 3% transparent padding and capped at 800px on the longest side (WebP, quality 82), so a shoe fills the box it is placed in; the script is idempotent and re-running it with `--force` regenerates the 28 derived images from the trimmed originals. Light colourways use softer contrast and a lightness floor so no dark mesh speckle or brown cast shows. No image carries another brand's mark. New shoes follow the same rule: transparent cut-out, three-quarter side view, no logos, two-tone colourway listed as a swatch pair.

## Do's and Don'ts

### Do:
- **Do** set `--glow` from the active colourway (`glowFromSwatch`) on any stage, card or section that shows one shoe.
- **Do** keep Ember for the single commit action per view, sale signals and focus.
- **Do** set headlines in the display style (wdth 125, 800, upper case, 0.92 leading) and everything else at normal width.
- **Do** make every button, badge and nav item a pill and every product container 28px-rounded.
- **Do** enter sections with the shared rise variant and the site ease; use springs for anything the pointer moves.
- **Do** gate every looping or pointer-driven motion behind `prefers-reduced-motion`.
- **Do** use tabular figures for prices, counts and sizes.

### Don't:
- **Don't** introduce a light theme, white tiles or a white page section; the stage is always dark.
- **Don't** add a second accent colour or use Ember as a fill for decoration or headings.
- **Don't** add a second typeface or a system display face; widths of Archivo carry the hierarchy.
- **Don't** use hard, offset or opaque shadows; depth is a top highlight and coloured light.
- **Don't** put small upper-case labels above headlines as decoration; labels name controls and data only.
- **Don't** use photography or renders that show any other brand's logo, or place type over the shoe.
