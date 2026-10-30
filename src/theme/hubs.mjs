// hubs.mjs - HUBS lane: the delivery-area hub (/dispensaries/), the state hub (/dispensaries/california/), the 12
// delivery-area pages (the adopted LOCATION template turned into a delivery page), the guide hub
// (/dispensary-guides/) and /404.html. /site-map/ lives in sitemap.mjs (rendered last).
// Content rule (BUILD-CONTRACT D2): every visible fact comes from site.json / ia.json as written; the only new words
// are neutral labels and one-line intros. Nothing with status "unconfirmed" is read here.
import { esc, escA, linkAttrs, gimg, photo, absUrl, areas, isExternal } from './util.mjs';
import { page, crumbsHtml, icon } from './shell.mjs';

// Hero art rotation (generated ids, all shot on black; decorative, never captioned as a place - D5).
export const ART = ['g-palms-night', 'g-doorstep', 'g-smoke-beam', 'g-gold-dust'];
// Client cut-outs that may cross the hero seam (decorative here, alt "").
const CUTS = ['watermelon-sherbet.webp', 'thc-crescendo.webp', 'crescendo-jar.webp', 'high-90s-preroll-pack.webp'];

const P = {
  home: '/',
  hub: '/dispensaries/',
  ca: '/dispensaries/california/',
  deals: '/dispensaries/california/deals/',
  rewards: '/rewards/',
  first: '/rewards/#first-customer',
  faq: '/faq/',
  card: '/getting-a-medical-card/',
  guides: '/dispensary-guides/',
  shop: '/shop/',
  contact: '/contact/',
  laws: '/cannabis-laws-by-state/',
  blog: '/blog/',
};
export const CRUMB = { home: [P.home, 'Home'], hub: [P.hub, 'Delivery areas'], ca: [P.ca, 'California'] };

// ---------- facts (fail closed: an unconfirmed value never reaches a page) ----------
function fact(v, what) {
  if (v == null || v === '') throw new Error('hubs: missing fact ' + what);
  if (typeof v === 'object' && v.status === 'unconfirmed') throw new Error('hubs: refusing unconfirmed fact ' + what);
  return v;
}
function facts(ctx) {
  const S = ctx.site;
  const H = S.hours;
  const law = S.caLaw.facts;
  const idLaw = fact(law.find((f) => /21 and older can buy/.test(f.text)), 'caLaw ID fact');
  const medLaw = fact(law.find((f) => /^Medicinal cannabis customers/.test(f.text)), 'caLaw medicinal fact');
  const ref = fact(S.referral, 'referral');
  const refSplit = ref.title.indexOf(', ');
  return {
    S,
    region: fact(S.region, 'region'),
    delivery: fact(H.delivery, 'hours.delivery'),
    pickup: fact(H.pickup, 'hours.pickup'),
    fast: fact(S.tagline.lines[2], 'tagline line 3'), // "45 Minutes or Less"
    door: fact(S.tagline.lines[1], 'tagline line 2'), // "At Your Door"
    first: fact(S.firstCustomer, 'firstCustomer'),
    ref,
    refHead: refSplit > 0 ? ref.title.slice(0, refSplit) : ref.title, // "Refer a friend"
    refGift: refSplit > 0 ? ref.title.charAt(refSplit + 2).toUpperCase() + ref.title.slice(refSplit + 3) : '', // "Get a free eighth of premium flower"
    idLaw,
    medLaw,
    deals: fact(S.deals, 'deals'),
    cats: S.categories.map((c) => ({ label: c.label, path: '/shop/' + c.slug + '/' })),
    // the Figma menu bar order (Flower, Pre-rolls, Vapes, Concentrates, Deals, Medical) with each item's page
    menu: S.menuBar.map((label) => {
      if (/^deals$/i.test(label)) return { label, path: P.deals };
      const c = S.categories.find((x) => x.label === label);
      return c ? { label, path: '/shop/' + c.slug + '/' } : null;
    }).filter(Boolean),
  };
}

// ---------- small helpers ----------
const SR_NEW_TAB = '<span class="d-sr"> (opens in a new tab)</span>';
const listJoin = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
const btn = (u, label, cls = 'btn btn--sun') => `<a class="${cls}"${linkAttrs(u)}>${esc(label)}</a>`;
const arrowLink = (u, label, cls = '') => `<a class="link-arrow${cls ? ' ' + cls : ''}"${linkAttrs(u)}>${esc(label)}${icon('arrow')}</a>`;

