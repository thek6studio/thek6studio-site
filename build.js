// Builds the website into the _site folder.
// The design (layout, colours, fonts, illustrations) lives here and in /design.
// All the words, products and images you edit live in /content and /static/images.
// No packages needed: run `node build.js`.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "_site");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const json = (p) => JSON.parse(read(p));

// ---------- helpers ----------
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Text in [square brackets] is shown highlighted so unfinished bits are easy to spot.
const txt = (v) => esc(v).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');

// Only allow sensible link types.
const url = (v) => {
  const s = String(v ?? "").trim();
  return /^(https?:\/\/|mailto:|#|\/)/i.test(s) ? esc(s) : "#";
};
const ext = (u) => (/^https?:\/\//i.test(String(u)) ? ' target="_blank" rel="noopener"' : "");
const key = (v) => String(v ?? "").trim().replace(/^https?:\/\/payhip\.com\/b\//i, "").replace(/[^A-Za-z0-9]/g, "");

const ord = (x) => (x.order === "" || x.order == null || isNaN(Number(x.order)) ? 999 : Number(x.order));
const loadFolder = (dir) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs
        .readdirSync(path.join(ROOT, dir))
        .filter((f) => f.endsWith(".json"))
        .map((f) => json(path.join(dir, f)))
        .filter((x) => !x.hidden)
        .sort((a, b) => ord(a) - ord(b) || String(a.title).localeCompare(String(b.title)))
    : [];

// ---------- content ----------
const S = json("content/settings.json");
const H = json("content/home.json");
const samples = loadFolder("content/samples");
const products = loadFolder("content/products");

const STAGE_COLOUR = { "Early Stage 1": "coral", "Stage 1": "mustard", "Stage 2": "sage", "Stage 3": "aqua" };
const SHORT_SUBJECT = { "Science and Technology": "Science" };
const tag = (item) => {
  const colour = STAGE_COLOUR[item.stage] || "aqua";
  const label = [item.stage, SHORT_SUBJECT[item.subject] || item.subject].filter(Boolean).join(" · ");
  return `<span class="tag" style="background:var(--${colour})">${esc(label)}</span>`;
};
const picture = (item) =>
  item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.image_alt)}" loading="lazy">`
    : `<div class="noimg">[${esc(item.stage || "")} preview image]</div>`;

const ICONS = {
  palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7h2A5.6 5.6 0 0 0 22 11c0-5-4.5-9-10-9z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  book: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
  numbers: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
};
const icon = (name) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4C5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`;
const TICK = '<span class="tick"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF8F1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></span>';

let usesPayhip = false;
const payhipButton = (k, label, cls) => {
  usesPayhip = true;
  return `<a href="https://payhip.com/b/${k}" class="btn ${cls} btn-sm payhip-buy-button" data-theme="none" data-product="${k}">${esc(label)}</a>`;
};

// ---------- sections ----------
const stores = S.other_stores || [];
const ig = esc(S.instagram_handle);
const igUrl = `https://www.instagram.com/${encodeURIComponent(S.instagram_handle || "")}/`;

const sampleCards = samples
  .map((s) => {
    const k = key(s.payhip_key);
    return `        <article class="sample">
          ${picture(s)}
          <div class="sample-body">${tag(s)}<h3>${txt(s.title)}</h3><p>${txt(s.topic)}</p>${k ? payhipButton(k, "Get it free", "btn-teal") : ""}</div>
        </article>`;
  })
  .join("\n");

const productCards = products
  .map((p) => {
    const k = key(p.payhip_key);
    let button;
    if (k) button = payhipButton(k, "Buy now", "btn-coral");
    else if (p.other_link) button = `<a class="btn btn-coral btn-sm" href="${url(p.other_link)}"${ext(p.other_link)}>${esc(p.other_link_label || "View unit")}</a>`;
    else button = `<span class="btn btn-sm" aria-disabled="true">Coming soon</span>`;
    return `          <article class="product">
            ${picture(p)}
            <div class="product-body">${tag(p)}<h3>${txt(p.title)}</h3><p>${txt(p.description)}</p>
              <div class="product-foot"><span class="price">${esc(p.price)}</span>${button}</div>
            </div>
          </article>`;
  })
  .join("\n");

const shop = products.length
  ? `      <div class="shop" id="shop">
        <h3 class="shop-title">${txt(H.resources.shop_heading)}</h3>
        <div class="products">
${productCards}
        </div>
      </div>
`
  : "";

const subjects = (H.subjects || [])
  .map(
    (s) =>
      `        <article class="subject"><span class="dot" style="background:var(--${esc(s.colour || "coral")})">${icon(s.icon)}</span><h3>${txt(s.name)}</h3><p>${txt(s.description)}</p>${
        s.link ? `<a href="${url(s.link)}"${ext(s.link)}>${esc(s.link_label || "Shop")} →</a>` : ""
      }</article>`
  )
  .join("\n");

const insideItems = (H.inside.items || [])
  .map((i) => `          <li>${TICK}<span><b>${txt(i.title)}</b><span>${txt(i.text)}</span></span></li>`)
  .join("\n");

const storeButtons = stores
  .map((s, i) => `<a class="btn ${i === 0 ? "btn-coral" : "btn-line"}" href="${url(s.url)}"${ext(s.url)}>Shop on ${esc(s.label)}</a>`)
  .join("\n            ");

const logo = read("design/logo.svg.html").replace('width="76" height="46"', 'width="76" height="46"');
const miniLogo = '<svg width="22" height="14" viewBox="0 0 54 34" aria-hidden="true"><path d="M5 28 A22 22 0 0 1 49 28" fill="none" stroke="#FF7F6B" stroke-width="7"/><path d="M13 28 A14 14 0 0 1 41 28" fill="none" stroke="#E3A62B" stroke-width="7"/><path d="M20 28 A7 7 0 0 1 34 28" fill="none" stroke="#A7DAD4" stroke-width="6"/></svg>';
const favicon = "data:image/svg+xml," + encodeURIComponent(logo.replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 34">'));

const email = S.email
  ? `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>`
  : '<span class="ph">[your email]</span>';

const page = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(S.site_title)}</title>
<meta name="description" content="${esc(S.meta_description)}">
<meta property="og:title" content="${esc(S.site_title)}">
<meta property="og:description" content="${esc(S.meta_description)}">
<meta property="og:type" content="website">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;0,600;1,500&display=swap">
<link rel="stylesheet" href="/css/style.css">
${usesPayhip ? '<script src="https://payhip.com/payhip.js"></script>\n' : ""}</head>
<body>

<header>
  <div class="wrap nav">
    <a class="brand" href="#top" aria-label="${esc(S.site_title)} home">
      ${logo}
      <span class="brand-name"><strong>${esc(S.brand_name)}</strong><span>${esc(S.brand_tagline)}</span></span>
    </a>
    <div class="nav-right">
      <nav aria-label="Main">
        <ul>
          <li><a href="#top" aria-current="page">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#resources">Resources</a></li>
          <li><a href="#free">Free samples</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <a class="cart" href="${url(S.cart_link)}"${ext(S.cart_link)} aria-label="Shop"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0F4C5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg></a>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <h1>${txt(H.hero.heading)}</h1>
        <p class="lede">${txt(H.hero.intro)}</p>
        <div class="hero-ctas">
          <a class="btn btn-coral" href="#resources">${esc(H.hero.primary_button)} <span aria-hidden="true">→</span></a>
          <a class="btn btn-line" href="#free">${esc(H.hero.secondary_button)}</a>
        </div>
      </div>
      ${read("design/hero-illustration.svg.html")}    </div>
  </section>

${read("design/stage-strip.html")}
  <section class="band free" id="free">
    <div class="wrap">
      <div class="head">
        <p class="label">${txt(H.free.label)}</p>
        <h2>${txt(H.free.heading)}</h2>
        <p>${txt(H.free.intro)}</p>
      </div>
      <div class="samples">
${sampleCards}
      </div>
      <div class="free-cta">
        <p><strong>${txt(H.free.box_heading)}</strong>${txt(H.free.box_text)}</p>
        ${H.free.box_link ? `<a class="btn btn-teal" href="${url(H.free.box_link)}"${ext(H.free.box_link)}>${esc(H.free.box_button)} <span aria-hidden="true">→</span></a>` : ""}
      </div>
    </div>
  </section>

  <section class="band" id="resources">
    <div class="wrap">
      <div class="head">
        <p class="label">${txt(H.resources.label)}</p>
        <h2>${txt(H.resources.heading)}</h2>
        <p>${txt(H.resources.intro)}</p>
      </div>
${shop}      <div class="subjects">
${subjects}
      </div>

      <div class="inside">
        <div>
          <p class="label" style="color:var(--coral-ink);margin-bottom:12px">${txt(H.inside.label)}</p>
          <h2>${txt(H.inside.heading)}</h2>
          <div class="stores">
            ${storeButtons}
          </div>
        </div>
        <ul>
${insideItems}
        </ul>
      </div>
    </div>
  </section>

  <section class="band" id="about" style="background:var(--white)">
    <div class="wrap about-grid">
      <div class="copy">
        <p class="label" style="color:var(--coral-ink)">${txt(H.about.label)}</p>
        <h2>${txt(H.about.heading)}</h2>
${(H.about.paragraphs || []).map((p) => `        <p>${txt(p)}</p>`).join("\n")}
        ${H.about.note ? `<p class="rename">${miniLogo}${txt(H.about.note)}</p>` : ""}
      </div>
      <div class="values">
        ${(H.about.values || []).map(txt).join("<br>")}
        <svg class="heart" width="34" height="30" viewBox="0 0 24 21" aria-hidden="true"><path d="M12 21 2.9 12.2A5.6 5.6 0 0 1 12 4.1a5.6 5.6 0 0 1 9.1 8.1z" fill="#FF7F6B"/></svg>
      </div>
    </div>
  </section>

  <section class="insta" aria-label="Instagram">
    <div class="wrap">
      <div>
        <h2>${txt(H.instagram.heading)}</h2>
        <p>${txt(H.instagram.text)}</p>
      </div>
      <a class="btn" href="${igUrl}" target="_blank" rel="noopener">@${ig} <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="band" id="contact">
    <div class="wrap">
      <div class="head">
        <p class="label">${txt(H.contact.label)}</p>
        <h2>${txt(H.contact.heading)}</h2>
        <p>${txt(H.contact.intro)}</p>
      </div>
      <div class="contact-grid">
        <div class="contact-card"><span class="label">Email</span><strong>${email}</strong></div>
        <div class="contact-card"><span class="label">Instagram</span><strong><a href="${igUrl}" target="_blank" rel="noopener">@${ig}</a></strong></div>
        <div class="contact-card"><span class="label">Shop</span><strong>${stores.map((s) => `<a href="${url(s.url)}"${ext(s.url)}>${esc(s.label)}</a>`).join(" · ")}</strong></div>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <span>© ${new Date().getFullYear()} ${esc(S.brand_name)}</span>
    <span>${esc(S.domain)}</span>
  </div>
</footer>

</body>
</html>
`;

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "css"), { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), page);
fs.copyFileSync(path.join(ROOT, "design/style.css"), path.join(OUT, "css/style.css"));
fs.cpSync(path.join(ROOT, "static"), OUT, { recursive: true });
console.log(`Built _site: ${samples.length} free samples, ${products.length} products${usesPayhip ? ", Payhip on" : ""}.`);
