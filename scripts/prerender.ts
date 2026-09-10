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

  // SSR content wrapper: visible to crawlers, hidden from users to avoid FOUC
  // - Crawlers (no JS): see full HTML content, can index everything
  // - Users (with JS): React mounts into #root, then removes #ssr-content
  // - height:0 + overflow:hidden is SEO-safe (not penalized like display:none)
  const wrappedSsr = `<div id="ssr-content" style="height:0;overflow:hidden;position:absolute;width:100%;left:0;top:0">${ssrHtml}</div>`;

  // Small inline script removes SSR shell once React has mounted
  const cleanupScript = `<script>
(function(){var r=document.getElementById('root');if(r){var o=new MutationObserver(function(m,obs){var s=document.getElementById('ssr-content');if(s&&r.children.length>1){s.remove();obs.disconnect()}});o.observe(r,{childList:true});setTimeout(function(){var s=document.getElementById('ssr-content');if(s)s.remove()},3000)}})();
</script>`;

  // Inject schema BEFORE #root, SSR HTML INSIDE #root, cleanup script after.
  // OJO: UNA sola sustitucion. Antes se hacian dos (la segunda con regex) y esa
  // segunda volvia a inyectar sobre lo ya inyectado -> 4 copias del SSR por
  // pagina y ficheros de 258 KB donde deberian ser 7 KB.
  const bloqueRoot = `${schemaScripts}\n<div id="root">${wrappedSsr}</div>\n${cleanupScript}`;
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

function renderCategoryLinks(catSlug: string): string {
  const ciuWithNegocios = ciudades.filter((c: any) =>
    negocios.some((n: any) => n.categoria_slug === catSlug && n.ciudad_slug === c.slug)
  );
  return `<ul>${ciuWithNegocios
    .map((c: any) => {
      const count = negocios.filter((n: any) => n.categoria_slug === catSlug && n.ciudad_slug === c.slug).length;
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
      const cnt = negocios.filter((n: any) => n.ciudad_slug === c.slug).length;
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
    const cityNegocios = ordenar(negocios.filter(
      (n: any) => n.categoria_slug === cat.slug && n.ciudad_slug === ciu.slug
    ));

    // Sin negocios de esa categoria en esa ciudad no hay pagina que generar:
    // evita decenas de miles de paginas vacias (y 38 GB de salida).
    if (cityNegocios.length === 0) continue;

    const barriosWithNegocios = cityBarrios.filter((b: any) =>
      negocios.some((n: any) => n.categoria_slug === cat.slug && n.ciudad_slug === ciu.slug && n.barrio_slug === b.slug)
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
          const bCount = negocios.filter((n: any) => n.categoria_slug === cat.slug && n.ciudad_slug === ciu.slug && n.barrio_slug === b.slug).length;
          return `<li><a href="/${cat.slug}/${ciu.slug}/${b.slug}">${esc(b.nombre)} (${bCount})</a></li>`;
        }).join("")}</ul>
        <h2>Todos los ${esc(cat.nombre.toLowerCase())} en ${esc(ciu.nombre)}</h2>
        ${cityNegocios.slice(0, 30).map(renderNegocioCard).join("")}
        ${cityNegocios.length > 30 ? `<p>... y ${cityNegocios.length - 30} más</p>` : ""}
        </main>`,
    });
    count++;

    // Category + City + Barrio
    for (const bar of cityBarrios) {
      const barNegocios = ordenar(negocios.filter(
        (n: any) =>
          n.categoria_slug === cat.slug &&
          n.ciudad_slug === ciu.slug &&
          n.barrio_slug === bar.slug
      ));

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
          ${barNegocios.length > 30 ? `<p>y ${barNegocios.length - 30} negocios mas en este barrio</p>` : ""}</main>`,
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