function source(src) {
  if (isExternal(src)) return `<a class="d-source"${linkAttrs(src)}>Source${SR_NEW_TAB}</a>`;
  return `<span class="d-source">Source: ${esc(src)}</span>`;
}

function meta(ctx, path, title, description) {
  const canonical = absUrl(ctx, path);
  return {
    title,
    description,
    canonical,
    og: { 'og:title': title, 'og:description': description, 'og:url': canonical, 'og:type': 'website', 'og:site_name': ctx.site.name },
  };
}

export function ldCrumbs(ctx, crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([p, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: absUrl(ctx, p) })),
  };
}

export function head2({ kicker = '', title, intro = '', id, cls = '' }) {
  return `<header class="d-head${cls ? ' ' + cls : ''}" data-reveal>
      ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
      <h2 class="display d-head__title" id="${escA(id)}">${title}</h2>
      ${intro ? `<p class="d-head__intro">${intro}</p>` : ''}
    </header>`;
}

// Hero: text straight on the dark ground (D10: no glass box), generated art screen-blended on the right behind a local
// scrim, the key light following the cursor ([data-spot]), the art drifting on scroll ([data-depth]), and at most one
// client cut-out crossing the seam into the next band (.band__clip recipe: the section stays overflow visible).
export function hero({ crumbs = [], kicker = '', title, line = '', lede = '', actions = '', art, cut = '', after = '', cls = '' }) {
  return `<section class="band band--void d-hero${cls ? ' ' + cls : ''}${cut ? ' d-hero--cut' : ''}" data-spot aria-labelledby="d-h1">
  <div class="band__clip" aria-hidden="true">
    <div class="d-hero__art" data-depth="0.12">${gimg(art, { alt: '', cls: 'd-hero__img screen', eager: true, sizes: '(max-width: 767px) 100vw, 72vw' })}</div>
    <span class="d-hero__pool"></span>
    <span class="d-hero__scrim"></span>
    
  </div>
  <div class="wrap d-hero__inner">
    ${crumbs.length ? `<div class="d-hero__crumbs">${crumbsHtml(crumbs)}</div>` : ''}
    <div class="d-hero__text">
      ${kicker ? `<p class="kicker" data-reveal>${kicker}</p>` : ''}
      <h1 class="display d-hero__title" id="d-h1" data-reveal style="--i:1">${title}</h1>
      ${line ? `<p class="d-hero__line" data-reveal style="--i:2">${line}</p>` : ''}
      ${lede ? `<p class="lede d-hero__lede" data-reveal style="--i:2">${lede}</p>` : ''}
      ${actions ? `<div class="btn-row d-hero__actions" data-reveal style="--i:3">${actions}</div>` : ''}
    </div>
    ${after}
  </div>
  ${cut}
</section>`;
}

function heroCut(ctx, file, cls = '') {
  return `<div class="protrude d-hero__cut${cls ? ' ' + cls : ''}" aria-hidden="true"><div class="d-hero__cutin" data-depth="-0.08">${photo(ctx, file, { alt: '', cls: 'cut', sizes: '(max-width: 767px) 160px, 400px' })}</div></div>`;
}

// Hours as stats: Delivery / Pick-up / At Your Door - 45 Minutes or Less (site.json hours + tagline).
function hours(F, { cls = '', fast = true } = {}) {
  const items = [[F.delivery.label, F.delivery.value, 'truck'], [F.pickup.label, F.pickup.value, 'bag']];
  if (fast) items.push([F.door, F.fast, 'clock']);
  return `<dl class="d-stats${cls ? ' ' + cls : ''}">${items.map(([k, v, ic], i) => `<div class="stat d-stat" data-reveal style="--i:${i}"><dt class="d-stat__k">${icon(ic, 'd-stat__ico')}${esc(k)}</dt><dd class="d-stat__v">${esc(v)}</dd></div>`).join('')}</dl>`;
}

function areaCard(a, i, { tag = 'li' } = {}) {
  return `<${tag} class="d-areas__item" data-reveal style="--i:${i % 6}"><a class="d-area glass glass--lit glass--lift"${linkAttrs(a.path)}>
      <span class="d-area__pin">${icon('pin')}</span>
      <span class="d-area__text"><span class="d-area__pre">Weed delivery in</span> <span class="d-area__name">${esc(a.name)}</span></span>
      <span class="d-area__go">${icon('arrow')}</span>
      
    </a></${tag}>`;
}

