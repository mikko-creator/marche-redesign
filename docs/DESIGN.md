# Design system: "Noir Marché"

A redesign of Marche's site: Marche's own brand (the MARCHÉ wordmark, black, white, Marche yellow `#ffd100`, the
pinks `#edb6c2` / `#e28197`, red `#bc2426` for discount numbers; NATS, Poppins and Montserrat) set in a
glassmorphism x tenebrism look, on the information architecture of a large multi-state dispensary operator's site.

## Grounds and light (back plane)

- Near-black grounds (`--ink-0` to `--ink-2`). Each section is lit by ONE warm key light in Marche yellow: a radial
  pool placed with `--lx` / `--ly`, a raking beam, a deep vignette and fine grain.
- `.band` is a section; `.band--void` (calm black), `.band--lit` (one pool), `.band--beam` (a beam across), `.band--rose`
  (a pink counter-light for rewards), `.band--sun` (the one yellow "lights on" band per page, black text).
- Backdrops (photos, generated stills, video) sit in `.band__clip`, so protruding art can cross a band's edge while
  backdrops stay clipped. Light never sits under body text.

## Glass (mid plane)

- `.glass` is a smoked pane (blur + saturation) over something varied: a light pool, a photo, video.
- `.glass--lit`: the top-left edge catches the key light (a gradient hairline drawn as a border).
- `.glass--sun` (offers) and `.glass--rose` (rewards) are tinted panes; `.glass--strong` carries body text;
  `.glass--lift` lifts on hover while a light sheen sweeps across it.
- The header frosts on its own pseudo-element, so the mega menus can blur what is behind them.
- Phones (720 px and below): panes become opaque smoked fills without a live blur, which is costly on phone graphics
  chips; the lit edges and tints stay. The header bar, the age gate and the home hero's promo pane keep their blur.

## Depth (front plane)

- Cut-out product art (`.cut`) carries a drop shadow and a yellow rim light from the key-light side.
- Generated still lifes shot on black blend into the grounds with `.screen`.
- `.protrude` objects cross section seams; at most one or two per screen, smaller on phones, never sideways overflow.
- Scroll parallax (`[data-depth]`), pointer tilt (`[data-tilt]`) and a key light that follows the pointer
  (`[data-spot]`) add depth on desktop.

## Type

- NATS, always uppercase, set big and tight for display (`.display`, `.display--mega` once per page); one accent per
  heading at most (`.accent` yellow, `.accent--rose`, or an outlined word `.outline`).
- Poppins for UI: kickers in spaced caps (`.kicker`, no leading tick), buttons, nav, prices.
- Montserrat for body copy at 16 px, line height 1.65; `.lede` for intros, `.prose` for long text.

## Components

Buttons (`.btn--sun` yellow with black text, `.btn--glass`, `.btn--ghost`, a light sweep on hover), `.link-arrow`,
`.chip`, the product card `.pcard` (cut-out, NATS name, NATS yellow price, a round "+" button), `.stat`, `.faq`
(details / summary), `.crumbs`, `.demo-form`. Every preview form is a demo: it never posts anywhere and says so.

## Motion

Scroll reveals (fade-up with the light coming on, staggered), parallax, tilt, the pointer-follow key light, a seamless
marquee (pauses on hover and focus), an auto-rotating promo strip (pauses on hover and focus, real buttons for its
dots), mega menus with hover intent, a slow light sweep across the footer wordmark. All of it stops under
`prefers-reduced-motion: reduce`, and every revealed element is visible without JavaScript.

## Accessibility

One `<h1>` per page, landmarks, real links and buttons, a visible yellow focus ring, alt text, text contrast of at
least 4.5:1 (hero text sits straight on a dark ground with a local scrim, not on a glass box), 44 px tap targets on
phones, no visible text under 13 px. Navigation: every destination is reachable from the desktop bar from 1024 px up
(mega menus with image cards); below 1024 px a drawer with a focus loop, closed with Esc. The 21+ question is asked
once and remembered; it never blocks the page without JavaScript.
