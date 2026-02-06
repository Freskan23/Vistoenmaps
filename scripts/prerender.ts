/**
 * Pre-rendering script for SEO.
 * Generates static HTML files with embedded meta tags and Schema.org JSON-LD
 * for each route, so search engines can index the content without JavaScript.
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

interface PageData {
  route: string;
  title: string;
  description: string;
  canonical: string;
  schemaJson: object[];
  h1: string;
  bodyText: string;
}

function generatePage(data: PageData) {
  const { route, title, description, canonical, schemaJson, h1, bodyText } = data;

  // Build meta tags
  const metaTags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description.replace(/"/g, "&quot;")}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Visto en Maps" />`,
  ].join("\n    ");

  // Build Schema.org JSON-LD
  const schemaScripts = schemaJson
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n");

  // SEO-friendly content for crawlers (hidden visually, visible to bots)
  const seoContent = `<div id="seo-content" style="position:absolute;left:-9999px;top:-9999px;"><h1>${h1}</h1><p>${bodyText.replace(/</g, "&lt;")}</p></div>`;

  // Inject into template
  let html = template;

  // Replace existing title
  if (html.includes("<title>")) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  } else {
    html = html.replace("</head>", `    <title>${title}</title>\n  </head>`);
  }

  // Remove existing generic description meta (avoid duplicates)
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>\s*/g, "");

  // Inject SEO meta tags before </head>
  html = html.replace(
    "</head>",
    `    <meta name="description" content="${description.replace(/"/g, "&quot;")}" />\n    <link rel="canonical" href="${canonical}" />\n    <meta property="og:title" content="${title}" />\n    <meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Visto en Maps" />\n  </head>`
  );

  // Inject schema + SEO content inside <body> before <div id="root">
  html = html.replace(
    '<div id="root">',
    `${schemaScripts}\n${seoContent}\n<div id="root">`
  );

  // Write file
  const filePath = route === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, ...route.split("/").filter(Boolean), "index.html");

  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, html, "utf-8");
}

// Generate all pages
let count = 0;

// Home
generatePage({
  route: "/",
  title: "Visto en Maps — Directorio de profesionales verificados en España",
  description: "Encuentra cerrajeros, fontaneros, electricistas, pintores, empresas de limpieza y reformas en tu barrio. Verificados en Google Maps.",
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
  h1: "Visto en Maps — Directorio de profesionales verificados en España",
  bodyText: `Encuentra cerrajeros, fontaneros, electricistas, pintores, empresas de limpieza y reformas cerca de ti. ${categorias.length} categorías, ${ciudades.length} ciudades, ${negocios.length} negocios verificados.`,
});
count++;

