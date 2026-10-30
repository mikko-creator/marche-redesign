// sitemap.mjs - /site-map/ (HUBS lane), rendered LAST (src/theme/index.mjs): lists every page in ctx.pages at render
// time, grouped Shop / Deals & rewards / Delivery areas / Resources / Company / Legal. Labels come from site.json
// (categories, areas) and ia.json (nav, megas, footer, blog categories) where one exists, otherwise from the page's own
// <title> (the text before " | "). A page no rule knows still gets listed (under Resources), never dropped.
import { esc, linkAttrs, stripTags, absUrl } from './util.mjs';
import { page } from './shell.mjs';
import { hero, ART, CRUMB, ldCrumbs } from './hubs.mjs';

const PATH = '/site-map/';
const GROUPS = ['Shop', 'Deals & rewards', 'Delivery areas', 'Resources', 'Company', 'Legal'];

const norm = (p) => {
  const s = String(p || '');
  if (!s.startsWith('/') || /[?#]/.test(s)) return null; // fragments / queries are not pages
  if (/\.[a-z0-9]{2,5}$/i.test(s)) return s;
  return s.endsWith('/') ? s : s + '/';
};

function groupOf(p) {
  if (p === '/' || p === '/shop/' || p.startsWith('/shop/')) return 'Shop';
  if (p === '/dispensaries/california/deals/' || p === '/rewards/' || p.startsWith('/rewards/')) return 'Deals & rewards';
  if (p.startsWith('/dispensaries/')) return 'Delivery areas';
  if (/^\/(about-us|events|careers|contact)\//.test(p)) return 'Company';
  if (/^\/(terms-and-conditions|privacy-policy|disclaimer|site-map)\//.test(p)) return 'Legal';
  return 'Resources';
}

// preferred order inside a group (anything not listed follows in path order)
const ORDER = ['/', '/shop/', '/shop/flower/', '/shop/pre-rolls/', '/shop/vapes/', '/shop/concentrates/', '/shop/medical/',
  '/dispensaries/california/deals/', '/rewards/',
  '/dispensaries/', '/dispensaries/california/',
  '/dispensary-guides/', '/getting-a-medical-card/', '/cannabis-laws-by-state/', '/cannabis-laws-by-state/california/', '/faq/', '/blog/',
  '/about-us/', '/events/', '/careers/', '/contact/',
  '/terms-and-conditions/', '/privacy-policy/', '/disclaimer/', '/site-map/'];

export async function render(ctx) {
  const S = ctx.site;
  const ia = ctx.ia;
  const label = new Map();
  const put = (u, l) => { const p = norm(u); if (p && l && !label.has(p)) label.set(p, stripTags(l)); };
  put('/', 'Home');
  put('/shop/', 'Shop');
  put('/dispensaries/', S.deliveryAreas.title);
  put('/dispensaries/california/', 'California');
  put('/dispensaries/california/deals/', 'Deals');
  put('/rewards/', 'Rewards');
  put('/blog/', 'Blog');
  for (const c of S.categories) put('/shop/' + c.slug + '/', c.label);
  const areaOrder = S.deliveryAreas.areas.map((a) => '/dispensaries/california/' + a.slug + '/');
  for (const a of S.deliveryAreas.areas) put('/dispensaries/california/' + a.slug + '/', a.name);
  for (const c of ia.blogCategories) put('/blog/' + c.slug + '/', c.label);
  for (const n of ia.nav) if (n.href) put(n.href, n.label);
  for (const n of ia.nav) for (const g of n.mega || []) for (const [u, l] of g.links || []) put(u, l);
  for (const c of ia.footer.columns) for (const [u, l] of c.links || []) put(u, l);
  for (const [u, l] of ia.footer.legal) put(u, l);
  put(PATH, 'Site map');

  const titleOf = (html) => {
    const m = /<title>([\s\S]*?)<\/title>/i.exec(html || '');
    return m ? stripTags(m[1]).split(' | ')[0].trim() : '';
  };

  const entries = [];
  for (const [p, v] of ctx.pages) {
    if (!p.endsWith('/')) continue; // files (404.html) are not pages to list
    entries.push({ path: p, label: label.get(p) || titleOf(v.html) || p, group: groupOf(p) });
  }
  if (!ctx.pages.has(PATH)) entries.push({ path: PATH, label: label.get(PATH), group: 'Legal' });
  const rank = (p) => { let i = ORDER.indexOf(p); if (i === -1 && areaOrder.includes(p)) i = ORDER.indexOf('/dispensaries/california/') + 0.01 * (1 + areaOrder.indexOf(p)); return i === -1 ? ORDER.length : i; };
  entries.sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path));

  const groups = GROUPS.map((g, gi) => {
    const items = entries.filter((e) => e.group === g);
    if (!items.length) return '';
    const listed = new Set(items.map((e) => e.path));
    // depth = listed ancestors in the same group (never counting "/"), so sub-pages indent under their parent
    const depth = (p) => { let d = 0; const parts = p.split('/').filter(Boolean); for (let k = 1; k < parts.length; k++) if (listed.has('/' + parts.slice(0, k).join('/') + '/')) d++; return Math.min(d, 2); };
    const id = 'd-sm-' + g.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '');
    return `<section class="glass glass--lit d-sm__group" data-reveal style="--i:${gi % 3}" aria-labelledby="${id}">
      <h2 class="d-sm__title" id="${id}">${esc(g)}<span class="d-sm__count">${items.length}</span></h2>
      <ul class="d-sm__list" role="list">${items.map((e) => { const d = depth(e.path); return `<li${d ? ` class="d-sm__sub d-sm__sub--${d}"` : ''}><a${linkAttrs(e.path, e.path === PATH ? { 'aria-current': 'page' } : {})}>${esc(e.label)}</a></li>`; }).join('')}</ul>
    </section>`;
  }).join('\n');

  const crumbs = [CRUMB.home, [PATH, 'Site map']];
  const title = 'Site Map | Marche';
  const description = `Every page of the Marche site: the shop, deals and rewards, ${S.deliveryAreas.areas.length} South Bay delivery areas, resources, company and legal pages.`;
  const canonical = absUrl(ctx, PATH);
  const main = `
${hero({
    crumbs,
    kicker: esc(S.name),
    title: `Site <span class="accent">map</span>`,
    lede: `Every page, grouped: ${entries.length} in all.`,
    art: ART[3],
    cls: 'd-hero--sm',
  })}
<section class="band band--lit d-sm" aria-label="All pages">
  <div class="wrap d-sm__grid">${groups}</div>
</section>`;
  return [{
    path: PATH,
    html: page({
      ctx, path: PATH, title, description, canonical,
      og: { 'og:title': title, 'og:description': description, 'og:url': canonical, 'og:type': 'website', 'og:site_name': S.name },
      jsonld: [ldCrumbs(ctx, crumbs)], bodyClass: 'd-page d-page--sitemap', main, crumbs, heroCrumbs: true,
    }),
  }];
}
