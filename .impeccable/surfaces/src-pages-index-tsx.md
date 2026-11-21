---
version: 1
slug: "src-pages-index-tsx"
primary_target: "src/pages/Index.tsx"
related_targets: ["src/pages/Products.tsx","src/pages/ProductDetail.tsx","src/pages/Cart.tsx","src/pages/Checkout.tsx"]
---

# Surface brief: Hike storefront (home, listing, product, bag, checkout)

Scope: the home page (Persuade), plus the shopping screens it leads into: listing, product detail, bag and checkout (Operate).
Audience: sneaker shoppers on phone and desktop, and portfolio reviewers. Job: find a pair, pick a size, buy.
Constraints: frontend only, GA4 events kept, original Hike identity.
Chosen direction: the category standard (the user chose it on 2026-11-21). The craft bar is Nike, Adidas and Puma, which the user named.

## Direction contract

THESIS: Hike as a big-sportswear storefront played straight, at the craft level of Nike, Adidas and Puma. It is image-led, fast and grid-dense. It keeps every convention a shopper expects and borrows none of those brands' identity: no swoosh, stripes or cat, and Hike's own wordmark, type and copy.

OWN-WORLD:
- Colors: white ground #FFFFFF, ink #111111, tile grey #F5F5F5, secondary text #707072, hairlines #E5E5E5. One Hike accent, signal orange #FF5A1F, used only for New/Sale flags, sale prices and focus rings.
- Type: Archivo throughout. Headlines are condensed (wdth 62–75), weight 800–900, uppercase, leading 0.9. UI text is normal width, weight 400–600.
- Components: black pill primary buttons and outlined pill secondaries. Square grey product tiles with the shoe centered, and name, category, color count and price stacked under them. A rectangular outlined size grid. Lucide icons at 1.5 stroke.

STORY: In one screen the visitor sees this season's campaign, then that Hike covers Running, Lifestyle, Training and Basketball. They browse what's trending, filter, pick a size, add to bag and check out without friction.

FIRST VIEWPORT:
- A 36px promo bar with rotating messages.
- A 60px header: the wordmark on the left. In the middle, New & Featured, Running, Lifestyle, Training, Basketball and Sale, which open mega-menus. On the right, a search pill, favorites and the bag with its count.
- A campaign media panel, full width and about 68vh, showing the hero shoe big on a graded studio field.
- Under the media, centered: a huge condensed headline and one line of copy, with no label above the headline. Then two pills, "Shop Running" (primary) and "Shop Air Runner".
- The top of the "Trending now" rail shows at the fold. Its tiles have quick-add.

Signature interaction: hovering a product tile crossfades to another colorway and shows its swatches. Adding to bag slides in an "Added to Bag" panel from the header with the item, size and a checkout button.
Motion grammar: 200ms ease-out fades and 300ms slides, no bounce. With reduced motion, everything is instant.

FORM: the category standard, the user's standing-exit choice over the roll. seed:bc96e574699a10a8

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
