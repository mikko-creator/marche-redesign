// shop.mjs - SHOP lane: /shop/ (the menu page in the brand Figma's own composition: MENU pill, search row, category
// chips, category sections, brand strip, "SEE ALL CATEGORIES"), the five category landing pages /shop/<slug>/,
// /dispensaries/california/deals/ and /rewards/.
// Words: site.json / ia.json values verbatim. New words are neutral glue only (section labels, one-line intros, button
// labels, empty states, short general product-format guides with no effect, health, potency, dosing or price claims).
// Every link goes through href()/linkAttrs(); every form is demoForm(); no inline script is emitted (D6).
import { page, crumbsHtml, icon } from './shell.mjs';
import { esc, escA, linkAttrs, gimg, photo, absUrl, demoForm } from './util.mjs';

const SHOP = '/shop/';
const DEALS = '/dispensaries/california/deals/';
const STATE = '/dispensaries/california/';
const AREAS_HUB = '/dispensaries/';
const REWARDS = '/rewards/';
const MED_CARD = '/getting-a-medical-card/';
const catPath = (c) => SHOP + c.slug + '/';

// generated art per category (BUILD-CONTRACT "Generated image ids")
const ART = { flower: 'g-bud-key', 'pre-rolls': 'g-prerolls', vapes: 'g-vape', concentrates: 'g-concentrate', medical: 'g-apothecary' };

// short, general product-format guides (glue words: what the format is and how it is sold or packed; nothing else)
const GUIDE = {
  flower: {
    h: 'What flower is',
    lede: 'What flower is, how it is packed, and the flowers on the sample menu.',
    p: [
      'Flower is the dried and cured bud of the cannabis plant, sold whole rather than ground or processed.',
      'It is sold by weight. An eighth of an ounce is about 3.5 grams, the size printed on many jars as 3.5G.',
      'Buds come in sealed jars or pouches, labelled with the brand, the strain name and the weight.',
    ],
  },
  'pre-rolls': {
    h: 'What a pre-roll is',
    lede: 'What a pre-roll is and how pre-rolls are packed.',
    p: [
      'A pre-roll is ground cannabis flower that comes already rolled in paper, usually with a small filter tip at one end.',
      'Pre-rolls are sold one at a time or in multi-packs, in tubes, tins or boxes.',
      'The label names the brand and the strain, and gives the weight of each pre-roll.',
    ],
  },
  vapes: {
    h: 'What a vape is',
    lede: 'What a vape cartridge is and how cartridges are sold.',
    p: [
      'A vape cartridge is a small tank of cannabis oil with a mouthpiece, made to fit a separate battery.',
      'Cartridges are sold by the amount of oil they hold, often half a gram or a full gram. Disposable vapes put the oil and the battery in one sealed unit.',
      'The label names the brand and the strain or blend the oil was made from.',
    ],
  },
  concentrates: {
    h: 'What concentrates are',
    lede: 'What concentrates are and how they are packed.',
    p: [
      'Concentrates are made by separating the resin of the cannabis plant from the plant material.',
      'They are named for their texture or for how they are made: wax, shatter, budder, live resin and rosin are some of the common forms.',
      'Concentrates are sold in small amounts, often a gram or half a gram, in small glass jars or folded parchment.',
    ],
  },
  medical: {
    h: 'Medicinal cannabis',
    lede: 'Medicinal cannabis in California: the rules, each with its official source.',
    p: [
      'Medicinal cannabis comes in the same product formats as adult-use cannabis: flower, pre-rolls, vapes and concentrates, among others.',
      'The California rules for buying it are listed below, each with its official source.',
    ],
  },
};

const EMPTY_LINE = 'Products for this category appear here when the menu connects.';
const SAMPLE_NOTE = 'Sample menu from the brand mockup';
const viewAll = (c) => c.viewAll || (c.slug === 'medical' ? 'view medical' : 'view all ' + c.plural.toLowerCase());

