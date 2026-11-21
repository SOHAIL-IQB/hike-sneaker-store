---
version: 1
slug: "src-pages-index-tsx"
primary_target: "src/pages/Index.tsx"
related_targets: ["src/pages/Products.tsx","src/pages/ProductDetail.tsx","src/pages/Cart.tsx","src/pages/Checkout.tsx"]
---

# Surface brief: Hike storefront (home, listing, product, bag, checkout)

Scope: home (Persuade) plus listing, product detail, bag, checkout, favorites (Operate).
Audience: sneaker shoppers on phone and desktop; portfolio reviewers.
Job: find a pair, pick a size, buy.
Constraints: frontend only; keep GA4 events; original Hike identity.
Chosen direction: the user pinned it on 2026-11-21, replacing the earlier canon pick: "a good futuristic design with smooth motion, like leading frontend websites", built with 21st.dev components. The craft bar is still Nike, Adidas and Puma.

## Direction contract

THESIS: Hike as a night-lit product lab. Every shoe is staged as a lit object floating in a dark room, and the ambient light takes on the colour of the colourway on show. It refuses the white-tile catalogue grid as the first impression.

OWN-WORLD:
- Ground and surfaces: near-black stage #06070A, steel surfaces #101217 and #181B21, hairline borders #22252B.
- Accent: one ember signal #FF5A1F for actions, flags and focus.
- Glow: an ambient radial glow driven by the --glow token from each colourway's swatch, plus a faint 64px engineering grid.
- Type: Archivo expanded (wdth 125, weight 800) for headlines; normal width for UI text.
- Components: pill buttons; floating island header with a morphing pill indicator; 3D tilt product cards with a cursor-tracking glow (21st.dev Product Card); dashed orbit rings around hero products (21st.dev Spatial Product Showcase).

STORY: The visitor meets the Air Runner floating in its own light and can change colourway, pick a size and add it to the bag right there. They then move into sports, the trending rail, the tech story and the full catalogue.

FIRST VIEWPORT:
- Floating island header across the top.
- Left: the product name huge in expanded caps, a one-line tagline, the price, a size row and "Add to bag".
- Right: the shoe at about 55vw, floating in an orbit ring and lit by its colourway glow, with a parallax drift.
- Bottom centre: a floating dock switches between four featured shoes. The background glow and grid re-tint on every switch.

Signature interaction: switching shoe or colourway re-tints the page's ambient light, and the shoe blurs out and springs back in.
Motion grammar: Lenis smooth scroll, blur-to-sharp rises on section entry, spring layout transitions on filters and pills, and one scroll-linked lab sequence where the shoe rotates and the spec callouts draw in. With reduced motion everything is static.

FORM: user-pinned direction. seed: none (pinned) — "a good futuristick desgine with smoth moton … use the 21st MCP"

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
