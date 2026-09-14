/**
 * Generates sitemap.xml from the JSON data files.
 * Run: npx tsx scripts/generate-sitemap.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "client", "src", "data");

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
const today = new Date().toISOString().split("T")[0];

const urls: { loc: string; priority: string; changefreq: string }[] = [];

// Home
urls.push({ loc: "/", priority: "1.0", changefreq: "weekly" });

// Static pages
urls.push({ loc: "/directorios", priority: "0.8", changefreq: "monthly" });
urls.push({ loc: "/contacto", priority: "0.5", changefreq: "monthly" });
urls.push({ loc: "/herramientas", priority: "0.7", changefreq: "monthly" });
urls.push({ loc: "/criterios", priority: "0.6", changefreq: "monthly" });

// Guias del blog. Faltaban por completo: ni la portada ni las 241 guias estaban
// en el sitemap, y encima /blog/<slug> devolvia 404.
urls.push({ loc: "/blog", priority: "0.8", changefreq: "weekly" });

// Guias "antes de contratar"
urls.push({ loc: "/precios", priority: "0.8", changefreq: "monthly" });
try {
  const costes = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "client", "public", "datos", "costes.json"),
      "utf-8"
    )
  );
  for (const g of costes) {
    urls.push({ loc: `/precios/${g.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  console.log("guias antes-de-contratar en sitemap:", costes.length);
} catch (e) {
  console.warn("sin costes.json: el sitemap sale sin esas guias");
}
try {
  const guias = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "client", "public", "datos", "blog.json"),
      "utf-8"
    )
  );
  for (const g of guias) {
    urls.push({ loc: `/blog/${g.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  console.log("guias en sitemap:", guias.length);
} catch (e) {
  console.warn("sin blog.json: el sitemap sale sin guias");
}
// Paginas legales: obligatorias en España y Google espera encontrarlas.
urls.push({ loc: "/aviso-legal", priority: "0.3", changefreq: "yearly" });
urls.push({ loc: "/privacidad", priority: "0.3", changefreq: "yearly" });
urls.push({ loc: "/cookies", priority: "0.3", changefreq: "yearly" });

// Categories
for (const cat of categorias) {
  urls.push({
    loc: `/${cat.slug}`,
    priority: "0.9",
    changefreq: "weekly",
  });

  // Category + City — SOLO combinaciones que tienen negocios de verdad.
  // Si no, el sitemap se llena de URLs que devuelven paginas vacias y Google
  // las marca como contenido pobre.
  for (const ciu of ciudades) {
    const cityNegocios = negocios.filter(
      (n: any) => n.categoria_slug === cat.slug && n.ciudad_slug === ciu.slug
    );
    if (cityNegocios.length === 0) continue;

    urls.push({
      loc: `/${cat.slug}/${ciu.slug}`,
      priority: "0.8",
      changefreq: "weekly",
    });

    // Category + City + Barrio
    const cityBarrios = barrios.filter(
      (b: any) => b.ciudad_slug === ciu.slug
    );
    for (const bar of cityBarrios) {
      // Individual businesses
      const barNegocios = negocios.filter(
        (n: any) =>
          n.categoria_slug === cat.slug &&
          n.ciudad_slug === ciu.slug &&
          n.barrio_slug === bar.slug
      );
      if (barNegocios.length === 0) continue;

      urls.push({
        loc: `/${cat.slug}/${ciu.slug}/${bar.slug}`,
        priority: "0.7",
        changefreq: "weekly",
      });
      for (const neg of barNegocios) {
        urls.push({
          loc: `/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
          priority: "0.6",
          changefreq: "monthly",
        });
      }
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

const outPath = path.join(__dirname, "..", "client", "public", "sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`Sitemap generated: ${urls.length} URLs -> ${outPath}`);
