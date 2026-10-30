// pages.mjs - PAGES lane, "NOIR MARCHÉ": /about-us/ /contact/ /faq/ /events/ /careers/ /blog/ (+ /blog/<cat>/ x3)
// /getting-a-medical-card/ /cannabis-laws-by-state/ (+ /california/) /terms-and-conditions/ /privacy-policy/
// /disclaimer/. Every visible fact is read from ctx.site (site.json) / ctx.ia (ia.json) at render time - nothing is
// retyped here except neutral glue (labels, one-line intros, empty states). Law and medical-card statements come only
// from site.json caLaw, each with its source. Forms are util.demoForm (textarea / tel variants keep data-demo-form and
// the [data-demo-note] element exactly as demoForm renders them).
// Layout: one shared hero (breadcrumb inside, H1 straight on the dark ground - no glass box, D10 - generated art
// screen-blended on the lit side, an optional client cut-out crossing the lower seam), then bands whose glass panes
// sit over a light pool. Classes: FOUNDATION's contract classes + this lane's p- prefix (src/styles/pages.css).
import { page, crumbsHtml, icon } from './shell.mjs';
import { esc, escA, attrs, linkAttrs, gimg, photo, stripTags, absUrl, areas, demoForm, slugify } from './util.mjs';

// ---------- shared facts (read, never retyped) ----------
const tag = (ctx) => ctx.site.tagline.lines; // ["Weed Delivery", "At Your Door", "45 Minutes or Less"]
const fast = (ctx) => tag(ctx)[tag(ctx).length - 1];
const hoursList = (ctx) => [{ ...ctx.site.hours.delivery, ico: 'truck' }, { ...ctx.site.hours.pickup, ico: 'bag' }];
const catPath = (c) => '/shop/' + c.slug + '/';
const DEALS_PATH = '/dispensaries/california/deals/';
const CAT_IMG = { flower: 'g-bud-key', 'pre-rolls': 'g-prerolls', vapes: 'g-vape', concentrates: 'g-concentrate', medical: 'g-apothecary', deals: 'g-jars' };

function law(ctx, re) {
  const all = [...ctx.site.caLaw.facts, ...ctx.site.caLaw.mmic];
  const f = all.find((x) => re.test(x.text));
  if (!f) throw new Error('pages.mjs: no site.json caLaw fact matches ' + re);
  return f;
}
const isUrl = (s) => /^https?:\/\//i.test(String(s));
const host = (u) => String(u).replace(/^https?:\/\//i, '').split('/')[0];
// a law fact's source: an official URL becomes a link (host as the label), a statute citation stays a <cite>
const source = (src) => (isUrl(src)
  ? `<p class="p-src">Source: <a class="p-src__link"${linkAttrs(src)}>${esc(host(src))}${icon('ext', 'p-src__ico')}<span class="p-sr"> (opens in a new tab)</span></a></p>`
  : `<p class="p-src">Source: <cite>${esc(src)}</cite></p>`);
const reviewed = (ctx, medical = false) => `<p class="p-review">${icon('clock', 'p-review__ico')}<span>Last reviewed ${esc(ctx.site.caLaw.reviewed)}</span></p>
<p class="p-advice">This page is general information, not legal${medical ? ' or medical' : ''} advice.</p>`;

// brand name -> its shop anchor (ia.json Explore mega "Brands" group)
function brandHref(ctx, name) {
  for (const n of ctx.ia.nav) for (const g of n.mega || []) if (g.group === 'Brands') for (const [h, l] of g.links || []) if (l === name) return h;
  return '/shop/';
}
const dealWords = (d) => [d.big, d.small, d.what].filter(Boolean).join(' ') + (d.brandLine ? ` (${d.brandLine})` : '');

// ---------- head + page ----------
function out(ctx, { path, name, description, crumbs, main, mod, jsonld = [] }) {
  const title = `${name} | ${ctx.site.name}`;
  const url = absUrl(ctx, path);
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: url,
      og: { 'og:title': title, 'og:description': description, 'og:url': url, 'og:type': 'website', 'og:site_name': ctx.site.name },
      jsonld, bodyClass: `p-page p-page--${mod}`, main, crumbs, heroCrumbs: true,
    }),
  };
}

// ---------- pieces ----------
const btn = (h, label, cls = 'btn--sun') => `<a class="btn ${cls}"${linkAttrs(h)}>${esc(label)}</a>`;
const arrow = (h, label, cls = '') => `<a class="link-arrow ${cls}"${linkAttrs(h)}>${esc(label)}${icon('arrow')}</a>`;
const kicker = (t) => (t ? `<p class="kicker">${esc(t)}</p>` : '');

