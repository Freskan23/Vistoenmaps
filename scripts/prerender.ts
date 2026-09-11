/**
 * Pre-rendering script for SEO.
 * Generates static HTML files with REAL visible content inside <div id="root">
 * so search engines can index without JavaScript.
 *
 * Run after `vite build`: tsx scripts/prerender.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "client", "src", "data");
const distDir = path.join(__dirname, "..", "dist", "public");

const categorias = JSON.parse(
  fs.readFileSync(path.join(dataDir, "categorias.json"), "utf-8")
);
const ciudades = JSON.parse(
  fs.readFileSync(path.join(dataDir, "ciudades.json"), "utf-8")
);
const barrios = JSON.parse(
  fs.readFileSync(path.join(dataDir, "barrios.json"), "utf-8")
);
const negocios = JSON.parse(
  fs.readFileSync(path.join(dataDir, "negocios.json"), "utf-8")
);

const BASE_URL = "https://vistoenmaps.com";

// Read the built index.html template
const templatePath = path.join(distDir, "index.html");
if (!fs.existsSync(templatePath)) {
  console.error("ERROR: dist/public/index.html not found. Run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(templatePath, "utf-8");

function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface PageData {
  route: string;
  title: string;
  description: string;
  canonical: string;
  schemaJson: object[];
  /** HTML content to render inside #root for crawlers */
  ssrHtml: string;
}