function pickupCard(ctx, F, i) {
  const u = ctx.ia.utility.pickup;
  return `<li class="d-areas__item" data-reveal style="--i:${i % 6}"><a class="d-area d-area--pickup glass glass--sun glass--lift"${linkAttrs(u.href)}>
      <span class="d-area__pin">${icon('bag')}</span>
      <span class="d-area__text"><span class="d-area__pre">${esc(u.label)}</span> <span class="d-area__name">${esc(u.value)}</span> <span class="d-area__hours">${esc(u.note || F.pickup.label + ' ' + F.pickup.value)}</span></span>
      <span class="d-area__go">${icon('arrow')}</span>
      
    </a></li>`;
}

function steps(F) {
  const items = [
    ['Choose on the menu', `${esc(listJoin(F.cats.map((c) => c.label)))}, plus deals.`],
    ['Order', `${esc(F.delivery.label)} ${esc(F.delivery.value)} or ${esc(F.pickup.label.toLowerCase())} ${esc(F.pickup.value)}.`],
    ['Delivered at your door', `${esc(F.fast)}. Valid ID, 21+.`],
  ];
  return `<ol class="d-steps">${items.map(([t, d], i) => `<li class="d-step" data-reveal style="--i:${i}"><span class="d-step__n" aria-hidden="true">0${i + 1}</span><h3 class="d-step__title">${esc(t)}</h3><p class="d-step__text">${d}</p></li>`).join('')}</ol>
    <p class="d-steps__law" data-reveal style="--i:3">${icon('id')}<span>${esc(F.idLaw.text)} ${source(F.idLaw.source)}</span></p>`;
}

function dealCard(d, i) {
  return `<li class="d-deals__item" data-reveal style="--i:${i}"><a class="d-deal glass glass--sun glass--lift"${linkAttrs(P.deals)}>
      ${d.brandLine ? `<span class="chip chip--sun d-deal__brand">${esc(d.brandLine)}</span>` : ''}
      <span class="d-deal__fig"><span class="d-deal__big">${esc(d.big)}</span>${d.small ? ` <span class="d-deal__small">${esc(d.small)}</span>` : ''}</span>
      <span class="d-deal__what">${esc(d.what)}</span>
      
    </a></li>`;
}

function faqHtml(items) {
  return `<div class="faq d-faq">${items.map(([q, a], i) => `<details class="faq__item" data-reveal style="--i:${i % 4}"><summary class="faq__q">${esc(q)}</summary><div class="faq__a">${a}</div></details>`).join('\n')}</div>`;
}

function render404(ctx) {
  const path = '/404.html';
  const title = 'Page Not Found | Marche';
  const description = 'This page does not exist on the Marche site. Go to the home page or the shop.';
  const main = `
<section class="band band--void d-404" data-spot aria-labelledby="d-h1">
  <div class="band__clip" aria-hidden="true"><span class="d-hero__pool d-404__pool"></span></div>
  <div class="wrap wrap--narrow d-404__inner">
    <img class="d-404__mark" src="/assets/brand/marche-logo-white.png" width="2677" height="471" alt="${escA(ctx.site.wordmark)}" decoding="async">
    <h1 class="display d-404__title" id="d-h1">Page <span class="accent">not found</span></h1>
    <p class="d-404__line">This page is not on the menu.</p>
    <div class="btn-row d-404__actions">${btn(P.home, 'Home')}${btn(P.shop, 'Shop', 'btn btn--ghost')}</div>
  </div>
</section>`;
  return {
    path,
    html: page({ ctx, path, title, description, og: { 'og:title': title, 'og:description': description, 'og:type': 'website', 'og:site_name': ctx.site.name }, bodyClass: 'd-page d-page--404', main }),
  };
}

