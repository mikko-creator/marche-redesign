# Media: logo, brand art, generated imagery and motion

This redesign pitch uses three kinds of imagery.

- **The High Grade logo** (`assets/brand/`) - the client's own files: the raised platinum logo on black and the flat
  black logo on white. The site shows the raised platinum version with its black background made transparent
  (`highgrade-logo-*.webp`, 310 to 1240 px wide). Two derived marks use the logo's own letter shapes: the giant footer
  wordmark sets HIGH and GRADE side by side on one line (`highgrade-wordmark*`), and the favicons use its H and G. The
  supplied files are kept outside the public copy.
- **Brand art and product photos** (`assets/photos/`) - from the Figma design file the pitch started from: the product
  cut-outs, the plants-at-night photo and the FLOWERS banner. They are used as supplied (resized and re-encoded to WebP
  by the build) with one exception: the FLOWERS banner's yellow duotone was recoloured to platinum for the new palette.
  Nothing in this folder was altered by AI.
- **Generated industry imagery** - the twelve stills in `assets/generated/` and the hero loop in `assets/media/` -
  was made for this pitch with AI image and video models. It is **illustrative mood only**: none of it shows High
  Grade, its store, staff, customers, products or brands, a real place, or a result. The twelve stills contain no
  people, hands or faces, and no generated image or video contains text, numbers, logos or brand marks. The hero loop
  shows one synthetic adult model; it is not a real person and not anyone's likeness.

## How the generated imagery was made

| | Model family | Provider |
|---|---|---|
| Stills | FLUX1.1 [pro] Ultra (text to image) | fal |
| Hero loop key frame | Marketing Studio Image 2.5 Flare (text to image, 4K) | Higgsfield |
| Hero loop | Kling 3.0 Pro (image to video), first and last frame set to that key frame | Higgsfield |

Every still followed one tenebrist brief: a subject shot on black in near-total darkness, one hard key light from the
upper left, deep shadow to the lower right, generous black space for type, fine grain. The exact prompts, aspect ratios
and alt texts are kept with the site content in `src/content/`.

The stills were generated with a warm golden key light for an earlier palette. For High Grade (November 2026) nine of
them and the hero loop were colour-graded so that light reads as platinum. The grade is deterministic and keeps
brightness, so the light keeps its shape and nothing was regenerated:
- the gold light, glows, glints and dust move to a cool neutral of the same luminance;
- on flower images, gold-lit greens are returned to green rather than turned grey;
- on the hero loop, skin and the joint's ember are left out of the grade.

Three stills keep their amber because it is the subject's real colour: the vape oil, the rosin and the amber glass
bottles.

Each still was reviewed at full size before it was accepted. Two were regenerated once: the pre-rolls (the first
version read as tobacco cigarettes) and the concentrate (the first version read as a sweet). The pre-roll still also
had one orange end ring recoloured to plain paper white by hand. Rejected versions are archived outside the site.

## Labelling

- Every JPEG in `assets/generated/` carries the IPTC digital source type `trainedAlgorithmicMedia` in its XMP
  metadata, and the build attaches the same XMP to every WebP variant it writes (`assets/img/<id>-<width>.webp`).
- Every generated `<img>` carries `data-ai="generated"`.
- The video files and both posters carry the same IPTC source type (video: container comment and description; posters:
  XMP).

## The stills

| id | aspect | what it shows | where the black space is | used by |
|---|---|---|---|---|
| `g-hero-bud` | 16:9 | one cured cannabis bud on black, trichomes catching a platinum key light, a smoke wisp | left half | home hero, social preview image |
| `g-bud-key` | 3:2 | macro of a cannabis flower in chiaroscuro | left third | Flower category, blog cards |
| `g-jars` | 3:2 | two plain glass jars of flower on black stone in a pool of platinum light | left 40% | Explore menu card, deals |
| `g-prerolls` | 3:2 | three unlit pre-rolls on dark slate, ground flower beside them | left half | Pre-rolls category |
| `g-vape` | 3:2 | one blank vape cartridge of amber oil on black glass (not graded) | left half | Vapes category |
| `g-concentrate` | 3:2 | a small dab of pale gold rosin on parchment, a dried bud beside it (not graded) | thin margins only | Concentrates category |
| `g-apothecary` | 3:2 | two unlabelled amber dropper bottles and a cannabis leaf (not graded) | top and top-left | Medical category, medical card page |
| `g-smoke-beam` | 16:9 | smoke drifting through one beam of platinum light | bottom-left, right edge | Resources menu card, laws pages, grounds |
| `g-palms-night` | 16:9 | palm silhouettes against a night sky with a silver horizon (generic, no landmark) | left two thirds | Delivery Areas menu card, delivery hubs |
| `g-doorstep` | 3:2 | a plain, unprinted paper bag on a dark doorstep under a porch light | dark door behind | delivery pages |
| `g-leaf-cut` | 4:5 | one cannabis fan leaf on pure black, platinum rim light | every side | screen-blended protrusions |
| `g-gold-dust` | 16:9 | platinum dust drifting in a shaft of light (the id is from the earlier palette) | left edge, lower right | band texture |

The palms and the doorstep are generic mood. They are never captioned as a place in the South Bay or anywhere else.

## The hero loop

`assets/media/hero-model.mp4` (1920x1080) and `assets/media/hero-model-sm.mp4` (a 720x1080 portrait crop for
phones), posters `assets/media/hero-model.jpg` and, for phones, `assets/media/hero-model-sm.jpg` (each file's first
frame, AI-labelled in its XMP): a 5-second slow-motion loop of an adult model in mirrored platinum shield sunglasses
and black cyberpunk techwear, exhaling a plume of smoke from a joint through one platinum key light, with distant city
lights. The key frame was generated at 4K and animated with the same frame as its first and last frame. That clip
slowed almost to a stop at both ends, so it was retimed to one constant motion speed and folded into itself with a
half-second crossfade: the last frame flows straight into the first (120 frames at 24 fps). It was then graded from
gold to platinum, frame by frame from the lossless frames, and re-encoded with the same settings. H.264, no audio track.

It is decorative: the page plays it muted, looped and inline, hides it from assistive technology, gives it a visible
pause / play button, and shows only the poster under `prefers-reduced-motion`. Registered in
`src/content/images.json` (`media.hero-model`). It depicts adult cannabis consumption: many ad platforms restrict that,
so confirm it before using the clip in paid channels.