function generatePage(data: PageData) {
  const { route, title, description, canonical, schemaJson, ssrHtml } = data;

  // Build Schema.org JSON-LD
  const schemaScripts = schemaJson
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n");

  let html = template;

  // Replace existing title
  if (html.includes("<title>")) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  } else {
    html = html.replace("</head>", `    <title>${esc(title)}</title>\n  </head>`);
  }

  // Remove existing description meta
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>\s*/g, "");

  // Inject SEO meta tags before </head>
  const metaBlock = [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Visto en Maps" />`,
  ].join("\n    ");

  html = html.replace("</head>", `    ${metaBlock}\n  </head>`);

  // El HTML del servidor se muestra VISIBLE mientras arranca el JavaScript.
  // Antes iba con height:0 (oculto) "para evitar parpadeo": el resultado era que
  // el visitante veia la PANTALLA EN BLANCO hasta que React montaba. Con el
  // bundle actual eso son varios segundos en un movil.
  // Ahora se ve el contenido al instante y React lo sustituye al montar.
  // ---- Primer pintado ----------------------------------------------------
  // El HTML del servidor esta AHI para Google desde el primer byte, pero al
  // visitante se le enseña una pantalla de carga con la marca: si no, durante
  // un instante veia el texto pelado (la hoja de estilos aun no ha llegado).
  // En cuanto React monta, la pantalla de carga se va con un fundido.
  // Pie para buscadores: se deduce el contexto de la propia ruta
  // (/categoria/ciudad/...) para enlazar por zona, y se añade a TODAS las paginas.
  const trozos = route.split("/").filter(Boolean);
  const catDeRuta = categorias.find((c: any) => c.slug === trozos[0]);
  const ciuDeRuta = catDeRuta ? ciudades.find((c: any) => c.slug === trozos[1]) : undefined;
  const pieSeo = renderPieSeo({
    catSlug: catDeRuta ? catDeRuta.slug : undefined,
    ciuSlug: ciuDeRuta ? ciuDeRuta.slug : undefined,
    ciuNombre: ciuDeRuta ? ciuDeRuta.nombre : undefined,
  });
  const wrappedSsr = `<div id="ssr-content" aria-hidden="false">${ssrHtml}${pieSeo}</div>`;

  const pantallaCarga = `<div id="vem-carga" role="status" aria-label="Cargando">
<div class="vem-carga-caja">
<svg class="vem-carga-pin" width="54" height="68" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21c0-7.18-5.82-13-13-13z" fill="#1B4965"/>
<circle cx="13" cy="13" r="5.2" fill="#FCC44E"/>
</svg>
<p class="vem-carga-marca">Visto en <span>Maps</span></p>
<div class="vem-carga-barra"><span></span></div>
</div></div>`;

  // Estilos EN LINEA: son los unicos que existen hasta que llega el CSS.
  const estilosSsr = `<style>
#vem-carga{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#fafaf7;transition:opacity .35s ease}
#vem-carga.vem-fuera{opacity:0;pointer-events:none}
.vem-carga-caja{display:flex;flex-direction:column;align-items:center;gap:14px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.vem-carga-pin{animation:vem-flota 1.4s ease-in-out infinite}
@keyframes vem-flota{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.vem-carga-marca{margin:0;font-size:1.05rem;font-weight:700;letter-spacing:.02em;color:#1B4965}
.vem-carga-marca span{color:#d98324}
.vem-carga-barra{width:132px;height:4px;border-radius:999px;background:#e4e7eb;overflow:hidden}
.vem-carga-barra span{display:block;width:40%;height:100%;border-radius:999px;background:#1B4965;animation:vem-avanza 1.1s ease-in-out infinite}
@keyframes vem-avanza{0%{transform:translateX(-100%)}100%{transform:translateX(330%)}}
@media (prefers-reduced-motion:reduce){.vem-carga-pin,.vem-carga-barra span{animation:none}}
/* El HTML del servidor: legible si algo falla, y siempre disponible para Google. */
#ssr-content{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:1100px;margin:0 auto;padding:16px 20px 40px;color:#1f2933}
#ssr-content h1{font-size:1.6rem;line-height:1.25;margin:.6rem 0 .2rem;color:#12303f}
#ssr-content h2{font-size:1.1rem;margin:1.4rem 0 .4rem;color:#12303f}
#ssr-content h3{font-size:1rem;margin:0 0 .25rem}
#ssr-content p{margin:.25rem 0;color:#52606d}
#ssr-content nav{font-size:.8rem;color:#7b8794;margin-bottom:.5rem}
#ssr-content a{color:#1B4965;text-decoration:none}
#ssr-content ul{list-style:none;padding:0;margin:.5rem 0;display:flex;flex-wrap:wrap;gap:.4rem}
#ssr-content ul li a{display:inline-block;background:#eef2f5;border-radius:999px;padding:.25rem .7rem;font-size:.85rem}
#ssr-content article{border:1px solid #e4e7eb;border-radius:12px;padding:.9rem 1rem;margin:.6rem 0;background:#fff}
#ssr-content .badge-recomendado,#ssr-content .badge-verificado{display:inline-block;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-radius:999px;padding:.15rem .55rem;margin-bottom:.35rem}
#ssr-content .badge-recomendado{background:#1B4965;color:#fff}
#ssr-content .badge-verificado{background:#fdf0d5;color:#8a6100}
.pie-seo{margin-top:2rem;padding-top:1rem;border-top:1px solid #e4e7eb}
.pie-seo h2{font-size:.95rem;color:#52606d}
</style>`;

  // Al montar React: quitar el HTML del servidor y fundir la pantalla de carga.
  // Red de seguridad a los 8 s: si algo fallara, se ve el contenido igualmente.
  const cleanupScript = `<script>
(function(){var r=document.getElementById('root');if(!r)return;var fin=function(){var s=document.getElementById('ssr-content');if(s)s.remove();var c=document.getElementById('vem-carga');if(c){c.className='vem-fuera';setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},400)}};var o=new MutationObserver(function(m,obs){if(r.children.length>1){fin();obs.disconnect()}});o.observe(r,{childList:true});setTimeout(fin,8000)})();
</scr` + `ipt>`;

  const bloqueRoot = `${estilosSsr}
${pantallaCarga}
${schemaScripts}\n<div id="root">${wrappedSsr}</div>\n${cleanupScript}`;
  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', bloqueRoot);
  } else {
    html = html.replace(/<div id="root">(?:<\/div>)?/, bloqueRoot);
  }

  // Write file
  const filePath = route === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, ...route.split("/").filter(Boolean), "index.html");

  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, html, "utf-8");
}

