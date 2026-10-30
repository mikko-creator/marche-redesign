// shell.mjs - page wrapper: <head>, utility bar, header + mega menus + drawer, footer, 21+ gate (FOUNDATION).
// The exports and the page() signature are FIXED (every lane calls them):
//   page({ ctx, path, title, description, canonical, og, jsonld, bodyClass, main, crumbs, heroCrumbs, scripts, preload })
//     main       the page's <main> INNER html (page() wraps it in <main id="main">)
//     crumbs     [[href, label], ...] (last = current page) -> a breadcrumb bar under the header; when heroCrumbs is
//                true the template prints crumbsHtml(crumbs) itself inside its hero and page() prints none
//     jsonld     array of objects -> <script type="application/ld+json">
//     bodyClass  extra body classes; "header-over" lets the main bar float over the first band (transparent until
//                the page scrolls; give that band top padding >= var(--header-main-h))
//     scripts    extra script file names under /assets/js/ (site.js is always loaded)
//     preload    [{ href, as, type, media, imagesrcset, imagesizes, fetchpriority }] -> <link rel="preload">
// Every word in the chrome comes from ctx.site / ctx.ia (Marche's own) except neutral glue (Menu, Close menu, the
// gate's question and buttons). No licence number is ever rendered.
import { esc, escA, attrs, href, linkAttrs, gimg, areas } from './util.mjs';

export const CSS_ORDER = ['fonts', 'tokens', 'base', 'components', 'motion', 'shell', 'home', 'shop', 'hubs', 'pages', 'mobile', 'fix'];

const ICON = {
  ext: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bag: '<path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M14 10h4M14 14h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1Z"/>',
};
export const icon = (name, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name] || ''}</svg>`;

export function crumbsHtml(crumbs) {
  if (!crumbs || !crumbs.length) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([h, l], i) => (i < crumbs.length - 1 ? `<li><a href="${escA(href(h))}">${esc(l)}</a></li>` : `<li aria-current="page">${esc(l)}</li>`)).join('')}</ol></nav>`;
}

// The wordmark ships as lossless WebP 358/722/1080 px wide (2.3/4.7/7.4 KB; cut at the master's exact 2677:471 ratio, so the
// header lays out to the same 0.05 px) instead of the 2677 px master PNG (30 KB):
// the header shows it 103-148 CSS px wide, the footer up to 239, the age gate 220. The header copy is eager (it is on
// every first screen) but not high priority, so the page's LCP image keeps the bandwidth.
const LOGO = { w: 2677, h: 471 };
export const LOGO_SRCSET = [358, 722, 1080].map((w) => `/assets/brand/marche-logo-white-${w}.webp ${w}w`).join(', ');
const logoImg = (alt, cls, sizes, eager = false) => `<img${attrs({ class: cls, src: '/assets/brand/marche-logo-white-722.webp', srcset: LOGO_SRCSET, sizes, alt, width: LOGO.w, height: LOGO.h, decoding: 'async', loading: eager ? 'eager' : 'lazy' })}>`;
const isCur = (h, path) => href(h) === path;
const cur = (h, path) => (isCur(h, path) ? ' aria-current="page"' : '');

// ---------- utility bar: the promo line + CTA; pick-up, delivery and account on the right ----------
function utilityHtml(ctx) {
  const { promo, utility: u } = ctx.ia;
  return `<div class="utility">
<div class="utility__inner wrap wrap--wide">
<p class="utility__promo"><span class="utility__spark" aria-hidden="true"></span><span class="utility__text">${esc(promo.text)}</span><a class="utility__cta"${linkAttrs(promo.href)}>${esc(promo.cta)}${icon('arrow')}</a></p>
<ul class="utility__links">
<li><a class="utility__link"${linkAttrs(u.pickup.href)}>${icon('pin')}<span>${esc(u.pickup.label)} <strong>${esc(u.pickup.value)}</strong></span><span class="utility__note">${esc(u.pickup.note)}</span></a></li>
<li><a class="utility__link"${linkAttrs(u.delivery.href)}>${icon('truck')}<span>${esc(u.delivery.label)}</span></a></li>
<li><a class="utility__link"${linkAttrs(u.account.href)}>${icon('user')}<span>${esc(u.account.label)}</span></a></li>
</ul>
</div>
</div>`;
}

// ---------- mega menus: link groups + one image card (ia.nav[].feature) ----------
function megaGroup(ctx, g, path) {
  if (g.areas) {
    const list = areas(ctx).map((a) => `<li><a${linkAttrs(a.path)}${cur(a.path, path)}><span>${esc(a.name)}</span></a></li>`).join('');
    return `<div class="mega__group mega__group--areas"><p class="mega__h">${esc(g.group)}</p><ul class="mega__links mega__links--cols">${list}</ul></div>`;
  }
  const list = (g.links || []).map(([h, l]) => `<li><a${linkAttrs(h)}${cur(h, path)}><span>${esc(l)}</span></a></li>`).join('');
  return `<div class="mega__group"><p class="mega__h">${esc(g.group)}</p><ul class="mega__links">${list}</ul>${g.note ? `<p class="mega__note">${icon('clock')}<span>${esc(g.note)}</span></p>` : ''}</div>`;
}