// ---------- shared pieces ----------
const crumbLd = (ctx, crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([h, l], i) => ({ '@type': 'ListItem', position: i + 1, name: l, item: absUrl(ctx, h) })),
});

function out(ctx, { path, name, description, main, crumbs, bodyClass }) {
  const title = `${name} | ${ctx.site.name}`;
  const url = absUrl(ctx, path);
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: url,
      og: { 'og:title': title, 'og:description': description, 'og:url': url, 'og:type': 'website', 'og:site_name': ctx.site.name },
      jsonld: [crumbLd(ctx, crumbs)],
      bodyClass: `s-page ${bodyClass}`,
      main, crumbs, heroCrumbs: true,
    }),
  };
}

const arrow = () => icon('arrow', 's-ico');
const joinList = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);

// product card (FOUNDATION .pcard): cut-out photo, NATS name lines, yellow price exactly as written, round "+" demo button
function pcard(ctx, p, i, { eager = false } = {}) {
  return `<li class="s-grid__item" data-reveal style="--i:${i}">
<article class="pcard" data-tilt>
<div class="pcard__media">${photo(ctx, p.photo, { cls: 'cut', eager, sizes: '(min-width: 1024px) 380px, (min-width: 600px) 44vw, 82vw' })}</div>
<h3 class="pcard__name">${p.nameLines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h3>
<p class="pcard__price">${esc(p.price)}</p>
<button type="button" class="pcard__add" data-demo-add aria-label="Add ${escA(p.name)} to cart (preview)">${icon('plus')}</button>
</article>
</li>`;
}

// links to the other categories (+ Deals), as chips
function catChips(ctx, current) {
  const cats = ctx.site.categories.filter((c) => c.slug !== current);
  return `<ul class="s-chips" role="list">${cats.map((c) => `<li><a class="chip"${linkAttrs(catPath(c))}>${esc(c.label)}</a></li>`).join('')}<li><a class="chip chip--sun"${linkAttrs(DEALS)}>Deals</a></li></ul>`;
}

const hoursFacts = (s) => `<dl class="s-facts">
<div><dt>${esc(s.hours.delivery.label)}</dt><dd>${esc(s.hours.delivery.value)}</dd></div>
<div><dt>${esc(s.hours.pickup.label)}</dt><dd>${esc(s.hours.pickup.value)}</dd></div>
</dl>`;

// ia.json mega feature cards (Deals, Delivery areas) reused as "keep exploring" cards
function feature(ctx, hrefWanted) {
  for (const n of ctx.ia.nav) if (n.feature && n.feature.href === hrefWanted) return n.feature;
  return null;
}