// Contacto
generatePage({
  route: "/contacto",
  title: "Contacto | Visto en Maps",
  description: "Contacta con el equipo de Visto en Maps. Sugerencias, añadir tu negocio al directorio o reportar errores.",
  canonical: `${BASE_URL}/contacto`,
  schemaJson: [{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contacto", url: `${BASE_URL}/contacto` }],
  h1: "Contacto — Visto en Maps",
  bodyText: "Contacta con nosotros para sugerencias, añadir tu negocio al directorio o reportar errores.",
});
count++;

// Categories
for (const cat of categorias) {
  generatePage({
    route: `/${cat.slug}`,
    title: `${cat.nombre} en España | Visto en Maps`,
    description: `${cat.nombre} en las principales ciudades de España. Encuentra profesionales verificados en Google Maps con teléfono, dirección y valoraciones.`,
    canonical: `${BASE_URL}/${cat.slug}`,
    schemaJson: [{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: cat.nombre, item: `${BASE_URL}/${cat.slug}` },
      ],
    }],
    h1: `${cat.nombre} en España`,
    bodyText: `${cat.descripcion}. Encuentra ${cat.nombre.toLowerCase()} en ${ciudades.map((c: any) => c.nombre).join(", ")}.`,
  });
  count++;

  // Category + City
  for (const ciu of ciudades) {
    const cityBarrios = barrios.filter((b: any) => b.ciudad_slug === ciu.slug);
    const cityNegocios = negocios.filter(
      (n: any) => n.categoria_slug === cat.slug && n.ciudad_slug === ciu.slug
    );

    generatePage({
      route: `/${cat.slug}/${ciu.slug}`,
      title: `${cat.nombre} en ${ciu.nombre} | Visto en Maps`,
      description: `${cityNegocios.length} ${cat.nombre.toLowerCase()} en ${ciu.nombre}. Barrios: ${cityBarrios.map((b: any) => b.nombre).join(", ")}. Verificados en Google Maps.`,
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
      h1: `${cat.nombre} en ${ciu.nombre}`,
      bodyText: `${cityNegocios.length} profesionales de ${cat.nombre.toLowerCase()} en ${ciu.nombre}. Barrios: ${cityBarrios.map((b: any) => b.nombre).join(", ")}.`,
    });
    count++;

    // Category + City + Barrio
    for (const bar of cityBarrios) {
      const barNegocios = negocios.filter(
        (n: any) =>
          n.categoria_slug === cat.slug &&
          n.ciudad_slug === ciu.slug &&
          n.barrio_slug === bar.slug
      );

      generatePage({
        route: `/${cat.slug}/${ciu.slug}/${bar.slug}`,
        title: `${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`,
        description: `${barNegocios.length} ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. Teléfonos, horarios, valoraciones y dirección. Verificados en Google Maps.`,
        canonical: `${BASE_URL}/${cat.slug}/${ciu.slug}/${bar.slug}`,
        schemaJson: [
          ...barNegocios.map((n: any) => ({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: n.nombre,
            address: { "@type": "PostalAddress", streetAddress: n.direccion, addressLocality: ciu.nombre, addressCountry: "ES" },
            telephone: n.telefono,
            geo: { "@type": "GeoCoordinates", latitude: n.coordenadas.lat, longitude: n.coordenadas.lng },
            aggregateRating: { "@type": "AggregateRating", ratingValue: n.valoracion_media, reviewCount: n.num_resenas },
            openingHours: n.horario,
          })),
        ],
        h1: `${cat.nombre} en ${bar.nombre}, ${ciu.nombre}`,
        bodyText: barNegocios
          .map((n: any) => `${n.nombre}: ${n.valoracion_media} estrellas, ${n.num_resenas} reseñas. ${n.direccion}. Tel: ${n.telefono}.`)
          .join(" "),
      });
      count++;

      // Individual businesses
      for (const neg of barNegocios) {
        generatePage({
          route: `/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
          title: `${neg.nombre} — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`,
          description: `${neg.nombre}: ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. ${neg.valoracion_media} estrellas, ${neg.num_resenas} reseñas. ${neg.direccion}. Tel: ${neg.telefono}.`,
          canonical: `${BASE_URL}/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
          schemaJson: [{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: neg.nombre,
            address: { "@type": "PostalAddress", streetAddress: neg.direccion, addressLocality: ciu.nombre, addressCountry: "ES" },
            telephone: neg.telefono,
            geo: { "@type": "GeoCoordinates", latitude: neg.coordenadas.lat, longitude: neg.coordenadas.lng },
            aggregateRating: { "@type": "AggregateRating", ratingValue: neg.valoracion_media, reviewCount: neg.num_resenas, bestRating: 5 },
            openingHours: neg.horario,
          }],
          h1: neg.nombre,
          bodyText: `${neg.nombre}: ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. Valoración: ${neg.valoracion_media}/5 (${neg.num_resenas} reseñas). Dirección: ${neg.direccion}. Teléfono: ${neg.telefono}. Horario: ${neg.horario}. Servicios: ${neg.servicios_destacados.join(", ")}.`,
        });
        count++;
      }
    }
  }
}

console.log(`Pre-rendered: ${count} pages -> ${distDir}`);