function megaCard(f) {
  if (!f) return '';
  return `<a class="mega__card"${linkAttrs(f.href)}>
<span class="mega__media">${gimg(f.image, { sizes: '(min-width: 1024px) 320px, 90vw', alt: '' })}<span class="mega__sheen" aria-hidden="true"></span></span>
<span class="mega__card-body"><span class="mega__card-t">${esc(f.title)}</span><span class="mega__card-l">${esc(f.line)}</span></span>
<span class="mega__card-go" aria-hidden="true">${icon('arrow')}</span>
</a>`;
}

function megaOwnsPath(ctx, it, path) {
  return (it.mega || []).some((g) => (g.areas ? areas(ctx).some((a) => isCur(a.path, path)) : (g.links || []).some(([h]) => isCur(h, path))));
}

function navHtml(ctx, path) {
  const { nav, cta, utility: u, promo } = ctx.ia;
  const items = nav.map((it) => {
    if (!it.mega) {
      return `<li class="nav__item"><a class="nav__link"${linkAttrs(it.href)}${cur(it.href, path)}><span>${esc(it.label)}</span></a></li>`;
    }
    const id = 'mega-' + it.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const n = it.mega.reduce((s, g) => s + (g.areas ? 2 : 1), 0);
    return `<li class="nav__item has-mega${megaOwnsPath(ctx, it, path) ? ' is-current' : ''}" data-mega>
<button class="nav__link nav__trigger" type="button" aria-expanded="false" aria-controls="${id}"><span>${esc(it.label)}</span>${icon('chev', 'ico--chev')}</button>
<div class="mega" id="${id}" data-mega-panel>
<div class="mega__panel glass glass--lit wrap wrap--wide">
<div class="mega__groups" style="--cols:${n}">${it.mega.map((g) => megaGroup(ctx, g, path)).join('')}</div>
${megaCard(it.feature)}
</div>
</div>
</li>`;
  }).join('\n');
  return `<nav class="nav" id="site-nav" aria-label="Main" data-nav>
<div class="nav__drawer-head"><span class="nav__drawer-title">Menu</span><button class="nav__close" type="button" data-nav-close>${icon('close')}<span class="sr-only">Close menu</span></button></div>
<p class="nav__promo"><span>${esc(promo.text)}</span><a class="nav__promo-cta"${linkAttrs(promo.href)}>${esc(promo.cta)}${icon('arrow')}</a></p>
<ul class="nav__list">
${items}
</ul>
<div class="nav__drawer-foot">
<a class="btn btn--sun"${linkAttrs(cta.href)}>${esc(cta.label)}${icon('arrow')}</a>
<a class="nav__foot-link"${linkAttrs(u.pickup.href)}>${icon('pin')}<span>${esc(u.pickup.label)} <strong>${esc(u.pickup.value)}</strong> <em>${esc(u.pickup.note)}</em></span></a>
<a class="nav__foot-link"${linkAttrs(u.delivery.href)}>${icon('truck')}<span>${esc(u.delivery.label)}</span></a>
<a class="nav__foot-link"${linkAttrs(u.account.href)}>${icon('user')}<span>${esc(u.account.label)}</span></a>
</div>
</nav>`;
}

function headerHtml(ctx, path) {
  const { cta } = ctx.ia;
  return `<header class="site-header" data-header>
<div class="site-header__inner wrap wrap--wide">
<a class="brand"${linkAttrs('/')}${path === '/' ? ' aria-current="page"' : ''}>${logoImg(ctx.site.name, 'brand__logo', '(max-width: 379.98px) 103px, (max-width: 767.98px) 120px, 148px', true)}</a>
${navHtml(ctx, path)}
<div class="header-tools">
<a class="header-tool"${linkAttrs('/shop/', { title: 'Search the menu' })}>${icon('search')}<span class="sr-only">Search the menu</span></a>
<a class="header-tool header-tool--account"${linkAttrs('/rewards/#join', { title: 'My account' })}>${icon('user')}<span class="sr-only">My account</span></a>
<a class="header-tool"${linkAttrs('/shop/', { title: 'Cart' })}>${icon('cart')}<span class="sr-only">Cart</span></a>
<a class="btn btn--sun btn--sm header-cta"${linkAttrs(cta.href)}>${esc(cta.label)}</a>
<button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>${icon('menu')}<span class="sr-only">Open menu</span></button>
</div>
</div>
</header>
<div class="nav-scrim" data-nav-scrim hidden></div>`;
}

