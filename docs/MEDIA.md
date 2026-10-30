# Media: generated imagery and motion

This redesign pitch uses two kinds of imagery.

- **Marche's own art** - the MARCHÉ wordmark, the product cut-outs, the brand banners and photographs in
  `assets/brand/` and `assets/photos/` - comes from Marche's own Figma file. It is used as supplied (resized and
  re-encoded to WebP by the build), never altered by AI.
- **Generated industry imagery** - the twelve stills in `assets/generated/` and the smoke loop in `assets/media/` -
  was made for this pitch with AI image and video models. It is **illustrative mood only**: none of it shows Marche,
  its store, staff, customers, products or brands, a real place, or a result. No image contains people, hands or faces,
  text, numbers, logos or brand marks.

## How the generated imagery was made

| | Model family | Provider |
|---|---|---|
| Stills | FLUX1.1 [pro] Ultra (text to image) | fal |
| Motion loop | Kling 3.0 Turbo (image to video), animated from the generated still `g-smoke-beam` | Higgsfield |

Every still follows one tenebrist brief: a subject shot on black in near-total darkness, one hard warm golden-yellow
key light from the upper left, deep shadow to the lower right, generous black space for type, fine grain, touches of
Marche yellow and gold. The exact prompts, aspect ratios and alt texts are kept with the site content in
`src/content/`.

Each still was reviewed at full size before it was accepted. Two were regenerated once: the pre-rolls (the first
version read as tobacco cigarettes) and the concentrate (the first version read as a sweet). The pre-roll still also
had one orange end ring recoloured to plain paper white by hand. Rejected versions are archived outside the site.

## Labelling

- Every JPEG in `assets/generated/` carries the IPTC digital source type `trainedAlgorithmicMedia` in its XMP
  metadata, and the build attaches the same XMP to every WebP variant it writes (`assets/img/<id>-<width>.webp`).
- Every generated `<img>` carries `data-ai="generated"`.
- The video files carry the same IPTC source type in their container metadata (comment and description).

## The stills

| id | aspect | what it shows | where the black space is | used by |
|---|---|---|---|---|
| `g-hero-bud` | 16:9 | one cured cannabis bud on black, trichomes catching the key light, a smoke wisp | left half | home hero, social preview image |
| `g-bud-key` | 3:2 | macro of a cannabis flower in chiaroscuro | left third | Flower category, blog cards |
| `g-jars` | 3:2 | two plain glass jars of flower on black stone | left 40% | Explore menu card, deals |
| `g-prerolls` | 3:2 | three unlit pre-rolls on dark slate, ground flower beside them | left half | Pre-rolls category |
| `g-vape` | 3:2 | one blank vape cartridge on black glass | left half | Vapes category |
| `g-concentrate` | 3:2 | a small dab of pale gold rosin on parchment, a dried bud beside it | thin margins only | Concentrates category |
| `g-apothecary` | 3:2 | two unlabelled amber dropper bottles and a cannabis leaf | top and top-left | Medical category, medical card page |
| `g-smoke-beam` | 16:9 | smoke drifting through one beam of golden light | bottom-left, right edge | Resources menu card, laws pages, grounds; source of the loop |
| `g-palms-night` | 16:9 | palm silhouettes against a night sky with a gold horizon (generic, no landmark) | left two thirds | Delivery Areas menu card, delivery hubs |
| `g-doorstep` | 3:2 | a plain, unprinted paper bag on a dark doorstep under a porch light | dark door behind | delivery pages |
| `g-leaf-cut` | 4:5 | one cannabis fan leaf on pure black, gold rim light | every side | screen-blended protrusions |
| `g-gold-dust` | 16:9 | gold dust drifting in a shaft of light | left edge, lower right | band texture |

The palms and the doorstep are generic mood. They are never captioned as a place in the South Bay or anywhere else.

## The loop

`assets/media/loop-smoke.mp4` (1920 wide) and `assets/media/loop-smoke-sm.mp4` (small screens), poster
`assets/media/loop-smoke.jpg` (the first frame): a 9.3-second loop of smoke drifting through a still beam of golden
light on black. It was animated from the generated still `g-smoke-beam`, then made seamless with ffmpeg (the clip
played forward and then in reverse, with a short crossfade at the seam). H.264, no audio track. It is decorative: the page plays it muted, looped
and inline, hides it from assistive technology, and shows only the poster under `prefers-reduced-motion`. Registered
in `src/content/images.json` (`media.loop-smoke`).