// ─── SSR HTML Generators ──────────────────────────────────────────────────

// Mismo orden que la web: recomendados primero, luego verificados, luego
// por valoracion y numero de opiniones.
function ordenar(lista: any[]): any[] {
  return [...lista].sort((a, b) => {
    const sa = a.super_destacado === true ? 1 : 0;
    const sb = b.super_destacado === true ? 1 : 0;
    if (sa !== sb) return sb - sa;
    const da = a.destacado === true ? 1 : 0;
    const db = b.destacado === true ? 1 : 0;
    if (da !== db) return db - da;
    const va = a.valoracion_media ?? 0;
    const vb = b.valoracion_media ?? 0;
    if (vb !== va) return vb - va;
    return (b.num_resenas ?? 0) - (a.num_resenas ?? 0);
  });
}

function renderDescripcion(n: any): string {
  const nl = String.fromCharCode(10);
  const parrafos = String(n.descripcion).split(nl + nl).filter((x: string) => x.trim());
  return `<section><h2>Sobre ${esc(n.nombre)}</h2>${parrafos.map((par: string) => `<p>${esc(par.trim())}</p>`).join("")}</section>`;
}

function renderNegocioCard(n: any): string {
  const badge = n.super_destacado
    ? `<p class="badge-recomendado"><strong>Recomendado</strong></p>`
    : n.destacado
      ? `<p class="badge-verificado"><strong>Ficha verificada</strong></p>`
      : "";
  const valoracion = n.valoracion_media
    ? `<p>${n.valoracion_media}/5${n.num_resenas ? ` (${n.num_resenas} opiniones)` : ""}</p>`
    : "";
  return `<article class="negocio-card${n.super_destacado ? " super-destacado" : n.destacado ? " destacado" : ""}">
    ${badge}
    <h3><a href="/${n.categoria_slug}/${n.ciudad_slug}/${n.barrio_slug}/${n.slug}">${esc(n.nombre)}</a></h3>
    ${n.direccion ? `<p>${esc(n.direccion)}</p>` : ""}
    ${valoracion}
    ${n.telefono ? `<p><a href="tel:${esc(n.telefono)}">${esc(n.telefono)}</a></p>` : ""}
    ${n.horario ? `<p>${esc(n.horario)}</p>` : ""}
    ${n.web ? `<p><a href="${esc(n.web)}" rel="nofollow">${esc(n.web)}</a></p>` : ""}
  </article>`;
}

function renderBreadcrumb(items: { label: string; href: string }[]): string {
  return `<nav aria-label="breadcrumb"><ol>${items
    .map((item, i) =>
      i < items.length - 1
        ? `<li><a href="${item.href}">${esc(item.label)}</a></li>`
        : `<li>${esc(item.label)}</li>`
    )
    .join("")}</ol></nav>`;
}

/**
 * Pie de pagina PARA BUSCADORES.
 *
 * El pie real lo pinta React, asi que Google (que no ejecuta JS al rastrear) no
 * veia NUNCA los enlaces a blog, contacto o las paginas legales: salian como
 * huerfanas en la auditoria. Este bloque va en el HTML de todas las paginas.
 *
 * Ademas enlaza POR CONTEXTO: desde una pagina de Malaga se enlaza a otros
 * gremios de Malaga, no a Madrid. Eso reparte la autoridad dentro de la misma
 * zona, que es lo que posiciona en busquedas locales.
 */