// the page hero: dark ground, one key-light pool (cursor-follow via data-spot), generated art screen-blended on the
// lit side behind a local scrim, breadcrumb + kicker + H1 + lede + CTAs straight on the ground; optional cut-out that
// crosses the lower seam (the band after a .p-hero--cut gets extra top padding).
function hero(ctx, { crumbs, kick, title, lede = '', ctas = [], bg = '', cut = '', mod = '' }) {
  return `<section class="band band--void p-hero${cut ? ' p-hero--cut' : ''} ${mod}" data-spot>
<div class="band__clip p-hero__clip" aria-hidden="true">
<div class="band__bg p-hero__bg">${bg ? gimg(bg, { alt: '', eager: true, sizes: '(min-width: 1024px) 70vw, 100vw', cls: 'screen p-hero__img' }) : ''}</div>
<span class="p-hero__pool"></span><span class="p-hero__scrim"></span><span class="grain"></span>
</div>
<div class="wrap p-hero__inner">
<div class="p-hero__text">
<div class="p-hero__crumbs">${crumbsHtml(crumbs)}</div>
${kicker(kick)}
<h1 class="display p-hero__title">${title}</h1>
${lede ? `<p class="lede p-hero__lede">${lede}</p>` : ''}
${ctas.length ? `<div class="btn-row p-hero__ctas">${ctas.join('')}</div>` : ''}
</div>
${cut}
</div>
</section>`;
}
// a client cut-out protruding past the hero's lower seam (decorative: the page text carries the meaning)
// not eager: the hero art behind the text is the page's one eager image (the LCP); phones show the cut at 96 to 104px
const heroCut = (ctx, file, cls = '') => `<div class="p-hero__cut protrude ${cls}" aria-hidden="true"><div class="p-hero__cut-in" data-depth="0.12">${photo(ctx, file, { alt: '', cls: 'cut p-hero__cut-img', sizes: '(min-width: 1024px) 400px, (max-width: 720px) 104px, 170px' })}</div></div>`;

function band(inner, { tone = 'void', mod = '', id = '', label = '', clip = '' } = {}) {
  return `<section${attrs({ class: `band band--${tone} p-band ${mod}`.trim(), id: id || null, 'aria-labelledby': label || null })}>
${clip ? `<div class="band__clip" aria-hidden="true">${clip}<span class="grain"></span></div>` : ''}
${inner}
</section>`;
}
const pool = (cls = '') => `<span class="p-pool ${cls}"></span>`;
const secHead = (id, kick, title, intro = '') => `<header class="p-head" data-reveal>${kicker(kick)}<h2 class="display p-head__title" id="${escA(id)}">${title}</h2>${intro ? `<p class="p-head__intro">${intro}</p>` : ''}</header>`;

const areaChips = (ctx, cls = '') => `<ul class="p-chips ${cls}" role="list">${areas(ctx).map((a, i) => `<li data-reveal style="--i:${i % 6}"><a class="chip"${linkAttrs(a.path)}>${icon('pin')}${esc(a.name)}</a></li>`).join('')}</ul>`;

function hoursCards(ctx) {
  return hoursList(ctx).map((h, i) => `<div class="p-hours__item glass glass--lit" data-reveal style="--i:${i}">${icon(h.ico, 'p-hours__ico')}<p class="p-hours__label">${esc(h.label)}</p><p class="p-hours__value">${esc(h.value)}</p></div>`).join('');
}

// demoForm variants (D9): the Message field becomes a <textarea>, Phone becomes type="tel"; asserted, never guessed
function formWith(opts, { area = [], tel = [] } = {}) {
  let html = demoForm(opts);
  for (const f of area) {
    const re = new RegExp(`<input class="demo-form__input" type="text" name="${slugify(f)}"[^>]*>`);
    if (!re.test(html)) throw new Error('pages.mjs: demoForm markup changed, cannot make a textarea for ' + f);
    html = html.replace(re, `<textarea class="demo-form__input p-form__area" name="${slugify(f)}" rows="5"></textarea>`);
  }
  for (const f of tel) {
    const re = new RegExp(`<input class="demo-form__input" type="text" name="${slugify(f)}"[^>]*>`);
    if (!re.test(html)) throw new Error('pages.mjs: demoForm markup changed, cannot make a tel input for ' + f);
    html = html.replace(re, `<input class="demo-form__input" type="tel" name="${slugify(f)}" autocomplete="tel" inputmode="tel">`);
  }
  if (!/data-demo-form/.test(html) || !/data-demo-note/.test(html)) throw new Error('pages.mjs: demo form lost its hooks');
  return html;
}

function insider(ctx, { id = 'insider', h = 'h2' } = {}) {
  const ins = ctx.site.insider;
  return `<div class="p-insider glass glass--strong glass--lit" data-reveal>
<div class="p-insider__copy">${kicker('Insider')}<${h} class="display p-insider__title" id="${escA(id)}-title">${esc(ins.title)}</${h}><p class="p-insider__body">${esc(ins.body)}</p></div>
<div class="p-insider__form">${demoForm({ id: id + '-form', fields: ins.fields, button: ins.button })}</div>
</div>`;
}

