# Contributing to Hike

Thanks for taking a look! Hike is a portfolio project, but fixes and ideas are welcome.

## Run it locally

```bash
git clone https://github.com/SOHAIL-IQB/hike-sneaker-store.git
cd hike-sneaker-store
npm install
npm run dev        # http://localhost:8080
```

## Before you open a pull request

```bash
npm run lint
npm test
npm run build
```

CI runs the same three commands on every push and pull request.

## Guidelines

- **Keep the design system.** Colours, type, spacing and motion rules are in [DESIGN.md](DESIGN.md). Use the tokens in `src/index.css` rather than hard-coded values.
- **Respect reduced motion.** New animations must stay off for `prefers-reduced-motion`.
- **Don't rename GA4 events.** `view_product`, `add_to_cart`, `begin_checkout` and `purchase` keep their names and parameters so existing reports keep working. New events are fine; document them in the README table.
- **Product images.** Add new colourways to `src/data/products.ts`, then run `npm run images:recolor`. Don't add images that show another brand's logo.
- **Small, focused commits** with a clear message (for example `fix: keep filters sticky on the listing page`).

## Reporting a bug or suggesting a feature

Use the [issue templates](https://github.com/SOHAIL-IQB/hike-sneaker-store/issues/new/choose). For bugs, include the page, the browser and device, and the steps to reproduce.
