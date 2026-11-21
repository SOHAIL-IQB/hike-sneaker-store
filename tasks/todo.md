# Hike redesign: task list

Verification commands: `npm run lint`, `npm test`, `npm run build`. Visual checks at 375 px and 1440 px.

## Phase 0: Direction
- [x] **1. Visual direction.** Big-sportswear standard chosen. Contract in `.impeccable/surfaces/src-pages-index-tsx.md`. DESIGN.md comes after the build (Task 14).

## Phase 1: Foundation
- [ ] **2. Prune and infrastructure.** Remove unused shadcn components and deps, add `vercel.json` rewrite, lazy-load routes.
  - Accept: build passes, bundle is smaller, refreshing a deep link works in `vite preview`.
- [ ] **3. Tokens, fonts, logo, favicon.**
  - Accept: theme tokens are in Tailwind and CSS variables, the original Hike logo is an SVG, a new favicon is in place.
- [ ] **4. Catalog.** About 18 products with categories, colorways, sizes and badges, plus WebP images.
  - Accept: typed data, every product has alt text, images are credited.
- [ ] **5. Store.** Cart, favorites and recently viewed in localStorage.
  - Accept: unit tests cover add, merge, update, remove and persistence.

## Phase 2: Shopping flow
- [ ] **6. Shell.** Header, mega-menu, search, mobile drawer, footer.
- [ ] **7. Home.** Hero, rails, shop by sport, story, newsletter.
- [ ] **8. Product listing.** Filters, sort, search, category routes, empty state.
- [ ] **9. Product detail.** Gallery, colorways, size grid, size guide, add to bag, favorite, related products.
- [ ] **10. Bag.** Mini-cart drawer and cart page.
- [ ] **11. Checkout.** Steps, validation, confirmation page.
  - Accept (6–11): works by keyboard, responsive, existing GA4 events still fire.

## Phase 3: Polish
- [ ] **12. Favorites page, 404, skeletons.**
- [ ] **13. Motion, accessibility and performance pass.**
- [ ] **14. Design critique and finish review, plus fixes.**

## Phase 4: Repo and release
- [ ] **15. README rewrite.** Screenshots, features, GA4 event table, credits.
- [ ] **16. GitHub metadata.** Description, topics, homepage, CI workflow, badge, templates, social preview.
- [ ] **17. Push to main and verify the Vercel deploy.**