// ---------- /about-us/ ----------
function about(ctx) {
  const s = ctx.site;
  const path = '/about-us/';
  const crumbs = [['/', 'Home'], [path, 'About']];
  const t = tag(ctx);
  const A = areas(ctx);
  const h = hero(ctx, {
    crumbs, kick: 'About', title: `About <span class="accent">${esc(s.name)}</span>`,
    lede: `${esc(t[0])} ${esc(t[1])}, ${esc(fast(ctx))}, across the ${esc(s.region)}.`,
    ctas: [btn(ctx.ia.cta.href, ctx.ia.cta.label), btn('/dispensaries/', s.deliveryAreas.title, 'btn--glass')],
    bg: 'g-gold-dust', cut: heroCut(ctx, 'watermelon-sherbet.webp', 'p-hero__cut--about'), mod: 'p-hero--about',
  });
  const num = fast(ctx).match(/^(\d+)\s+(.*)$/);
  const stats = `<div class="wrap p-stats" role="list">
<div class="stat p-stat" role="listitem" data-reveal style="--i:0"><span class="stat__num p-stat__num">${esc(num ? num[1] : fast(ctx))}</span><span class="stat__label p-stat__label">${esc(num ? num[2] : '')}</span></div>
${hoursList(ctx).map((x, i) => `<div class="stat p-stat" role="listitem" data-reveal style="--i:${i + 1}"><span class="stat__num p-stat__num p-stat__num--time">${esc(x.value)}</span><span class="stat__label p-stat__label">${esc(x.label)}</span></div>`).join('')}
<div class="stat p-stat" role="listitem" data-reveal style="--i:3"><span class="stat__num p-stat__num">${A.length}</span><span class="stat__label p-stat__label">${esc(s.deliveryAreas.title)}</span></div>
</div>`;
  const cats = s.menuBar.map((label) => {
    const c = s.categories.find((x) => x.label === label);
    const key = c ? c.slug : slugify(label);
    const to = c ? catPath(c) : DEALS_PATH;
    const more = c ? (c.viewAll || 'Shop ' + c.label.toLowerCase()) : 'Shop deals';
    return { key, label, to, more };
  });
  const catCards = `<div class="p-cats">${cats.map((c, i) => `<a class="p-cat glass glass--lit glass--lift"${linkAttrs(c.to)} data-reveal style="--i:${i % 6}">
<span class="p-cat__media">${gimg(CAT_IMG[c.key] || 'g-jars', { alt: '', sizes: '(min-width: 1024px) 26vw, 45vw', cls: 'p-cat__img' })}</span>
<span class="p-cat__body"><span class="p-cat__name">${esc(c.label)}</span><span class="link-arrow p-cat__more">${esc(c.more)}${icon('arrow')}</span></span>
</a>`).join('')}</div>`;
  const brands = `<div class="p-brands">${s.brandsOnMenu.map((b, i) => {
    const prods = s.products.filter((p) => p.brand === b.name);
    const ph = (prods.find((p) => p.photo) || {}).photo;
    return `<article class="p-brand glass glass--strong glass--lit glass--lift" data-reveal style="--i:${i}">
<div class="p-brand__media" data-tilt>${ph ? photo(ctx, ph, { cls: 'cut p-brand__img', sizes: '(min-width: 1024px) 300px, (max-width: 720px) 38vw, 60vw' }) : ''}</div>
<div class="p-brand__copy"><h3 class="p-brand__name">${esc(b.name)}</h3>
${prods.length ? `<ul class="p-brand__list" role="list">${prods.map((p) => `<li><span>${esc(p.name)}</span> <span class="p-brand__price">${esc(p.price)}</span></li>`).join('')}</ul>` : ''}
${arrow(brandHref(ctx, b.name), 'Shop ' + b.name)}</div>
</article>`;
  }).join('')}</div>`;
  const deals = `<div class="p-deals">
${s.deals.map((d, i) => `<a class="p-deal glass glass--sun glass--lift"${linkAttrs(DEALS_PATH)} data-reveal style="--i:${i}"><span class="p-deal__big">${esc(d.big)}</span>${d.small ? `<span class="p-deal__small">${esc(d.small)}</span>` : ''}<span class="p-deal__what">${esc(d.what)}</span>${d.brandLine ? `<span class="chip p-deal__brand">${esc(d.brandLine)}</span>` : ''}</a>`).join('')}
<a class="p-offer glass glass--sun glass--lift"${linkAttrs('/rewards/#first-customer')} data-reveal style="--i:3">${icon('tag', 'p-offer__ico')}<span class="p-offer__title">${esc(s.firstCustomer.title)}</span><span class="p-offer__sub">${esc(s.firstCustomer.sub)}</span></a>
<a class="p-offer glass glass--rose glass--lift"${linkAttrs('/rewards/#join')} data-reveal style="--i:4">${icon('gift', 'p-offer__ico')}<span class="p-offer__title">${esc(s.referral.title)}</span><span class="p-offer__sub">Rewards</span></a>
</div>`;
  const main = `${h}
${band(`<div class="wrap">${secHead('about-glance', 'At a glance', `Delivery <span class="accent">and pick-up</span>`)}</div>${stats}`, { tone: 'sun', mod: 'p-band--glance', label: 'about-glance' })}
${band(`<div class="wrap">${secHead('about-menu', 'The menu', `What's on <span class="accent">the menu</span>`)}${catCards}</div>`, { mod: 'p-band--menu', label: 'about-menu', clip: pool('p-pool--right') })}
${band(`<div class="wrap">${secHead('about-brands', 'Brands', `Brands on <span class="accent">the menu</span>`)}${brands}</div>`, { tone: 'beam', mod: 'p-band--brands', label: 'about-brands', clip: pool('p-pool--left') })}
${band(`<div class="wrap">${secHead('about-deals', 'Deals & rewards', `Deals <span class="accent">and offers</span>`)}${deals}<p class="p-more">${arrow(DEALS_PATH, 'See all deals')} ${arrow('/rewards/', 'Rewards')}</p></div>`, { mod: 'p-band--deals', label: 'about-deals', clip: pool('p-pool--right') })}
${band(`<div class="wrap">${secHead('about-areas', s.deliveryAreas.title, `Weed delivery in <span class="accent">the South Bay</span>`)}${areaChips(ctx)}<p class="p-more">${arrow('/dispensaries/', 'All delivery areas')}</p></div>`, { tone: 'lit', mod: 'p-band--areas', label: 'about-areas', clip: `<span class="band__bg p-band__art">${gimg('g-palms-night', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span>` })}`;
  return out(ctx, {
    path, name: 'About', mod: 'about', crumbs, main,
    description: `About ${s.name}: weed delivery at your door in the ${s.region}, ${fast(ctx).toLowerCase()}. Delivery ${s.hours.delivery.value}, pick-up ${s.hours.pickup.value}.`,
  });
}

// ---------- /contact/ ----------
function contact(ctx) {
  const s = ctx.site;
  const path = '/contact/';
  const crumbs = [['/', 'Home'], [path, s.contact.heading]];
  const h = hero(ctx, {
    crumbs, kick: 'Contact', title: `${esc(s.contact.heading.split(' ')[0])} <span class="accent">${esc(s.contact.heading.split(' ').slice(1).join(' '))}</span>`,
    lede: 'Delivery and pick-up hours, the address and a message form.',
    ctas: [btn('#contact-form', 'Send a message'), btn('/faq/', 'FAQ', 'btn--glass')],
    bg: 'g-palms-night', mod: 'p-hero--contact',
  });
  const form = formWith({ id: 'contact-form', fields: ['Name', 'Email', 'Message'], button: 'Send' }, { area: ['Message'] });
  const main = `${h}
${band(`<div class="wrap p-contact">
<div class="p-contact__info">
${secHead('contact-hours', 'Hours', `Delivery <span class="accent">and pick-up</span>`)}
<div class="p-hours">${hoursCards(ctx)}</div>
<div class="p-address glass glass--strong glass--lit" data-reveal>${icon('pin', 'p-address__ico')}<div><h3 class="p-address__title">Address</h3><p class="p-address__line">${esc(s.contact.address.line)}</p><p class="p-address__note">Address shown as in the brand mockup, to be confirmed</p></div></div>
</div>
<div class="p-contact__form glass glass--strong glass--lit" data-reveal style="--i:1"><h2 class="display p-form__title" id="contact-message">Send <span class="accent">a message</span></h2>${form}</div>
</div>`, { tone: 'lit', mod: 'p-band--contact', label: 'contact-hours', clip: pool('p-pool--left') })}
${band(`<div class="wrap">${secHead('contact-areas', s.deliveryAreas.title, `Where <span class="accent">we deliver</span>`, `${esc(s.deliveryAreas.prefix)} the ${esc(s.region)}.`)}${areaChips(ctx)}<p class="p-more">${arrow('/dispensaries/', 'All delivery areas')}</p></div>`, { mod: 'p-band--areas', label: 'contact-areas', clip: `<span class="band__bg p-band__art">${gimg('g-smoke-beam', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span>` })}`;
  return out(ctx, {
    path, name: s.contact.heading, mod: 'contact', crumbs, main,
    description: `Contact ${s.name}: delivery ${s.hours.delivery.value}, pick-up ${s.hours.pickup.value}, delivery areas in the ${s.region} and a message form.`,
  });
}

// ---------- /faq/ ----------
function faq(ctx) {
  const s = ctx.site;
  const path = '/faq/';
  const crumbs = [['/', 'Home'], [path, 'FAQ']];
  const t = tag(ctx);
  const A = areas(ctx);
  const a = (h, l) => `<a${linkAttrs(h)}>${esc(l)}</a>`;
  const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const id21 = law(ctx, /21 and older can buy/i);
  const med = law(ctx, /^Medicinal cannabis customers/i);
  const lic = law(ctx, /licensed before you buy/i);
  const groups = [
    { id: 'delivery', title: 'Delivery & pick-up', items: [
      { q: 'What are your delivery hours?', a: `<p>${esc(s.hours.delivery.label)}: ${esc(s.hours.delivery.value)}.</p>` },
      { q: 'What are your pick-up hours?', a: `<p>${esc(s.hours.pickup.label)}: ${esc(s.hours.pickup.value)}.</p><p>${a('/contact/', 'Contact and pick-up')}</p>` },
      { q: 'How fast is delivery?', a: `<p>${esc(t[0])} ${esc(t[1])}, ${esc(fast(ctx))}.</p>` },
      { q: 'Where do you deliver?', a: `<p>${esc(s.name)} delivers in the ${esc(s.region)}: ${list(A.map((x) => a(x.path, x.name)))}.</p><p>${a('/dispensaries/', 'All delivery areas')}</p>` },
    ] },
    { id: 'menu', title: 'Menu & offers', items: [
      { q: "What's on the menu?", a: `<p>${list(s.categories.map((c) => a(catPath(c), c.label)))}.</p><p>Brands on the menu: ${list(s.brandsOnMenu.map((b) => a(brandHref(ctx, b.name), b.name)))}.</p><p>${a('/shop/', 'Browse the menu')}</p>` },
      { q: 'Is there a first-customer offer?', a: `<p>${esc(ctx.ia.promo.text)}.</p><p>${a('/rewards/#first-customer', 'First-customer offer')}</p>` },
      { q: 'Is there a referral offer?', a: `<p>${esc(s.referral.title)}.</p><p>${a('/rewards/#join', 'Refer a friend')}</p>` },
      { q: 'What deals are there?', a: `<p>${list(s.deals.map((d) => esc(dealWords(d))))}.</p><p>${a(DEALS_PATH, 'See all deals')}</p>` },
      { q: 'How do I get deals and updates?', a: `<p>${esc(s.insider.body)}</p><p>${a('/events/#insider', s.insider.title)}</p>` },
    ] },
    { id: 'law', title: 'ID, age & the law', items: [
      { q: 'Do I need an ID, and how old do I need to be?', a: `<p>${esc(id21.text)}</p>${source(id21.source)}` },
      { q: 'What are the rules for medicinal cannabis customers?', a: `<p>${esc(med.text)}</p>${source(med.source)}<p>${a('/getting-a-medical-card/', 'Getting a Medical Card')} · ${a('/shop/medical/', 'Medical menu')}</p>` },
      { q: 'How can I check that a cannabis business is licensed?', a: `<p>${esc(lic.text)}</p>${source(lic.source)}` },
    ], foot: `<p class="p-faq__foot">General information, not legal advice. Last reviewed ${esc(s.caLaw.reviewed)}. ${a('/cannabis-laws-by-state/california/', 'California cannabis laws')}</p>` },
  ];
  const h = hero(ctx, {
    crumbs, kick: 'FAQ', title: `Frequently asked <span class="accent">questions</span>`,
    lede: 'Delivery, pick-up, the menu, offers and the rules for buying cannabis in California.',
    ctas: groups.map((g) => btn('#faq-' + g.id, g.title, 'btn--glass btn--sm')),
    bg: 'g-smoke-beam', cut: heroCut(ctx, 'crescendo-jar.webp', 'p-hero__cut--faq'), mod: 'p-hero--faq',
  });
  const body = groups.map((g, gi) => `<section class="p-faq__group" aria-labelledby="faq-${g.id}" data-reveal style="--i:${gi}">
<h2 class="display p-faq__title" id="faq-${g.id}">${esc(g.title)}</h2>
<div class="faq p-faq__list">${g.items.map((it, i) => `<details class="faq__item"${gi === 0 && i === 0 ? ' open' : ''}><summary class="faq__q">${esc(it.q)}</summary><div class="faq__a">${it.a}</div></details>`).join('\n')}</div>
${g.foot || ''}
</section>`).join('\n');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: groups.flatMap((g) => g.items).map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(it.a.replace(/<span class="p-sr">[^<]*<\/span>/g, '').replace(/<\/p>/g, ' ')).replace(/\s+/g, ' ').trim() } })) }];
  const main = `${h}
${band(`<div class="wrap p-faq">${body}</div>`, { tone: 'lit', mod: 'p-band--faq', clip: pool('p-pool--left') })}
${band(`<div class="wrap p-cta glass glass--strong glass--lit" data-reveal><div><h2 class="display p-cta__title" id="faq-more">Still have <span class="accent">a question?</span></h2><p class="p-cta__line">Send a note from the contact page.</p></div><div class="btn-row">${btn('/contact/', 'Contact us')}${btn('/shop/', 'Browse the menu', 'btn--glass')}</div></div>`, { mod: 'p-band--cta', label: 'faq-more', clip: pool('p-pool--right') })}`;
  return out(ctx, {
    path, name: 'FAQ', mod: 'faq', crumbs, main, jsonld,
    description: `${s.name} FAQ: delivery ${s.hours.delivery.value}, pick-up ${s.hours.pickup.value}, ${fast(ctx).toLowerCase()}, delivery areas, the menu, offers and California ID rules.`,
  });
}