// ---------- /shop/ ----------
function menuPage(ctx) {
  const s = ctx.site;
  const path = SHOP;
  const crumbs = [['/', 'Home'], [SHOP, 'Shop']];
  const byLabel = Object.fromEntries(s.categories.map((c) => [c.label, c]));
  const chips = s.menuBar.map((label) => {
    const c = byLabel[label];
    return c
      ? `<li><a class="chip" href="#${escA(c.slug)}">${esc(label)}</a></li>`
      : `<li><a class="chip chip--sun"${linkAttrs(DEALS)}>${esc(label)}</a></li>`;
  }).join('');

  const sections = s.categories.map((c, ci) => {
    const prods = s.products.filter((p) => p.category === c.slug);
    const head = `<header class="s-sec__head">
<p class="s-sec__num" aria-hidden="true">${String(ci + 1).padStart(2, '0')}</p>
<h2 class="display s-sec__h" id="s-h-${escA(c.slug)}">${esc(c.plural)}</h2>
</header>`;
    const more = `<p class="s-sec__more"><a class="btn btn--glass btn--sm"${linkAttrs(catPath(c))}>${esc(viewAll(c))} ${arrow()}</a></p>`;
    if (prods.length) {
      return `<section class="s-sec s-sec--products" id="${escA(c.slug)}" aria-labelledby="s-h-${escA(c.slug)}">
${head}
<ul class="s-grid" role="list">
${prods.map((p, i) => pcard(ctx, p, i)).join('\n')}
</ul>
${more}
</section>`;
    }
    const deco = c.slug === 'pre-rolls'
      ? `<span class="s-catcard__cut">${photo(ctx, 'high-90s-preroll-pack.webp', { cls: 'cut', sizes: '(min-width: 1024px) 300px, 40vw' })}</span>`
      : '';
    const extra = c.slug === 'medical' ? `<a class="link-arrow"${linkAttrs(MED_CARD)}>Getting a Medical Card</a>` : '';
    return `<section class="s-sec" id="${escA(c.slug)}" aria-labelledby="s-h-${escA(c.slug)}">
${head}
<div class="s-catcard glass glass--lit glass--lift${deco ? ' s-catcard--cut' : ''}" data-reveal>
<div class="s-catcard__art" aria-hidden="true">${gimg(ART[c.slug], { alt: '', cls: 's-catcard__img screen', sizes: '(min-width: 1024px) 640px, 100vw' })}</div>
${deco}
<div class="s-catcard__body">
<p class="kicker">${esc(c.label)}</p>
<p class="s-catcard__line">${esc(EMPTY_LINE)}</p>
<div class="btn-row"><a class="btn btn--sun btn--sm"${linkAttrs(catPath(c))}>${esc(viewAll(c))} ${arrow()}</a>${extra}</div>
</div>
</div>
</section>`;
  }).join('\n');

  const brandPhoto = { "High 90's": 'watermelon-sherbet.webp', 'THC Design': 'thc-crescendo.webp' };
  const brandId = (n) => 'brand-' + n.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const brands = s.brandsOnMenu.map((b, i) => {
    const prods = s.products.filter((p) => p.brand === b.name);
    const ph = brandPhoto[b.name] || (prods[0] && prods[0].photo);
    return `<li class="s-brand glass glass--lit glass--lift" id="${escA(brandId(b.name))}" data-reveal style="--i:${i}">
<div class="s-brand__cut" aria-hidden="true">${ph ? photo(ctx, ph, { alt: '', cls: 'cut', sizes: '(min-width: 1024px) 260px, 44vw' }) : ''}</div>
<div class="s-brand__body">
<p class="kicker">Brand</p>
<h3 class="s-brand__name">${esc(b.name)}</h3>
<ul class="s-brand__items" role="list">${prods.map((p) => `<li><a class="link-arrow" href="#${escA(p.category)}">${esc(p.name)}</a> <span class="s-brand__price">${esc(p.price)}</span></li>`).join('')}</ul>
</div>
</li>`;
  }).join('\n');

  const allTiles = s.categories.map((c, i) => `<li data-reveal style="--i:${i}"><a class="s-tile glass glass--lift"${linkAttrs(catPath(c))}>
<span class="s-tile__art" aria-hidden="true">${gimg(ART[c.slug], { alt: '', cls: 's-tile__img screen', sizes: '(min-width: 1024px) 240px, 45vw' })}</span>
<span class="s-tile__t">${esc(c.label)}</span>${arrow()}
</a></li>`).join('\n') + `\n<li data-reveal style="--i:${s.categories.length}"><a class="s-tile s-tile--deals glass glass--sun glass--lift"${linkAttrs(DEALS)}>
<span class="s-tile__art" aria-hidden="true">${gimg('g-jars', { alt: '', cls: 's-tile__img screen', sizes: '(min-width: 1024px) 240px, 45vw' })}</span>
<span class="s-tile__t">Deals</span>${arrow()}
</a></li>`;

  const main = `
<section class="band band--lit s-hero" aria-labelledby="s-menu-h">
<div class="band__clip" aria-hidden="true"><span class="s-hero__pool"></span><span class="s-hero__beam"></span><span class="grain"></span></div>
<div class="wrap wrap--wide s-hero__in">
<div class="s-hero__text">
${crumbsHtml(crumbs)}
<p class="kicker">${esc(s.region)}</p>
<h1 class="s-pill" id="s-menu-h">Menu</h1>
<p class="lede s-hero__lede">${esc(s.tagline.lines[0])} ${esc(s.tagline.lines[1])} <span class="s-hero__fast">${esc(s.tagline.lines[2])}</span></p>
${demoForm({ id: 's-menu-search', fields: ['Search the menu'], button: 'Search', cls: 's-search' })}
<nav class="s-catnav" id="categories" aria-label="Menu categories"><ul class="s-chips" role="list">${chips}</ul></nav>
<p class="s-note">${esc(SAMPLE_NOTE)}</p>
</div>
</div>
<div class="s-hero__cut protrude" aria-hidden="true"><div class="s-hero__float" data-depth="0.08">${photo(ctx, 'crescendo-jar.webp', { alt: '', cls: 'cut', eager: true, sizes: '(min-width: 1024px) 440px, 42vw' })}</div></div>
</section>

<section class="band band--void s-menu" aria-label="Menu categories">
<div class="band__clip" aria-hidden="true"><span class="s-menu__pool"></span></div>
<div class="wrap wrap--wide">
${sections}
</div>
</section>

<section class="band band--beam s-brands" aria-labelledby="s-brands-h">
<div class="band__clip" aria-hidden="true"><span class="s-brands__pool"></span><span class="grain"></span></div>
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">Brands</p><h2 class="display" id="s-brands-h">Brands on the <span class="accent">menu</span></h2></header>
<ul class="s-brands__list" role="list">
${brands}
</ul>
</div>
</section>

<section class="band band--void s-all" aria-labelledby="s-all-h">
<div class="wrap wrap--wide">
<h2 class="s-pill s-pill--ghost" id="s-all-h">See all categories</h2>
<ul class="s-all__list" role="list">
${allTiles}
</ul>
<p class="s-note s-all__note">${esc(SAMPLE_NOTE)}</p>
</div>
</section>`;

  const plurals = joinList(s.categories.map((c) => c.plural));
  const description = `Shop the ${s.name} menu: ${plurals}, with ${joinList(s.brandsOnMenu.map((b) => b.name))}. Weed delivery at your door in the ${s.region}, ${s.tagline.lines[2]}.`;
  return out(ctx, { path, name: 'Menu', description, main, crumbs, bodyClass: 's-page--menu' });
}

