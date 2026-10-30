# Marche - redesign pitch

A static, platform-free redesign concept for **Marche**, a cannabis delivery service in the South Bay of Los Angeles.

- **Preview (noindex):** https://mikko-creator.github.io/marche-redesign/
- **Design:** "NOIR MARCHÉ" - glassmorphism x tenebrism on Marche's own brand (the MARCHÉ wordmark, black, white,
  Marche yellow `#ffd100`, pinks, NATS / Poppins / Montserrat). Near-black grounds carved by one warm key light,
  smoked glass panes whose edges catch that light, product cut-outs and still lifes crossing section edges for depth,
  scroll-through reveals, parallax and hover light sweeps. See [docs/DESIGN.md](docs/DESIGN.md).
- **Architecture:** the information architecture of a large multi-state dispensary operator's site (utility bar, nav
  order, mega menus, footer columns, page types, URL patterns), carrying Marche's own content from its brand mockup.
- **Imagery:** Marche's own art from its brand file, plus AI-generated illustrative stills and one motion loop
  ([docs/MEDIA.md](docs/MEDIA.md)).

## What is in the pitch

Home; Shop (menu) and five category pages; Deals; Rewards (refer a friend, first-customer offer, deals sign-up);
Delivery areas hub, California hub and twelve delivery-area pages (Gardena, Hawthorne, El Segundo, Inglewood,
Manhattan Beach, Redondo Beach, LAX/Westchester, Hermosa Beach, Lawndale, Torrance, Carson, Ladera Heights); delivery
guide; blog hub; medical card and California law pages (official sources linked); About, Contact, FAQ, Events,
Careers; legal placeholders; site map; 404.

Every form on the preview is a demo and sends nothing. The menu shows the sample products and prices from Marche's
mockup. Hours, address, licence number and policy texts are to be confirmed with Marche before launch.

## Build

Node 18+ and `cwebp` on PATH; no npm dependencies.

```bash
node src/build.mjs            # -> dist/
node tools/serve.mjs --root dist --port 8080 --not-found 404.html
```

`src/content/site.json` holds every Marche fact with the place in the brand file it came from; `src/content/ia.json`
holds the navigation, mega menus and footer; templates are in `src/theme/`, styles in `src/styles/`.