// ---------- /events/ ----------
function events(ctx) {
  const s = ctx.site;
  const path = '/events/';
  const crumbs = [['/', 'Home'], [path, 'Events']];
  const h = hero(ctx, {
    crumbs, kick: 'Events', title: `Marche <span class="accent">events</span>`,
    lede: `Events from ${esc(s.name)} will be listed here.`,
    ctas: [btn('#insider', s.insider.button), btn('/shop/', 'Browse the menu', 'btn--glass')],
    bg: 'g-gold-dust', cut: heroCut(ctx, 'high-90s-preroll-pack.webp', 'p-hero__cut--events'), mod: 'p-hero--events',
  });
  const main = `${h}
${band(`<div class="wrap wrap--narrow"><div class="p-empty glass glass--strong glass--lit" data-reveal>${icon('clock', 'p-empty__ico')}<h2 class="display p-empty__title" id="events-list">Upcoming <span class="accent">events</span></h2><p class="p-empty__line">No events are posted yet.</p></div></div>`, { tone: 'lit', mod: 'p-band--empty', label: 'events-list', clip: pool('p-pool--center') })}
<section class="band band--void p-band p-band--insider" id="insider" aria-labelledby="insider-title"><div class="band__clip" aria-hidden="true"><span class="band__bg p-band__art">${gimg('g-smoke-beam', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span><span class="grain"></span></div><div class="wrap">${insider(ctx)}</div></section>`;
  return out(ctx, {
    path, name: 'Events', mod: 'events', crumbs, main,
    description: `${s.name} events: none are posted yet. ${s.insider.title}`,
  });
}