// ---------- /shop/<category>/ ----------
function lawSource(src) {
  if (/^https?:\/\//i.test(src)) {
    let label = src;
    try { const u = new URL(src); label = u.hostname.replace(/^www\./, '') + (u.pathname.length > 1 ? u.pathname.replace(/\/$/, '') : ''); } catch { /* keep the raw URL */ }
    return `<a${linkAttrs(src)}>${esc(label)}</a>`;
  }
  return `<cite>${esc(src)}</cite>`;
}

function categoryPage(ctx, c) {
  const s = ctx.site;
  const path = catPath(c);
  const g = GUIDE[c.slug];
  const crumbs = [['/', 'Home'], [SHOP, 'Shop'], [path, c.label]];
  const prods = s.products.filter((p) => p.category === c.slug);
  const top = (s.topProducts.links || []).find((l) => l.href === path);
  const cutFile = c.slug === 'flower' ? 'crescendo-jar.webp' : c.slug === 'pre-rolls' ? 'high-90s-preroll-pack.webp' : '';

  const productsBand = prods.length
    ? `<section class="band band--void s-onmenu" aria-labelledby="s-onmenu-h">
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">On the menu</p><h2 class="display" id="s-onmenu-h">${esc(c.plural)}</h2></header>
<ul class="s-grid" role="list">
${prods.map((p, i) => pcard(ctx, p, i)).join('\n')}
</ul>
<p class="s-note">${esc(SAMPLE_NOTE)}</p>
<p class="btn-row"><a class="btn btn--glass"${linkAttrs(SHOP + '#' + c.slug)}>Back to the menu ${arrow()}</a></p>
</div>
</section>`
    : `<section class="band band--void s-onmenu" aria-labelledby="s-onmenu-h">
<div class="wrap wrap--wide">
<div class="s-empty glass glass--lit" data-reveal>
<p class="kicker">On the menu</p>
<h2 class="display s-empty__h" id="s-onmenu-h">${esc(c.plural)}</h2>
<p class="s-empty__line">${esc(EMPTY_LINE)}</p>
<p class="s-note">${esc(SAMPLE_NOTE)}</p>
<p class="btn-row"><a class="btn btn--sun"${linkAttrs(SHOP)}>See the menu ${arrow()}</a></p>
</div>
</div>
</section>`;

  let lawBand = '';
  if (c.slug === 'medical') {
    const law = s.caLaw;
    const facts = law.facts.filter((f) => /medicinal/i.test(f.text)).concat(law.mmic || []);
    lawBand = `<section class="band band--void s-law" aria-labelledby="s-law-h">
<div class="band__clip" aria-hidden="true"><span class="s-law__pool"></span></div>
<div class="wrap">
<header class="s-band-head" data-reveal><p class="kicker">California law</p><h2 class="display" id="s-law-h">Medicinal <span class="accent">rules</span></h2></header>
<ol class="s-law__list" role="list">
${facts.map((f, i) => `<li class="s-law__item glass glass--strong" data-reveal style="--i:${i}"><p class="s-law__text">${esc(f.text)}</p><p class="s-law__src">Source: ${lawSource(f.source)}</p></li>`).join('\n')}
</ol>
<p class="s-law__meta">Last reviewed ${esc(law.reviewed)}. General information, not legal advice.</p>
<p class="btn-row"><a class="btn btn--sun"${linkAttrs(MED_CARD)}>Getting a Medical Card ${arrow()}</a></p>
</div>
</section>`;
  }

  const dealsF = feature(ctx, DEALS);
  const areasF = feature(ctx, STATE);
  const main = `
<section class="band band--lit s-cathero s-cathero--${escA(c.slug)}" aria-labelledby="s-cat-h">
<div class="band__clip" aria-hidden="true">
<div class="s-cathero__art" data-depth="0.1">${gimg(ART[c.slug], { alt: '', cls: 's-cathero__img screen', eager: true, sizes: '(min-width: 1024px) 64vw, 100vw' })}</div>
<span class="s-cathero__scrim"></span><span class="grain"></span>
</div>
<div class="wrap wrap--wide s-cathero__in">
${crumbsHtml(crumbs)}
<p class="kicker">${esc(top ? top.label : 'Shop by category')}</p>
<h1 class="display s-cathero__h" id="s-cat-h">${esc(c.plural)}</h1>
<p class="lede s-cathero__lede">${esc(g.lede)}</p>
<div class="btn-row">
<a class="btn btn--sun"${linkAttrs(SHOP + '#' + c.slug)}>Shop the menu ${arrow()}</a>
<a class="btn btn--ghost"${linkAttrs(DEALS)}>Deals</a>
</div>
</div>
${cutFile ? `<div class="s-cathero__cut protrude" aria-hidden="true"><div data-depth="0.06">${photo(ctx, cutFile, { alt: '', cls: 'cut', eager: true, sizes: '(min-width: 1024px) 360px, 38vw' })}</div></div>` : ''}
</section>

<section class="band band--void s-guide${cutFile ? ' s-after-cut' : ''}" aria-labelledby="s-guide-h">
<div class="band__clip" aria-hidden="true"><span class="s-guide__pool"></span></div>
<div class="wrap wrap--wide s-guide__in">
<div class="s-guide__text" data-reveal>
<p class="kicker">Guide</p>
<h2 class="display s-guide__h" id="s-guide-h">${esc(g.h)}</h2>
<div class="prose">${g.p.map((t) => `<p>${esc(t)}</p>`).join('\n')}</div>
</div>
<aside class="s-guide__aside glass glass--lit" aria-labelledby="s-hours-h" data-reveal style="--i:1">
<p class="kicker">Delivery</p>
<h3 class="s-guide__aside-h" id="s-hours-h">${esc(s.tagline.lines[2])}</h3>
${hoursFacts(s)}
<p class="s-guide__aside-line">${esc(s.tagline.lines[0])} ${esc(s.tagline.lines[1])} in the ${esc(s.region)}.</p>
<a class="link-arrow"${linkAttrs(STATE)}>${esc(s.deliveryAreas.title)}</a>
</aside>
</div>
</section>

${productsBand}
${lawBand}

<section class="band band--void s-more" aria-labelledby="s-more-h">
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">Keep exploring</p><h2 class="display" id="s-more-h">More from the <span class="accent">menu</span></h2></header>
<div class="s-more__grid">
${dealsF ? `<a class="s-more__card glass glass--sun glass--lit glass--lift" data-reveal${linkAttrs(dealsF.href)}><span class="kicker">${esc(dealsF.title)}</span><span class="s-more__t">${esc(dealsF.line)}</span>${arrow()}</a>` : ''}
${areasF ? `<a class="s-more__card glass glass--lit glass--lift" data-reveal style="--i:1"${linkAttrs(areasF.href)}><span class="kicker">${esc(s.deliveryAreas.title)}</span><span class="s-more__t">${esc(areasF.title)}</span><span class="s-more__line">${esc(areasF.line)}</span>${arrow()}</a>` : ''}
</div>
<nav class="s-more__cats" aria-label="Other categories"><p class="kicker">Other categories</p>${catChips(ctx, c.slug)}</nav>
</div>
</section>`;

  const prodLine = prods.length ? `: ${joinList(prods.map((p) => `${p.name} (${p.price})`))}` : '';
  const description = c.slug === 'medical'
    ? `${c.label} on the ${s.name} menu, with California's rules for medicinal cannabis and the MMIC card, each with its official source. Not legal advice.`
    : `${c.plural} on the ${s.name} menu${prodLine}, with a short guide to the format. Weed delivery at your door in the ${s.region}.`;
  return out(ctx, { path, name: c.plural, description, main, crumbs, bodyClass: `s-page--cat s-page--cat-${c.slug}` });
}