// ---------- footer ----------
function footerHtml(ctx) {
  const s = ctx.site;
  const f = ctx.ia.footer;
  const h = s.hours;
  const linkList = (arr) => `<ul class="footer__links">${arr.map(([u, l]) => `<li><a${linkAttrs(u)}>${esc(l)}</a></li>`).join('')}</ul>`;
  const col = (c) => {
    if (c.links) return `<div class="footer__col"><h2 class="footer__h">${esc(c.title)}</h2>${linkList(c.links)}</div>`;
    if (c.contact) {
      return `<div class="footer__col footer__col--contact"><h2 class="footer__h">${esc(c.title)}</h2>
<address class="footer__addr">${icon('pin')}<span>${esc(s.contact.address.line)}</span></address>
<p class="footer__flag">Address shown as in the brand mockup, to be confirmed</p>
<ul class="footer__hours">
<li>${icon('truck')}<span>${esc(h.delivery.label)}</span><strong>${esc(h.delivery.value)}</strong></li>
<li>${icon('bag')}<span>${esc(h.pickup.label)}</span><strong>${esc(h.pickup.value)}</strong></li>
</ul></div>`;
    }
    if (c.location) {
      return `<div class="footer__col footer__col--location"><h2 class="footer__h">${esc(c.title)}</h2><ul class="footer__areas">${areas(ctx).map((a) => `<li><a class="chip"${linkAttrs(a.path)}>${esc(a.name)}</a></li>`).join('')}</ul></div>`;
    }
    return '';
  };
  return `<footer class="site-footer">
<div class="footer__clip" aria-hidden="true"><span class="footer__light"></span><span class="grain"></span></div>
<div class="wrap wrap--wide">
<div class="footer__top">
<div class="footer__brand">
<a class="brand brand--footer"${linkAttrs('/')}>${logoImg(s.name, 'brand__logo', '(max-width: 1000px) 171px, 239px')}</a>
<p class="footer__tag">${s.tagline.lines.map((l, i) => (i === s.tagline.lines.length - 1 ? `<span class="accent">${esc(l)}</span>` : `<span>${esc(l)}</span>`)).join(' ')}</p>
</div>
<div class="btn-row footer__cta">
<a class="btn btn--sun"${linkAttrs(ctx.ia.cta.href)}>${esc(ctx.ia.cta.label)}${icon('arrow')}</a>
<a class="btn btn--ghost"${linkAttrs('/dispensaries/')}>${esc(s.deliveryAreas.title)}</a>
</div>
</div>
<div class="footer__cols">
${f.columns.map(col).join('\n')}
</div>
<div class="footer__legal">
<p class="footer__copy">&copy; 2026 ${esc(s.name)}. All Rights Reserved.</p>
<ul class="footer__legal-links">${f.legal.map(([u, l]) => `<li><a${linkAttrs(u)}>${esc(l)}</a></li>`).join('')}</ul>
</div>
</div>
<div class="footer__mark" aria-hidden="true"><span class="footer__mark-word"></span></div>
</footer>`;
}

// ---------- 21+ gate (D7): hidden by default; site.js opens it unless localStorage marche-age-ok = 1. Never blocks
// the page without JS. ----------
function gateHtml(ctx) {
  return `<div class="age-gate" data-age-gate data-age-key="${escA(ctx.site.ageGateKey || 'marche-age-ok')}" hidden>
<div class="age-gate__card glass glass--lit glass--strong" role="dialog" aria-modal="true" aria-labelledby="age-gate-q" aria-describedby="age-gate-d">
${logoImg('', 'age-gate__logo', '220px')}
<h2 class="age-gate__q" id="age-gate-q">Are you 21 or older?</h2>
<p class="age-gate__d" id="age-gate-d">Please confirm your age to enter.</p>
<div class="btn-row age-gate__actions"><button class="btn btn--sun" type="button" data-age-yes>Yes</button><button class="btn btn--ghost" type="button" data-age-no>No</button></div>
<p class="age-gate__no" data-age-msg hidden role="status">Sorry, this site is for adults 21 and older.</p>
</div>
</div>`;
}

export function page({ ctx, path, title, description, canonical, og = {}, jsonld = [], bodyClass = '', main, crumbs, heroCrumbs = false, scripts = [], preload = [] }) {
  const css = (ctx.cssFiles || []).map((f) => `<link rel="stylesheet" href="/assets/css/${f}.css">`).join('\n');
  const ld = (jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (preload || []).map((p) => `<link rel="preload"${attrs(p)}>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(description)}">
${canonical ? `<link rel="canonical" href="${escA(canonical)}">` : ''}
${Object.entries(og || {}).map(([k, v]) => `<meta property="${escA(k)}" content="${escA(v)}">`).join('\n')}
<meta name="theme-color" content="#050505">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/nats-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/poppins-600.woff2" as="font" type="font/woff2" crossorigin>
${pre}
${css}
<script>document.documentElement.classList.add('js');</script>
${ld}
</head>
<body${attrs({ class: bodyClass })}>
<a class="skip" href="#main">Skip to main content</a>
<div class="site">
${utilityHtml(ctx)}
${headerHtml(ctx, path)}
${crumbs && crumbs.length && !heroCrumbs ? `<div class="crumbs-bar"><div class="wrap wrap--wide">${crumbsHtml(crumbs)}</div></div>` : ''}
<main id="main">
${main}
</main>
${footerHtml(ctx)}
</div>
${gateHtml(ctx)}
<script src="/assets/js/site.js" defer></script>
${scripts.map((s) => `<script src="/assets/js/${s}" defer></script>`).join('\n')}
</body>
</html>`;
}