// ---------- /careers/ ----------
function careers(ctx) {
  const s = ctx.site;
  const path = '/careers/';
  const crumbs = [['/', 'Home'], [path, 'Careers']];
  const h = hero(ctx, {
    crumbs, kick: 'Careers', title: `Work <span class="accent">with Marche</span>`,
    lede: `Interested in working with ${esc(s.name)}? Send your details with the application form below.`,
    ctas: [btn('#application', 'Application'), btn('/about-us/', 'About Marche', 'btn--glass')],
    bg: 'g-smoke-beam', mod: 'p-hero--careers',
  });
  const form = formWith({ id: 'application-form', fields: ['Name', 'Email', 'Phone', 'Position of interest', 'Message'], button: 'Submit application' }, { area: ['Message'], tel: ['Phone'] });
  const main = `${h}
${band(`<div class="wrap wrap--narrow"><div class="p-empty glass glass--strong glass--lit" data-reveal>${icon('user', 'p-empty__ico')}<h2 class="display p-empty__title" id="careers-open">Open <span class="accent">positions</span></h2><p class="p-empty__line">No openings are posted yet.</p></div></div>`, { tone: 'lit', mod: 'p-band--empty', label: 'careers-open', clip: pool('p-pool--center') })}
<section class="band band--void p-band p-band--application" id="application" aria-labelledby="application-title"><div class="band__clip" aria-hidden="true"><span class="band__bg p-band__art">${gimg('g-gold-dust', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span><span class="grain"></span></div>
<div class="wrap p-apply">
<div class="p-apply__copy" data-reveal>${kicker('Application')}<h2 class="display p-apply__title" id="application-title">Apply <span class="accent">to Marche</span></h2><p class="p-apply__line">Name, email, phone, the position you are interested in and a short message.</p></div>
<div class="p-apply__form glass glass--strong glass--lit" data-reveal style="--i:1">${form}</div>
</div></section>`;
  return out(ctx, {
    path, name: 'Careers', mod: 'careers', crumbs, main,
    description: `Careers at ${s.name}: no openings are posted yet. Send your name, email, phone, position of interest and a message with the application form.`,
  });
}