// ---------- /dispensaries/california/deals/ ----------
function dealArt(ctx, d) {
  if (d.id === 'crescendo-10') return `<span class="s-deal__cut">${photo(ctx, 'crescendo-jar.webp', { alt: '', cls: 'cut', sizes: '(min-width: 1024px) 260px, 50vw' })}</span>`;
  const id = /pre-?roll/i.test(d.what) ? 'g-prerolls' : 'g-bud-key';
  return gimg(id, { alt: '', cls: 's-deal__img screen', sizes: '(min-width: 1024px) 400px, 90vw' });
}

function dealsPage(ctx) {
  const s = ctx.site;
  const path = DEALS;
  const crumbs = [['/', 'Home'], [AREAS_HUB, 'Delivery areas'], [STATE, 'California'], [DEALS, 'Deals']];
  const fc = s.firstCustomer;
  const ref = s.referral;
  const cards = s.deals.map((d, i) => {
    const ember = i % 2 === 1;
    return `<li class="s-deal glass glass--sun glass--lit glass--lift" data-reveal style="--i:${i}">
<div class="s-deal__art" aria-hidden="true">${dealArt(ctx, d)}</div>
<h3 class="s-deal__h">${d.brandLine ? `<span class="s-deal__brand">${esc(d.brandLine)}</span> ` : ''}<span class="s-deal__ticket${ember ? ' s-deal__ticket--ember' : ''}"><span class="s-deal__big">${esc(d.big)}</span>${d.small ? ` <span class="s-deal__small">${esc(d.small)}</span>` : ''}</span> <span class="s-deal__what">${esc(d.what)}</span></h3>
<a class="btn btn--sun s-deal__cta"${linkAttrs(SHOP)}>Shop deals ${arrow()}</a>
</li>`;
  }).join('\n');

  const main = `
<section class="band band--lit s-dhero" aria-labelledby="s-deals-h">
<div class="band__clip" aria-hidden="true">
<div class="s-dhero__art" data-depth="0.1">${gimg('g-jars', { alt: '', cls: 's-dhero__img screen', eager: true, sizes: '(min-width: 1024px) 60vw, 100vw' })}</div>
<span class="s-dhero__scrim"></span><span class="grain"></span>
</div>
<div class="wrap wrap--wide s-dhero__in">
${crumbsHtml(crumbs)}
<p class="kicker">${esc(ctx.ia.promo.text)}</p>
<h1 class="display display--mega s-dhero__h" id="s-deals-h">Deals</h1>
<p class="lede s-dhero__lede">Deals on the ${esc(s.name)} menu, plus the first-customer and refer-a-friend offers.</p>
<div class="btn-row"><a class="btn btn--sun"${linkAttrs(SHOP)}>Shop deals ${arrow()}</a><a class="btn btn--ghost"${linkAttrs(REWARDS)}>Rewards</a></div>
</div>
</section>

<section class="band band--void s-deals" aria-labelledby="s-deals-list-h">
<div class="band__clip" aria-hidden="true"><span class="s-deals__pool"></span></div>
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">${esc(s.name)} deals</p><h2 class="display" id="s-deals-list-h">Deals on the <span class="accent">menu</span></h2></header>
<ul class="s-deals__list" role="list">
${cards}
</ul>
<p class="s-note">Deals as shown in the brand mockup.</p>
</div>
</section>

<section class="band band--void s-offers" aria-labelledby="s-offers-h">
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">Offers</p><h2 class="display" id="s-offers-h">More <span class="accent--rose accent">offers</span></h2></header>
<div class="s-offers__grid">
<article class="s-offer glass glass--sun glass--lit glass--lift" data-reveal>
<p class="kicker">${esc(fc.sub)}</p>
<h3 class="display s-offer__h">${esc(fc.title)}</h3>
<p class="btn-row"><a class="btn btn--sun"${linkAttrs(REWARDS + '#first-customer')}>Get the offer ${arrow()}</a></p>
</article>
<article class="s-offer s-offer--rose glass glass--rose glass--lit glass--lift" data-reveal style="--i:1">
<p class="kicker">Refer a friend</p>
<h3 class="display s-offer__h">${ref.titleLines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h3>
<p class="btn-row"><a class="btn btn--glass"${linkAttrs(REWARDS + '#join')}>${esc(ref.button)} ${arrow()}</a></p>
</article>
</div>
<p class="btn-row s-offers__cta"><a class="btn btn--sun"${linkAttrs(SHOP)}>Shop deals ${arrow()}</a><a class="btn btn--ghost"${linkAttrs(STATE)}>${esc(s.deliveryAreas.title)}</a></p>
</div>
</section>`;

  const dealWords = s.deals.map((d) => [d.brandLine, d.big, d.small, d.what].filter(Boolean).join(' '));
  const description = `${s.name} deals: ${joinList(dealWords)}. Plus ${fc.title.replace(/^Get /, '')} for first customers, and ${ref.title.charAt(0).toLowerCase() + ref.title.slice(1)}.`;
  return out(ctx, { path, name: 'Deals', description, main, crumbs, bodyClass: 's-page--deals' });
}