// Conteos calculados UNA vez. Sin esto, cada una de las 30.359 paginas recorria
// los 20.253 negocios por cada categoria y ciudad: el prerender pasaba de 5
// minutos a mas de 8 horas.
const _porCatCiu = new Map<string, number>();
const _porCat = new Map<string, number>();
const _porCiu = new Map<string, number>();
for (const n of negocios as any[]) {
  const k = n.categoria_slug + "|" + n.ciudad_slug;
  _porCatCiu.set(k, (_porCatCiu.get(k) || 0) + 1);
  _porCat.set(n.categoria_slug, (_porCat.get(n.categoria_slug) || 0) + 1);
  _porCiu.set(n.ciudad_slug, (_porCiu.get(n.ciudad_slug) || 0) + 1);
}
const cuenta = (cat: string, ciu: string) => _porCatCiu.get(cat + "|" + ciu) || 0;

// Negocios agrupados: evita filtrar los 20.253 una y otra vez.
const _gruposCiudad = new Map<string, any[]>();
const _gruposBarrio = new Map<string, any[]>();
for (const n of negocios as any[]) {
  const kc = n.categoria_slug + "|" + n.ciudad_slug;
  if (!_gruposCiudad.has(kc)) _gruposCiudad.set(kc, []);
  _gruposCiudad.get(kc)!.push(n);
  const kb = kc + "|" + n.barrio_slug;
  if (!_gruposBarrio.has(kb)) _gruposBarrio.set(kb, []);
  _gruposBarrio.get(kb)!.push(n);
}

// Los bloques del pie se repiten mucho: se guardan ya montados.
const _cacheOtrosGremios = new Map<string, string>();
const _cacheOtrasCiudades = new Map<string, string>();

const ENLACES_FIJOS = `<nav aria-label="Pie"><ul class="lista-enlaces">
<li><a href="/">Inicio</a></li>
<li><a href="/directorios">Directorios</a></li>
<li><a href="/blog">Blog</a></li>
<li><a href="/eventos">Eventos</a></li>
<li><a href="/contacto">Contacto</a></li>
<li><a href="/aviso-legal">Aviso legal</a></li>
<li><a href="/privacidad">Privacidad</a></li>
<li><a href="/cookies">Cookies</a></li>
</ul></nav>`;

/**
 * Pie de pagina PARA BUSCADORES.
 *
 * El pie real lo pinta React, asi que Google (que rastrea sin ejecutar JS) no
 * veia los enlaces a blog, contacto ni las paginas legales: salian huerfanas.
 * Ademas enlaza POR CONTEXTO: desde una pagina de Malaga se enlaza a otros
 * gremios de Malaga, que es lo que reparte autoridad en busquedas locales.
 */
function renderPieSeo(ctx: { catSlug?: string; ciuSlug?: string; ciuNombre?: string } = {}): string {
  const partes: string[] = [];

  if (ctx.ciuSlug) {
    const clave = (ctx.catSlug || "") + "|" + ctx.ciuSlug;
    let bloque = _cacheOtrosGremios.get(clave);
    if (bloque === undefined) {
      const otros = (categorias as any[])
        .filter((c) => c.slug !== ctx.catSlug && cuenta(c.slug, ctx.ciuSlug!) > 0)
        .sort((a, b) => cuenta(b.slug, ctx.ciuSlug!) - cuenta(a.slug, ctx.ciuSlug!))
        .slice(0, 12);
      bloque = otros.length
        ? `<section><h2>Otros servicios en ${esc(ctx.ciuNombre || "")}</h2><ul class="lista-enlaces">${otros
            .map((c) => `<li><a href="/${c.slug}/${ctx.ciuSlug}">${esc(c.nombre)} en ${esc(ctx.ciuNombre || "")}</a></li>`)
            .join("")}</ul></section>`
        : "";
      _cacheOtrosGremios.set(clave, bloque);
    }
    if (bloque) partes.push(bloque);
  }

  if (ctx.catSlug) {
    const clave = ctx.catSlug + "|" + (ctx.ciuSlug || "");
    let bloque = _cacheOtrasCiudades.get(clave);
    if (bloque === undefined) {
      const cat = (categorias as any[]).find((c) => c.slug === ctx.catSlug);
      const otras = (ciudades as any[])
        .filter((c) => c.slug !== ctx.ciuSlug && cuenta(ctx.catSlug!, c.slug) > 0)
        .sort((a, b) => cuenta(ctx.catSlug!, b.slug) - cuenta(ctx.catSlug!, a.slug))
        .slice(0, 12);
      bloque = otras.length && cat
        ? `<section><h2>${esc(cat.nombre)} en otras ciudades</h2><ul class="lista-enlaces">${otras
            .map((c) => `<li><a href="/${ctx.catSlug}/${c.slug}">${esc(cat.nombre)} en ${esc(c.nombre)}</a></li>`)
            .join("")}</ul></section>`
        : "";
      _cacheOtrasCiudades.set(clave, bloque);
    }
    if (bloque) partes.push(bloque);
  }

  partes.push(ENLACES_FIJOS);
  return `<footer class="pie-seo">${partes.join("")}</footer>`;
}