// ---------- /dispensaries/ ----------
function renderHub(ctx, F, A) {
  const path = P.hub;
  const crumbs = [CRUMB.home, [path, 'Delivery areas']];
  const m = meta(ctx, path, 'Delivery Areas | Marche', `Marche weed delivery areas in the ${F.region}: ${A.map((a) => a.name).join(', ')}. ${F.delivery.label} ${F.delivery.value}, ${F.pickup.label} ${F.pickup.value}.`);
  const main = `
${hero({
    crumbs,
    kicker: esc(F.region),
    title: `Delivery <span class="accent">areas</span>`,
    lede: `Weed delivery at your door in ${A.length} areas of the ${esc(F.region)}. ${esc(F.fast)}.`,
    actions: `${btn(P.shop, ctx.ia.cta.label)}${btn(P.ca, 'California', 'btn btn--ghost')}`,
    art: ART[0],
    cut: heroCut(ctx, 'crescendo-jar.webp', 'd-hero__cut--jar'),
  })}
<section class="band band--sun d-hours" aria-labelledby="d-hours-h">
  <div class="wrap d-hours__grid">
    <h2 class="d-hours__title" id="d-hours-h" data-reveal>Hours</h2>
    ${hours(F, { cls: 'd-stats--sun' })}
  </div>
</section>
<section class="band band--lit d-group" aria-labelledby="d-ca-h">
  <div class="wrap">
    ${head2({ kicker: esc(F.region), title: `<a class="d-head__link"${linkAttrs(P.ca)}>California${icon('arrow')}</a>`, id: 'd-ca-h', intro: `${A.length} delivery areas and pick-up.` })}
    <ul class="d-areas" role="list">${A.map((a, i) => areaCard(a, i)).join('\n')}
    ${pickupCard(ctx, F, A.length)}</ul>
  </div>
</section>
<section class="band band--void d-next" aria-labelledby="d-next-h">
  <div class="wrap">
    ${head2({ kicker: 'Before you order', title: `Plan your <span class="accent">order</span>`, id: 'd-next-h' })}
    <ul class="d-links" role="list">
      <li data-reveal style="--i:0"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.guides)}>${icon('truck')}<span>Delivery Guide</span></a></li>
      <li data-reveal style="--i:1"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.deals)}>${icon('tag')}<span>Deals</span></a></li>
      <li data-reveal style="--i:2"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.faq)}>${icon('search')}<span>FAQ</span></a></li>
    </ul>
  </div>
</section>`;
  return { path, html: page({ ctx, path, ...m, jsonld: [ldCrumbs(ctx, crumbs)], bodyClass: 'd-page d-page--hub', main, crumbs, heroCrumbs: true }) };
}

// ---------- /dispensaries/california/ ----------
function renderState(ctx, F, A) {
  const path = P.ca;
  const crumbs = [CRUMB.home, CRUMB.hub, [path, 'California']];
  const m = meta(ctx, path, 'Weed Delivery in the South Bay, CA | Marche', `Weed delivery in the ${F.region}: ${F.delivery.label} ${F.delivery.value}, ${F.pickup.label} ${F.pickup.value}, ${F.fast}. Delivery areas: ${A.map((a) => a.name).join(', ')}.`);
  const dealsMini = F.deals.map((d) => `<li>${esc(d.big)}${d.small ? ' ' + esc(d.small) : ''} ${esc(d.what)}${d.brandLine ? ` <span class="d-mini__brand">(${esc(d.brandLine)})</span>` : ''}</li>`).join('');
  const main = `
${hero({
    crumbs,
    kicker: 'California',
    title: `Weed delivery in the <span class="accent">South Bay</span>`,
    line: `Cannabis delivery in the ${esc(F.region)}`,
    actions: `${btn(P.shop, ctx.ia.cta.label)}${btn(P.deals, 'Deals', 'btn btn--ghost')}`,
    art: ART[1],
    after: hours(F, { cls: 'd-stats--hero' }),
    cls: 'd-hero--stats',
  })}
<section class="band band--lit d-group" aria-labelledby="d-areas-h">
  <div class="wrap">
    ${head2({ kicker: esc(F.region), title: `Delivery <span class="accent">areas</span>`, id: 'd-areas-h', intro: 'Pick your area for its delivery details, deals and FAQs.' })}
    <ul class="d-areas" role="list">${A.map((a, i) => areaCard(a, i)).join('\n')}</ul>
  </div>
</section>
<section class="band band--sun d-how" aria-labelledby="d-how-h">
  <div class="wrap">
    <header class="d-head d-head--sun" data-reveal><p class="d-how__kicker">How it works</p><h2 class="display d-head__title" id="d-how-h">How ordering works</h2></header>
    ${steps(F)}
  </div>
</section>
<section class="band band--void d-pair" aria-labelledby="d-pair-h">
  <div class="wrap">
    ${head2({ kicker: 'More information', title: `Deals &amp; <span class="accent">answers</span>`, id: 'd-pair-h' })}
    <div class="d-pair__grid">
      <article class="glass glass--sun d-pair__card" data-reveal style="--i:0">
        <h3 class="d-pair__title">${icon('tag')}Deals</h3>
        <ul class="d-mini">${dealsMini}</ul>
        ${arrowLink(P.deals, 'See all deals')}
      </article>
      <article class="glass glass--lit d-pair__card" data-reveal style="--i:1">
        <h3 class="d-pair__title">${icon('search')}FAQ</h3>
        <p>Delivery hours, ID, the medical menu, the first-customer offer and the referral offer.</p>
        ${arrowLink(P.faq, 'Read the FAQ')}
      </article>
    </div>
  </div>
</section>`;
  return { path, html: page({ ctx, path, ...m, jsonld: [ldCrumbs(ctx, crumbs)], bodyClass: 'd-page d-page--state', main, crumbs, heroCrumbs: true }) };
}