// ---------- /rewards/ ----------
function rewardsPage(ctx) {
  const s = ctx.site;
  const path = REWARDS;
  const crumbs = [['/', 'Home'], [REWARDS, 'Rewards']];
  const ref = s.referral;
  const fc = s.firstCustomer;
  const ins = s.insider;
  const lines = ref.titleLines.map((l, i) => `<span class="s-rhero__line${i === 1 ? ' accent--rose' : ''}">${esc(l)}</span>`).join(' ');

  const main = `
<section class="band band--lit band--rose s-rhero" aria-labelledby="s-rewards-h">
<div class="band__clip" aria-hidden="true"><span class="s-rhero__pool"></span><span class="s-rhero__rose"></span><span class="grain"></span></div>
<div class="wrap wrap--wide s-rhero__in">
<div class="s-rhero__text">
${crumbsHtml(crumbs)}
<h1 class="s-pill" id="s-rewards-h">Rewards</h1>
<p class="kicker">Refer a friend</p>
<h2 class="display display--mega s-rhero__h">${lines}</h2>
</div>
<div class="s-rhero__form glass glass--rose glass--lit" data-reveal>
<p class="kicker">Sign up</p>
${demoForm({ id: 'join', fields: ref.fields, button: ref.button, cls: 's-form' })}
</div>
</div>
<div class="s-rhero__cut protrude" aria-hidden="true"><div data-depth="0.06">${gimg('g-leaf-cut', { alt: '', cls: 's-rhero__leaf screen', sizes: '(min-width: 1024px) 300px, 34vw' })}</div></div>
</section>

<section class="band band--void s-first s-after-cut" id="first-customer" aria-labelledby="s-first-h">
<div class="band__clip" aria-hidden="true"><span class="s-first__pool"></span></div>
<div class="wrap wrap--wide s-first__in">
<div class="s-first__text" data-reveal>
<p class="kicker">${esc(fc.sub)}</p>
<h2 class="display s-first__h" id="s-first-h">${esc(fc.title)}</h2>
</div>
<div class="s-first__form glass glass--sun glass--lit" data-reveal style="--i:1">
${demoForm({ id: 's-first-form', fields: fc.fields, button: fc.button, cls: 's-form' })}
</div>
</div>
</section>

<section class="band band--void s-insider" aria-labelledby="s-insider-h">
<div class="band__clip" aria-hidden="true"><span class="s-insider__pool"></span><span class="grain"></span></div>
<div class="wrap wrap--wide s-insider__in">
<div class="s-insider__text" data-reveal>
<p class="kicker">Insider</p>
<h2 class="display s-insider__h" id="s-insider-h">${esc(ins.title)}</h2>
<p class="lede">${esc(ins.body)}</p>
</div>
<div class="s-insider__form glass glass--lit" data-reveal style="--i:1">
${demoForm({ id: 's-insider-form', fields: ins.fields, button: ins.button, cls: 's-form' })}
</div>
</div>
</section>

<section class="band band--void s-more" aria-labelledby="s-rmore-h">
<div class="wrap wrap--wide">
<header class="s-band-head" data-reveal><p class="kicker">Keep exploring</p><h2 class="display" id="s-rmore-h">Deals &amp; the <span class="accent">menu</span></h2></header>
<p class="btn-row"><a class="btn btn--sun"${linkAttrs(DEALS)}>Deals ${arrow()}</a><a class="btn btn--glass"${linkAttrs(SHOP)}>Shop</a><a class="btn btn--ghost"${linkAttrs(STATE)}>${esc(s.deliveryAreas.title)}</a></p>
</div>
</section>`;

  const description = `${s.name} rewards: ${ref.title.charAt(0).toLowerCase() + ref.title.slice(1)}; ${fc.title.charAt(0).toLowerCase() + fc.title.slice(1)} as a first customer; and ${ins.title.charAt(0).toLowerCase() + ins.title.slice(1).replace(/!$/, '')}.`;
  return out(ctx, { path, name: 'Rewards', description, main, crumbs, bodyClass: 's-page--rewards' });
}

export async function render(ctx) {
  return [
    menuPage(ctx),
    ...ctx.site.categories.map((c) => categoryPage(ctx, c)),
    dealsPage(ctx),
    rewardsPage(ctx),
  ];
}