function renderCategoryLinks(catSlug: string): string {
  const ciuWithNegocios = ciudades.filter((c: any) =>
    cuenta(catSlug, c.slug) > 0
  );
  return `<ul>${ciuWithNegocios
    .map((c: any) => {
      const count = cuenta(catSlug, c.slug);
      return `<li><a href="/${catSlug}/${c.slug}">${esc(c.nombre)} (${count})</a></li>`;
    })
    .join("")}</ul>`;
}

// ─── Generate All Pages ───────────────────────────────────────────────────
let count = 0;

// Home
generatePage({
  route: "/",
  title: "Visto en Maps — Directorio de profesionales verificados en España",
  description: `Encuentra profesionales verificados en ${ciudades.length} ciudades de España. ${negocios.length} negocios con teléfono, dirección, valoraciones y horarios.`,
  canonical: BASE_URL,
  schemaJson: [{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Visto en Maps",
    url: BASE_URL,
    description: "Directorio de profesionales y negocios locales verificados en Google Maps",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }],
  ssrHtml: `
    <header><h1>Visto en Maps — El profesional que necesitas, a un clic</h1>
    <p>+${negocios.length} negocios verificados en Google Maps · ${ciudades.length} ciudades · ${categorias.length} categorías</p></header>
    <main>
    <section><h2>¿Qué necesitas hoy?</h2>
    <ul>${categorias.map((c: any) => `<li><a href="/${c.slug}">${esc(c.nombre)}</a> — ${esc(c.descripcion)}</li>`).join("")}</ul>
    </section>
    <section><h2>Ciudades</h2>
    <ul>${ciudades.map((c: any) => {
      const cnt = _porCiu.get(c.slug) || 0;
      return `<li><a href="/cerrajeros/${c.slug}">${esc(c.nombre)}</a> (${cnt} negocios)</li>`;
    }).join("")}</ul>
    </section>
    </main>`,
});
count++;

// Eventos
generatePage({
  route: "/eventos",
  title: "Eventos y conciertos en España | Visto en Maps",
  description: "Próximos eventos, conciertos y espectáculos en España. Descubre qué hacer en tu ciudad.",
  canonical: `${BASE_URL}/eventos`,
  schemaJson: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Eventos", item: `${BASE_URL}/eventos` },
  ]}],
  ssrHtml: `<header><h1>Eventos y conciertos en España</h1><p>Próximos eventos, conciertos y espectáculos en las principales ciudades de España.</p></header>`,
});
count++;

// Blog
generatePage({
  route: "/blog",
  title: "Los mejores de tu ciudad — Rankings y guías | Visto en Maps",
  description: "Rankings de los mejores negocios y profesionales por ciudad. Guías actualizadas con valoraciones reales de Google Maps.",
  canonical: `${BASE_URL}/blog`,
  schemaJson: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
  ]}],
  ssrHtml: `<header><h1>Los mejores de tu ciudad</h1><p>Rankings actualizados con valoraciones reales. Sin publicidad, sin tratos. Solo datos.</p></header>`,
});
count++;

