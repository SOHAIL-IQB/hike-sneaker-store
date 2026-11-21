# Implementation Plan: Hike storefront redesign and repo polish

Source of product truth: `PRODUCT.md`

## Overview

This is a full visual and UX redesign of the Hike sneaker store. It stays frontend only, on the existing Vite + React + TypeScript + Tailwind + shadcn stack. The patterns come from big athletic storefronts like Nike, Adidas and Puma:
- editorial campaign hero;
- mega-menu navigation;
- category and "shop by sport" rails;
- filterable product listing page (PLP);
- rich product detail page (PDP) with gallery, colorways and a size grid;
- slide-out cart;
- multi-step simulated checkout.

The identity is original. The catalog grows to about 18 products. GA4 tracking is kept on every funnel step.

The GitHub repo also gets polished:
- new README with screenshots and a feature list;
- description, topics and website link;
- license check;
- CI workflow and build badge.

## Architecture Decisions

- **Keep the stack, prune the weight.** About 45 unused shadcn components and unused deps (recharts, react-day-picker, input-otp, react-resizable-panels and others) get removed. Smaller bundle, cleaner repo.
- **Static catalog as the source of truth.** `src/data/products.ts` holds a typed `Product` with id, slug, name, category, gender, price, compare-at price, colorways (each with its own images), sizes, badges ("New", "Bestseller"), description and features. Filters, search and sort are pure functions over this array.
- **Client state in one store.** Cart, favorites and recently viewed live in React context with a `useReducer`, persisted to localStorage and wrapped in try/catch. No backend.
- **Analytics stays behind `trackEvent()`.** The existing event names and parameters are preserved. New interactions (search, filter, favorite, begin checkout) get events in the same style. The GA4 snippet in `index.html` is unchanged.
- **Route-level code splitting** with `React.lazy`, plus a `vercel.json` SPA rewrite so deep links like `/products/velocity` don't 404 on refresh.
- **Images** are converted to WebP at 2 sizes, lazy-loaded below the fold, with explicit width and height to avoid layout shift.
- **Visual world** is decided in the design step (Impeccable new-work) before any UI code. It ends in a `DESIGN.md` covering tokens, type, color, components and motion.

## Task List

### Phase 0: Direction (no code)
- [x] Task 1: Visual direction. The user chose the big-sportswear standard (Nike/Adidas/Puma craft bar). The build contract is in `.impeccable/surfaces/src-pages-index-tsx.md`. DESIGN.md is written from the finished build in Task 14, not before.

### Checkpoint: Direction approved ✅ (2026-11-21)

### Phase 1: Foundation
- [x] Task 2: Prune unused components and dependencies, add the SPA rewrite, set up route-level lazy loading.
- [x] Task 3: Design tokens (Tailwind theme and CSS variables), fonts, the new Hike logo and favicon.
- [ ] Task 4: Expanded catalog data model, about 18 products, and optimized images.
- [x] Task 5: Persistent cart, favorites and recently-viewed store, with unit tests.

### Checkpoint: Foundation
- [ ] `npm run build`, `npm run lint` and `npm test` all pass, and the app runs with the new tokens.

### Phase 2: Core shopping flow (vertical slices)
- [ ] Task 6: App shell. Announcement bar, header with mega-menu and search, mobile drawer nav, footer.
- [ ] Task 7: Home page. Campaign hero, trending rail, shop by sport, featured story, newsletter strip (frontend only).
- [ ] Task 8: Product listing. Category and gender routes, filter sidebar (category, size, color, price), sort, search results, empty state.
- [ ] Task 9: Product detail. Image gallery, colorway switcher, size grid with a size-guide dialog, add to bag, favorite, details accordion, "you may also like".
- [ ] Task 10: Bag. Slide-out mini-cart and a full cart page with quantity, size edit, remove and order summary.
- [ ] Task 11: Checkout. Multi-step flow (contact, shipping, simulated payment, review) with validation and an order confirmation page.

### Checkpoint: Funnel complete
- [ ] Full journey works by mouse and keyboard on 375 px and 1440 px widths.
- [ ] Every GA4 event fires (checked in the console log of `trackEvent`).

### Phase 3: Polish
- [ ] Task 12: Favorites page, 404 page, loading skeletons and error states.
- [ ] Task 13: Motion pass (reduced-motion safe), accessibility audit (WCAG 2.2 AA) and performance pass.
- [ ] Task 14: Design review: Impeccable critique and finish review, then the fixes from it.

### Checkpoint: Ship-ready

### Phase 4: Repository polish and release
- [ ] Task 15: README rewrite. Hero banner, live-demo link, screenshots and GIF, feature list, tech stack badges, GA4 event table, project structure, image credits.
- [ ] Task 16: GitHub metadata. Description, topics, homepage URL, social preview image, GitHub Actions CI (lint, test, build) with a status badge, issue and PR templates.
- [ ] Task 17: Commit in logical steps, push to `main`, and confirm Vercel redeploys and the live site works.

### Checkpoint: Complete
- [ ] Live site matches the local build.
- [ ] The repo page looks polished.
- [ ] The user has reviewed it.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Free stock sneaker photos often show real brand logos | Med | Pick logo-free or plain shots. If there aren't enough, reuse the existing AI renders across colorways with careful crops. |
| Pushing to `main` redeploys the live site immediately | Med | Only push after the full local checkpoint passes. Commit in small logical steps. |
| Changing GA4 event names would break the assignment's reports | Med | Keep existing names and params exactly. Only add new events. |
| Too close to Nike, Adidas or Puma visually | Med | Use their layout patterns, not their identity: original logo, palette, type and copy. |
| The GitHub social preview image can't be set through the API | Low | I generate the image and you upload it in Settings (one click). |
| npm blocked esbuild's install script | Low | The build already works with the prebuilt binary. Approve it only if a later step fails. |

## Open Questions

- None blocking. Visual direction is settled in Task 1, with your review.