// ---------- /dispensaries/california/<slug>/ ----------
function renderArea(ctx, F, A, a, idx) {
  const path = a.path;
  const city = a.name;
  const crumbs = [CRUMB.home, CRUMB.hub, CRUMB.ca, [path, city]];
  const m = meta(ctx, path, `Weed Delivery in ${city}, CA | Marche`, `Weed delivery in ${city}, ${F.region}: ${F.delivery.label} ${F.delivery.value}, ${F.pickup.label} ${F.pickup.value}, ${F.fast}. Order from the Marche menu.`);
  const others = A.filter((x) => x.slug !== a.slug);
  const amen = [
    ['id', 'Valid ID, 21+', '', ''],
    ['truck', F.delivery.label, F.delivery.value, ''],
    ['bag', F.pickup.label, F.pickup.value, P.contact],
    ['clock', F.fast, F.door, ''],
    ['plus', 'Medical menu', '', '/shop/medical/'],
    ['tag', F.first.title, F.first.sub, P.first],
    ['gift', F.refHead, F.refGift, P.rewards],
  ];
  const faqs = [
    [`What are the delivery hours in ${city}?`, `<p>${esc(F.delivery.label)}: ${esc(F.delivery.value)}. ${esc(F.pickup.label)}: ${esc(F.pickup.value)}.</p>`],
    [`How fast is weed delivery in ${city}?`, `<p>${esc(F.fast)}, at your door.</p>`],
    ['Which areas does Marche deliver to?', `<p>${esc(listJoin(A.map((x) => x.name)))}, in the ${esc(F.region)}.</p><p>${arrowLink(P.hub, 'All delivery areas')}</p>`],
    [`Do I need ID for weed delivery in ${city}?`, `<p>${esc(F.idLaw.text)} ${source(F.idLaw.source)}</p>`],
    ['Is there a medical menu?', `<p>Yes: Medical is one of the menu categories. ${esc(F.medLaw.text)} ${source(F.medLaw.source)}</p><p>${arrowLink('/shop/medical/', 'Medical menu')} ${arrowLink(P.card, 'Getting a Medical Card')}</p>`],
    ['Is there an offer for first-time customers?', `<p>${esc(F.first.sub)}: ${esc(F.first.title)}.</p><p>${arrowLink(P.first, 'Rewards')}</p>`],
    ['What do I get for referring a friend?', `<p>${esc(F.ref.title)}.</p><p>${arrowLink(P.rewards, 'Refer a friend')}</p>`],
    ['Can I pick up my order instead?', `<p>${esc(F.pickup.label)}: ${esc(F.pickup.value)}.</p><p>${arrowLink(P.contact, 'Contact us')}</p>`],
    ['What can I order?', `<p>The menu has ${esc(listJoin(F.cats.map((c) => c.label)))}, plus deals.</p><p>${arrowLink(P.shop, 'Shop the menu')}</p>`],
  ];
  const main = `
${hero({
    crumbs,
    kicker: esc(F.region),
    title: `Weed delivery in <span class="accent">${esc(city)}</span>`,
    line: `Cannabis delivery in the ${esc(F.region)}`,
    actions: `${btn(P.shop, ctx.ia.cta.label)}${btn(P.deals, 'Deals', 'btn btn--ghost')}`,
    art: ART[idx % ART.length],
    cut: heroCut(ctx, CUTS[idx % CUTS.length], 'd-hero__cut--' + (idx % CUTS.length)),
    cls: 'd-hero--area',
  })}
<section class="band band--rose d-strip" aria-labelledby="d-strip-h">
  <div class="wrap d-strip__grid">
    <span class="d-strip__ico" aria-hidden="true">${icon('gift')}</span>
    <h2 class="d-strip__title" id="d-strip-h" data-reveal>${esc(F.ref.title)}</h2>
    <div class="d-strip__cta" data-reveal style="--i:1">${btn(P.rewards, 'Refer a friend', 'btn btn--glass')}</div>
  </div>
</section>
<section class="band band--lit d-details" id="details" aria-labelledby="d-details-h">
  <div class="wrap d-details__grid">
    <div class="d-details__main">
      ${head2({ kicker: 'Delivery details', title: `${esc(city)} delivery <span class="accent">details</span>`, id: 'd-details-h' })}
      <div class="glass glass--lit glass--strong d-details__pane" data-reveal style="--i:1">
        <dl class="d-dl">
          <div class="d-dl__row"><dt>${icon('truck')}${esc(F.delivery.label)}</dt><dd>${esc(F.delivery.value)}</dd></div>
          <div class="d-dl__row"><dt>${icon('bag')}${esc(F.pickup.label)}</dt><dd>${esc(F.pickup.value)}</dd></div>
          <div class="d-dl__row"><dt>${icon('clock')}${esc(F.door)}</dt><dd>${esc(F.fast)}</dd></div>
          <div class="d-dl__row d-dl__row--menu"><dt>${icon('cart')}Menu</dt><dd><ul class="d-chips" role="list">${F.menu.map((c) => `<li><a class="chip"${linkAttrs(c.path)}>${esc(c.label)}</a></li>`).join('')}</ul></dd></div>
        </dl>
      </div>
    </div>
    <aside class="d-more" aria-labelledby="d-more-h" data-reveal style="--i:2">
      <h2 class="d-more__title" id="d-more-h">More information</h2>
      <ul class="d-more__list" role="list">
        <li><a class="d-more__link"${linkAttrs(P.deals)}>${icon('tag')}<span>Deals</span>${icon('arrow', 'd-more__go')}</a></li>
        <li><a class="d-more__link"${linkAttrs(P.rewards)}>${icon('gift')}<span>Rewards</span>${icon('arrow', 'd-more__go')}</a></li>
        <li><a class="d-more__link"${linkAttrs(P.faq)}>${icon('search')}<span>FAQ</span>${icon('arrow', 'd-more__go')}</a></li>
        <li><a class="d-more__link"${linkAttrs(P.card)}>${icon('id')}<span>Getting a Medical Card</span>${icon('arrow', 'd-more__go')}</a></li>
      </ul>
    </aside>
  </div>
</section>
<section class="band band--beam d-amen" aria-labelledby="d-amen-h">
  <div class="wrap">
    ${head2({ kicker: esc(F.region), title: `Ordering from <span class="accent">Marche</span>`, id: 'd-amen-h' })}
    <ul class="d-amen__grid" role="list">
      ${amen.map(([ic, label, sub, u], i) => {
    const inner = `<span class="d-amen__ico">${icon(ic)}</span><span class="d-amen__label">${esc(label)}</span>${sub ? `<span class="d-amen__sub">${esc(sub)}</span>` : ''}`;
    return `<li class="d-amen__item" data-reveal style="--i:${i % 4}">${u ? `<a class="d-amen__card glass glass--lit glass--lift"${linkAttrs(u)}>${inner}</a>` : `<div class="d-amen__card glass glass--lit">${inner}</div>`}</li>`;
  }).join('\n      ')}
    </ul>
  </div>
</section>
<section class="band band--void d-deals" aria-labelledby="d-deals-h">
  <div class="wrap">
    ${head2({ kicker: 'Deals', title: `Deals for <span class="accent">${esc(city)}</span>`, id: 'd-deals-h' })}
    <ul class="d-deals__row" role="list">${F.deals.map(dealCard).join('\n')}</ul>
    <div class="btn-row d-deals__cta" data-reveal>${btn(P.deals, 'See all deals')}${btn(P.shop, ctx.ia.cta.label, 'btn btn--ghost')}</div>
  </div>
</section>
<section class="band band--lit d-faqs" aria-labelledby="d-faq-h">
  <div class="wrap d-faqs__grid">
    <div class="d-faqs__aside">
      ${head2({ kicker: 'FAQ', title: `${esc(city)} delivery <span class="accent">FAQs</span>`, id: 'd-faq-h' })}
      <div class="btn-row" data-reveal style="--i:1">${btn(P.faq, 'All FAQs', 'btn btn--ghost')}</div>
    </div>
    ${faqHtml(faqs)}
  </div>
</section>
<section class="band band--void d-near" aria-labelledby="d-near-h">
  <div class="wrap">
    ${head2({ kicker: esc(F.region), title: `More South Bay delivery <span class="accent">areas</span>`, id: 'd-near-h' })}
    <ul class="d-areas" role="list">${others.map((x, i) => areaCard(x, i)).join('\n')}</ul>
  </div>
</section>`;
  return { path, html: page({ ctx, path, ...m, jsonld: [ldCrumbs(ctx, crumbs)], bodyClass: 'd-page d-page--area', main, crumbs, heroCrumbs: true }) };
}

