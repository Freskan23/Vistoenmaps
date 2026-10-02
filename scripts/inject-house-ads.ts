import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist", "public");

/**
 * Inyecta el anuncio propio (Local Brain) en el HTML prerenderizado de las
 * paginas de listado: tras el articulo en la home, tras la cabecera en
 * categorias/ciudades/barrios y en /eventos tras el contenido.
 *
 * El anuncio real lo pinta la APP via <AdSlot> (HousePromo). Esto solo pone la
 * version estatica para que Google y quien entra sin JS lo vean igual.
 */

const MARCA_NOMBRE = "Local Brain";
const MARCA_URL = "https://localbrain.app";
const MARCA_COLOR = "#2a6d94";
const PUNTOS = [
  "Varias ubicaciones y clientes en un mismo panel",
  "Publicaciones y respuestas a reseñas centralizadas",
  "Seguimiento de posiciones con histórico",
];

function anuncio(utm: string): string {
  const puntosHtml = PUNTOS.map((p) => `<li>✓ ${p}</li>`).join("");
  return `<section class="vem-house-ad" style="background:${MARCA_COLOR};color:#fff;border-radius:16px;padding:20px 24px;margin:24px 0" data-vem-ad="${utm}">
  <p style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;opacity:.65;margin:0 0 6px">Publicidad · Para agencias y gestorías de fichas</p>
  <p style="font-size:17px;font-weight:700;margin:0 0 8px">Gestiona todas tus fichas de Google desde un solo panel</p>
  <ul style="list-style:none;padding:0;margin:0 0 12px;font-size:13px;opacity:.9">${puntosHtml}</ul>
  <a href="${MARCA_URL}/?utm_source=vistoenmaps&amp;utm_medium=ads&amp;utm_campaign=${utm}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-block;background:#fff;color:${MARCA_COLOR};font-weight:700;font-size:13px;padding:8px 18px;border-radius:999px;text-decoration:none">Ver ${MARCA_NOMBRE} →</a>
</section>`;
}

function inject(html: string, marker: RegExp, utm: string): string {
  if (html.includes("vem-house-ad")) return html;
  const m = html.match(marker);
  if (!m) return html;
  const i = m.index! + m[0].length;
  return html.slice(0, i) + "\n" + anuncio(utm) + html.slice(i);
}

// En la home el contenido llega envuelto en <main>; insertamos tras el h1
// para que el anuncio se vea sin hacer scroll.
function injectHome(html: string): string {
  if (html.includes("vem-house-ad")) return html;
  const m = html.match(/<\/h1>/i);
  if (!m) return html;
  const i = m.index! + m[0].length;
  return html.slice(0, i) + "\n" + anuncio("home") + html.slice(i);
}

function walk(dir: string, cb: (f: string) => void) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else if (e.name === "index.html") cb(p);
  }
}

let n = 0;

// Home: tras el h1 (el SSR de la home no usa <article>)
const home = path.join(distDir, "index.html");
if (fs.existsSync(home)) {
  const h = fs.readFileSync(home, "utf-8");
  fs.writeFileSync(home, injectHome(h), "utf-8");
  n++;
}

// Categorias (una sola carpeta): despues de </header>
walk(distDir, (f) => {
  const rel = path.relative(distDir, f).replace(/\\/g, "/");
  const parts = rel.split("/");
  let utm = "";
  if (parts.length === 2) utm = `cat-${parts[0]}`;
  else if (parts.length === 3) utm = `ciu-${parts[0]}-${parts[1]}`;
  else if (parts.length === 4) utm = `bar-${parts[0]}-${parts[1]}-${parts[2]}`;
  else if (rel === "eventos/index.html") utm = "eventos";
  if (!utm) return;

  let h = fs.readFileSync(f, "utf-8");
  const before = h.length;
  h = inject(h, /<\/header>/i, utm);
  if (h.length !== before) {
    fs.writeFileSync(f, h, "utf-8");
    n++;
  }
});

console.log(`House ads inyectados en ${n} paginas -> dist/public`);