// Directorios
generatePage({
  route: "/directorios",
  title: "Directorios de negocios en España | Visto en Maps",
  description: "Los mejores directorios para dar de alta tu negocio en España.",
  canonical: `${BASE_URL}/directorios`,
  schemaJson: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Directorios", item: `${BASE_URL}/directorios` },
  ]}],
  ssrHtml: `<header><h1>Directorios de negocios en España</h1><p>Guía completa de directorios donde dar de alta tu negocio.</p></header>`,
});
count++;

// Paginas legales (obligatorias en España). Contenido corto en el HTML para
// que Google las indexe aunque el visitante no ejecute JS.
const LEGALES = [
  { ruta: "aviso-legal", titulo: "Aviso legal",
    desc: "Aviso legal y condiciones de uso de Visto en Maps, directorio de negocios locales de España.",
    intro: "Condiciones de uso del directorio, origen de la informacion publicada y como corregir o retirar la ficha de un negocio." },
  { ruta: "privacidad", titulo: "Politica de privacidad",
    desc: "Como trata Visto en Maps los datos personales: que se recoge, para que y como ejercer tus derechos.",
    intro: "Navegar por el directorio no exige facilitar datos personales. Aqui se explica que se trata al escribir por el formulario o crear una cuenta de negocio." },
  { ruta: "cookies", titulo: "Politica de cookies",
    desc: "Que cookies usa Visto en Maps y como controlarlas.",
    intro: "Este directorio no usa cookies de publicidad ni de seguimiento entre sitios." },
];
for (const lg of LEGALES) {
  generatePage({
    route: `/${lg.ruta}`,
    title: `${lg.titulo} | Visto en Maps`,
    description: lg.desc,
    canonical: `${BASE_URL}/${lg.ruta}`,
    schemaJson: [{ "@context": "https://schema.org", "@type": "WebPage", name: lg.titulo, url: `${BASE_URL}/${lg.ruta}` }],
    ssrHtml: `<main><h1>${esc(lg.titulo)}</h1><p>${esc(lg.intro)}</p></main>`,
  });
  count++;
}