// ---------- /dispensary-guides/ ----------
function renderGuides(ctx, F, A) {
  const path = P.guides;
  const crumbs = [CRUMB.home, [path, 'Delivery Guide']];
  const m = meta(ctx, path, 'Delivery Guide | Marche', `Marche delivery guides for the ${F.region}: ${A.map((a) => a.name).join(', ')}. ${F.delivery.label} ${F.delivery.value}, ${F.fast}.`);
  const main = `
${hero({
    crumbs,
    kicker: 'Resources',
    title: `Delivery <span class="accent">guide</span>`,
    lede: `How Marche delivery works, and one guide per area of the ${esc(F.region)}.`,
    actions: `${btn(P.shop, ctx.ia.cta.label)}${btn(P.hub, 'Delivery areas', 'btn btn--ghost')}`,
    art: ART[2],
  })}
<section class="band band--sun d-how" aria-labelledby="d-how-h">
  <div class="wrap">
    <header class="d-head d-head--sun" data-reveal><p class="d-how__kicker">How it works</p><h2 class="display d-head__title" id="d-how-h">How delivery works</h2></header>
    ${steps(F)}
  </div>
</section>
<section class="band band--lit d-guides" aria-labelledby="d-guides-h">
  <div class="wrap">
    ${head2({ kicker: esc(F.region), title: `Area <span class="accent">guides</span>`, id: 'd-guides-h', intro: `${A.length} delivery areas, each with its delivery details, deals and FAQs.` })}
    <ol class="d-guides__list" role="list">${A.map((a, i) => `<li class="d-guides__item" data-reveal style="--i:${i % 6}"><a class="d-guide glass glass--lit glass--lift"${linkAttrs(a.path)}>
      <span class="d-guide__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="d-guide__body"><span class="d-guide__title">${esc(a.label)}</span><span class="d-guide__meta">${esc(F.delivery.label)} ${esc(F.delivery.value)} &middot; ${esc(F.fast)}</span></span>
      <span class="d-guide__go">${icon('arrow')}</span>
      
    </a></li>`).join('\n')}</ol>
  </div>
</section>
<section class="band band--void d-next" aria-labelledby="d-read-h">
  <div class="wrap">
    ${head2({ kicker: 'Resources', title: `Keep <span class="accent">reading</span>`, id: 'd-read-h' })}
    <ul class="d-links" role="list">
      <li data-reveal style="--i:0"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.card)}>${icon('id')}<span>Getting a Medical Card</span></a></li>
      <li data-reveal style="--i:1"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.laws)}>${icon('pin')}<span>State Laws</span></a></li>
      <li data-reveal style="--i:2"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.faq)}>${icon('search')}<span>FAQ</span></a></li>
      <li data-reveal style="--i:3"><a class="d-link glass glass--lit glass--lift"${linkAttrs(P.blog)}>${icon('arrow')}<span>Blog</span></a></li>
    </ul>
  </div>
</section>`;
  return { path, html: page({ ctx, path, ...m, jsonld: [ldCrumbs(ctx, crumbs)], bodyClass: 'd-page d-page--guides', main, crumbs, heroCrumbs: true }) };
}

export async function render(ctx) {
  const F = facts(ctx);
  const A = areas(ctx);
  if (A.length !== 12) throw new Error('hubs: expected 12 delivery areas in site.json, got ' + A.length);
  return [
    renderHub(ctx, F, A),
    renderState(ctx, F, A),
    ...A.map((a, i) => renderArea(ctx, F, A, a, i)),
    renderGuides(ctx, F, A),
    render404(ctx),
  ];
}
