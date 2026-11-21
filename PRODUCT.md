# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** shoppers browsing sneakers on phone or desktop. They find a pair by category or use, compare colorways and prices, pick a size, and go through cart and checkout.
- **Secondary:** recruiters, instructors and developers looking at the project as a portfolio piece. They judge the craft, how believable the shopping flow is, and how the analytics are wired.

## Product Purpose

Hike is a demo sneaker store. It was first built for an academic assignment on digital analytics, where it simulated a real shopping journey to show Google Analytics 4 tracking of user behavior and conversion events. The redesign turns it into a modern, portfolio-grade storefront while keeping that analytics purpose.

Success means:
- every step of the funnel (browse, view product, add to cart, checkout, purchase) works end to end with no backend;
- every step still fires its GA4 event;
- the site holds up next to big athletic-brand storefronts at first glance.

## Positioning

An original athletic brand, "Hike". It is not a clone or reskin of any real brand. Big sportswear storefronts (Nike, Adidas, Puma) are references for patterns and quality only: editorial campaign heroes, category navigation, dense product grids and fast product pages. Their logos, names, marks, copy and imagery are never used.

## Operating Context

- Frontend only. There is no server, database, payments or auth.
- All state lives in the browser: cart, favorites and recently viewed are kept in localStorage.
- Checkout is simulated. No real payment details are collected.
- Deployed on Vercel at https://hike-sneaker-store.vercel.app from the `main` branch of github.com/SOHAIL-IQB/hike-sneaker-store. Pushing to `main` redeploys the site.

## Capabilities and Constraints

- **Stack (existing, kept):** Vite, React 18, TypeScript, Tailwind CSS 3, shadcn/ui (Radix) and react-router-dom 6.
- **Routes to keep:** `/`, `/products`, `/products/:id`, `/cart`, `/checkout`, plus a 404 page.
- **GA4 stays:** measurement ID `G-RVBB8Q0CW5` is loaded in `index.html`, and events go through `trackEvent()` in `src/lib/analytics.ts`. The existing event names (`view_product`, `add_to_cart`, `purchase`, and any others already in the code) must keep firing with the same parameters.
- **Catalog:** grows from 4 products to about 16–20 across categories (Running, Lifestyle, Training, Basketball), with colorways, sizes and prices. Catalog data lives in static TypeScript.
- **Workflow:** changes are committed and pushed directly to `main`, as the user chose.

## Brand Commitments

- The name **Hike** is kept.
- The logo is a new, original Hike wordmark or mark. It must not resemble the Nike swoosh, the Adidas three stripes or trefoil, or the Puma cat.
- The current favicon (`public/favicon.png`) will be replaced by the new mark.
- **Visual standard:** the big-sportswear storefront convention, played straight at the craft level of Nike, Adidas and Puma. The user chose this on 2026-11-21. Their layouts and patterns are the bar; their identity (logos, names, type, copy, imagery) is never used.
- Existing product images that show another brand's mark must be replaced or retouched before launch. Today that's Velocity (a swoosh), Street Pro (a swoosh-like mark) and Air Runner (an "N" mark).

## Evidence on Hand

- Product renders already in the repo: `src/assets/hero-shoe.png`, `shoe-air-runner.png`, `shoe-velocity.png`, `shoe-street-pro.png` and `shoe-flex-motion.png`. They are AI-rendered shoes on white backgrounds.
- New product photos will come from free-license sources (for example Unsplash), each credited in the README. Images showing another brand's logo will not be used.
- There are no real reviews, ratings, customers, press or sales figures. The site must not present invented testimonials or stats as real. Any reviews shown are clearly demo content.

## Product Principles

1. The whole funnel has to work. Every page is a usable step toward a purchase, not a mockup.
2. Analytics is part of the build, not an afterthought. Every meaningful action is tracked, and the tracking is easy to point to in the code.
3. Original brand, industry-grade patterns: borrow conventions shoppers already know, never another brand's identity.
4. Fast on a phone. Images are optimized and the layout is mobile-first.

## Accessibility & Inclusion

Target WCAG 2.2 AA:
- the full flow works by keyboard;
- focus is always visible;
- color contrast passes;
- reduced-motion settings are respected;
- every product image has meaningful alt text.
