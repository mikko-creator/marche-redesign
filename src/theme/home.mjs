// home.mjs - the home page "/" (HOME lane, "NOIR MARCHÉ"). Section order = the adopted operator's home (contract 6
// HOME, 13 sections); every visible fact is read from ctx.site (site.json) or ctx.ia (ia.json), never retyped. New words
// are neutral glue only (section labels, button labels, one-line format descriptions). No inline JS (contract D6).
import fs from 'node:fs';
import path from 'node:path';
import { page, icon } from './shell.mjs';
import { esc, escA, linkAttrs, gimg, photo, absUrl, areas, demoForm, hasGenerated, imgUrl } from './util.mjs';
import { ROOT } from '../lib/paths.mjs';

const must = (v, what) => { if (v == null || v === '' || (Array.isArray(v) && !v.length)) throw new Error('home: missing content: ' + what); return v; };

// every link the ia.json nav carries, [href, label] in nav order (labels are the ia's own words)
function iaLinkList(ia) {
  const out = [];
  for (const n of ia.nav || []) {
    if (n.href) out.push([n.href, n.label]);
    if (n.feature) out.push([n.feature.href, n.feature.title]);
    for (const g of n.mega || []) for (const l of g.links || []) out.push(l);
  }
  return out;
}

// the Higgsfield hero loop, only when it is registered in images.json AND its files are on disk (fail closed: else
// the still). 'hero-model' (the operator's revision: a model in cyberpunk shades, slow-motion exhale) wins over the
// first build's 'loop-smoke'.
function heroLoop(ctx) {
  const media = (ctx.images && ctx.images.media) || {};
  const id = media['hero-model'] ? 'hero-model' : 'loop-smoke';
  const m = media[id];
  if (!m) return null;
  const norm = (u) => (typeof u === 'string' && u ? (u.startsWith('/') ? u : '/' + u) : '');
  const exists = (u) => !!u && u.startsWith('/assets/media/') && fs.existsSync(path.join(ROOT, u.slice(1).split(/[?#]/)[0]));
  const pick = (...c) => c.map(norm).find(exists) || '';
  const mp4 = pick(m.mp4, m.src, m.file, `assets/media/${id}.mp4`);
  if (!mp4) return null;
  return {
    id,
    mp4,
    webm: pick(m.webm, `assets/media/${id}.webm`),
    phone: pick(m.phone, m.mp4Phone, m.mp4Small, m.sm, m.small, `assets/media/${id}-sm.mp4`, `assets/media/${id}-phone.mp4`),
    poster: pick(m.poster, `assets/media/${id}.jpg`, `assets/media/${id}-poster.webp`, `assets/media/${id}-poster.jpg`),
    // phones: the first frame of the phone cut (720x1080), so the 1920px desktop poster never reaches a phone
    posterPhone: pick(m.posterSmall, m.posterPhone, `assets/media/${id}-sm.jpg`),
  };
}

// wrap the last word of a plain string in .accent (text unchanged)
function accentLast(s, cls = 'accent') {
  const t = String(s).trim();
  const i = t.lastIndexOf(' ');
  return i === -1 ? `<span class="${cls}">${esc(t)}</span>` : `${esc(t.slice(0, i))} <span class="${cls}">${esc(t.slice(i + 1))}</span>`;
}

const head = (kicker, h2Html, id, extra = '') => `<div class="h-head${extra ? ' ' + extra : ''}" data-reveal><p class="kicker">${esc(kicker)}</p><h2 id="${id}" class="display h-head__h">${h2Html}</h2></div>`;

export async function render(ctx) {
  const site = must(ctx.site, 'site.json');
  const ia = must(ctx.ia, 'ia.json');
  const links = iaLinkList(ia);
  const iaHref = (label) => must((links.find(([, l]) => l === label) || [])[0], 'ia link "' + label + '"');
  const iaLabel = (h) => (links.find(([u]) => u === h) || [])[1];
  // a top-level nav label ("Rewards"), not the first mega link that shares its href ("Refer a friend")
  const navLabel = (h) => ((ia.nav || []).find((n) => n.href === h) || {}).label;

  const tag = must(site.tagline && site.tagline.lines, 'tagline lines');
  if (tag.length !== 3) throw new Error('home: tagline must have 3 lines');
  const hrs = must(site.hours, 'hours');
  const del = must(hrs.delivery, 'delivery hours');
  const pick = must(hrs.pickup, 'pick-up hours');
  const cats = must(site.categories, 'categories');
  const cat = (slug) => must(cats.find((c) => c.slug === slug), 'category ' + slug);
  const products = must(site.products, 'products');
  const deals = must(site.deals, 'deals');
  const fc = must(site.firstCustomer, 'firstCustomer');
  const ref = must(site.referral, 'referral');
  const ins = must(site.insider, 'insider');
  const dealsHref = iaHref('Deals');
  const shopCta = must(ia.cta, 'ia.cta');
  const areasHref = must(ia.utility && ia.utility.delivery && ia.utility.delivery.href, 'ia.utility.delivery.href');
  const areaList = areas(ctx);
  if (areaList.length !== 12) throw new Error('home: expected 12 delivery areas, got ' + areaList.length);

  // ---------- 1. hero: a tenebrist stage. H1 straight on the dark ground (D10: no glass box), the key light follows
  // the pointer ([data-spot] sets --lx/--ly), the promo carousel as a glass rotator strip, the two priced products as
  // cut-outs that cross the hero's bottom edge into the hours band ----------
  const loop = heroLoop(ctx);
  // the poster <img> sits under the video and covers it until the first frame, so the video carries no poster
  // attribute (that would fetch the 1920px still on phones too); phones get the phone frame through <picture>
  const posterImg = loop && loop.poster ? `<img class="h-hero__poster" src="${escA(loop.poster)}" alt="" decoding="async" fetchpriority="high">` : '';
  const poster = posterImg && loop.posterPhone ? `<picture><source media="(max-width: 720px)" srcset="${escA(loop.posterPhone)}">${posterImg}</picture>` : posterImg;
  const heroBg = loop
    ? `<div class="band__bg h-hero__film">${poster}<video class="h-hero__video" autoplay muted loop playsinline preload="auto" aria-hidden="true" tabindex="-1">${loop.phone ? `<source src="${escA(loop.phone)}" type="video/mp4" media="(max-width: 720px)">` : ''}${loop.webm ? `<source src="${escA(loop.webm)}" type="video/webm">` : ''}<source src="${escA(loop.mp4)}" type="video/mp4"></video></div>`
    : gimg('g-hero-bud', { cls: 'band__bg h-hero__bg', alt: '', eager: true, sizes: '100vw' });
  const promoSlides = [
    { href: '/rewards/#first-customer', ico: 'user', k: fc.sub, t: fc.title },
    { href: dealsHref, ico: 'tag', k: iaLabel(dealsHref) || 'Deals', t: [deals[0].big, deals[0].small, deals[0].what].filter(Boolean).join(' ') },
    { href: '/rewards/', ico: 'gift', k: navLabel('/rewards/') || 'Rewards', t: ref.title },
  ];
  const promos = `<div class="h-promos glass glass--lit" data-rotator role="region" aria-roledescription="carousel" aria-label="Promotions">
<div class="rotator__stage h-promos__stage">
${promoSlides.map((s, i) => `<a class="h-promo" data-slide${linkAttrs(s.href)} aria-label="${escA(s.k + ': ' + s.t)}"><span class="h-promo__ico" aria-hidden="true">${icon(s.ico)}</span><span class="h-promo__txt"><span class="h-promo__k">${esc(s.k)}</span><span class="h-promo__t">${esc(s.t)}</span></span>${icon('arrow', 'h-promo__go')}</a>`).join('\n')}
</div>
<div class="h-promos__dots" data-rotator-dots></div>
</div>`;
  const [pa, pb] = products;
  const heroHtml = `<section class="h-hero band band--void" data-spot aria-labelledby="h-hero-h1">
<div class="band__clip h-hero__clip" aria-hidden="true">${heroBg}<span class="h-hero__scrim"></span><span class="pool h-hero__pool"></span><span class="h-hero__beam"></span><span class="h-hero__vig"></span></div>
<div class="wrap wrap--wide h-hero__inner">
<div class="h-hero__copy">
<p class="kicker h-hero__kicker" data-reveal>${esc(site.region)}</p>
<h1 id="h-hero-h1" class="display h-hero__h1" data-reveal style="--i:1"><span class="h-hero__l1">${esc(tag[0])}</span> <span class="h-hero__l2">${esc(tag[1])}</span> <span class="h-hero__l3 accent">${esc(tag[2])}</span></h1>
<div class="btn-row h-hero__ctas" data-reveal style="--i:2"><a class="btn btn--sun"${linkAttrs(shopCta.href)}>${esc(shopCta.label)}${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs(areasHref)}>${icon('pin')}${esc(site.deliveryAreas.title)}</a></div>
<div class="h-hero__promos" data-reveal style="--i:3">${promos}</div>
</div>
<div class="h-hero__stage">
<span class="h-hero__halo" aria-hidden="true"></span>
<div class="h-hero__prod h-hero__prod--b protrude"><div class="h-hero__lift" data-depth="0.06">${photo(ctx, pb.photo, { cls: 'cut h-hero__cut', sizes: '(max-width: 720px) 34vw, (min-width: 768px) 24vw, 44vw' })}</div></div>
<div class="h-hero__prod h-hero__prod--a protrude"><div class="h-hero__lift" data-depth="0.12">${photo(ctx, pa.photo, { cls: 'cut h-hero__cut', sizes: '(max-width: 720px) 44vw, (min-width: 768px) 30vw, 54vw' })}</div></div>
</div>
</div>
</section>`;

  // ---------- 2. Delivery / Pick-up hours (the Figma's first block), lit glass ticket; the products land on its right ----------
  const hoursHtml = `<section class="h-hours band band--lit" aria-labelledby="h-hours-h">
<div class="band__clip" aria-hidden="true"><span class="h-hours__beam"></span></div>
<div class="wrap wrap--wide">
<div class="h-hours__panel glass glass--lit" data-reveal>
<h2 id="h-hours-h" class="kicker h-hours__k">${icon('clock')}Hours</h2>
<dl class="h-hours__list">
<div class="h-hours__item"><dt class="h-hours__label">${icon('truck')}${esc(del.label)}</dt><dd class="h-hours__value">${esc(del.value)}</dd></div>
<div class="h-hours__item"><dt class="h-hours__label">${icon('bag')}${esc(pick.label)}</dt><dd class="h-hours__value">${esc(pick.value)}</dd></div>
</dl>
</div>
</div>
</section>`;

  // ---------- 3. shop by category: the Figma menu bar as six lit image cards ----------
  const CAT_ART = { flower: 'g-bud-key', 'pre-rolls': 'g-prerolls', vapes: 'g-vape', concentrates: 'g-concentrate', medical: 'g-apothecary' };
  const menu = must(site.menuBar, 'menuBar').map((label) => {
    if (/^deals$/i.test(label)) return { label, href: dealsHref, art: 'g-jars' };
    const c = must(cats.find((x) => x.label === label), 'category for menu label ' + label);
    return { label, href: '/shop/' + c.slug + '/', art: must(CAT_ART[c.slug], 'category art ' + c.slug) };
  });
  const catsHtml = `<section class="h-cats band band--void" aria-labelledby="h-cats-h">
<div class="wrap wrap--wide">
${head('Menu', 'Shop by <span class="accent">category</span>', 'h-cats-h')}
<ul class="h-cats__grid" role="list">${menu.map((m, i) => `<li class="h-cats__item" data-reveal style="--i:${i}"><a class="h-cat glass glass--lit glass--lift"${linkAttrs(m.href)}><span class="h-cat__media">${gimg(m.art, { alt: '', sizes: '(max-width: 720px) 42vw, (min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw' })}</span><span class="h-cat__name">${esc(m.label)}${icon('arrow', 'h-cat__go')}</span></a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 4. brands on the menu: High 90's + THC Design, each cut-out stepping out of the top of its pane ----------
  const BRAND_ART = { "High 90's": 'high-90s-preroll-pack.webp', 'THC Design': 'crescendo-jar.webp' };
  const brands = must(site.brandsOnMenu, 'brandsOnMenu');
  const brandsHtml = `<section class="h-brands band band--lit" aria-labelledby="h-brands-h">
<div class="band__clip" aria-hidden="true"><span class="h-brands__pool"></span></div>
<div class="wrap wrap--wide">
${head('Brands', 'Brands on the <span class="accent">menu</span>', 'h-brands-h')}
<ul class="h-brands__grid" role="list">${brands.map((b, i) => `<li class="h-brands__item" data-reveal style="--i:${i}"><a class="h-brand glass glass--lit glass--lift"${linkAttrs(iaHref(b.name))}><span class="h-brand__art" aria-hidden="true">${photo(ctx, must(BRAND_ART[b.name], 'brand art ' + b.name), { cls: 'cut', alt: '', sizes: '(max-width: 720px) 27vw, (min-width: 768px) 26vw, 50vw' })}</span><span class="h-brand__name">${esc(b.name)}</span><span class="link-arrow h-brand__go">Shop ${esc(b.name)}${icon('arrow')}</span></a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 5. statement: the page's one "lights on" yellow band, the tagline in mega display type ----------
  const statementHtml = `<section class="h-statement band band--sun" aria-label="${escA(tag.join(' '))}">
<div class="wrap wrap--wide">
<p class="display display--mega h-statement__t" data-reveal><span class="h-statement__a">${esc(tag[0])} ${esc(tag[1])}</span> <span class="h-statement__b outline">${esc(tag[2])}</span></p>
</div>
</section>`;

  // ---------- 6. FLOWERS menu row: the gold-flowers banner (its lettering is the heading), the two product cards, view all ----------
  const flower = cat('flower');
  const flowerProducts = products.filter((p) => p.category === 'flower');
  // [data-tilt] sits on a wrapper: .pcard:hover sets its own transform and would cancel the tilt on the same element
  const pcard = (p, i) => `<div class="h-tilt" data-tilt data-reveal style="--i:${i}"><article class="pcard h-pcard">
<div class="pcard__media">${photo(ctx, p.photo, { cls: 'cut', sizes: '(max-width: 720px) 39vw, (min-width: 1024px) 26vw, (min-width: 768px) 40vw, 46vw' })}</div>
<h3 class="pcard__name"><a${linkAttrs('/shop/' + p.category + '/')}>${p.nameLines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</a></h3>
<p class="pcard__price">${esc(p.price)}</p>
<a class="pcard__add"${linkAttrs('/shop/')} data-demo-add aria-label="${escA('Add ' + p.name)}">${icon('plus')}</a>
</article></div>`;
  const flowersHtml = `<section class="h-flowers band band--void" aria-labelledby="h-flowers-h">
<div class="wrap wrap--wide">
<h2 id="h-flowers-h" class="h-vh">${esc(flower.plural)}</h2>
<div class="h-flowers__banner" data-reveal>${photo(ctx, 'gold-flowers-banner.webp', { alt: '', sizes: '(max-width: 720px) 92vw, (min-width: 1440px) 1360px, 96vw' })}</div>
<div class="h-flowers__row">
${flowerProducts.map(pcard).join('\n')}
<a class="h-flowers__all"${linkAttrs('/shop/' + flower.slug + '/')} data-reveal style="--i:${flowerProducts.length}"><span class="h-flowers__all-t">${esc(flower.viewAll)}</span>${icon('arrow')}</a>
</div>
</div>
</section>`;

  // ---------- 7. pre-rolls + vapes spotlights: category art under smoked glass, a screen-blended leaf crossing the seam ----------
  const SPOT = [
    { slug: 'pre-rolls', art: 'g-prerolls', line: 'Ground flower, pre-rolled in paper.' },
    { slug: 'vapes', art: 'g-vape', line: 'Cannabis oil in a cartridge for a vape battery.' },
  ];
  const spotsHtml = `<section class="h-spots band band--lit" aria-label="${escA(SPOT.map((s) => cat(s.slug).label).join(' and '))}">
<div class="band__clip" aria-hidden="true"><span class="h-spots__pool"></span></div>
<div class="wrap wrap--wide h-spots__grid">
${SPOT.map((s, i) => { const c = cat(s.slug); return `<article class="h-spot" aria-labelledby="h-spot-${c.slug}" data-reveal style="--i:${i}">
<div class="h-spot__media">${gimg(s.art, { alt: '', sizes: '(max-width: 720px) 35vw, (min-width: 1024px) 46vw, 96vw' })}</div>
<div class="h-spot__body glass glass--lit">
<p class="kicker">Spotlight</p>
<h2 id="h-spot-${c.slug}" class="display h-spot__h">${esc(c.plural)}</h2>
<p class="h-spot__p">${esc(s.line)}</p>
<a class="link-arrow"${linkAttrs('/shop/' + c.slug + '/')}>${esc(c.viewAll)}${icon('arrow')}</a>
</div>
</article>`; }).join('\n')}
</div>
</section>
<div class="h-seam h-seam--leaf" aria-hidden="true"><span class="h-seam__art screen"><span class="h-seam__in" data-depth="0.15">${gimg('g-leaf-cut', { alt: '', sizes: '(max-width: 720px) 22vw, (min-width: 768px) 18vw, 30vw' })}</span></span></div>`;

  // ---------- 8. deals trio: site.json deals, big NATS numbers on yellow-tinted glass ----------
  const dealsHtml = `<section class="h-deals band band--beam" aria-labelledby="h-deals-h">
<div class="band__clip" aria-hidden="true"><span class="h-deals__pool"></span></div>
<div class="wrap wrap--wide">
<div class="h-deals__top">${head('Deals', 'Shop the <span class="accent">deals</span>', 'h-deals-h')}<a class="btn btn--ghost h-deals__cta"${linkAttrs(ia.promo.href)} data-reveal>${esc(ia.promo.cta)}${icon('arrow')}</a></div>
<ul class="h-deals__grid" role="list">${deals.map((d, i) => `<li class="h-deals__item" data-reveal style="--i:${i}"><a class="h-deal glass glass--sun glass--lit glass--lift"${linkAttrs(dealsHref)}>${d.brandLine ? `<span class="h-deal__brand">${esc(d.brandLine)}</span>` : ''}<span class="h-deal__big">${esc(d.big)}</span>${d.small ? `<span class="h-deal__small">${esc(d.small)}</span>` : ''}<span class="h-deal__what">${esc(d.what)}</span>${icon('arrow', 'h-deal__go')}</a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 9. rewards pair: refer a friend (rose glass) + first customer 25% off (sun glass), both demo forms ----------
  const rewardsHtml = `<section class="h-rewards band band--rose" aria-labelledby="h-rewards-h">
<div class="band__clip" aria-hidden="true">${photo(ctx, 'plants-night.webp', { alt: '', cls: 'band__bg h-rewards__ground', sizes: '100vw' })}<span class="band__veil h-rewards__veil"></span></div>
<div class="wrap wrap--wide">
${head('Offers', `<span class="accent--rose">${esc(navLabel('/rewards/') || 'Rewards')}</span>`, 'h-rewards-h')}
<div class="h-rewards__grid">
<article class="h-reward h-reward--ref glass glass--rose glass--lit" aria-labelledby="h-ref-h" data-reveal>
<span class="h-reward__ico" aria-hidden="true">${icon('gift')}</span>
<h3 id="h-ref-h" class="display h-reward__h">${ref.titleLines.map((l) => `<span class="h-reward__line">${esc(l)}</span>`).join(' ')}</h3>
${demoForm({ id: 'h-referral-form', fields: ref.fields, button: ref.button, cls: 'h-reward__form' })}
</article>
<article class="h-reward h-reward--first glass glass--sun glass--lit" aria-labelledby="h-first-h" data-reveal style="--i:1">
<span class="h-reward__ico" aria-hidden="true">${icon('user')}</span>
<p class="kicker">${esc(fc.sub)}</p>
<h3 id="h-first-h" class="display h-reward__h">${accentLast(fc.title.replace(/ off$/i, ''))} ${esc((fc.title.match(/ off$/i) || [''])[0].trim())}</h3>
${demoForm({ id: 'h-first-customer-form', fields: fc.fields, button: fc.button, cls: 'h-reward__form' })}
</article>
</div>
</div>
</section>`;

  // ---------- 10. delivery areas: the 12 names as a marquee ribbon (decorative copy) + the 12 links ----------
  // site.js wraps [data-marquee] children in .marquee__track > .marquee__group x2 (motion.css): plain children here
  const names = areaList.map((a) => `<span class="h-areas__name">${esc(a.name)}${icon('pin', 'h-areas__dot')}</span>`).join('');
  const areasHtml = `<section class="h-areas band band--void" aria-labelledby="h-areas-h">
<div class="band__clip" aria-hidden="true">${gimg('g-palms-night', { alt: '', cls: 'band__bg h-areas__bg', sizes: '100vw' })}<span class="band__veil h-areas__veil"></span></div>
<div class="h-areas__marquee" data-marquee aria-hidden="true">${names}</div>
<div class="wrap wrap--wide">
<div class="h-areas__top">${head(site.region, accentLast(site.deliveryAreas.title), 'h-areas-h')}<a class="link-arrow h-areas__all"${linkAttrs(iaHref('All delivery areas'))} data-reveal>${esc('All delivery areas')}${icon('arrow')}</a></div>
<ul class="h-areas__grid" role="list">${areaList.map((a, i) => `<li data-reveal style="--i:${i % 4}"><a class="h-area glass glass--lift"${linkAttrs(a.path)}>${icon('pin', 'h-area__pin')}<span class="h-area__txt"><span class="h-area__pre">${esc(site.deliveryAreas.prefix)}</span> <span class="h-area__name">${esc(a.name).replace(/\//g, '/<wbr>')}</span></span>${icon('arrow', 'h-area__go')}</a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 11. top products: the Figma's six link labels ----------
  const top = must(site.topProducts, 'topProducts');
  const topHtml = `<section class="h-top band band--void" aria-labelledby="h-top-h">
<div class="wrap wrap--wide h-top__inner">
<h2 id="h-top-h" class="display h-top__h" data-reveal>${accentLast(top.title)}</h2>
<ul class="h-top__list" role="list">${top.links.map((l, i) => `<li data-reveal style="--i:${i}"><a class="chip h-top__chip"${linkAttrs(l.href)}>${esc(l.label)}${icon('arrow')}</a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 12. guides: three ia.blogPosts (the first of each blog category, preferring non-menu pages) ----------
  const posts = ia.blogCategories.map((bc) => {
    const inCat = ia.blogPosts.filter((p) => p.cat === bc.slug);
    return { ...(inCat.find((p) => !p.href.startsWith('/shop/')) || must(inCat[0], 'blog post in ' + bc.slug)), catLabel: bc.label };
  }).slice(0, 3);
  const postTitle = (p) => {
    const c = cats.find((x) => p.href === '/shop/' + x.slug + '/');
    return c ? c.label + ' guide' : must(iaLabel(p.href), 'ia label for ' + p.href);
  };
  const guidesHtml = `<section class="h-guides band band--lit" aria-labelledby="h-guides-h">
<div class="band__clip" aria-hidden="true"><span class="h-guides__pool"></span></div>
<div class="wrap wrap--wide">
<div class="h-guides__top">${head(iaLabel('/blog/') || 'Blog', 'Guides', 'h-guides-h')}<a class="link-arrow"${linkAttrs('/blog/')} data-reveal>Read the blog${icon('arrow')}</a></div>
<ul class="h-guides__grid" role="list">${posts.map((p, i) => `<li data-reveal style="--i:${i}"><a class="h-guide glass glass--lit glass--lift"${linkAttrs(p.href)}><span class="h-guide__media">${gimg(p.image, { alt: '', sizes: '(max-width: 720px) 33vw, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw' })}</span><span class="h-guide__body"><span class="h-guide__cat">${esc(p.catLabel)}</span><span class="h-guide__t">${esc(postTitle(p))}</span><span class="h-guide__go">Read${icon('arrow')}</span></span></a></li>`).join('')}</ul>
</div>
</section>`;

  // ---------- 13. insider sign-up: smoke in a beam behind a strong glass pane carrying the form ----------
  const insiderHtml = `<section class="h-insider band band--beam" aria-labelledby="h-insider-h">
<div class="band__clip" aria-hidden="true">${gimg('g-smoke-beam', { alt: '', cls: 'band__bg h-insider__bg screen', sizes: '100vw' })}<span class="band__veil h-insider__veil"></span></div>
<div class="wrap wrap--wide h-insider__inner">
<div class="h-insider__copy" data-reveal><p class="kicker">Insider</p><h2 id="h-insider-h" class="display h-insider__h">${accentLast(ins.title)}</h2><p class="lede h-insider__p">${esc(ins.body)}</p></div>
<div class="h-insider__pane glass glass--strong glass--lit" data-reveal style="--i:1">${demoForm({ id: 'h-insider-form', fields: ins.fields, button: ins.button, cls: 'h-insider__form' })}</div>
</div>
</section>`;

  const main = [heroHtml, hoursHtml, catsHtml, brandsHtml, statementHtml, flowersHtml, spotsHtml, dealsHtml, rewardsHtml, areasHtml, topHtml, guidesHtml, insiderHtml].join('\n');

  const title = `${site.name} | ${tag[0]} ${tag[1]} in the ${site.region}`;
  const description = `${tag[0]} ${tag[1].toLowerCase()} in the ${site.region}: ${tag[2].toLowerCase()}. ${del.label} ${del.value}, ${pick.label.toLowerCase()} ${pick.value}. ${cats.map((c) => c.label).join(', ')}.`;
  const og = { 'og:title': title, 'og:description': description, 'og:url': absUrl(ctx, '/'), 'og:type': 'website', 'og:site_name': site.name };
  if (hasGenerated('g-hero-bud')) og['og:image'] = ctx.site.origin + imgUrl('g-hero-bud', 1200);
  return [{
    path: '/',
    html: page({
      ctx, path: '/', title, description, canonical: absUrl(ctx, '/'), og,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: absUrl(ctx, '/') }],
      bodyClass: 'is-home', main,
    }),
  }];
}