// Contacto
generatePage({
  route: "/contacto",
  title: "Contacto | Visto en Maps",
  description: "Contacta con Visto en Maps. Añade tu negocio al directorio.",
  canonical: `${BASE_URL}/contacto`,
  schemaJson: [{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contacto", url: `${BASE_URL}/contacto` }],
  ssrHtml: `<header><h1>Contacto — Visto en Maps</h1><p>¿Tienes un negocio y no apareces aquí? Contacta con nosotros.</p></header>`,
});
count++;

// Categories
for (const cat of categorias) {
  generatePage({
    route: `/${cat.slug}`,
    title: `${cat.nombre} en España | Visto en Maps`,
    description: `${cat.nombre} en las principales ciudades de España. Profesionales verificados en Google Maps.`,
    canonical: `${BASE_URL}/${cat.slug}`,
    schemaJson: [{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: cat.nombre, item: `${BASE_URL}/${cat.slug}` },
      ],
    }],
    ssrHtml: `
      ${renderBreadcrumb([{ label: "Inicio", href: "/" }, { label: cat.nombre, href: `/${cat.slug}` }])}
      <header><h1>${esc(cat.nombre)} en España</h1><p>${esc(cat.descripcion)}</p></header>
      <main><h2>Ciudades con ${esc(cat.nombre.toLowerCase())}</h2>
      ${renderCategoryLinks(cat.slug)}
      </main>`,
  });
  count++;

  // Category + City
  for (const ciu of ciudades) {
    const cityBarrios = barrios.filter((b: any) => b.ciudad_slug === ciu.slug);
    const cityNegocios = ordenar(_gruposCiudad.get(cat.slug + "|" + ciu.slug) || []);

    // Sin negocios de esa categoria en esa ciudad no hay pagina que generar:
    // evita decenas de miles de paginas vacias (y 38 GB de salida).
    if (cityNegocios.length === 0) continue;

    const barriosWithNegocios = cityBarrios.filter(
      (b: any) => (_gruposBarrio.get(cat.slug + "|" + ciu.slug + "|" + b.slug) || []).length > 0
    );

    generatePage({
      route: `/${cat.slug}/${ciu.slug}`,
      title: `${cat.nombre} en ${ciu.nombre} | Visto en Maps`,
      description: `${cityNegocios.length} ${cat.nombre.toLowerCase()} en ${ciu.nombre}. Verificados en Google Maps con valoraciones reales.`,
      canonical: `${BASE_URL}/${cat.slug}/${ciu.slug}`,
      schemaJson: [{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: cat.nombre, item: `${BASE_URL}/${cat.slug}` },
          { "@type": "ListItem", position: 3, name: ciu.nombre, item: `${BASE_URL}/${cat.slug}/${ciu.slug}` },
        ],
      }],
      ssrHtml: `
        ${renderBreadcrumb([
          { label: "Inicio", href: "/" },
          { label: cat.nombre, href: `/${cat.slug}` },
          { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
        ])}
        <header><h1>${esc(cat.nombre)} en ${esc(ciu.nombre)}</h1>
        <p>${cityNegocios.length} profesionales verificados</p></header>
        <main>
        <h2>Barrios</h2>
        <ul>${barriosWithNegocios.map((b: any) => {
          const bCount = (_gruposBarrio.get(cat.slug + "|" + ciu.slug + "|" + b.slug) || []).length;
          return `<li><a href="/${cat.slug}/${ciu.slug}/${b.slug}">${esc(b.nombre)} (${bCount})</a></li>`;
        }).join("")}</ul>
        <h2>Todos los ${esc(cat.nombre.toLowerCase())} en ${esc(ciu.nombre)}</h2>
        ${cityNegocios.slice(0, 30).map(renderNegocioCard).join("")}
        ${cityNegocios.length > 30 ? `<section><h2>Mas ${esc(cat.nombre.toLowerCase())} en ${esc(ciu.nombre)}</h2><ul class="lista-enlaces">${cityNegocios.slice(30, 400).map((n: any) => `<li><a href="/${cat.slug}/${ciu.slug}/${n.barrio_slug}/${n.slug}">${esc(n.nombre)}</a></li>`).join("")}</ul></section>` : ""}
        </main>`,
    });
    count++;

    // Category + City + Barrio
    for (const bar of cityBarrios) {
      const barNegocios = ordenar(_gruposBarrio.get(cat.slug + "|" + ciu.slug + "|" + bar.slug) || []);

      if (barNegocios.length === 0) continue;

      generatePage({
        route: `/${cat.slug}/${ciu.slug}/${bar.slug}`,
        title: `${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`,
        description: `${barNegocios.length} ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. Teléfonos, horarios y valoraciones.`,
        canonical: `${BASE_URL}/${cat.slug}/${ciu.slug}/${bar.slug}`,
        schemaJson: barNegocios.slice(0, 10).map((n: any) => ({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: n.nombre,
          address: { "@type": "PostalAddress", streetAddress: n.direccion || undefined, addressLocality: ciu.nombre, addressCountry: "ES" },
          telephone: n.telefono || undefined,
          geo: n.coordenadas ? { "@type": "GeoCoordinates", latitude: n.coordenadas.lat, longitude: n.coordenadas.lng } : undefined,
          aggregateRating: n.num_resenas > 0 ? { "@type": "AggregateRating", ratingValue: n.valoracion_media, reviewCount: n.num_resenas } : undefined,
          openingHours: n.horario || undefined,
        })),
        ssrHtml: `
          ${renderBreadcrumb([
            { label: "Inicio", href: "/" },
            { label: cat.nombre, href: `/${cat.slug}` },
            { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
            { label: bar.nombre, href: `/${cat.slug}/${ciu.slug}/${bar.slug}` },
          ])}
          <header><h1>${esc(cat.nombre)} en ${esc(bar.nombre)}, ${esc(ciu.nombre)}</h1>
          <p>${barNegocios.length} profesionales verificados en este barrio</p></header>
          <main>${barNegocios.slice(0, 30).map(renderNegocioCard).join("")}
          ${barNegocios.length > 30 ? `<section><h2>Todos los ${esc(cat.nombre.toLowerCase())} de ${esc(bar.nombre)}</h2><ul class="lista-enlaces">${barNegocios.slice(30).map((n: any) => `<li><a href="/${cat.slug}/${ciu.slug}/${bar.slug}/${n.slug}">${esc(n.nombre)}</a></li>`).join("")}</ul></section>` : ""}</main>`,
      });
      count++;

      // Individual businesses
      for (const neg of barNegocios) {
        generatePage({
          route: `/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
          title: `${neg.nombre} — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`,
          description: neg.meta_descripcion || [`${neg.nombre}: ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}.`, neg.valoracion_media ? `${neg.valoracion_media}/5.` : null, neg.num_resenas ? `${neg.num_resenas} opiniones.` : null, neg.direccion || null, neg.telefono ? `Tel: ${neg.telefono}.` : null].filter(Boolean).join(" "),
          canonical: `${BASE_URL}/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
          schemaJson: [{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: neg.nombre,
            address: { "@type": "PostalAddress", streetAddress: neg.direccion || undefined, addressLocality: ciu.nombre, addressCountry: "ES" },
            telephone: neg.telefono || undefined,
            geo: neg.coordenadas ? { "@type": "GeoCoordinates", latitude: neg.coordenadas.lat, longitude: neg.coordenadas.lng } : undefined,
            aggregateRating: neg.num_resenas > 0 ? { "@type": "AggregateRating", ratingValue: neg.valoracion_media, reviewCount: neg.num_resenas, bestRating: 5 } : undefined,
            openingHours: neg.horario || undefined,
            ...(neg.web ? { url: neg.web } : {}),
          }],
          ssrHtml: `
            ${renderBreadcrumb([
              { label: "Inicio", href: "/" },
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
              { label: bar.nombre, href: `/${cat.slug}/${ciu.slug}/${bar.slug}` },
              { label: neg.nombre, href: `/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}` },
            ])}
            <main>
            <article>
              <h1>${esc(neg.nombre)}</h1>
              ${neg.valoracion_media ? `<p>${neg.valoracion_media}/5${neg.num_resenas ? ` (${neg.num_resenas} opiniones)` : ""}</p>` : ""}
              ${neg.super_destacado ? `<p><strong>Recomendado en Visto en Maps</strong></p>` : neg.destacado ? `<p><strong>Ficha verificada</strong></p>` : ""}
              ${neg.direccion ? `<p>${esc(neg.direccion)}</p>` : ""}
              ${neg.telefono ? `<p>📞 <a href="tel:${neg.telefono}">${esc(neg.telefono)}</a></p>` : ""}
              ${neg.horario ? `<p>🕐 ${esc(neg.horario)}</p>` : ""}
              ${neg.web ? `<p>🌐 <a href="${esc(neg.web)}" rel="nofollow">${esc(neg.web)}</a></p>` : ""}
              ${neg.servicios_destacados?.length ? `<p>Servicios: ${neg.servicios_destacados.map(esc).join(", ")}</p>` : ""}
              ${neg.descripcion ? renderDescripcion(neg) : ""}
              ${neg.url_google_maps ? `<p><a href="${esc(neg.url_google_maps)}" rel="nofollow">Ver en Google Maps</a></p>` : ""}
            </article>
            </main>`,
        });
        count++;
      }
    }
  }
}

console.log(`✅ Pre-rendered: ${count} pages -> ${distDir}`);