// ---------- blog: /blog/ + /blog/<cat>/ ----------
// card title = the target page's H1 (read from ctx.pages when that module rendered first: home, shop, hubs run before
// this one); else this lane's own H1s; else a fallback keyed by href (the IA labels).
const OWN_H1 = { '/getting-a-medical-card/': 'Getting a Medical Card', '/cannabis-laws-by-state/california/': 'California cannabis laws' };
const FALLBACK_H1 = { '/dispensary-guides/': 'Delivery Guide', '/dispensaries/california/': 'Weed delivery in the South Bay' };
function h1Of(ctx, to) {
  if (OWN_H1[to]) return OWN_H1[to];
  const p = ctx.pages && ctx.pages.get(to);
  if (p && p.html) {
    const m = p.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    if (m) { const tx = stripTags(m[1].replace(/<br\s*\/?>/gi, ' ')).replace(/\s+/g, ' ').trim(); if (tx) return tx; }
  }
  const c = ctx.site.categories.find((x) => catPath(x) === to);
  return c ? c.label : FALLBACK_H1[to] || to;
}
const catOf = (ctx, slug) => ctx.ia.blogCategories.find((c) => c.slug === slug);
function postCards(ctx, posts) {
  return `<div class="p-posts">${posts.map((p, i) => `<article class="p-post glass glass--lit glass--lift" data-reveal style="--i:${i % 6}">
<a class="p-post__link"${linkAttrs(p.href)}>
<span class="p-post__media">${gimg(p.image, { alt: '', sizes: '(min-width: 1024px) 30vw, (min-width: 721px) 45vw, 46vw', cls: 'p-post__img' })}</span>
<span class="p-post__body"><span class="p-post__cat">${esc((catOf(ctx, p.cat) || {}).label || '')}</span><h3 class="p-post__title">${esc(h1Of(ctx, p.href))}</h3><span class="link-arrow p-post__more">Read the guide${icon('arrow')}</span></span>
</a>
</article>`).join('\n')}</div>`;
}
function blogChips(ctx, current) {
  const all = [['/blog/', 'All guides', !current], ...ctx.ia.blogCategories.map((c) => [`/blog/${c.slug}/`, c.label, current === c.slug])];
  return `<nav class="p-cats-nav" aria-label="Blog categories"><ul class="p-chips" role="list">${all.map(([h, l, on]) => `<li><a class="chip${on ? ' chip--sun' : ''}"${linkAttrs(h)}${on ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`).join('')}</ul></nav>`;
}
function blogHub(ctx) {
  const path = '/blog/';
  const crumbs = [['/', 'Home'], [path, 'Blog']];
  const feat = (ctx.ia.nav.find((n) => n.feature && n.feature.href === '/blog/') || {}).feature || { line: '' };
  const h = hero(ctx, {
    crumbs, kick: 'Resources', title: `The Marche <span class="accent">blog</span>`,
    lede: `${esc(feat.line)}, delivery in the ${esc(ctx.site.region)} and California cannabis law.`,
    ctas: [blogChips(ctx, '')],
    bg: 'g-smoke-beam', cut: heroCut(ctx, 'thc-crescendo.webp', 'p-hero__cut--blog'), mod: 'p-hero--blog',
  });
  const groups = ctx.ia.blogCategories.map((c, gi) => {
    const posts = ctx.ia.blogPosts.filter((p) => p.cat === c.slug);
    return band(`<div class="wrap"><header class="p-head p-head--row" data-reveal><div>${kicker('Guides')}<h2 class="display p-head__title" id="blog-${escA(c.slug)}">${esc(c.label)}</h2></div>${arrow(`/blog/${c.slug}/`, 'All ' + c.label.toLowerCase())}</header>${postCards(ctx, posts)}</div>`, { tone: gi % 2 ? 'void' : 'lit', mod: 'p-band--posts', label: 'blog-' + c.slug, clip: pool(gi % 2 ? 'p-pool--right' : 'p-pool--left') });
  }).join('\n');
  return out(ctx, {
    path, name: 'Blog', mod: 'blog', crumbs, main: `${h}\n${groups}`,
    description: `${ctx.site.name} blog: ${ctx.ia.blogCategories.map((c) => c.label.toLowerCase()).join(', ')}. Guides to every category on the menu, delivery in the ${ctx.site.region} and California cannabis law.`,
  });
}
const CAT_BG = { 'product-guides': 'g-bud-key', delivery: 'g-palms-night', 'laws-and-medical': 'g-apothecary' };
const CAT_LEDE = {
  'product-guides': 'Guides to every category on the menu.',
  delivery: (ctx) => `Weed delivery in the ${esc(ctx.site.region)}.`,
  'laws-and-medical': 'California cannabis law and the medical card program.',
};
function blogCat(ctx, c) {
  const path = `/blog/${c.slug}/`;
  const crumbs = [['/', 'Home'], ['/blog/', 'Blog'], [path, c.label]];
  const posts = ctx.ia.blogPosts.filter((p) => p.cat === c.slug);
  const lede = typeof CAT_LEDE[c.slug] === 'function' ? CAT_LEDE[c.slug](ctx) : CAT_LEDE[c.slug] || '';
  const words = c.label.split(' ');
  const h = hero(ctx, {
    crumbs, kick: 'Blog', title: words.length > 1 ? `${esc(words.slice(0, -1).join(' '))} <span class="accent">${esc(words[words.length - 1])}</span>` : esc(c.label),
    lede, ctas: [blogChips(ctx, c.slug)], bg: CAT_BG[c.slug] || 'g-smoke-beam', mod: 'p-hero--blogcat',
  });
  const main = `${h}
${band(`<div class="wrap"><header class="p-head" data-reveal>${kicker(c.label)}<h2 class="display p-head__title" id="blog-list">${posts.length} <span class="accent">${posts.length === 1 ? 'guide' : 'guides'}</span></h2></header>${postCards(ctx, posts)}<p class="p-more">${arrow('/blog/', 'All guides')}</p></div>`, { tone: 'lit', mod: 'p-band--posts', label: 'blog-list', clip: pool('p-pool--left') })}`;
  return out(ctx, {
    path, name: `${c.label} | Blog`, mod: 'blogcat', crumbs, main,
    description: `${c.label} guides from the ${ctx.site.name} blog: ${posts.map((p) => h1Of(ctx, p.href)).join(', ')}.`,
  });
}

// ---------- law + medical ----------
function factList(facts, startAt = 1) {
  return `<ol class="p-facts" role="list">${facts.map((f, i) => `<li class="p-fact glass glass--strong glass--lit" data-reveal style="--i:${i % 6}"><span class="p-fact__n" aria-hidden="true">${String(i + startAt).padStart(2, '0')}</span><div class="p-fact__body"><p class="p-fact__text">${esc(f.text)}</p>${source(f.source)}</div></li>`).join('')}</ol>`;
}
function medicalCard(ctx) {
  const s = ctx.site;
  const path = '/getting-a-medical-card/';
  const crumbs = [['/', 'Home'], [path, OWN_H1[path]]];
  const med = law(ctx, /^Medicinal cannabis customers/i);
  const words = OWN_H1[path].split(' ');
  const h = hero(ctx, {
    crumbs, kick: 'Laws & medical', title: `${esc(words.slice(0, 2).join(' '))} <span class="accent">${esc(words.slice(2).join(' '))}</span>`,
    lede: "California's medical card program and the rules for medicinal cannabis, from official sources.",
    ctas: [btn('/shop/medical/', 'Medical menu'), btn('/cannabis-laws-by-state/california/', 'California cannabis laws', 'btn--glass')],
    bg: 'g-apothecary', mod: 'p-hero--medical',
  });
  const main = `${h}
${band(`<div class="wrap wrap--narrow p-law">
${secHead('mmic-facts', 'Official sources', `The medical <span class="accent">card</span>`)}
${factList([med, ...s.caLaw.mmic])}
<div class="p-law__meta" data-reveal>${reviewed(ctx, true)}</div>
</div>`, { tone: 'lit', mod: 'p-band--law', label: 'mmic-facts', clip: `<span class="band__bg p-band__art p-band__art--soft">${gimg('g-smoke-beam', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span>${pool('p-pool--left')}` })}
${band(`<div class="wrap p-cta glass glass--strong glass--lit" data-reveal><div><h2 class="display p-cta__title" id="medical-menu">The medical <span class="accent">menu</span></h2><p class="p-cta__line">${esc(s.categories.find((c) => c.slug === 'medical').label)} is one of the categories on the ${esc(s.name)} menu.</p></div><div class="btn-row">${btn('/shop/medical/', 'Shop medical')}${btn('/faq/', 'FAQ', 'btn--glass')}</div></div>`, { mod: 'p-band--cta', label: 'medical-menu', clip: pool('p-pool--right') })}`;
  return out(ctx, {
    path, name: OWN_H1[path], mod: 'medical', crumbs, main,
    description: `Getting a medical card in California: the voluntary MMIC program, the physician's recommendation it requires and the medicinal rules, each with its official source. Last reviewed ${s.caLaw.reviewed}.`,
  });
}
function lawsHub(ctx) {
  const s = ctx.site;
  const path = '/cannabis-laws-by-state/';
  const crumbs = [['/', 'Home'], [path, 'Cannabis laws by state']];
  const h = hero(ctx, {
    crumbs, kick: 'State laws', title: `Cannabis laws <span class="accent">by state</span>`,
    lede: `General information on cannabis law in the state where ${esc(s.name)} delivers.`,
    ctas: [btn('/cannabis-laws-by-state/california/', 'California')],
    bg: 'g-gold-dust', mod: 'p-hero--laws',
  });
  const main = `${h}
${band(`<div class="wrap">${secHead('laws-states', 'States', `Where <span class="accent">we deliver</span>`)}
<div class="p-states"><a class="p-state glass glass--strong glass--lit glass--lift"${linkAttrs('/cannabis-laws-by-state/california/')} data-reveal>
<span class="p-state__media">${gimg('g-smoke-beam', { alt: '', sizes: '(min-width: 1024px) 40vw, 92vw', cls: 'p-state__img' })}</span>
<span class="p-state__body"><span class="p-state__name">California</span><span class="p-state__line">General rules for adults and medicinal customers, each with its official source. Last reviewed ${esc(s.caLaw.reviewed)}.</span><span class="link-arrow">${esc(OWN_H1['/cannabis-laws-by-state/california/'])}${icon('arrow')}</span></span>
</a></div>
<p class="p-advice p-advice--hub">General information, not legal advice.</p></div>`, { tone: 'lit', mod: 'p-band--states', label: 'laws-states', clip: pool('p-pool--left') })}`;
  return out(ctx, {
    path, name: 'Cannabis laws by state', mod: 'laws', crumbs, main,
    description: `Cannabis laws by state: California's rules for adults and medicinal customers, each with its official source. Last reviewed ${s.caLaw.reviewed}.`,
  });
}
function lawsCa(ctx) {
  const s = ctx.site;
  const path = '/cannabis-laws-by-state/california/';
  const crumbs = [['/', 'Home'], ['/cannabis-laws-by-state/', 'Cannabis laws by state'], [path, 'California']];
  const h = hero(ctx, {
    crumbs, kick: 'State laws', title: `California <span class="accent">cannabis laws</span>`,
    lede: 'General California rules for adults and medicinal customers, each with its official source.',
    ctas: [btn('/getting-a-medical-card/', OWN_H1['/getting-a-medical-card/'], 'btn--glass'), btn('/faq/', 'FAQ', 'btn--ghost')],
    bg: 'g-smoke-beam', mod: 'p-hero--laws-ca',
  });
  const main = `${h}
${band(`<div class="wrap wrap--narrow p-law">
${secHead('ca-facts', 'California', `The rules <span class="accent">in brief</span>`)}
${factList(s.caLaw.facts)}
<div class="p-law__meta" data-reveal>${reviewed(ctx)}</div>
</div>`, { tone: 'lit', mod: 'p-band--law', label: 'ca-facts', clip: `<span class="band__bg p-band__art p-band__art--soft">${gimg('g-gold-dust', { alt: '', sizes: '100vw', cls: 'screen p-band__art-img' })}</span>${pool('p-pool--left')}` })}
${band(`<div class="wrap p-cta glass glass--strong glass--lit" data-reveal><div><h2 class="display p-cta__title" id="ca-more">Medical <span class="accent">cards</span></h2><p class="p-cta__line">California's medical card program, with its official sources.</p></div><div class="btn-row">${btn('/getting-a-medical-card/', OWN_H1['/getting-a-medical-card/'])}${btn('/shop/medical/', 'Medical menu', 'btn--glass')}</div></div>`, { mod: 'p-band--cta', label: 'ca-more', clip: pool('p-pool--right') })}`;
  return out(ctx, {
    path, name: 'California cannabis laws', mod: 'laws-ca', crumbs, main,
    description: `California cannabis laws in brief: ID and age 21+, possession limits, medicinal customers 18+, public use, driving and licence checks, each with its official source. Last reviewed ${s.caLaw.reviewed}.`,
  });
}

// ---------- legal placeholders ----------
const LEGAL = [
  { path: '/terms-and-conditions/', name: 'Terms & Conditions', what: 'terms and conditions' },
  { path: '/privacy-policy/', name: 'Privacy Policy', what: 'privacy policy' },
  { path: '/disclaimer/', name: 'Disclaimer', what: 'disclaimer' },
];
function legal(ctx, L) {
  const s = ctx.site;
  const crumbs = [['/', 'Home'], [L.path, L.name]];
  const words = L.name.split(' ');
  const h = hero(ctx, {
    crumbs, kick: 'Legal', title: words.length > 1 ? `${esc(words.slice(0, -1).join(' '))} <span class="accent">${esc(words[words.length - 1])}</span>` : esc(L.name),
    bg: 'g-gold-dust', mod: 'p-hero--legal',
  });
  const others = LEGAL.filter((x) => x.path !== L.path);
  const main = `${h}
${band(`<div class="wrap wrap--narrow"><div class="prose p-legal glass glass--strong glass--lit" data-reveal>
<p>${esc(s.name)}'s ${esc(L.what)} will be published here before launch.</p>
<p>Questions in the meantime? <a${linkAttrs('/contact/')}>Contact us</a>.</p>
<p class="p-legal__more">${others.map((x) => arrow(x.path, x.name)).join(' ')}</p>
</div></div>`, { tone: 'lit', mod: 'p-band--legal', clip: pool('p-pool--left') })}`;
  return out(ctx, {
    path: L.path, name: L.name, mod: 'legal', crumbs, main,
    description: `${s.name}'s ${L.what} will be published here before launch.`,
  });
}

export async function render(ctx) {
  return [
    about(ctx), contact(ctx), faq(ctx), events(ctx), careers(ctx),
    blogHub(ctx), ...ctx.ia.blogCategories.map((c) => blogCat(ctx, c)),
    medicalCard(ctx), lawsHub(ctx), lawsCa(ctx),
    ...LEGAL.map((L) => legal(ctx, L)),
  ];
}
